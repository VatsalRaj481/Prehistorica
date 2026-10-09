import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  askChiefCurator,
  askChiefCuratorStream,
  reformulateCuratorQuery,
  analyzeFossilImage,
  simulateRunwayInteraction,
  synthesizeFormationFoodWeb,
  GroundingSpeciesContext
} from '../services/gemini.js';
import { searchSimilarSpecies, getEmbeddingCount } from '../services/vectorStore.js';
import { speciesCache } from '../services/speciesCache.js';

const prisma = new PrismaClient();

/**
 * 1. POST /api/curator/ask (and /api/ai/curator/chat) — Chief Curator Grounded RAG Agent (SSE Streaming)
 */
export async function curatorChat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { query, history, stream } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({ error: 'A query string is required' });
      return;
    }

    // 1. Multi-turn query reformulation: resolve pronouns and follow-up references
    const searchQuery = await reformulateCuratorQuery({
      query: query.trim(),
      conversationHistory: history || []
    });

    // 2. Retrieve top matching grounded species from pgvector using the contextualized query
    let matchedSpecies = await searchSimilarSpecies(searchQuery, 8);

    // Thematic candidate injection for boundary/benchmark taxa:
    const combinedQueryText = `${query} ${searchQuery}`.toLowerCase();

    // 1. Largest dinosaur / heaviest sauropod / supermassive titanosaur inquiries
    const isLargestSauropodQuery =
      /(largest|biggest|heaviest|longest|colossal|massive|giant|scale|tonnage|mass\s+limit|size\s+limit|size\s+record).*(dinosaur|sauropod|titanosaur|land\s+animal|terrestrial\s+animal|vertebrate)/i.test(combinedQueryText) ||
      /(dinosaur|sauropod|titanosaur).*(largest|biggest|heaviest|longest|colossal|massive|giant|weight|tonnage|heaviest)/i.test(combinedQueryText) ||
      /\b(largest|biggest|heaviest)\s+(ever|creature|animal|dinosaur)\b/i.test(combinedQueryText) ||
      combinedQueryText.includes('bruhathkayosaurus');

    // 2. Largest Jurassic theropod / apex Morrison predator inquiries
    const isLargestJurassicTheropodQuery =
      /(largest|biggest|heaviest|longest|apex|top|supreme).*(jurassic\s+(theropod|predator|carnivore|dinosaur|hunter)|morrison\s+(predator|carnivore|theropod|hunter))/i.test(combinedQueryText) ||
      /(jurassic).*(largest|biggest|heaviest|longest|apex|top|supreme).*(theropod|predator|carnivore|hunter|dinosaur)/i.test(combinedQueryText) ||
      /(morrison\s+formation).*(largest|predator|carnivore|theropod|apex)/i.test(combinedQueryText) ||
      combinedQueryText.includes('saurophaganax');

    // 3. Largest head / skull / cranial gigantism inquiries
    const isLargestHeadQuery =
      /(largest|biggest|longest|colossal|massive|giant).*(head|skull|cranium|frill|snout)/i.test(combinedQueryText) ||
      /(head|skull|cranium|frill|snout).*(largest|biggest|longest|size|scale|record)/i.test(combinedQueryText);

    const thematicIdsToInject: number[] = [];
    if (isLargestSauropodQuery) {
      // 5423: Bruhathkayosaurus, 509: Argentinosaurus, 514: Patagotitan
      for (const tid of [5423, 509, 514]) {
        if (!matchedSpecies.some(s => s.id === tid) && !thematicIdsToInject.includes(tid)) {
          thematicIdsToInject.push(tid);
        }
      }
    }

    if (isLargestJurassicTheropodQuery) {
      // 5422: Saurophaganax, 150: Torvosaurus, 94: Allosaurus fragilis
      for (const tid of [5422, 150, 94]) {
        if (!matchedSpecies.some(s => s.id === tid) && !thematicIdsToInject.includes(tid)) {
          thematicIdsToInject.push(tid);
        }
      }
    }

    if (isLargestHeadQuery) {
      // 471: Pentaceratops, 5403: Torosaurus, 25: Triceratops horridus, 1: Tyrannosaurus rex, 19: Giganotosaurus, 18: Spinosaurus
      for (const tid of [471, 5403, 25, 1, 19, 18]) {
        if (!matchedSpecies.some(s => s.id === tid) && !thematicIdsToInject.includes(tid)) {
          thematicIdsToInject.push(tid);
        }
      }
    }

    if (thematicIdsToInject.length > 0) {
      const thematicSpecies = await prisma.species.findMany({
        where: { id: { in: thematicIdsToInject } }
      });
      for (const sp of thematicSpecies) {
        matchedSpecies.push({ ...sp, similarity: 0.95 });
      }
    }

    // 3. Extract any species IDs explicitly linked in recent conversation history
    const historySpeciesIds: number[] = [];
    if (Array.isArray(history)) {
      for (const msg of history.slice(-4)) {
        if (typeof msg?.content === 'string') {
          const matches = msg.content.matchAll(/\/species\/(\d+)/g);
          for (const m of matches) {
            const id = parseInt(m[1], 10);
            if (!isNaN(id) && !historySpeciesIds.includes(id)) {
              historySpeciesIds.push(id);
            }
          }
        }
      }
    }

    // If species previously discussed are relevant to the contextualized query but missed by vector search, pull them in
    if (historySpeciesIds.length > 0) {
      const existingIds = new Set(matchedSpecies.map(s => s.id));
      const missingIds = historySpeciesIds.filter(id => !existingIds.has(id));
      if (missingIds.length > 0) {
        const extraSpecies = await prisma.species.findMany({
          where: { id: { in: missingIds } }
        });
        const queryLower = `${query} ${searchQuery}`.toLowerCase();
        for (const sp of extraSpecies) {
          if (
            queryLower.includes(sp.name.toLowerCase()) ||
            queryLower.includes(sp.scientificName.toLowerCase()) ||
            (sp.clade && queryLower.includes(sp.clade.toLowerCase()))
          ) {
            matchedSpecies.push({ ...sp, similarity: 0.85 });
          }
        }
      }
    }

    // 4. Dynamic relevance filtering: suppress low-scoring noise
    const bestSimilarity = matchedSpecies.length > 0 ? (matchedSpecies[0].similarity || 0) : 0;
    matchedSpecies = matchedSpecies.filter(s => {
      const sim = s.similarity || 0;
      if (sim >= 0.65) return true;
      if (bestSimilarity >= 0.70) {
        return sim >= (bestSimilarity - 0.15) && sim >= 0.55;
      }
      return sim >= 0.50;
    });

    const contextSpecies: GroundingSpeciesContext[] = matchedSpecies.map(s => {
      let facts: string[] = [];
      try {
        facts = JSON.parse(s.interestingFacts || '[]');
      } catch {}

      return {
        id: s.id,
        name: s.name,
        scientificName: s.scientificName,
        clade: s.clade,
        diet: s.diet,
        habitat: s.habitat,
        timePeriod: s.timePeriod,
        myaStart: s.myaStart,
        myaEnd: s.myaEnd,
        geographicRange: s.geographicRange,
        interestingFacts: facts,
        sizeNotes: s.sizeNotes,
        similarity: s.similarity
      };
    });

