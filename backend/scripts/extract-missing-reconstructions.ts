import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface MissingSpeciesEntry {
  dbId: number;
  speciesIndex: number;
  name: string;
  scientificName: string;
  clade: string;
  timePeriod: string;
  hasDiagramMatches: boolean;
  diagramCount: number;
}

async function main() {
  const reportPath = path.join(process.cwd(), 'reports', 'image-candidates.md');
  if (!fs.existsSync(reportPath)) {
    console.error(`Report file not found at: ${reportPath}`);
    process.exit(1);
  }

  console.log('Fetching species roster from database...');
  const speciesDbList = await prisma.species.findMany({
    select: {
      id: true,
      name: true,
      scientificName: true,
      clade: true,
      timePeriod: true
    }
  });

  const speciesMap = new Map<number, typeof speciesDbList[0]>();
  for (const s of speciesDbList) {
    speciesMap.set(s.id, s);
  }

  const mdContent = fs.readFileSync(reportPath, 'utf8');

  // Split by species header: ### [Species X of 364] (DB ID: #Y) — Name (*Scientific*)
  const speciesBlocks = mdContent.split(/(?=### \[Species \d+ of 364\])/);

  const missingList: MissingSpeciesEntry[] = [];

  for (const block of speciesBlocks) {
    if (!block.startsWith('### [Species')) continue;

    // Parse header info
    const headerMatch = block.match(/### \[Species (\d+) of 364\] \(DB ID: #(\d+)\) — (.+?) \(\*(.+?)\*\)/);
    if (!headerMatch) continue;

    const speciesIndex = parseInt(headerMatch[1], 10);
    const dbId = parseInt(headerMatch[2], 10);
    const name = headerMatch[3].trim();
    const scientificName = headerMatch[4].trim();

    // Check if Life Reconstruction Artwork Candidates count is 0
    const reconMatch = block.match(/#### 🎨 Life Reconstruction Artwork Candidates \((\d+)\)/);
    const reconCount = reconMatch ? parseInt(reconMatch[1], 10) : 0;

    if (reconCount === 0) {
      // Check for diagram matches
      const diagramMatch = block.match(/#### 🦴 Skeletal & Diagram Matches \((\d+)\)/);
      const diagramCount = diagramMatch ? parseInt(diagramMatch[1], 10) : 0;

      // Parse clade from block line
      const cladeMatch = block.match(/- \*\*Clade\*\*: `(.+?)`/);
      const dbRecord = speciesMap.get(dbId);
      const rawClade = cladeMatch ? cladeMatch[1] : (dbRecord?.clade || 'Other');
      const clade = (rawClade === 'Other' && dbRecord?.clade) ? dbRecord.clade : rawClade;
      const timePeriod = dbRecord?.timePeriod || 'Unknown Era';

      missingList.push({
        dbId,
        speciesIndex,
        name,
        scientificName,
        clade,
        timePeriod,
        hasDiagramMatches: diagramCount > 0,
        diagramCount
      });
    }
  }

  console.log(`Extraction Complete: ${missingList.length} species have 0 life reconstruction artwork candidates.`);

  // Group by Clade
  const cladeGroups = new Map<string, MissingSpeciesEntry[]>();
  for (const entry of missingList) {
    const list = cladeGroups.get(entry.clade) || [];
    list.push(entry);
    cladeGroups.set(entry.clade, list);
  }

  // Sort clade names alphabetically
  const sortedClades = Array.from(cladeGroups.keys()).sort();

  // Within each clade, sort species alphabetically by name
  for (const cladeName of sortedClades) {
    const list = cladeGroups.get(cladeName)!;
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Generate output report
  const outputReportPath = path.join(process.cwd(), 'reports', 'no-reconstruction-candidates.md');

  let out = `# Prehistorica — Species Lacking Life Reconstruction Artwork Report\n\n`;
  out += `**Generated At**: ${new Date().toISOString()}\n`;
  out += `**Target Subset**: Species with 0 open-licensed life reconstruction artwork candidates\n`;
  out += `**Total Missing Species**: **${missingList.length}** of 364 database species (${((missingList.length / 364) * 100).toFixed(1)}%)\n\n`;

  out += `---

## 📊 Summary Breakdown by Clade / Taxonomic Category

| Clade Category | Count Missing Reconstructions | % of Missing Total (101) | Has Diagram/Skeletal Backup? |
|:---|:---|:---|:---|
`;

  for (const cladeName of sortedClades) {
    const entries = cladeGroups.get(cladeName)!;
    const withDiagrams = entries.filter(e => e.hasDiagramMatches).length;
    out += `| **${cladeName}** | **${entries.length}** | ${((entries.length / missingList.length) * 100).toFixed(1)}% | ${withDiagrams} of ${entries.length} species | \n`;
  }

  out += `\n---\n\n## 📋 Detailed Species List (Grouped by Clade & Alphabetical)\n\n`;

  for (const cladeName of sortedClades) {
    const entries = cladeGroups.get(cladeName)!;
    out += `### 🦴 Clade: ${cladeName} (${entries.length} species missing reconstructions)\n\n`;

    out += `| # | Database ID | Species Name | Scientific Name | Time Period / Era | Diagram Backup Available? |\n`;
    out += `|:---|:---|:---|:---|:---|:---|\n`;

    entries.forEach((e, idx) => {
      const diagramLabel = e.hasDiagramMatches ? `YES (${e.diagramCount} match${e.diagramCount > 1 ? 'es' : ''})` : `NO`;
      out += `| ${idx + 1} | #${e.dbId} | **${e.name}** | *${e.scientificName}* | ${e.timePeriod} | ${diagramLabel} |\n`;
    });

    out += `\n`;
  }

  fs.writeFileSync(outputReportPath, out, 'utf8');
  console.log(`Report successfully written to: ${outputReportPath}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Error generating missing reconstructions report:', err);
  prisma.$disconnect();
  process.exit(1);
});
