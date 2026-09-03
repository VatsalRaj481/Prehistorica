import './../src/dns-init.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://bbsmxcoywionsvmfznah.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

async function testBucket() {
  console.log('Testing Supabase connection...');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Has key:', Boolean(supabaseKey));

  // Check existing buckets
  const res = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey
    }
  });

  if (!res.ok) {
    console.error('Failed to list buckets:', res.status, await res.text());
    return;
  }

  const buckets = await res.json();
  console.log('Existing buckets:', buckets.map((b: any) => b.name));

  const silBucket = buckets.find((b: any) => b.name === 'species-silhouettes');
  if (!silBucket) {
    console.log('Creating new bucket: species-silhouettes...');
    const createRes = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 'species-silhouettes',
        name: 'species-silhouettes',
        public: true
      })
    });
    console.log('Create bucket status:', createRes.status, await createRes.text());
  } else {
    console.log('Bucket species-silhouettes already exists! Public:', silBucket.public);
  }
}

testBucket().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