/**
 * Verifies all /species/:id links and species mentions against the museum roster.
 * If a link text references a known species (e.g. "Pentaceratops") but has a wrong or hallucinated ID (e.g. 141),
 * this rewrites the link to the correct catalog ID (/species/471) and returns all verified referenced species.
 */
async function resolveAndRepairReferencedSpecies(
  responseText: string,
  initialMatchedSpecies: any[] = []
): Promise<{
  repairedText: string;
  referencedSpecies: any[];
  referencedIds: number[];
}> {
  const roster = await speciesCache.getRoster();

  // Fast lookup maps
  const nameToItem = new Map<string, any>();
  const idToItem = new Map<number, any>();

  for (const item of roster) {
    idToItem.set(item.id, item);
    nameToItem.set(item.name.toLowerCase(), item);
    nameToItem.set(item.scientificName.toLowerCase(), item);
    // Also map genus name (first word of name or scientificName)
    const genus = item.name.split(' ')[0].toLowerCase();
    if (!nameToItem.has(genus)) {
      nameToItem.set(genus, item);
    }
  }

  const detectedIds = new Set<number>();
  let repairedText = responseText;

  // 1. Repair and validate markdown links: [LinkText](.../species/ID)
  const linkRegex = /\[([^\]]+)\]\((?:https?:\/\/[^\/\s]+)?\/species\/(\d+)\)/g;
  repairedText = repairedText.replace(linkRegex, (match, linkText, claimedIdStr) => {
    const claimedId = parseInt(claimedIdStr, 10);
    const cleanName = linkText.trim().replace(/^[*_~`]+|[*_~`]+$/g, '').toLowerCase();
    const genus = cleanName.split(' ')[0].toLowerCase();

    const matchedByText = nameToItem.get(cleanName) || nameToItem.get(genus);
    const matchedById = idToItem.get(claimedId);

    if (matchedByText) {
      detectedIds.add(matchedByText.id);
      if (matchedByText.id !== claimedId) {
        // Hallucinated or mismatched ID repaired to the correct catalog ID
        return `[${linkText}](/species/${matchedByText.id})`;
      }
      return `[${linkText}](/species/${claimedId})`;
    }

    if (matchedById) {
      detectedIds.add(matchedById.id);
      return `[${linkText}](/species/${claimedId})`;
    }

    return match;
  });

  // 2. Also check if any initial matchedSpecies was mentioned by name in text
  for (const s of initialMatchedSpecies) {
    const nameLower = s.name.toLowerCase();
    const genusLower = s.name.split(' ')[0].toLowerCase();
    if (repairedText.toLowerCase().includes(nameLower) || repairedText.toLowerCase().includes(genusLower)) {
      detectedIds.add(s.id);
    }
  }

  // 3. Assemble full species records for all referenced IDs
  const matchedMap = new Map<number, any>();
  for (const s of initialMatchedSpecies) {
    matchedMap.set(s.id, s);
  }

  const missingIds = Array.from(detectedIds).filter(id => !matchedMap.has(id));
  if (missingIds.length > 0) {
    const fetched = await prisma.species.findMany({
      where: { id: { in: missingIds } }
    });
    for (const f of fetched) {
      matchedMap.set(f.id, { ...f, similarity: 0.95 });
    }
  }

  const referencedIds = Array.from(detectedIds);
  const referencedSpecies = referencedIds
    .map(id => matchedMap.get(id))
    .filter(Boolean);

  return {
    repairedText,
    referencedSpecies,
    referencedIds
  };
}

    const buildGroundedSpecimens = (speciesList: any[]) => {
      return speciesList.map(s => {
        let mediaArr: any[] = [];
        let silhouetteObj: any = null;
        try { mediaArr = JSON.parse(s.media || '[]'); } catch {}
        try { silhouetteObj = JSON.parse(s.comparisonSilhouette || '{}'); } catch {}

        return {
          id: s.id,
          name: s.name,
          scientificName: s.scientificName,
          clade: s.clade,
          timePeriod: s.timePeriod,
          similarity: Math.round((s.similarity || 0) * 100),
          imageUrl: mediaArr[0]?.url || null,
          silhouetteUrl: silhouetteObj?.url || null
        };
      });
    };

    // If client explicitly asks for non-streaming JSON
    if (stream === false) {
      const result = await askChiefCurator({
        query: query.trim(),
        conversationHistory: history || [],
        contextSpecies
      });

      const { repairedText, referencedSpecies, referencedIds } = await resolveAndRepairReferencedSpecies(
        result.response,
        matchedSpecies
      );

      // ONLY show species related to / referenced in the response
      const groundedToReturn = referencedSpecies.length > 0
        ? referencedSpecies
        : matchedSpecies.slice(0, 3).filter(s => (s.similarity || 0) >= 0.75);

      res.json({
        answer: repairedText,
        referencedSpeciesIds: referencedIds,
        groundedSpecimens: buildGroundedSpecimens(groundedToReturn)
      });
      return;
    }

    // Server-Sent Events (SSE) Streaming
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    let isClientConnected = true;
    req.on('close', () => {
      isClientConnected = false;
    });

    const sendSseEvent = (event: string, data: any) => {
      if (!isClientConnected) return;
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // 1. Send initial grounded museum specimens metadata (top high-confidence candidates)
    sendSseEvent('grounded', { groundedSpecimens: buildGroundedSpecimens(matchedSpecies.slice(0, 3).filter(s => (s.similarity || 0) >= 0.75)) });

    // 2. Stream tokens via Gemini SDK stream API in real-time
    let fullResponse = '';
    const streamGen = askChiefCuratorStream({
      query: query.trim(),
      conversationHistory: history || [],
      contextSpecies
    });

    for await (const token of streamGen) {
      if (!isClientConnected) break;
      fullResponse += token;
      sendSseEvent('token', { token, text: fullResponse });
    }

    // 3. Compute referenced species IDs, repair any hallucinated IDs, and finalize
    const { repairedText, referencedSpecies, referencedIds } = await resolveAndRepairReferencedSpecies(
      fullResponse,
      matchedSpecies
    );

    // ONLY show species related to / referenced in the response
    const groundedToReturn = referencedSpecies.length > 0
      ? referencedSpecies
      : matchedSpecies.slice(0, 3).filter(s => (s.similarity || 0) >= 0.75);

    const finalizedGrounded = buildGroundedSpecimens(groundedToReturn);

    sendSseEvent('done', {
      answer: repairedText,
      referencedSpeciesIds: referencedIds,
      groundedSpecimens: finalizedGrounded
    });

    res.end();
  } catch (error: any) {
    if (res.headersSent) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: error?.message || 'Streaming failure' })}\n\n`);
      res.end();
    } else {
      next(error);
    }
  }
}

/**
 * 2. POST /api/ai/fossil-lens — Multimodal Fossil Identifier
 */
export async function fossilLens(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'imageBase64 is required' });
      return;
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const analysis = await analyzeFossilImage({
      imageBase64: cleanBase64,
      mimeType: mimeType || 'image/jpeg'
    });

    // Enhance candidate species with Prehistorica database records & silhouettes
    const candidateNames = (analysis.candidatePrehistoricaSpecies || []).map(c => c.name);
    const dbMatches = await prisma.species.findMany({
      where: {
        OR: candidateNames.map(name => ({
          name: { contains: name, mode: 'insensitive' }
        }))
      },
      select: {
        id: true,
        name: true,
        scientificName: true,
        clade: true,
        timePeriod: true,
        media: true,
        comparisonSilhouette: true
      },
      take: 4
    });

    const enrichedCandidates = (analysis.candidatePrehistoricaSpecies || []).map(cand => {
      const match = dbMatches.find(m => m.name.toLowerCase().includes(cand.name.toLowerCase()));
      let mediaArr: any[] = [];
      let silhouetteObj: any = null;
      if (match) {
        try { mediaArr = JSON.parse(match.media || '[]'); } catch {}
        try { silhouetteObj = JSON.parse(match.comparisonSilhouette || '{}'); } catch {}
      }

      return {
        ...cand,
        speciesId: match?.id || null,
        reconstructionUrl: mediaArr[0]?.url || null,
        silhouetteUrl: silhouetteObj?.url || null
      };
    });

    res.json({
      analysis: {
        ...analysis,
        candidatePrehistoricaSpecies: enrichedCandidates
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 3. POST /api/ai/runway/matchup — Caliper Runway Matchup & Biomechanical Engine
 */
export async function simulateRunwayMatchup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { speciesIds } = req.body;

    if (!Array.isArray(speciesIds) || speciesIds.length < 2) {
      res.status(400).json({ error: 'At least two speciesIds are required for biomechanical simulation.' });
      return;
    }

    // Cache key based on sorted species IDs
    const sortedIds = [...speciesIds].sort((a, b) => a - b);
    const cacheKey = `matchup_${sortedIds.join('_')}`;

    // Check DB cache first (0 tokens consumed on hit!)
    const cached: any = await prisma.$queryRawUnsafe(
      `SELECT "analysis" FROM "RunwayMatchupCache" WHERE "speciesKey" = $1 LIMIT 1;`,
      cacheKey
    );

    if (cached && cached.length > 0) {
      res.json({
        cached: true,
        simulation: cached[0].analysis
      });
      return;
    }

    // Load full details for the species
    const speciesList = await prisma.species.findMany({
      where: { id: { in: sortedIds } }
    });

    if (speciesList.length < 2) {
      res.status(404).json({ error: 'One or more requested species not found in database.' });
      return;
    }

    const speciesA = speciesList[0];
    const speciesB = speciesList[1];

    const simulation = await simulateRunwayInteraction({ speciesA, speciesB });

    // Store in cache
    await prisma.$executeRawUnsafe(
      `INSERT INTO "RunwayMatchupCache" ("speciesKey", "analysis")
       VALUES ($1, $2::jsonb)
       ON CONFLICT ("speciesKey") DO NOTHING;`,
      cacheKey,
      JSON.stringify(simulation)
    );

    res.json({
      cached: false,
      simulation
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 4. GET /api/ai/search/semantic — Natural Language Semantic Discovery
 */
export async function semanticSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = req.query.q as string;
    const limit = Math.min(Number(req.query.limit) || 12, 30);

    if (!q || q.trim().length < 2) {
      res.json([]);
      return;
    }

    const matches = await searchSimilarSpecies(q.trim(), limit);

    const formatted = matches.map(s => {
      let mediaArr: any[] = [];
      let silhouetteObj: any = null;
      let geoObj: any = null;
      try { mediaArr = JSON.parse(s.media || '[]'); } catch {}
      try { silhouetteObj = JSON.parse(s.comparisonSilhouette || '{}'); } catch {}
      try { geoObj = JSON.parse(s.geographicRange || '{}'); } catch {}

      return {
        id: s.id,
        name: s.name,
        scientificName: s.scientificName,
        clade: s.clade,
        diet: s.diet,
        habitat: s.habitat,
        timePeriod: s.timePeriod,
        myaStart: s.myaStart,
        myaEnd: s.myaEnd,
        fossilFormation: geoObj?.fossilFormation || null,
        country: geoObj?.country || null,
        reconstructionImageUrl: mediaArr[0]?.url || null,
        comparisonSilhouette: silhouetteObj,
        similarity: Math.round((s.similarity || 0) * 100)
      };
    });

    res.json(formatted);
  } catch (error) {
    next(error);
  }
}

/**
 * 5. GET /api/ai/formation/food-web — Deep-Time Paleo-Biome & Trophic Food Web Synthesizer
 */
export async function getFormationFoodWeb(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const formation = req.query.formation as string;
    const era = (req.query.era as string) || 'Mesozoic';
    const stressor = req.query.stressor as string | undefined;

    if (!formation) {
      res.status(400).json({ error: 'Formation name is required' });
      return;
    }

    const cacheKey = `formation_${formation.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${(stressor || 'baseline').toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    // Check DB cache
    const cached: any = await prisma.$queryRawUnsafe(
      `SELECT "data" FROM "BiomeFoodWebCache" WHERE "formationKey" = $1 LIMIT 1;`,
      cacheKey
    );

    if (cached && cached.length > 0) {
      res.json({
        cached: true,
        foodWeb: cached[0].data
      });
      return;
    }

    // Query species belonging to this formation
    const speciesInFormation = await prisma.species.findMany({
      where: {
        geographicRange: { contains: formation, mode: 'insensitive' }
      },
      select: {
        id: true,
        name: true,
        scientificName: true,
        clade: true,
        diet: true,
        sizeNotes: true
      },
      take: 20
    });

    const foodWeb = await synthesizeFormationFoodWeb({
      formationName: formation,
      era,
      speciesInFormation,
      stressor
    });

    // Save to cache
    await prisma.$executeRawUnsafe(
      `INSERT INTO "BiomeFoodWebCache" ("formationKey", "data")
       VALUES ($1, $2::jsonb)
       ON CONFLICT ("formationKey") DO NOTHING;`,
      cacheKey,
      JSON.stringify(foodWeb)
    );

    res.json({
      cached: false,
      foodWeb
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ai/status — Health check & pgvector indexing status
 */
export async function getAiStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const count = await getEmbeddingCount();
    const totalSpecies = await prisma.species.count();
    res.json({
      status: 'operational',
      models: {
        generation: 'gemini-3.6-flash',
        embedding: 'gemini-embedding-2'
      },
      indexedSpecies: count,
      totalSpecies,
      isFullyIndexed: count >= totalSpecies
    });
  } catch (error) {
    next(error);
  }
}
