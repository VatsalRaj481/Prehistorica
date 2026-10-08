import '../dns-init.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to safely parse stored JSON strings or return original object
function parseJson(val: any, fallback: any) {
  if (!val) return fallback;
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const items = trimmed
          .slice(1, -1)
          .match(/("(?:[^"\\]|\\.)*"|[^,]+)/g);
        if (items) {
          return items.map(s => s.replace(/^"|"$/g, '').replace(/\\"/g, '"').trim());
        }
      } catch {}
    }
    return fallback;
  }
}

// Format a DB species record into rich structured JSON
export function formatSpeciesRecord(s: any) {
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
    reconstructionImageUrl: s.reconstructionImageUrl || (mediaArr.find((m: any) => m.type === 'art' || m.type === 'life_reconstruction')?.url || null),
    fossilImageUrl: s.fossilImageUrl || (mediaArr.find((m: any) => m.type === 'fossil_specimen' || m.type === 'photo')?.url || (mediaArr.length > 1 ? mediaArr[1].url : null)),
    lengthM: s.lengthM !== undefined && s.lengthM !== null ? s.lengthM : (sizeObj.length?.value ?? null),
    heightM: s.heightM !== undefined && s.heightM !== null ? s.heightM : (sizeObj.height?.value ?? null),
    weightKg: s.weightKg !== undefined && s.weightKg !== null ? s.weightKg : (sizeObj.weight?.value ?? null),
    interestingFacts: parseJson(s.interestingFacts, []),
    media: mediaArr,
    taxonomy: taxObj,
    sizeEstimate: sizeObj,
    geographicRange: geoObj,
    closestLivingRelatives: parseJson(s.closestLivingRelatives, []),
    sources: parseJson(s.sources, []),
    comparisonSilhouette: parseJson(s.comparisonSilhouette, null)
  };
}

