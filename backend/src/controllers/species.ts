import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to safely parse stored JSON strings or return original object
function parseJson(val: any, fallback: any) {
  if (!val) return fallback;
  if (typeof val !== 'string') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// Helper to format a DB species record into rich structured JSON
function formatSpeciesRecord(s: any) {
  if (!s) return null;
  const mediaArr = parseJson(s.media, []);
  const taxObj = parseJson(s.taxonomy, {});
  const geoObj = parseJson(s.geographicRange, {});
  const sizeObj = parseJson(s.sizeEstimate, {});

  return {
    ...s,
    dietType: s.dietType || s.diet,
    creatureType: s.creatureType || s.clade,
    locations: parseJson(s.locations, geoObj.region ? [geoObj.region] : []),
    country: s.country || geoObj.country || null,
    fossilFormation: s.fossilFormation || geoObj.fossilFormation || null,
    genus: s.genus || taxObj.genus || null,
    family: s.family || taxObj.family || null,
    reconstructionImageUrl: s.reconstructionImageUrl || (mediaArr.length > 0 ? mediaArr[0].url : null),
    fossilImageUrl: s.fossilImageUrl || (mediaArr.length > 1 ? mediaArr[1].url : null),
    lengthM: s.lengthM !== undefined && s.lengthM !== null ? s.lengthM : (sizeObj.length?.value || null),
    heightM: s.heightM !== undefined && s.heightM !== null ? s.heightM : (sizeObj.height?.value || null),
    weightKg: s.weightKg !== undefined && s.weightKg !== null ? s.weightKg : (sizeObj.weight?.value || null),
    interestingFacts: parseJson(s.interestingFacts, []),
    media: mediaArr,
    taxonomy: taxObj,
    sizeEstimate: sizeObj,
    geographicRange: geoObj,
    closestLivingRelatives: parseJson(s.closestLivingRelatives, []),
    sources: parseJson(s.sources, [])
  };
}


// Helper to capitalize words
function formatLocation(loc: string): string {
  return loc
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// 1. GET /api/species (Filtered Roster, Search, and Pagination)
export async function getSpecies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      diet,
      habitat,
      clade,
      location,
      time_period,
      mya_start,
      mya_end,
      search,
      fossil_formation,
      country,
      creature_type,
      min_length,
      max_length,
      page,
      limit
    } = req.query;

    const where: any = {};

    // Multi-select or single filter for clade
    if (clade) {
      const cladeList = Array.isArray(clade)
        ? clade.map(c => String(c))
        : (clade as string).split(',').map(c => c.trim());
      where.clade = { in: cladeList };
    }

    // Multi-select or single filter for diet
    if (diet) {
      const dietList = Array.isArray(diet)
        ? diet.map(d => String(d).toLowerCase())
        : (diet as string).split(',').map(d => d.trim().toLowerCase());
      where.diet = { in: dietList };
    }

    // Multi-select or single filter for habitat
    if (habitat) {
      const habitatList = Array.isArray(habitat)
        ? habitat.map(h => String(h).toLowerCase())
        : (habitat as string).split(',').map(h => h.trim().toLowerCase());
      where.habitat = { in: habitatList };
    }

    if (creature_type) {
      where.clade = {
        equals: creature_type as any
      };
    }

    if (fossil_formation || country || location) {
      const cleanFormation = (fossil_formation as string || location as string || '').replace(/\s+(Formation|Beds|Limestone|Group|Basin|Shale)$/i, '').trim();
      const targetStr = country as string || cleanFormation;
      if (targetStr) {
        where.geographicRange = {
          contains: targetStr
        };
      }
    }

    if (time_period) {
      where.timePeriod = {
        contains: time_period as string
      };
    }

    if (mya_start || mya_end) {
      const startNum = parseFloat(mya_start as string || '1000');
      const endNum = parseFloat(mya_end as string || '0');
      // Species lived during selected timeframe if overlaps: myaEnd <= startNum AND myaStart >= endNum
      where.myaEnd = { lte: startNum };
      where.myaStart = { gte: endNum };
    }

    if (search) {
      const searchStr = search as string;
      where.OR = [
        { name: { contains: searchStr } },
        { scientificName: { contains: searchStr } },
        { nameMeaning: { contains: searchStr } },
        { geographicRange: { contains: searchStr } },
        { taxonomy: { contains: searchStr } },
        { discoveryHistory: { contains: searchStr } }
      ];
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [total, rawList] = await Promise.all([
      prisma.species.count({ where }),
      prisma.species.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: limit ? skip : undefined,
        take: limit ? limitNum : undefined
      })
    ]);

    let speciesList = rawList.map(formatSpeciesRecord);

    if (fossil_formation) {
      const cleanQuery = (fossil_formation as string).toLowerCase().replace(/\s+(formation|beds|limestone|group|basin|shale)$/i, '').trim();
      
      const directMatches: any[] = [];
      const fallbackMatches: any[] = [];

      speciesList.forEach(s => {
        const form = (s.fossilFormation || s.geographicRange?.fossilFormation || '').toLowerCase();
        const isDirect = form && (form.includes(cleanQuery) || cleanQuery.includes(form));
        if (isDirect) {
          directMatches.push({ ...s, isMapFallback: false });
        } else {
          fallbackMatches.push({ ...s, isMapFallback: true });
        }
      });

      speciesList = [...directMatches, ...fallbackMatches];
    }

    if (limit) {
      res.json({
        data: speciesList,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } else {
      res.json(speciesList);
    }
  } catch (error) {
    next(error);
  }
}

