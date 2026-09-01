import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * PREHISTORICA PERMANENT SAFEGUARD SYSTEM: verify-no-regression.ts
 * ══════════════════════════════════════════════════════════════════════════════
 * This project's core rule: scripts that add species must NEVER modify existing rows.
 * If you need to fix/update an existing species' data, that is a separate, manual,
 * reviewed operation — never part of routine seeding or adding new species.
 *
 * This script ensures:
 * 1. An immutable snapshot of all protected fields (media, taxonomy, interestingFacts,
 *    sources, name, scientificName, diet, habitat, clade, etc.) is captured BEFORE
 *    any operation.
 * 2. After the operation, every pre-existing row is re-queried and compared against
 *    its snapshot state.
 * 3. If ANY pre-existing row is modified or deleted, it FAILS LOUDLY with exit code 1
 *    and prints the exact species ID, name, and field diff.
 * ══════════════════════════════════════════════════════════════════════════════
 */

const prisma = new PrismaClient();
const SNAPSHOT_PATH = path.join(process.cwd(), '.species-safeguard-snapshot.json');

// Protected fields that must NEVER be altered on existing rows
const PROTECTED_FIELDS = [
  'name',
  'scientificName',
  'nameMeaning',
  'timePeriod',
  'epoch',
  'myaStart',
  'myaEnd',
  'diet',
  'dietDetails',
  'habitat',
  'clade',
  'geographicRange',
  'taxonomy',
  'taxonomicStatus',
  'media',
  'discoveryHistory',
  'interestingFacts',
  'sizeNotes',
  'sizeEstimate',
  'sizeComparisonToHuman',
  'extinctionEvent',
  'closestLivingRelatives',
  'sources',
  'placeholder'
] as const;

type ProtectedField = typeof PROTECTED_FIELDS[number];

interface SpeciesSnapshotRow {
  id: number;
  name: string;
  scientificName: string;
  fields: Record<ProtectedField, any>;
  rowHash: string;
}

interface SnapshotMetadata {
  timestamp: string;
  speciesCount: number;
  speciesMap: Record<number, SpeciesSnapshotRow>;
}

// Canonical normalization for robust comparison (handles JSON formatting differences)
function canonicalNormalize(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    // Try parsing if it's a JSON string
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return JSON.stringify(sortKeys(parsed));
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (typeof val === 'object') {
    return JSON.stringify(sortKeys(val));
  }
  return String(val);
}

function sortKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  } else if (obj !== null && typeof obj === 'object') {
    const sorted: Record<string, any> = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortKeys(obj[key]);
    }
    return sorted;
  }
  return obj;
}

export async function takeSnapshot(): Promise<SnapshotMetadata> {
  console.log('🔒 [SAFEGUARD] Capturing pre-operation snapshot of all existing Species records...');
  
  const allSpecies = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const speciesMap: Record<number, SpeciesSnapshotRow> = {};

  for (const s of allSpecies) {
    const fields: Record<string, any> = {};
    let combinedHashInput = `id:${s.id};`;

    for (const field of PROTECTED_FIELDS) {
      const val = (s as any)[field];
      fields[field] = val;
      combinedHashInput += `${field}:${canonicalNormalize(val)};`;
    }

    const rowHash = crypto.createHash('sha256').update(combinedHashInput).digest('hex');

    speciesMap[s.id] = {
      id: s.id,
      name: s.name,
      scientificName: s.scientificName,
      fields: fields as Record<ProtectedField, any>,
      rowHash
    };
  }

  const snapshot: SnapshotMetadata = {
    timestamp: new Date().toISOString(),
    speciesCount: allSpecies.length,
    speciesMap
  };

  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2), 'utf8');
  console.log(`✅ [SAFEGUARD] Snapshot created for ${allSpecies.length} species records at ${SNAPSHOT_PATH}`);
  return snapshot;
}