// High-precision search evaluation ensuring word-boundary matches and preventing false positives
export function evaluateSearchMatch(s: any, query: string): { matched: boolean; score: number } {
  if (!query) return { matched: true, score: 0 };
  const q = query.trim().toLowerCase();
  if (!q) return { matched: true, score: 0 };

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const wordPrefixRegex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}`, 'i');
  const exactWordRegex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i');

  const sName = (s.name || '').toLowerCase();
  const sSci = (s.scientificName || '').toLowerCase();
  const taxObj = s.taxonomy || {};

  let score = 0;
  let matched = false;

  // 1. Primary Name & Scientific Name Matches
  if (sName === q || sSci === q) {
    matched = true;
    score += 100;
  } else if (sName.startsWith(q) || sSci.startsWith(q)) {
    matched = true;
    score += 80;
  } else if (exactWordRegex.test(sName) || exactWordRegex.test(sSci)) {
    matched = true;
    score += 70;
  } else if (wordPrefixRegex.test(sName) || wordPrefixRegex.test(sSci)) {
    matched = true;
    score += 50;
  }

  // 2. Structured Taxonomy Matches (Family, Genus, Order, Class, Clade)
  const genus = (taxObj.genus || '').toLowerCase();
  if (genus) {
    if (genus === q) {
      matched = true;
      score += 90;
    } else if (genus.startsWith(q)) {
      matched = true;
      score += 60;
    }
  }

  for (const [rank, val] of Object.entries(taxObj)) {
    if (typeof val === 'string' && val.trim()) {
      const vLower = val.toLowerCase();
      if (vLower === q) {
        matched = true;
        score += 85;
      } else if (exactWordRegex.test(val)) {
        matched = true;
        score += 65;
      } else if (wordPrefixRegex.test(val)) {
        matched = true;
        score += 45;
      }
    }
  }

  // 3. Geographic Range (Region, Country, Formation)
  const geoObj = s.geographicRange || {};
  for (const val of Object.values(geoObj)) {
    if (typeof val === 'string' && val.trim()) {
      const vLower = val.toLowerCase();
      if (vLower === q || exactWordRegex.test(val) || wordPrefixRegex.test(val)) {
        matched = true;
        score += 30;
      }
    }
  }

  // 4. Name Meaning
  if (s.nameMeaning && (exactWordRegex.test(s.nameMeaning) || wordPrefixRegex.test(s.nameMeaning))) {
    matched = true;
    score += 20;
  }

  return { matched, score };
}

export const CLADE_CANONICAL_MAP: Record<string, string> = {
  // Direct Prisma Clade enum matches
  'theropod': 'Theropod',
  'sauropod': 'Sauropod',
  'ornithischian': 'Ornithischian',
  'pterosaur': 'Pterosaur',
  'marine_reptile': 'Marine_Reptile',
  'marine reptile': 'Marine_Reptile',
  'early_mammal_synapsid': 'Early_Mammal_Synapsid',
  'early mammal/synapsid': 'Early_Mammal_Synapsid',
  'early mammal synapsid': 'Early_Mammal_Synapsid',
  'early_tetrapod_amphibian': 'Early_Tetrapod_Amphibian',
  'early tetrapod/amphibian': 'Early_Tetrapod_Amphibian',
  'early tetrapod amphibian': 'Early_Tetrapod_Amphibian',
  'invertebrate': 'Invertebrate',
  'sauropodomorph': 'Sauropodomorph',
  'aetosaur': 'Aetosaur',
  'phytosaur': 'Phytosaur',
  'rauisuchian': 'Rauisuchian',
  'poposauroid': 'Poposauroid',
  'crocodylomorph': 'Crocodylomorph',
  'silesaurid': 'Silesaurid',
  'archosauriform': 'Archosauriform',
  'protorosaur': 'Protorosaur',
  'other': 'Other',

  // Common UI aliases and synonyms
  'sauropodomorpha': 'Sauropodomorph',
  'sauropoda': 'Sauropod',
  'basal_sauropodomorph': 'Sauropodomorph',
  'basal_sauropodomorpha': 'Sauropodomorph',
  'marine_reptiles': 'Marine_Reptile',
  'ichthyosaur': 'Marine_Reptile',
  'ichthyosaurs': 'Marine_Reptile',
  'ichthyosauria': 'Marine_Reptile',
  'plesiosaur': 'Marine_Reptile',
  'plesiosaurs': 'Marine_Reptile',
  'plesiosauria': 'Marine_Reptile',
  'pliosaur': 'Marine_Reptile',
  'pliosaurs': 'Marine_Reptile',
  'mosasaur': 'Marine_Reptile',
  'mosasaurs': 'Marine_Reptile',
  'mosasauroidea': 'Marine_Reptile',
  'ankylosaur': 'Ornithischian',
  'ankylosauria': 'Ornithischian',
  'ceratopsian': 'Ornithischian',
  'ceratopsidae': 'Ornithischian',
  'hadrosaur': 'Ornithischian',
  'hadrosauridae': 'Ornithischian',
  'stegosaur': 'Ornithischian',
  'stegosauria': 'Ornithischian'
};

export interface SpeciesRosterItem {
  id: number;
  name: string;
  scientificName: string;
  clade: string;
  timePeriod: string;
  myaStart?: number;
  myaEnd?: number;
  taxonomy?: any;
  silhouetteUrl?: string | null;
  diet?: string;
  habitat?: string;
  fossilFormation?: string | null;
  reconstructionImageUrl?: string | null;
  lengthM?: number | null;
  heightM?: number | null;
  weightKg?: number | null;
}

export interface CachedSpeciesDetail {
  species: any;
  catalogPage: number;
  relatedSpecies: any[];
}

class SpeciesCacheManager {
  private cacheMap = new Map<number, any>();
  private sortedList: any[] = [];
  private rosterList: SpeciesRosterItem[] = [];
  private detailsMap = new Map<number, CachedSpeciesDetail>();
  private cachedCount = 0;
  private cachedMaxUpdatedAt: number | null = null;
  private lastCheckTime = 0;
  private readonly CHECK_INTERVAL_MS = 15000; // Check DB at most once every 15 seconds
  private backgroundTimer: NodeJS.Timeout | null = null;
  private initialized = false;
  private initializingPromise: Promise<void> | null = null;
  private lastRefreshedAt: Date | null = null;

  /**
   * Initializes the in-memory cache by warming up all species from the database.
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    if (this.initializingPromise) return this.initializingPromise;

    this.initializingPromise = (async () => {
      const startTime = Date.now();
      try {
        console.log('[SpeciesCache] Warming up in-memory species cache from database...');
        const [rawList, telemetry] = await Promise.all([
          prisma.species.findMany({ orderBy: { name: 'asc' } }),
          prisma.species.aggregate({
            _count: { id: true },
            _max: { updatedAt: true }
          })
        ]);

        const newMap = new Map<number, any>();
        const formattedList: any[] = [];
        const newRoster: SpeciesRosterItem[] = [];

        for (const raw of rawList) {
          const formatted = formatSpeciesRecord(raw);
          if (formatted) {
            newMap.set(formatted.id, formatted);
            formattedList.push(formatted);

            // Build lightweight roster item
            const artMedia = formatted.media?.find((m: any) => m.type === 'art' || m.type === 'life_reconstruction');
            newRoster.push({
              id: formatted.id,
              name: formatted.name,
              scientificName: formatted.scientificName,
              clade: formatted.clade,
              timePeriod: formatted.timePeriod,
              myaStart: formatted.myaStart,
              myaEnd: formatted.myaEnd,
              taxonomy: formatted.taxonomy || null,
              silhouetteUrl: formatted.comparisonSilhouette?.url || null,
              diet: formatted.diet,
              habitat: formatted.habitat,
              fossilFormation: formatted.fossilFormation,
              reconstructionImageUrl: formatted.reconstructionImageUrl || artMedia?.url || null,
              lengthM: formatted.lengthM,
              heightM: formatted.heightM,
              weightKg: formatted.weightKg
            });
          }
        }

        // Precompute detail bundle (coexisting related species and catalog page) for all species
        const newDetailsMap = new Map<number, CachedSpeciesDetail>();
        for (let i = 0; i < formattedList.length; i++) {
          const target = formattedList[i];
          const targetFormation = target.fossilFormation || target.geographicRange?.fossilFormation || null;
          const targetCountry = target.country || target.geographicRange?.country || null;
          const targetPeriod = target.timePeriod;

          const formationMatches: any[] = [];
          const eraRegionMatches: any[] = [];
          const cladeMatches: any[] = [];
          const seenIds = new Set<number>();

          for (const cand of formattedList) {
            if (cand.id === target.id) continue;
            const candForm = cand.fossilFormation || cand.geographicRange?.fossilFormation || '';
            const candCountry = cand.country || cand.geographicRange?.country || '';

            let isSameFormation = false;
            if (targetFormation && candForm) {
              const cleanT = targetFormation.toLowerCase().replace(/\s+(formation|beds|group|shale|limestone)$/i, '').trim();
              const cleanC = candForm.toLowerCase().replace(/\s+(formation|beds|group|shale|limestone)$/i, '').trim();
              if (cleanT && cleanC && (cleanT.includes(cleanC) || cleanC.includes(cleanT))) {
                isSameFormation = true;
              }
            }

            if (isSameFormation) {
              formationMatches.push({ ...cand, coexistSignal: 'formation' });
              seenIds.add(cand.id);
            } else if (targetPeriod && cand.timePeriod && cand.timePeriod === targetPeriod && (candCountry && targetCountry && candCountry.toLowerCase() === targetCountry.toLowerCase())) {
              if (!seenIds.has(cand.id)) {
                eraRegionMatches.push({ ...cand, coexistSignal: 'era_region' });
                seenIds.add(cand.id);
              }
            } else if (cand.clade === target.clade) {
              if (!seenIds.has(cand.id)) {
                cladeMatches.push({ ...cand, coexistSignal: 'clade' });
                seenIds.add(cand.id);
              }
            }
          }

          const relatedList = [...formationMatches, ...eraRegionMatches, ...cladeMatches].slice(0, 6);
          const catalogPage = Math.floor(i / 12) + 1;

          newDetailsMap.set(target.id, {
            species: target,
            catalogPage,
            relatedSpecies: relatedList
          });
        }

        this.cacheMap = newMap;
        this.sortedList = formattedList;
        this.rosterList = newRoster;
        this.detailsMap = newDetailsMap;
        this.cachedCount = telemetry._count.id;
        this.cachedMaxUpdatedAt = telemetry._max.updatedAt?.getTime() || null;
        this.lastCheckTime = Date.now();
        this.initialized = true;
        this.lastRefreshedAt = new Date();

        // Start periodic background revalidation timer (every 30 seconds)
        if (!this.backgroundTimer) {
          this.backgroundTimer = setInterval(() => {
            this.checkAndRevalidate().catch(err => {
              console.warn('[SpeciesCache] Background revalidation check error:', err?.message || err);
            });
          }, 30000);
          this.backgroundTimer.unref();
        }

        const duration = Date.now() - startTime;
        console.log(`[SpeciesCache] ✓ In-memory cache loaded successfully: ${this.cacheMap.size} specimens ready in ${duration}ms (telemetry count: ${this.cachedCount}).`);
      } catch (err) {
        console.error('[SpeciesCache] Failed to warm in-memory cache:', err);
        throw err;
      } finally {
        this.initializingPromise = null;
      }
    })();

    return this.initializingPromise;
  }

  /**
   * Automatically checks if the database has changed by comparing count and max(updatedAt).
   * If a difference is detected, reloads the cache transparently.
   */
  async checkAndRevalidate(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastCheckTime < this.CHECK_INTERVAL_MS) {
      return false;
    }
    this.lastCheckTime = now;

    try {
      const telemetry = await prisma.species.aggregate({
        _count: { id: true },
        _max: { updatedAt: true }
      });

      const currentCount = telemetry._count.id;
      const currentMaxUpdated = telemetry._max.updatedAt?.getTime() || null;

      if (currentCount !== this.cachedCount || currentMaxUpdated !== this.cachedMaxUpdatedAt) {
        console.log(`[SpeciesCache] 🔄 Database change detected (count: ${this.cachedCount} -> ${currentCount}). Auto-refreshing in-memory cache...`);
        await this.refresh();
        return true;
      }
    } catch (err: any) {
      console.warn('[SpeciesCache] Failed to verify DB change telemetry:', err.message);
    }
    return false;
  }

  /**
   * Refreshes the cache by invalidating and re-reading the database.
   */
  async refresh(): Promise<number> {
    this.initialized = false;
    await this.init();
    return this.cacheMap.size;
  }

  /**
   * Ensure cache is warmed and conditionally checks for database updates.
   */
  private async ensureReady(): Promise<void> {
    if (!this.initialized) {
      await this.init();
      return;
    }

    // Trigger non-blocking change detection check if interval has elapsed
    if (Date.now() - this.lastCheckTime >= this.CHECK_INTERVAL_MS) {
      this.checkAndRevalidate().catch(() => {});
    }
  }

  /**
   * Retrieves a single species by ID in O(1) time with pre-computed coexisting relations.
   */
  async getById(id: number): Promise<CachedSpeciesDetail | null> {
    await this.ensureReady();
    return this.detailsMap.get(id) || null;
  }

  /**
   * Retrieves the lightweight roster for dropdowns, selectors, and runway.
   */
  async getRoster(): Promise<SpeciesRosterItem[]> {
    await this.ensureReady();
    return this.rosterList;
  }

  /**
   * Retrieves species for comparison in O(1) time per ID.
   */
  async compare(ids: number[]): Promise<any[]> {
    await this.ensureReady();
    const result: any[] = [];
    for (const id of ids) {
      const s = this.cacheMap.get(id);
      if (s) result.push(s);
    }
    return result;
  }

  /**
   * Evaluates search autocomplete in memory.
   */
  async autocomplete(query: string, limit = 8): Promise<any[]> {
    await this.ensureReady();
    const searchStr = (query || '').trim();
    if (!searchStr || searchStr.length < 2) return [];

    const scored: { item: any; score: number }[] = [];
    for (const s of this.sortedList) {
      const evalRes = evaluateSearchMatch(s, searchStr);
      if (evalRes.matched) {
        scored.push({ item: s, score: evalRes.score });
      }
    }

    scored.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));
    return scored.slice(0, limit).map(s => s.item);
  }

  /**
   * Evaluates query filters, search, and pagination in memory.
   */
  async querySpecies(filters: {
    diet?: string;
    habitat?: string;
    clade?: string;
    creature_type?: string;
    location?: string;
    time_period?: string;
    fossil_formation?: string;
    country?: string;
    min_length?: number;
    max_length?: number;
    mya_start?: number;
    mya_end?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ total: number; page: number; limit: number; totalPages: number; data: any[] }> {
    await this.ensureReady();

    const {
      diet,
      habitat,
      clade,
      creature_type,
      location,
      time_period,
      fossil_formation,
      country,
      min_length,
      max_length,
      mya_start,
      mya_end,
      search,
      page = 1,
      limit = 50
    } = filters;

    let candidateList = this.sortedList;

    // 1. Relational/attribute filters
    if (diet) {
      const dietArr = diet.split(',').map(d => d.trim().toLowerCase()).filter(Boolean);
      candidateList = candidateList.filter(s => {
        const d = (s.diet || s.dietType || '').toLowerCase();
        return dietArr.includes(d);
      });
    }

    if (habitat) {
      const habArr = habitat.split(',').map(h => h.trim().toLowerCase()).filter(Boolean);
      candidateList = candidateList.filter(s => {
        const h = (s.habitat || '').toLowerCase();
        return habArr.includes(h);
      });
    }

    const cladeTarget = clade || creature_type;
    if (cladeTarget) {
      const cladeArr = (Array.isArray(cladeTarget) ? cladeTarget : String(cladeTarget).split(','))
        .map(c => String(c).trim())
        .filter(Boolean);
      const normalizedTargets: string[] = [];
      for (const item of cladeArr) {
        const key = item.toLowerCase().replace(/[\s\/-]+/g, '_');
        const resolved = CLADE_CANONICAL_MAP[key] || CLADE_CANONICAL_MAP[item.toLowerCase()] || item;
        normalizedTargets.push(resolved.toLowerCase());
      }
      candidateList = candidateList.filter(s => {
        const c = (s.clade || s.creatureType || '').toLowerCase();
        return normalizedTargets.some(target => c === target || c.includes(target));
      });
    }

    if (location) {
      const locClean = location.trim().toLowerCase();
      candidateList = candidateList.filter(s => {
        const geo = s.geographicRange || {};
        const continent = (geo.continent || '').toLowerCase();
        const region = (geo.region || '').toLowerCase();
        const cty = (s.country || geo.country || '').toLowerCase();
        return continent.includes(locClean) || region.includes(locClean) || cty.includes(locClean);
      });
    }

    if (country) {
      const ctyClean = country.trim().toLowerCase();
      candidateList = candidateList.filter(s => {
        const c = (s.country || s.geographicRange?.country || '').toLowerCase();
        return c.includes(ctyClean);
      });
    }

    if (time_period) {
      const tpClean = time_period.trim().toLowerCase();
      candidateList = candidateList.filter(s => {
        const tp = (s.timePeriod || '').toLowerCase();
        return tp.includes(tpClean);
      });
    }

    if (mya_start !== undefined && !isNaN(mya_start)) {
      candidateList = candidateList.filter(s => s.myaEnd <= mya_start);
    }

    if (mya_end !== undefined && !isNaN(mya_end)) {
      candidateList = candidateList.filter(s => s.myaStart >= mya_end);
    }

    if (min_length !== undefined && !isNaN(min_length)) {
      candidateList = candidateList.filter(s => {
        const len = s.lengthM;
        return len !== null && len !== undefined && !isNaN(len) && len >= min_length;
      });
    }

    if (max_length !== undefined && !isNaN(max_length)) {
      candidateList = candidateList.filter(s => {
        const len = s.lengthM;
        return len !== null && len !== undefined && !isNaN(len) && len <= max_length;
      });
    }

    // 2. High-precision word-boundary search filtering & scoring
    if (search && search.trim()) {
      const searchStr = search.trim();
      const scored: { item: any; score: number }[] = [];
      for (const s of candidateList) {
        const evalRes = evaluateSearchMatch(s, searchStr);
        if (evalRes.matched) {
          scored.push({ item: s, score: evalRes.score });
        }
      }
      scored.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));
      candidateList = scored.map(s => s.item);
    }

    // 3. Fossil formation matching
    if (fossil_formation) {
      const cleanQuery = fossil_formation.toLowerCase().replace(/\s+(formation|beds|limestone|group|basin|shale)$/i, '').trim();
      const directMatches: any[] = [];
      const fallbackMatches: any[] = [];

      candidateList.forEach(s => {
        const form = (s.fossilFormation || s.geographicRange?.fossilFormation || '').toLowerCase();
        const isDirect = form && (form.includes(cleanQuery) || cleanQuery.includes(form));
        if (isDirect) {
          directMatches.push({ ...s, isMapFallback: false });
        } else {
          fallbackMatches.push({ ...s, isMapFallback: true });
        }
      });

      candidateList = [...directMatches, ...fallbackMatches];
    }

    const total = candidateList.length;
    const pageNum = Math.max(1, page);
    const limitNum = limit > 0 ? limit : 50;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const skip = (pageNum - 1) * limitNum;
    const paginatedData = limit > 0 ? candidateList.slice(skip, skip + limitNum) : candidateList;

    return {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      data: paginatedData
    };
  }

  /**
   * Deterministically returns the Creature of the Day based on UTC date.
   */
  async getCreatureOfTheDay(): Promise<any> {
    await this.ensureReady();
    if (this.sortedList.length === 0) return null;

    const now = new Date();
    const utcYear = now.getUTCFullYear();
    const utcMonth = now.getUTCMonth();
    const utcDate = now.getUTCDate();
    const timestamp = Date.UTC(utcYear, utcMonth, utcDate);
    const daysSinceEpoch = Math.floor(timestamp / (1000 * 60 * 60 * 24));

    const index = daysSinceEpoch % this.sortedList.length;
    return this.sortedList[index];
  }

  /**
   * Cache telemetry and status metrics.
   */
  getStats() {
    return {
      initialized: this.initialized,
      totalCached: this.cacheMap.size,
      lastRefreshedAt: this.lastRefreshedAt,
      approxMemoryBytes: this.cacheMap.size * 5500 // ~5.5 KB per rich record = ~4.4 MB total
    };
  }
}

export const speciesCache = new SpeciesCacheManager();
