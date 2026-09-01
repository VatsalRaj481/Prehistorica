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
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: {
    size?: number;
    mimetype?: string;
    [key: string]: any;
  } | null;
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
      throw new Error(`Failed to list storage folder '${prefix}' (status ${res.status}): ${text}`);
    }

    const items: StorageItem[] = await res.json();
    if (!items || items.length === 0) {
      break;
    }

    for (const item of items) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      // If item is a folder (id is null or metadata is null/empty)
      if (!item.id && (!item.metadata || Object.keys(item.metadata).length === 0)) {
        const subFiles = await listStorageFolder(fullPath);
        allFiles.push(...subFiles);
      } else {
        const size = item.metadata?.size || 0;
        allFiles.push({
          name: item.name,
          path: fullPath,
          size
        });
      }
    }

    if (items.length < limit) {
      break;
    }
    offset += limit;
  }

  return allFiles;
}

async function main() {
  console.log("Listing all storage files via REST API...");
  const files = await listStorageFolder('');
  console.log(`Successfully retrieved ${files.length} storage files.`);
  
  if (files.length > 0) {
    console.log("First 10 files:");
    files.slice(0, 10).forEach(f => console.log(`  Path: ${f.path}, Size: ${f.size} bytes`));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
