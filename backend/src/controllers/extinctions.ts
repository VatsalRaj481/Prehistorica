import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/extinctions
 * Returns all Big Five mass extinction events from PostgreSQL,
 * ordered chronologically from oldest (End-Ordovician) to youngest (K-Pg).
 */
export async function getExtinctions(req: Request, res: Response) {
  try {
    const extinctions = await prisma.extinctionEvent.findMany({
      orderBy: { peakAgeMa: 'desc' },
    });

    res.json({
      success: true,
      count: extinctions.length,
      data: extinctions,
    });
  } catch (error: any) {
    console.error('Error fetching extinction events from PostgreSQL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve mass extinction events from database.',
      details: error.message,
    });
  }
}

/**
 * GET /api/extinctions/:slug
 * Returns a specific extinction event by slug (e.g. 'end-permian', 'k-pg')
 * with matching museum species from that boundary.
 */
export async function getExtinctionBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;

    const extinction = await prisma.extinctionEvent.findUnique({
      where: { slug },
    });

    if (!extinction) {
      return res.status(404).json({
        success: false,
        error: `Extinction event with slug '${slug}' not found.`,
      });
    }

    // Query species existing around this crisis boundary (+/- 5 Ma)
    const boundarySpecies = await prisma.species.findMany({
      where: {
        AND: [
          { myaStart: { gte: extinction.peakAgeMa - 6 } },
          { myaEnd: { lte: extinction.peakAgeMa + 6 } },
        ],
      },
      select: {
        id: true,
        name: true,
        scientificName: true,
        clade: true,
        diet: true,
        habitat: true,
        timePeriod: true,
        myaStart: true,
        myaEnd: true,
        extinctionEvent: true,
        media: true,
        comparisonSilhouette: true,
      },
      take: 8,
    });

    res.json({
      success: true,
      data: {
        ...extinction,
        boundarySpecies,
      },
    });
  } catch (error: any) {
    console.error(`Error fetching extinction event ${req.params.slug}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve extinction event details.',
      details: error.message,
    });
  }
}

/**
 * GET /api/climate-curves
 * Returns all Phanerozoic geochemical data points (541 Ma to 0 Ma) from PostgreSQL.
 */
export async function getPaleoclimateCurves(req: Request, res: Response) {
  try {
    const points = await prisma.paleoclimatePoint.findMany({
      orderBy: { ageMa: 'desc' },
    });

    res.json({
      success: true,
      count: points.length,
      data: points,
    });
  } catch (error: any) {
    console.error('Error fetching paleoclimate curves from PostgreSQL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve paleoclimate data from database.',
      details: error.message,
    });
  }
}
