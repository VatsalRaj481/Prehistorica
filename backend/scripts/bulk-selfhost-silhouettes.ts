import './../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();
const supabaseUrl = process.env.SUPABASE_URL || 'https://bbsmxcoywionsvmfznah.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const uploadedUuids = new Map<string, string>();

async function uploadFileToSupabase(fileName: string, buffer: Buffer, contentType: string): Promise<string> {
  const url = `${supabaseUrl}/storage/v1/object/species-silhouettes/${fileName}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
      'Content-Type': contentType,
      'x-upsert': 'true'
    },
    body: buffer
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload failed for ${fileName} (${res.status}): ${errText}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/species-silhouettes/${fileName}`;
}

async function fetchWithRetry(url: string, retries = 3): Promise<Buffer | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Prehistorica-Uploader/2.0' } });
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        return Buffer.from(arrayBuf);
      }
      if (res.status === 404) return null;
      await new Promise(r => setTimeout(r, 400 * (i + 1)));
    } catch (e) {
      if (i === retries - 1) return null;
      await new Promise(r => setTimeout(r, 400 * (i + 1)));
    }
  }
  return null;
}

// Canonical fallback mapping when an item had a node UUID or specific clade assignment
const CLADE_IMAGE_UUIDS: Record<string, string> = {
  '978f844b-4bcf-4f96-b258-efc3fb716290': 'b8dfc9c4-26ca-4e25-b7b6-8bc483bd9be0', // Allosaurus (Theropod)
  '10cf1c0d-c049-43c3-8aa6-74dbba22fe3a': '7a99b167-b719-4233-946c-addf3ef1c06c', // Camarasaurus (Sauropod)
  '1e8f0d85-cecf-49e9-8a3f-876d96b2929f': '1e8f0d85-cecf-49e9-8a3f-876d96b2929f', // Laquintasaura (Ornithischian)
  '44c82592-4a98-4f54-bd0e-68d6fc236950': '02651c35-768e-4570-9bad-90cac6911b52', // Pterodactylus (Pterosaur)
  '40db43fb-581f-4743-8c79-bec7ff2ced43': '40db43fb-581f-4743-8c79-bec7ff2ced43', // Rhomaleosaurus (Marine Reptile)
  'e779b623-ff1c-4777-8ba8-83f2df6bdb9f': 'e779b623-ff1c-4777-8ba8-83f2df6bdb9f', // Stagonolepis (Aetosaur)
  '121a2008-b9de-4adb-bb03-33fcf21e5ae6': '121a2008-b9de-4adb-bb03-33fcf21e5ae6', // Diandongosuchus (Phytosaur)
  '168d6b6f-96b1-4867-967b-3f68fd31e078': '168d6b6f-96b1-4867-967b-3f68fd31e078', // Eosphorosuchus (Crocodylomorph)
  '61c59b94-6b48-40b4-ada1-3cc6c7543604': '61c59b94-6b48-40b4-ada1-3cc6c7543604', // Archaeovenator (Synapsid)
  '4177e7fa-4d98-4f40-8b94-521817f39774': '4177e7fa-4d98-4f40-8b94-521817f39774', // Effigia (Poposauroid)
  'be9ace64-29f6-45d4-9cc9-9b035d1cc04c': 'be9ace64-29f6-45d4-9cc9-9b035d1cc04c'  // Postosuchus (Rauisuchian)
};

async function getImageDownloadInfo(uuid: string): Promise<{ url: string; contentType: string; ext: string } | null> {
  const realUuid = CLADE_IMAGE_UUIDS[uuid] || uuid;
  try {
    const res = await fetch(`https://api.phylopic.org/images/${realUuid}?build=552`);
    if (!res.ok) return null;
    const data = await res.json();
    const source = data._links?.sourceFile;
    if (source && source.href) {
      const isSvg = source.type === 'image/svg+xml' || source.href.endsWith('.svg');
      return {
        url: source.href,
        contentType: source.type || (isSvg ? 'image/svg+xml' : 'image/png'),
        ext: isSvg ? 'svg' : 'png'
      };
    }
    const raster = data._links?.rasterFiles?.[0];
    if (raster && raster.href) {
      return {
        url: raster.href,
        contentType: raster.type || 'image/png',
        ext: 'png'
      };
    }
  } catch (e) {
    console.error(`Error resolving image info for ${uuid}:`, e);
  }
  return null;
}