export async function verifyRegression(): Promise<{ success: boolean; violations: string[] }> {
  console.log('\n🔍 [SAFEGUARD] Verifying database integrity against pre-operation snapshot...');

  if (!fs.existsSync(SNAPSHOT_PATH)) {
    console.warn('⚠️ [SAFEGUARD WARNING] No snapshot file found at ' + SNAPSHOT_PATH + '. Skipping verification.');
    return { success: true, violations: [] };
  }

  const rawSnapshot = fs.readFileSync(SNAPSHOT_PATH, 'utf8');
  let snapshot: SnapshotMetadata;
  try {
    snapshot = JSON.parse(rawSnapshot);
  } catch (err: any) {
    throw new Error(`[SAFEGUARD ERROR] Failed to parse snapshot file: ${err.message}`);
  }

  const snapshotIds = Object.keys(snapshot.speciesMap).map(Number);
  console.log(`[SAFEGUARD] Re-querying ${snapshotIds.length} pre-existing species rows...`);

  const currentRows = await prisma.species.findMany({
    where: { id: { in: snapshotIds } },
    orderBy: { id: 'asc' }
  });

  const currentMap = new Map<number, any>();
  for (const r of currentRows) {
    currentMap.set(r.id, r);
  }

  const violations: string[] = [];

  // Check 1: Verify all snapshot rows still exist (NO DELETIONS of existing species)
  for (const origId of snapshotIds) {
    const orig = snapshot.speciesMap[origId];
    const curr = currentMap.get(origId);

    if (!curr) {
      violations.push(`DELETED ROW: Species #${orig.id} "${orig.name}" (${orig.scientificName}) was completely removed from the database!`);
      continue;
    }

    // Check 2: Verify all protected fields are 100% identical
    for (const field of PROTECTED_FIELDS) {
      const origVal = orig.fields[field];
      const currVal = (curr as any)[field];

      const origNorm = canonicalNormalize(origVal);
      const currNorm = canonicalNormalize(currVal);

      if (origNorm !== currNorm) {
        violations.push(
          `MODIFIED ROW: Species #${orig.id} "${orig.name}" (${orig.scientificName})\n` +
          `  └─ Field "${field}" was altered!\n` +
          `     Before: ${origNorm.length > 120 ? origNorm.substring(0, 120) + '... [TRUNCATED]' : origNorm}\n` +
          `     After:  ${currNorm.length > 120 ? currNorm.substring(0, 120) + '... [TRUNCATED]' : currNorm}`
        );
      }
    }
  }

  // Check total DB count
  const totalDbCount = await prisma.species.count();
  const newSpeciesAdded = totalDbCount - snapshot.speciesCount;

  if (violations.length > 0) {
    console.error('\n' + '█'.repeat(80));
    console.error('❌ CRITICAL REGRESSION DETECTED! EXISTING SPECIES DATA WAS MODIFIED OR DELETED!');
    console.error('█'.repeat(80));
    console.error(`Total Violations Found: ${violations.length}\n`);
    violations.forEach((v, idx) => {
      console.error(`[VIOLATION #${idx + 1}]\n${v}\n`);
    });
    console.error('█'.repeat(80));
    console.error('FAILING OPERATION TO PREVENT DATA CORRUPTION.');
    console.error('█'.repeat(80) + '\n');

    // Keep snapshot for forensic debugging
    return { success: false, violations };
  }

  console.log(`✅ [SAFEGUARD PASSED]: All ${snapshot.speciesCount} pre-existing species records are 100% intact and untouched.`);
  if (newSpeciesAdded > 0) {
    console.log(`✨ [SAFEGUARD INFO]: ${newSpeciesAdded} new species were safely added. (Total DB Count: ${totalDbCount})`);
  } else {
    console.log(`✨ [SAFEGUARD INFO]: Database count unchanged (${totalDbCount} species).`);
  }

  // Clean up snapshot on clean pass
  try {
    if (fs.existsSync(SNAPSHOT_PATH)) {
      fs.unlinkSync(SNAPSHOT_PATH);
    }
  } catch {}

  return { success: true, violations: [] };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--snapshot') || args.includes('--before')) {
    try {
      await takeSnapshot();
      process.exit(0);
    } catch (e: any) {
      console.error('❌ [SAFEGUARD ERROR] Failed taking snapshot:', e.message);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  } else if (args.includes('--verify') || args.includes('--after')) {
    try {
      const result = await verifyRegression();
      if (!result.success) {
        process.exit(1);
      }
      process.exit(0);
    } catch (e: any) {
      console.error('❌ [SAFEGUARD ERROR] Verification failed:', e.message);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  } else if (args.includes('--run')) {
    const cmdIndex = args.indexOf('--run');
    const cmd = args.slice(cmdIndex + 1).join(' ');
    if (!cmd) {
      console.error('ERROR: Missing command to run. Usage: tsx verify-no-regression.ts --run "<command>"');
      process.exit(1);
    }

    try {
      await takeSnapshot();
    } catch (e: any) {
      console.error('❌ [SAFEGUARD ERROR] Failed taking pre-operation snapshot:', e.message);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }

    console.log(`\n🚀 [SAFEGUARD RUNNER] Executing protected command: "${cmd}"\n`);
    let cmdError: any = null;
    try {
      execSync(cmd, { stdio: 'inherit' });
    } catch (err: any) {
      cmdError = err;
    }

    const verifyPrisma = new PrismaClient();
    try {
      const result = await verifyRegression();
      if (!result.success || cmdError) {
        if (cmdError) {
          console.error(`❌ [SAFEGUARD RUNNER] Wrapped command failed with exit code ${cmdError.status || 1}`);
        }
        process.exit(cmdError?.status || 1);
      }
      process.exit(0);
    } finally {
      await verifyPrisma.$disconnect();
    }
  } else {
    console.log('Prehistorica Anti-Regression Safeguard');
    console.log('Usage:');
    console.log('  tsx scripts/verify-no-regression.ts --snapshot');
    console.log('  tsx scripts/verify-no-regression.ts --verify');
    console.log('  tsx scripts/verify-no-regression.ts --run "<command>"');
    process.exit(0);
  }
}

if (process.argv[1] && process.argv[1].includes('verify-no-regression')) {
  main();
}
