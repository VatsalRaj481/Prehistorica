import './../src/dns-init.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TaxonResolution {
  domain: string;
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
  source: string;
}

// Helper to fetch with retry
async function fetchJson(url: string, retries = 2): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Prehistorica-Taxonomy/1.0' } });
      if (res.ok) return await res.json();
      if (res.status === 404) return null;
    } catch {
      await new Promise(r => setTimeout(r, 400));
    }
  }
  return null;
}

export async function resolveTaxonomyForSpecies(speciesName: string, scientificName: string, clade: string): Promise<TaxonResolution> {
  const normSci = scientificName.trim();
  const genus = normSci.split(' ')[0].replace(/[^a-zA-Z]/g, '');

  // 1. Query PBDB all_parents for species
  let pbdbData = await fetchJson(`https://paleobiodb.org/data1.2/taxa/list.json?name=${encodeURIComponent(normSci)}&rel=all_parents&show=attr`);
  if (!pbdbData?.records?.length) {
    // Fallback to genus in PBDB
    pbdbData = await fetchJson(`https://paleobiodb.org/data1.2/taxa/list.json?name=${encodeURIComponent(genus)}&rel=all_parents&show=attr`);
  }

  // 2. Query GBIF match
  let gbif = await fetchJson(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(normSci)}&kingdom=Animalia`);
  if (!gbif?.family) {
    gbif = await fetchJson(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(genus)}&kingdom=Animalia`);
  }

  // Parse PBDB parents
  const pbdbRanks: Record<string, string> = {};
  const allParentNames: string[] = [];
  if (pbdbData?.records) {
    pbdbData.records.forEach((r: any) => {
      allParentNames.push(r.nam);
      if (r.rnk) pbdbRanks[r.rnk] = r.nam;
    });
  }

  // Phylum
  const phylum = pbdbRanks['phylum'] || gbif?.phylum || 'Chordata';

  // Family resolution (Certified source priority: GBIF family -> PBDB family -> Clade-specific fallback)
  let family = gbif?.family || pbdbRanks['family'];
  if (!family || family.toLowerCase().endsWith(genus.toLowerCase() + 'idae')) {
    // Check if PBDB had an unranked clade or superfamily
    const superFam = allParentNames.find(n => n.endsWith('oidea'));
    const realFam = allParentNames.find(n => n.endsWith('idae') && n.toLowerCase() !== genus.toLowerCase() + 'idae');
    family = realFam || superFam || family || `${genus} clade`;
  }

  // Class & Order curatorial Linnaean resolution based on authentic phylogenetic clade
  let taxonClass = 'Reptilia';
  let order = 'Dinosauria';

  const cladeLower = clade.toLowerCase();

  if (cladeLower.includes('theropod')) {
    taxonClass = 'Reptilia';
    order = 'Saurischia';
  } else if (cladeLower.includes('sauropod')) {
    taxonClass = 'Reptilia';
    order = 'Saurischia';
  } else if (cladeLower.includes('ornithischian')) {
    taxonClass = 'Reptilia';
    order = 'Ornithischia';
  } else if (cladeLower.includes('pterosaur')) {
    taxonClass = 'Reptilia';
    order = 'Pterosauria';
  } else if (cladeLower.includes('marine')) {
    taxonClass = 'Reptilia';
    if (allParentNames.includes('Ichthyosauria') || allParentNames.includes('Ichthyopterygia')) {
      order = 'Ichthyosauria';
    } else if (allParentNames.includes('Plesiosauria') || allParentNames.includes('Sauropterygia')) {
      order = 'Plesiosauria';
    } else if (allParentNames.includes('Mosasauroidea') || allParentNames.includes('Squamata')) {
      order = 'Squamata';
    } else if (allParentNames.includes('Placodontia')) {
      order = 'Placodontia';
    } else if (allParentNames.includes('Nothosauroidea') || allParentNames.includes('Nothosauria')) {
      order = 'Nothosauroidea';
    } else if (allParentNames.includes('Testudines')) {
      order = 'Testudines';
    } else if (allParentNames.includes('Crocodylomorpha')) {
      order = 'Crocodylomorpha';
    } else {
      order = pbdbRanks['order'] || gbif?.order || 'Sauropterygia';
    }
  } else if (cladeLower.includes('mammal') || cladeLower.includes('synapsid')) {
    if (allParentNames.includes('Mammalia') || gbif?.class === 'Mammalia') {
      taxonClass = 'Mammalia';
      order = pbdbRanks['order'] || gbif?.order || 'Theriiformes';
    } else {
      taxonClass = 'Synapsida';
      if (allParentNames.includes('Dicynodontia')) order = 'Dicynodontia';
      else if (allParentNames.includes('Cynodontia')) order = 'Cynodontia';
      else if (allParentNames.includes('Therapsida')) order = 'Therapsida';
      else if (allParentNames.includes('Pelycosauria') || allParentNames.includes('Sphenacodontia')) order = 'Pelycosauria';
      else order = 'Therapsida';
    }
  } else if (cladeLower.includes('invertebrate')) {
    taxonClass = pbdbRanks['class'] || gbif?.class || 'Invertebrata';
    order = pbdbRanks['order'] || gbif?.order || 'Cephalopoda';
  } else if (cladeLower.includes('amphibian')) {
    taxonClass = 'Amphibia';
    order = pbdbRanks['order'] || gbif?.order || 'Temnospondyli';
  } else {
    taxonClass = pbdbRanks['class'] || gbif?.class || 'Reptilia';
    order = pbdbRanks['order'] || gbif?.order || clade.replace(/_/g, ' ');
  }

  return {
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum,
    class: taxonClass,
    order,
    family: family || 'Dinosauridae',
    genus,
    species: normSci,
    source: pbdbData?.records?.length ? 'Paleobiology Database (PBDB) + GBIF' : 'GBIF Backbone Taxonomy'
  };
}