async function bulkSelfHost() {
  console.log('Reading coverage report...');
  const reportPath = path.join(__dirname, '../reports/phylopic_coverage_report.json');
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

  const allItems: any[] = [...report.exactMatches, ...report.genericMatches];
  console.log(`Total species with verified silhouettes to process: ${allItems.length}`);

  // Pre-populate already uploaded items from database to skip re-uploading
  console.log('Checking existing database records...');
  const existingSpecies = await prisma.species.findMany({
    where: { comparisonSilhouette: { not: null } },
    select: { id: true, comparisonSilhouette: true }
  });

  const processedIds = new Set<number>();
  existingSpecies.forEach(s => {
    try {
      const parsed = JSON.parse(s.comparisonSilhouette!);
      if (parsed.url && parsed.url.includes('species-silhouettes')) {
        processedIds.add(s.id);
        const uuidMatch = parsed.url.match(/species-silhouettes\/([a-f0-9-]+)\./);
        if (uuidMatch) uploadedUuids.set(uuidMatch[1], parsed.url);
      }
    } catch {}
  });

  console.log(`Already completed in DB: ${processedIds.size} species. Cached uploaded assets: ${uploadedUuids.size}.`);

  const pendingItems = allItems.filter(item => !processedIds.has(item.speciesId));
  console.log(`Remaining pending species to upload & attach: ${pendingItems.length}`);

  const startTime = Date.now();
  const BATCH_SIZE = 30;
  let successCount = processedIds.size;
  let failCount = 0;

  for (let i = 0; i < pendingItems.length; i += BATCH_SIZE) {
    const batch = pendingItems.slice(i, i + BATCH_SIZE);
    const batchStart = Date.now();

    for (const item of batch) {
      try {
        const match = item.match;
        if (!match || !match.uuid) continue;

        const effectiveUuid = CLADE_IMAGE_UUIDS[match.uuid] || match.uuid;
        let selfHostedUrl = uploadedUuids.get(effectiveUuid);

        if (!selfHostedUrl) {
          const downloadInfo = await getImageDownloadInfo(effectiveUuid);
          if (!downloadInfo) {
            console.error(`[FAIL] Could not resolve download URL for ${item.name} (${effectiveUuid})`);
            failCount++;
            continue;
          }

          const buffer = await fetchWithRetry(downloadInfo.url);
          if (!buffer) {
            console.error(`[FAIL] Could not download image data for ${item.name} (${downloadInfo.url})`);
            failCount++;
            continue;
          }

          const fileName = `${effectiveUuid}.${downloadInfo.ext}`;
          selfHostedUrl = await uploadFileToSupabase(fileName, buffer, downloadInfo.contentType);
          uploadedUuids.set(effectiveUuid, selfHostedUrl);
        }

        // Prepare the new comparisonSilhouette payload
        const payload = {
          url: selfHostedUrl,
          sourceUrl: match.pageUrl || `https://www.phylopic.org/images/${effectiveUuid}`,
          license: match.license,
          credit: match.uploadedBy,
          taxon: match.taxon,
          taxonMatch: match.taxonMatch
        };

        // Update ONLY comparisonSilhouette in DB
        await prisma.species.update({
          where: { id: item.speciesId },
          data: {
            comparisonSilhouette: JSON.stringify(payload)
          }
        });

        successCount++;
      } catch (err) {
        console.error(`[ERROR] Failed processing species ${item.speciesId} (${item.name}):`, err);
        failCount++;
      }
    }

    const progress = Math.min(i + BATCH_SIZE, pendingItems.length);
    const batchElapsed = ((Date.now() - batchStart) / 1000).toFixed(1);
    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `[BATCH COMPLETED] Processed: ${progress}/${pendingItems.length} (${totalElapsed}s elapsed, batch took ${batchElapsed}s) | Total Completed: ${successCount} | Failed: ${failCount} | Unique Assets: ${uploadedUuids.size}`
    );

    // Minor pause between batches
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n================ BULK UPLOAD SUMMARY ================');
  console.log(`Total target species: ${allItems.length}`);
  console.log(`Successfully attached to DB: ${successCount}`);
  console.log(`Unique silhouettes self-hosted in Supabase: ${uploadedUuids.size}`);
  console.log(`Failures: ${failCount}`);
  console.log(`Total time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  console.log('=====================================================\n');
}

bulkSelfHost().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error in bulkSelfHost:', err);
  process.exit(1);
});
