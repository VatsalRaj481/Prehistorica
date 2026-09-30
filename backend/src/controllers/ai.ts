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
    let matchedSpecies = await searchSimilarSpecies(searchQuery, 6);

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

    const buildGroundedSpecimens = (speciesList: any[], referencedIds: number[] = []) => {
      const formatted = speciesList.map(s => {
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

      if (referencedIds.length === 0) {
        return formatted;
      }

      // Prioritize referenced species first, and filter out unreferenced low-similarity records (<62%)
      return formatted
        .filter(s => referencedIds.includes(s.id) || (s.similarity || 0) >= 62)
        .sort((a, b) => {
          const aRef = referencedIds.includes(a.id) ? 1 : 0;
          const bRef = referencedIds.includes(b.id) ? 1 : 0;
          if (aRef !== bRef) return bRef - aRef;
          return (b.similarity || 0) - (a.similarity || 0);
        });
    };

    // If client explicitly asks for non-streaming JSON
    if (stream === false) {
      const result = await askChiefCurator({
        query: query.trim(),
        conversationHistory: history || [],
        contextSpecies
      });

      const groundedSpecimens = buildGroundedSpecimens(matchedSpecies, result.referencedSpecies);

      res.json({
        answer: result.response,
        referencedSpeciesIds: result.referencedSpecies,
        groundedSpecimens
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

    // 1. Send initial grounded museum specimens metadata
    sendSseEvent('grounded', { groundedSpecimens: buildGroundedSpecimens(matchedSpecies) });

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

    // 3. Compute referenced species IDs and finalize
    const referencedSpeciesIds: number[] = [];
    contextSpecies.forEach(s => {
      if (fullResponse.includes(`/species/${s.id}`) || fullResponse.toLowerCase().includes(s.name.toLowerCase())) {
        referencedSpeciesIds.push(s.id);
      }
    });

    const finalizedGrounded = buildGroundedSpecimens(matchedSpecies, referencedSpeciesIds);

    sendSseEvent('done', {
      answer: fullResponse,
      referencedSpeciesIds,
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