async function testSample() {
  const sampleSpecies = [
    { name: 'Guanlingsaurus', scientificName: 'Guanlingsaurus liangae', clade: 'Marine_Reptile' },
    { name: 'Lisowicia', scientificName: 'Lisowicia bojani', clade: 'Early_Mammal_Synapsid' },
    { name: 'Cynognathus', scientificName: 'Cynognathus crateronotus', clade: 'Early_Mammal_Synapsid' },
    { name: 'Tyrannosaurus', scientificName: 'Tyrannosaurus rex', clade: 'Theropod' },
    { name: 'Triceratops', scientificName: 'Triceratops horridus', clade: 'Ornithischian' },
    { name: 'Brachiosaurus', scientificName: 'Brachiosaurus altithorax', clade: 'Sauropod' },
    { name: 'Pterodactylus', scientificName: 'Pterodactylus antiquus', clade: 'Pterosaur' },
    { name: 'Mosasaurus', scientificName: 'Mosasaurus hoffmannii', clade: 'Marine_Reptile' },
    { name: 'Meganeura', scientificName: 'Meganeura monyi', clade: 'Invertebrate' },
    { name: 'Dimetrodon', scientificName: 'Dimetrodon grandis', clade: 'Early_Mammal_Synapsid' },
    { name: 'Simosaurus', scientificName: 'Simosaurus gaillardoti', clade: 'Marine_Reptile' },
    { name: 'Indochelys', scientificName: 'Indochelys spatulata', clade: 'Marine_Reptile' }
  ];

  console.log('Testing taxonomic resolution across sample species...\n');

  for (const s of sampleSpecies) {
    const res = await resolveTaxonomyForSpecies(s.name, s.scientificName, s.clade);
    console.log(`=== ${s.name} (${s.scientificName}) ===`);
    console.log(`  Domain:  ${res.domain}`);
    console.log(`  Kingdom: ${res.kingdom}`);
    console.log(`  Phylum:  ${res.phylum}`);
    console.log(`  Class:   ${res.class}`);
    console.log(`  Order:   ${res.order}`);
    console.log(`  Family:  ${res.family}`);
    console.log(`  Genus:   ${res.genus}`);
    console.log(`  Species: ${res.species}`);
    console.log(`  Source:  ${res.source}\n`);
  }
}

testSample().then(() => process.exit(0)).catch(console.error);
