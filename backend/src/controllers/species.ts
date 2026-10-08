import '../dns-init.js';
import { Request, Response, NextFunction } from 'express';
import { 
  speciesCache, 
  formatSpeciesRecord, 
  evaluateSearchMatch,
  CLADE_CANONICAL_MAP 
} from '../services/speciesCache.js';

export { formatSpeciesRecord, evaluateSearchMatch, CLADE_CANONICAL_MAP };

// 1. GET /api/species (Filtered Roster, Search, and Pagination via In-Memory Cache)
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

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = limit !== undefined ? parseInt(limit as string, 10) : 0;
    const minL = min_length !== undefined ? parseFloat(min_length as string) : undefined;
    const maxL = max_length !== undefined ? parseFloat(max_length as string) : undefined;
    const myaStart = mya_start !== undefined ? parseFloat(mya_start as string) : undefined;
    const myaEnd = mya_end !== undefined ? parseFloat(mya_end as string) : undefined;

    const result = await speciesCache.querySpecies({
      diet: diet as string,
      habitat: habitat as string,
      clade: (clade || creature_type) as string,
      creature_type: creature_type as string,
      location: location as string,
      time_period: time_period as string,
      fossil_formation: fossil_formation as string,
      country: country as string,
      min_length: minL,
      max_length: maxL,
      mya_start: myaStart,
      mya_end: myaEnd,
      search: search as string,
      page: pageNum,
      limit: limitNum
    });

    if (limit !== undefined) {
      res.json({
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      });
    } else {
      res.json(result.data);
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

    const matches = await speciesCache.autocomplete(q, 8);
    res.json(matches);
  } catch (error) {
    next(error);
  }
}

// 2.5 GET /api/species/roster (Lightweight roster for search, selectors, and dropdowns)
export async function getSpeciesRoster(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const roster = await speciesCache.getRoster();
    res.json(roster);
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

    const idList = idsParam
      .split(',')
      .map(id => parseInt(id.trim(), 10))
      .filter(id => !isNaN(id));

    const orderedList = await speciesCache.compare(idList);
    res.json(orderedList);
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

    const result = await speciesCache.getById(speciesId);

    if (!result) {
      res.status(404).json({ error: 'Species not found' });
      return;
    }

    const responseData = {
      ...result.species,
      catalogPage: result.catalogPage,
      relatedSpecies: result.relatedSpecies
    };

    res.json(responseData);
  } catch (error) {
    next(error);
  }
}

// 5. GET /api/species/creature-of-the-day
export async function getCreatureOfTheDay(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const daily = await speciesCache.getCreatureOfTheDay();

    if (!daily) {
      res.status(404).json({ error: 'No species found in database' });
      return;
    }

    res.json(daily);
  } catch (error) {
    next(error);
  }
}

// 6. POST /api/species/cache/refresh (Curatorial invalidation and reload hook)
export async function refreshCache(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const count = await speciesCache.refresh();
    res.json({
      status: 'ok',
      message: 'In-memory species cache successfully refreshed',
      totalCached: count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

// 7. GET /api/species/cache/stats (Cache telemetry)
export async function getCacheStats(req: Request, res: Response): Promise<void> {
  res.json(speciesCache.getStats());
}