// 2. GET /api/species/search/autocomplete
export async function searchAutocomplete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = req.query.q as string;
    if (!q || q.trim().length < 2) {
      res.json([]);
      return;
    }

    const searchStr = q.trim();

    const matches = await prisma.species.findMany({
      where: {
        OR: [
          { name: { contains: searchStr } },
          { scientificName: { contains: searchStr } },
          { geographicRange: { contains: searchStr } }
        ]
      },
      select: {
        id: true,
        name: true,
        scientificName: true,
        clade: true,
        geographicRange: true,
        media: true
      },
      take: 8,
      orderBy: { name: 'asc' }
    });

    const formattedMatches = matches.map(formatSpeciesRecord);
    res.json(formattedMatches);
  } catch (error) {
    next(error);
  }
}

// 3. GET /api/species/compare?ids=1,2
export async function compareSpecies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idsParam = req.query.ids as string;
    if (!idsParam) {
      res.status(400).json({ error: 'Please provide ids query parameter (e.g. ?ids=1,2)' });
      return;
    }

    const idList = idsParam.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));

    const rawMatches = await prisma.species.findMany({
      where: { id: { in: idList } }
    });

    const speciesList = rawMatches.map(formatSpeciesRecord);
    res.json(speciesList);
  } catch (error) {
    next(error);
  }
}

// 4. GET /api/species/:id
export async function getSpeciesById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const speciesId = parseInt(id, 10);

    if (isNaN(speciesId)) {
      res.status(400).json({ error: 'Invalid species ID' });
      return;
    }

    const rawSpecies = await prisma.species.findUnique({
      where: { id: speciesId }
    });

    if (!rawSpecies) {
      res.status(404).json({ error: 'Species not found' });
      return;
    }

    const species = formatSpeciesRecord(rawSpecies);

    // Query related species based on clade or taxonomy genus/family
    let relatedList: any[] = [];
    const taxObj = species.taxonomy || {};
    const targetGenus = taxObj.genus;
    const targetFamily = taxObj.family;

    const relatedMatches = await prisma.species.findMany({
      where: {
        id: { not: speciesId },
        clade: rawSpecies.clade
      },
      take: 12
    });

    const formattedRelated = relatedMatches.map(formatSpeciesRecord);

    // Rank genus/family matches higher
    formattedRelated.sort((a, b) => {
      const aGenus = a.taxonomy?.genus;
      const bGenus = b.taxonomy?.genus;
      const aIsGenus = aGenus && targetGenus && aGenus.toLowerCase() === targetGenus.toLowerCase();
      const bIsGenus = bGenus && targetGenus && bGenus.toLowerCase() === targetGenus.toLowerCase();
      if (aIsGenus && !bIsGenus) return -1;
      if (!aIsGenus && bIsGenus) return 1;
      return 0;
    });

    relatedList = formattedRelated.slice(0, 6);


    const responseData = {
      ...species,
      relatedSpecies: relatedList,
    };

    res.json(responseData);
  } catch (error) {
    next(error);
  }
}

// 5. GET /api/species/creature-of-the-day
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

    res.json(formatSpeciesRecord(dailyCreature));
  } catch (error) {
    next(error);
  }
}

