import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to capitalize words (for location filtering consistency)
function formatLocation(loc: string): string {
  return loc
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// 1. GET /api/species
export async function getSpecies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { diet, location, time_period, search, fossil_formation, country, creature_type } = req.query;

    const where: any = {};

    if (diet) {
      where.dietType = {
        equals: diet as string,
        mode: 'insensitive',
      };
    }

    if (creature_type) {
      where.creatureType = {
        equals: creature_type as string,
        mode: 'insensitive',
      };
    }

    if (fossil_formation) {
      const cleanFormation = (fossil_formation as string).replace(/\s+(Formation|Beds|Limestone|Group|Basin|Shale)$/i, '').trim();
      where.OR = [
        { fossilFormation: { contains: cleanFormation, mode: 'insensitive' } },
        {
          AND: [
            { country: { equals: country as string, mode: 'insensitive' } }
          ]
        }
      ];
    } else if (location) {
      const formattedLoc = formatLocation(location as string);
      where.locations = {
        has: formattedLoc,
      };
    }

    if (time_period) {
      where.timePeriod = {
        contains: time_period as string,
        mode: 'insensitive',
      };
    }

    if (search) {
      const searchStr = search as string;
      where.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { scientificName: { contains: searchStr, mode: 'insensitive' } },
        { nameMeaning: { contains: searchStr, mode: 'insensitive' } },
        { dietDetails: { contains: searchStr, mode: 'insensitive' } },
        { taxonomicClassification: { contains: searchStr, mode: 'insensitive' } },
        { discoveryHistory: { contains: searchStr, mode: 'insensitive' } },
        { sizeNotes: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    let speciesList = await prisma.species.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    if (fossil_formation) {
      const cleanQuery = (fossil_formation as string).toLowerCase().replace(/\s+(formation|beds|limestone|group|basin|shale)$/i, '').trim();
      
      const directMatches: any[] = [];
      const fallbackMatches: any[] = [];

      speciesList.forEach(s => {
        const form = (s.fossilFormation || '').toLowerCase();
        const isDirect = form && (form.includes(cleanQuery) || cleanQuery.includes(form));
        if (isDirect) {
          directMatches.push({ ...s, isMapFallback: false });
        } else {
          fallbackMatches.push({ ...s, isMapFallback: true });
        }
      });

      speciesList = [...directMatches, ...fallbackMatches];
    }

    res.json(speciesList);
  } catch (error) {
    next(error);
  }
}

// 2. GET /api/species/:id
export async function getSpeciesById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const speciesId = parseInt(id, 10);

    if (isNaN(speciesId)) {
      res.status(400).json({ error: 'Invalid species ID' });
      return;
    }

    const species = await prisma.species.findUnique({
      where: { id: speciesId },
    });

    if (!species) {
      res.status(404).json({ error: 'Species not found' });
      return;
    }

    // Query other species sharing genus or family
    let relatedList: any[] = [];
    if (species.genus || species.family) {
      const orConditions: any[] = [];
      if (species.genus) orConditions.push({ genus: { equals: species.genus, mode: 'insensitive' } });
      if (species.family) orConditions.push({ family: { equals: species.family, mode: 'insensitive' } });

      const relatedMatches = await prisma.species.findMany({
        where: {
          id: { not: speciesId },
          OR: orConditions
        },
        take: 20
      });

      // Sort: Genus matches rank higher than Family matches
      relatedMatches.sort((a, b) => {
        const aIsGenus = a.genus && species.genus && a.genus.toLowerCase() === species.genus.toLowerCase();
        const bIsGenus = b.genus && species.genus && b.genus.toLowerCase() === species.genus.toLowerCase();
        if (aIsGenus && !bIsGenus) return -1;
        if (!aIsGenus && bIsGenus) return 1;
        return 0;
      });

      relatedList = relatedMatches.slice(0, 6);
    }

    const responseData = {
      ...species,
      relatedSpecies: relatedList,
    };

    res.json(responseData);
  } catch (error) {
    next(error);
  }
}

// 3. GET /api/creature-of-the-day
export async function getCreatureOfTheDay(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const allSpecies = await prisma.species.findMany({
      select: { id: true },
      orderBy: { id: 'asc' },
    });

    if (allSpecies.length === 0) {
      res.status(404).json({ error: 'No species found in database' });
      return;
    }

    // Determine day index using UTC midnight timestamp
    const now = new Date();
    const utcYear = now.getUTCFullYear();
    const utcMonth = now.getUTCMonth();
    const utcDate = now.getUTCDate();

    const timestamp = Date.UTC(utcYear, utcMonth, utcDate);
    const daysSinceEpoch = Math.floor(timestamp / (1000 * 60 * 60 * 24));

    const index = daysSinceEpoch % allSpecies.length;
    const dailyId = allSpecies[index].id;

    const dailyCreature = await prisma.species.findUnique({
      where: { id: dailyId },
    });

    res.json(dailyCreature);
  } catch (error) {
    next(error);
  }
}
