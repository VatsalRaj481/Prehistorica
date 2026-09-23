import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  askChiefCurator,
  analyzeFossilImage,
  simulateRunwayInteraction,
  synthesizeFormationFoodWeb,
  GroundingSpeciesContext
} from '../services/gemini.js';
import { searchSimilarSpecies, getEmbeddingCount } from '../services/vectorStore.js';

const prisma = new PrismaClient();

/**
 * 1. POST /api/ai/curator/chat — Chief Curator Grounded RAG Agent
 */
export async function curatorChat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { query, history } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({ error: 'A query string is required' });
      return;
    }

    // 1. Retrieve top matching grounded species from pgvector
    const matchedSpecies = await searchSimilarSpecies(query.trim(), 5);

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

    // 2. Ask Chief Curator with grounded context
    const result = await askChiefCurator({
      query: query.trim(),
      conversationHistory: history || [],
      contextSpecies
    });

    res.json({
      answer: result.response,
      referencedSpeciesIds: result.referencedSpecies,
      groundedSpecimens: matchedSpecies.map(s => {
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
      })
    });
  } catch (error) {
    next(error);
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
