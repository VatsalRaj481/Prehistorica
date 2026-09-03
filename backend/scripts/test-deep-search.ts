import './../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Load the current report
const reportPath = path.join(__dirname, '../reports/phylopic_coverage_report.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// Test searching higher taxonomy for a few "none" species
async function testCladeFallback() {
  const testNames = [
    'Squalicorax',
    'Baculites',
    'Pliosaurus',
    'Cryptoclidus',
    'Aetosaurus',
    'Arizonasaurus',
    'Saurosuchus',
    'Teleosaurus',
    'Metriacanthosaurus',
    'Jobaria',
    'Supersaurus',
    'Edmontonia'
  ];

  for (const name of testNames) {
    const ac = await (await fetch(`https://api.phylopic.org/autocomplete?build=552&query=${encodeURIComponent(name.toLowerCase())}`)).json();
    console.log(`\nQuery: "${name}" -> Autocomplete matches:`, ac.matches);
  }
}

testCladeFallback().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
