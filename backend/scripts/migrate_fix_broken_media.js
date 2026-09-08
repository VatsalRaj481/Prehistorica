const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Target updates specifications
const UPDATES = [
  {
    id: 482,
    name: 'Corythosaurus',
    updater: (currentMedia) => {
      return currentMedia.map(m => {
        if (m.url && m.url.includes('Corythosaurus_BW.jpg')) {
          return {
            ...m,
            url: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Corythosaurus_stebingeri.png',
            credit: 'Connor Ashbridge (CC0)',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Corythosaurus_stebingeri.png',
            type: 'art'
          };
        }
        return m;
      });
    }
  },
  {
    id: 502,
    name: 'Polacanthus',
    updater: (currentMedia) => {
      return currentMedia.map(m => {
        if (m.url && m.url.includes('Polacanthus_BW.jpg')) {
          return {
            ...m,
            url: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Polacanthus_TD.png',
            credit: 'TotalDino (CC BY 4.0)',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Polacanthus_TD.png',
            type: 'art'
          };
        }
        return m;
      });
    }
  },
  {
    id: 1760,
    name: 'Caudipteryx zhoui',
    updater: (currentMedia) => {
      const validMedia = currentMedia.filter(m => !m.url.includes('Caudipteryx_BW.jpg'));
      const perfectArt = currentMedia.find(m => m.url.includes('1760-perfect-art.png')) || {
        url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/1760-perfect-art.png',
        type: 'art',
        credit: 'TotalDino (CC BY-SA 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Caudipteryx_TD.png'
      };
      const others = validMedia.filter(m => !m.url.includes('1760-perfect-art.png'));
      return [{ ...perfectArt, type: 'art' }, ...others];
    }
  },
  {
    id: 34,
    name: 'Gastornis parisiensis',
    updater: (currentMedia) => {
      return currentMedia.map(m => {
        if (m.url && m.url.includes('Gastornis_giganteus.png')) {
          return {
            ...m,
            url: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Gastornis.png',
            credit: 'Tim Bertelink (CC BY-SA 4.0)',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gastornis.png',
            type: 'art'
          };
        }
        return m;
      });
    }
  },
  {
    id: 5178,
    name: 'Kaprosuchus',
    updater: (currentMedia) => {
      return currentMedia.map(m => {
        if (m.url && m.url.includes('Kaprosuchus_saharicus.jpg')) {
          return {
            ...m,
            url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Kaprosuchus.png',
            credit: 'LiterallyMiguel (CC0)',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kaprosuchus.png',
            type: 'art'
          };
        }
        return m;
      });
    }
  },
  {
    id: 5181,
    name: 'Entelodon',
    updater: (currentMedia) => {
      return currentMedia.map(m => {
        if (m.url && m.url.includes('Entelodon_magnus.jpg')) {
          return {
            ...m,
            url: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Entelodon_magnus.png',
            credit: 'Concavenator (CC BY-SA 4.0)',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Entelodon_magnus.png',
            type: 'art'
          };
        }
        return m;
      });
    }
  },
  {
    id: 5170,
    name: 'Thylacosmilus',
    updater: (currentMedia) => {
      return currentMedia.map(m => {
        if (m.url && m.url.includes('Thylacosmilus_BW.jpg')) {
          return {
            ...m,
            url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Thylacosmilus_%28Recreacion%29.jpg',
            credit: 'Jose manuel canete (CC BY-SA 4.0)',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Thylacosmilus_(Recreacion).jpg',
            type: 'art'
          };
        }
        return m;
      });
    }
  },
  {
    id: 5173,
    name: 'Cervalces',
    updater: (currentMedia) => {
      return currentMedia.map(m => {
        if (m.url && m.url.includes('Cervalces_scotti.jpg')) {
          return {
            ...m,
            url: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Life_restoration_cervalces_scotti.jpg',
            credit: 'Dantheman9758 (CC BY 3.0)',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Life_restoration_cervalces_scotti.jpg',
            type: 'art'
          };
        }
        return m;
      });
    }
  },
  {
    id: 5176,
    name: 'Geosternbergia',
    updater: (currentMedia) => {
      return currentMedia.map(m => {
        if (m.url && m.url.includes('Geosternbergia_maysei.jpg')) {
          return {
            ...m,
            url: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Pterosaur_Flight_Adaptations_-_Pteranodon_sternbergi_-_Hugo_Salais_L%C3%B3pez.jpg',
            credit: 'Hugo Salais López (CC BY-SA 3.0)',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pterosaur_Flight_Adaptations_-_Pteranodon_sternbergi_-_Hugo_Salais_L%C3%B3pez.jpg',
            type: 'art'
          };
        }
        return m;
      });
    }
  },
  {
    id: 5182,
    name: 'Sarkastodon',
    updater: (currentMedia) => {
      return currentMedia.map(m => {
        if (m.url && m.url.includes('Sarkastodon_mongoliensis.jpg')) {
          return {
            ...m,
            url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Sarkastodon_mongoliensisDB24.jpg',
            credit: 'Dmitry Bogdanov (CC BY 4.0)',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Sarkastodon_mongoliensisDB24.jpg',
            type: 'art'
          };
        }
        return m;
      });
    }
  },
  {
    id: 1672,
    name: 'Kollikodon ritchiei',
    updater: (currentMedia) => {
      return currentMedia.map(m => {
        if (m.url && m.url.includes('Kollikodon_BW.jpg')) {
          return {
            ...m,
            url: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Kollikodon.fossil.jpg',
            credit: 'Stuart Humphreys / Australian Museum (Attribution)',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kollikodon.fossil.jpg',
            type: 'fossil_specimen'
          };
        }
        return m;
      });
    }
  },
  {
    id: 884,
    name: 'Indosuchus',
    updater: (currentMedia) => {
      return currentMedia.map(m => {
        if (m.sourceUrl === '/images/placeholders/theropod.svg') {
          return {
            ...m,
            sourceUrl: 'https://en.wikipedia.org/wiki/Indosuchus'
          };
        }
        return m;
      });
    }
  },
  {
    id: 923,
    name: 'Sivatherium',
    updater: (currentMedia) => {
      return currentMedia.map(m => {
        if (m.sourceUrl === '/images/placeholders/synapsid.svg') {
          return {
            ...m,
            sourceUrl: 'https://en.wikipedia.org/wiki/Sivatherium'
          };
        }
        return m;
      });
    }
  },
  {
    id: 924,
    name: 'Stegodon ganesa',
    updater: (currentMedia) => {
      return currentMedia.map(m => {
        if (m.sourceUrl === '/images/placeholders/synapsid.svg') {
          return {
            ...m,
            sourceUrl: 'https://en.wikipedia.org/wiki/Stegodon'
          };
        }
        return m;
      });
    }
  }
];

