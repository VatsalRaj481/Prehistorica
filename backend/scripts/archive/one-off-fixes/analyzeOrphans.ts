import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

const supabaseUrl = process.env.SUPABASE_URL || 'https://bbsmxcoywionsvmfznah.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

interface StorageItem {
  name: string;
  id?: string | null;
  metadata?: { size?: number; [key: string]: any } | null;
}

async function listStorageFolder(prefix: string = ''): Promise<{ name: string; path: string; size: number }[]> {
  let allFiles: { name: string; path: string; size: number }[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/list/species-media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prefix,
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' }
      })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to list storage (status ${res.status}): ${text}`);
    }

    const items: StorageItem[] = await res.json();
    if (!items || items.length === 0) break;

    for (const item of items) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (!item.id && (!item.metadata || Object.keys(item.metadata).length === 0)) {
        const subFiles = await listStorageFolder(fullPath);
        allFiles.push(...subFiles);
      } else {
        allFiles.push({
          name: item.name,
          path: fullPath,
          size: item.metadata?.size || 0
        });
      }
    }

    if (items.length < limit) break;
    offset += limit;
  }

  return allFiles;
}

async function analyze() {
  console.log("1. Fetching storage files...");
  const storageFiles = await listStorageFolder('');
  console.log(`Found ${storageFiles.length} files in Supabase Storage 'species-media'.`);

  console.log("\n2. Fetching species records from DB...");
  const speciesList = await prisma.species.findMany();
  console.log(`Found ${speciesList.length} species in DB.`);

  // Collect all URLs referenced in media arrays across all species
  const allMediaUrls: { url: string; speciesId: number; speciesName: string; mediaType: string }[] = [];
  const dbFullTextUrls: { url: string; speciesId: number; speciesName: string; field: string }[] = [];

  for (const s of speciesList) {
    let mediaArr: any[] = [];
    if (s.media) {
      try {
        mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : s.media;
      } catch (e) {
        console.error(`Failed to parse media for species #${s.id}: ${s.media}`);
      }
    }
    if (Array.isArray(mediaArr)) {
      for (const item of mediaArr) {
        if (item && item.url) {
          allMediaUrls.push({
            url: item.url,
            speciesId: s.id,
            speciesName: s.name,
            mediaType: item.type || 'unknown'
          });
        }
      }
    }

    // Check all fields for any supabase storage URLs just in case
    const jsonFields = {
      media: s.media,
      sources: s.sources,
      discoveryHistory: s.discoveryHistory,
      interestingFacts: s.interestingFacts,
      sizeNotes: s.sizeNotes,
      dietDetails: s.dietDetails
    };

    for (const [fieldName, val] of Object.entries(jsonFields)) {
      if (typeof val === 'string' && val.includes('species-media')) {
        dbFullTextUrls.push({
          url: val,
          speciesId: s.id,
          speciesName: s.name,
          field: fieldName
        });
      }
    }
  }

  console.log(`Total URLs in all species media arrays: ${allMediaUrls.length}`);
  console.log(`Total DB entries containing 'species-media' string: ${dbFullTextUrls.length}`);

  // Print sample URLs from media arrays
  console.log("\nSample DB Media URLs (first 10):");
  allMediaUrls.slice(0, 10).forEach(m => console.log(`  [Species #${m.speciesId} ${m.speciesName}] (${m.mediaType}): ${m.url}`));

  // Let's create helper functions for URL normalization
  // Standard Supabase public URL: https://<project>.supabase.co/storage/v1/object/public/species-media/<filename>
  // Or http/https variations, query string parameters, url encoding (e.g. %20 vs space, %28 vs (, etc.)
}

analyze().catch(console.error).finally(() => prisma.$disconnect());
