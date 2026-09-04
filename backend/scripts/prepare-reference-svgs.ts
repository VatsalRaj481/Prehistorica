import './../src/dns-init.js';
import dotenv from 'dotenv';
import path from 'path';
import sharp from 'sharp';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://bbsmxcoywionsvmfznah.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

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

async function prepareAndUpload() {
  console.log('=== Preparing Calibrated Reference Figures ===\n');

  // 1. Clean Human Silhouette (tightly trimmed viewBox so feet are at absolute bottom)
  console.log('1. Calibrating Human Silhouette...');
  const humanRawSvg = await (await fetch('https://images.phylopic.org/images/b8c16fc6-d16b-4fac-8a04-67182448157e/source.svg')).text();
  
  // Replace viewBox="0 0 1000 1000" with tight bounds viewBox="274 72 452 856"
  const calibratedHumanSvg = humanRawSvg
    .replace(/viewBox=\"[^\"]+\"/, 'viewBox="274 72 452 856"')
    .replace(/width=\"[^\"]+\"/, 'width="452"')
    .replace(/height=\"[^\"]+\"/, 'height="856"');

  // Verify with sharp that bottom padding is 0
  const humanBuf = Buffer.from(calibratedHumanSvg, 'utf8');
  const humanTrim = await sharp(humanBuf).trim().toBuffer({ resolveWithObject: true });
  console.log('Calibrated Human Render:', humanTrim.info);

  const humanUrl = await uploadFileToSupabase('reference-human.svg', humanBuf, 'image/svg+xml');
  console.log('Uploaded Calibrated Human:', humanUrl);

  // 2. User's exact African Bush Elephant (910d853a-1a15-4953-a1d3-b81208994d35 by Chuanxin Yu, CC0)
  console.log('\n2. Calibrating African Bush Elephant (910d853a)...');
  const eleRawSvg = await (await fetch('https://images.phylopic.org/images/910d853a-1a15-4953-a1d3-b81208994d35/vector.svg')).text();
  
  // The vector SVG has viewBox="0 0 3485.000000 2446.000000"
  // Let's normalize it to a clean standard SVG
  const eleBuf = Buffer.from(eleRawSvg, 'utf8');
  const eleTrim = await sharp(eleBuf).trim().toBuffer({ resolveWithObject: true });
  console.log('Raw Elephant Render:', eleTrim.info);

  // Trimmed width is 3482, trimmed height is 2441, offset top is -2
  // We can adjust viewBox="0 2 3485 2444" so feet touch the absolute bottom
  const calibratedEleSvg = eleRawSvg
    .replace(/viewBox=\"[^\"]+\"/, 'viewBox="0 2 3485 2444"')
    .replace(/width=\"[^\"]+\"/, 'width="3485"')
    .replace(/height=\"[^\"]+\"/, 'height="2444"');

  const calEleBuf = Buffer.from(calibratedEleSvg, 'utf8');
  const calEleTrim = await sharp(calEleBuf).trim().toBuffer({ resolveWithObject: true });
  console.log('Calibrated Elephant Render:', calEleTrim.info);

  const elephantUrl = await uploadFileToSupabase('reference-african-bush-elephant.svg', calEleBuf, 'image/svg+xml');
  console.log('Uploaded Calibrated African Bush Elephant:', elephantUrl);

  console.log('\nAll reference figures prepared and uploaded!');
}

prepareAndUpload().then(() => process.exit(0)).catch(console.error);
