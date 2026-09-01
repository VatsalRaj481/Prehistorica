const { execSync } = require('child_process');

async function main() {
  console.log('--- STARTING SEQUENTIAL INGESTION OF ALL REMAINING BATCHES ---');

  // Start from offset 80 up to 360 in steps of 20
  for (let offset = 80; offset < 360; offset += 20) {
    const batchNum = Math.floor(offset / 20) + 1;
    console.log(`\n==============================================`);
    console.log(`LAUNCHING BATCH ${batchNum} (Offset: ${offset}, Limit: 20)...`);
    console.log(`==============================================\n`);

    try {
      execSync(`node scripts/ingest_species_batch.js ${offset} 20`, {
        cwd: __dirname + '/..',
        stdio: 'inherit'
      });
    } catch (err) {
      console.error(`Batch ${batchNum} encountered an error:`, err.message);
    }
  }

  console.log('\n==============================================');
  console.log('ALL REMAINING BATCHES COMPLETE!');
  console.log('==============================================\n');
}

main();