async function main() {
  console.log('--- STARTING AUDITED MEDIA REPAIR MIGRATION ---');

  console.log('Step 1: Fetching all species from database...');
  const allSpeciesBefore = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });
  console.log(`Retrieved ${allSpeciesBefore.length} species records.`);

  if (allSpeciesBefore.length !== 558) {
    throw new Error(`Expected 558 species records in DB, found ${allSpeciesBefore.length}! Aborting.`);
  }

  const snapshotDir = path.join(__dirname, '..', 'prisma', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const preSnapshotPath = path.join(snapshotDir, 'pre_media_fix_snapshot.json');
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allSpeciesBefore, null, 2), 'utf8');
  console.log(`Pre-migration snapshot written to: ${preSnapshotPath}`);

  console.log('\nStep 2: Performing reviewed updates on 14 targets...');
  const targetIds = UPDATES.map(u => u.id);
  
  for (const updateSpec of UPDATES) {
    const existing = allSpeciesBefore.find(s => s.id === updateSpec.id);
    if (!existing) {
      throw new Error(`Target species ID ${updateSpec.id} (${updateSpec.name}) not found in DB!`);
    }

    let parsedMedia = [];
    if (typeof existing.media === 'string') {
      try {
        parsedMedia = JSON.parse(existing.media);
      } catch (e) {
        parsedMedia = [];
      }
    } else if (Array.isArray(existing.media)) {
      parsedMedia = existing.media;
    }

    const updatedMedia = updateSpec.updater(parsedMedia);
    const mediaJsonStr = JSON.stringify(updatedMedia);

    await prisma.species.update({
      where: { id: updateSpec.id },
      data: {
        media: mediaJsonStr
      }
    });

    console.log(`  ✓ Updated ID ${updateSpec.id} (${updateSpec.name})`);
  }

  console.log('\nStep 3: Fetching post-migration state and verifying 100% safeguard invariant...');
  const allSpeciesAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, 'post_media_fix_snapshot.json');
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allSpeciesAfter, null, 2), 'utf8');
  console.log(`Post-migration snapshot written to: ${postSnapshotPath}`);

  if (allSpeciesAfter.length !== 558) {
    throw new Error(`Post-check failed: Expected 558 species, found ${allSpeciesAfter.length}`);
  }

  let untouchedCount = 0;
  let touchedTargetCount = 0;
  const unexpectedChanges = [];

  for (let i = 0; i < allSpeciesBefore.length; i++) {
    const before = allSpeciesBefore[i];
    const after = allSpeciesAfter.find(s => s.id === before.id);

    if (!after) {
      unexpectedChanges.push(`Species ID ${before.id} (${before.name}) was DELETED!`);
      continue;
    }

    const isTarget = targetIds.includes(before.id);

    if (isTarget) {
      const nonMediaDiff = [];
      for (const key of Object.keys(before)) {
        if (key === 'media' || key === 'updatedAt') continue;
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          nonMediaDiff.push(key);
        }
      }
      if (nonMediaDiff.length > 0) {
        unexpectedChanges.push(`Target ID ${before.id} had unexpected changes in non-media fields: ${nonMediaDiff.join(', ')}`);
      } else {
        touchedTargetCount++;
      }
    } else {
      const fieldDiff = [];
      for (const key of Object.keys(before)) {
        if (key === 'updatedAt') continue;
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          fieldDiff.push(key);
        }
      }
      if (fieldDiff.length > 0) {
        unexpectedChanges.push(`NON-TARGET ID ${before.id} (${before.name}) was MODIFIED! Fields: ${fieldDiff.join(', ')}`);
      } else {
        untouchedCount++;
      }
    }
  }

  console.log(`\nVerification Results:`);
  console.log(`- Targets safely updated: ${touchedTargetCount} / 14`);
  console.log(`- Non-target species bit-for-bit identical: ${untouchedCount} / 544 (100.0%)`);

  if (unexpectedChanges.length > 0) {
    console.error('CRITICAL ERROR: Unexpected regressions detected:');
    unexpectedChanges.forEach(err => console.error('  ✕ ' + err));
    throw new Error('Safeguard verification failed! Regressions detected.');
  }

  console.log('\nStep 4: Synchronizing static JSON archives in backend/prisma/...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  const fullExportPath = path.join(prismaDir, 'species_full_export.json');
  fs.writeFileSync(fullExportPath, JSON.stringify(allSpeciesAfter, null, 2), 'utf8');
  console.log(`  ✓ Updated species_full_export.json (${allSpeciesAfter.length} records)`);

  const jurassic = allSpeciesAfter.filter(s => s.timePeriod && s.timePeriod.toLowerCase().includes('jurassic'));
  const cretaceous = allSpeciesAfter.filter(s => s.timePeriod && s.timePeriod.toLowerCase().includes('cretaceous'));
  const triassic = allSpeciesAfter.filter(s => s.timePeriod && s.timePeriod.toLowerCase().includes('triassic'));
  const others = allSpeciesAfter.filter(s => {
    const tp = (s.timePeriod || '').toLowerCase();
    return !tp.includes('jurassic') && !tp.includes('cretaceous') && !tp.includes('triassic');
  });

  fs.writeFileSync(path.join(prismaDir, 'species_jurassic.json'), JSON.stringify(jurassic, null, 2), 'utf8');
  console.log(`  ✓ Updated species_jurassic.json (${jurassic.length} records)`);

  fs.writeFileSync(path.join(prismaDir, 'species_cretaceous.json'), JSON.stringify(cretaceous, null, 2), 'utf8');
  console.log(`  ✓ Updated species_cretaceous.json (${cretaceous.length} records)`);

  fs.writeFileSync(path.join(prismaDir, 'species_triassic.json'), JSON.stringify(triassic, null, 2), 'utf8');
  console.log(`  ✓ Updated species_triassic.json (${triassic.length} records)`);

  fs.writeFileSync(path.join(prismaDir, 'species_others.json'), JSON.stringify(others, null, 2), 'utf8');
  console.log(`  ✓ Updated species_others.json (${others.length} records)`);

  console.log('\n--- AUDITED MEDIA REPAIR MIGRATION COMPLETE SUCCESSFULLY ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma['$disconnect']();
  });
