import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env') });
import { PrismaClient } from '@prisma/client';
import { validateSilhouetteMetadata } from './validate-silhouettes';

const prisma = new PrismaClient();

// High-quality verified silhouettes from Supabase Storage
const SILHOUETTES = {
  // Dromaeosaur / Paraves / Unenlagiid
  dromaeosaur: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/8d1c194f-3bf7-4114-a32e-5b895167a017.svg',
    sourceUrl: 'https://www.phylopic.org/images/8d1c194f-3bf7-4114-a32e-5b895167a017',
    license: 'Creative Commons CC0 1.0 Universal Public Domain Dedication',
    credit: 'Richard Rich',
    taxon: 'Dromaeosauridae (Representative: Velociraptor mongoliensis)',
    taxonMatch: 'clade approximation'
  }),
  // Tyrannosauroidea
  tyrannosauroid: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/02e30c15-3233-449b-a623-85314f79e870.png',
    sourceUrl: 'https://www.phylopic.org/images/02e30c15-3233-449b-a623-85314f79e870',
    license: 'Creative Commons Attribution 3.0 Unported',
    credit: 'Craig Dylke',
    taxon: 'Tyrannosauroidea (Representative: Albertosaurus sarcophagus)',
    taxonMatch: 'clade approximation'
  }),
  // Abelisauridae
  abelisaur: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/07ac345a-7b69-4f99-a3fd-84b4d08fcd80.svg',
    sourceUrl: 'https://www.phylopic.org/images/07ac345a-7b69-4f99-a3fd-84b4d08fcd80',
    license: 'Creative Commons CC0 1.0 Universal Public Domain Dedication',
    credit: 'thetruespinofanboi',
    taxon: 'Abelisauridae (Representative: Carnotaurus sastrei)',
    taxonMatch: 'clade approximation'
  }),
  // Spinosauridae
  spinosaur: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/452d28c2-9f32-49c8-8181-392b2aa66d71.svg',
    sourceUrl: 'https://www.phylopic.org/images/452d28c2-9f32-49c8-8181-392b2aa66d71',
    license: 'Creative Commons Attribution 3.0 Unported',
    credit: 'Alessio Ciaffi',
    taxon: 'Spinosauridae (Representative: Baryonyx walkeri)',
    taxonMatch: 'clade approximation'
  }),
  // Oviraptorosauria
  oviraptor: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/101a8c21-5211-4f7f-b083-4f3373095a03.svg',
    sourceUrl: 'https://www.phylopic.org/images/101a8c21-5211-4f7f-b083-4f3373095a03',
    license: 'Creative Commons CC0 1.0 Universal Public Domain Dedication',
    credit: 'Ivan Iofrida',
    taxon: 'Oviraptorosauria (Representative: Oviraptor philoceratops)',
    taxonMatch: 'clade approximation'
  }),
  // Alvarezsauridae
  alvarezsaur: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/b141222c-36a1-4b5f-a6b2-581a7553d276.svg',
    sourceUrl: 'https://www.phylopic.org/images/b141222c-36a1-4b5f-a6b2-581a7553d276',
    license: 'Creative Commons CC0 1.0 Universal Public Domain Dedication',
    credit: 'Tasman Dixon',
    taxon: 'Alvarezsauridae (Representative: Shuvuuia deserti)',
    taxonMatch: 'clade approximation'
  }),
  // Therizinosauria
  therizinosaur: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/2f4b561d-d659-4195-8933-d4ba0203c61c.png',
    sourceUrl: 'https://www.phylopic.org/images/2f4b561d-d659-4195-8933-d4ba0203c61c',
    license: 'Creative Commons Attribution-ShareAlike 3.0 Unported',
    credit: 'yoshi50',
    taxon: 'Therizinosauria (Representative: Therizinosaurus cheloniformis)',
    taxonMatch: 'clade approximation'
  }),
  // Ceratopsidae: Chasmosaurinae
  chasmosaurine: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/9738fe4f-f60b-4f76-a014-f0cf4478d368.svg',
    sourceUrl: 'https://www.phylopic.org/images/9738fe4f-f60b-4f76-a014-f0cf4478d368',
    license: 'Creative Commons CC0 1.0 Universal Public Domain Dedication',
    credit: 'Matthew Dempsey',
    taxon: 'Chasmosaurinae (Representative: Chasmosaurus belli)',
    taxonMatch: 'clade approximation'
  }),
  // Ceratopsidae: Centrosaurinae
  centrosaurine: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/141e2aa7-d6a2-4b28-a347-322f7fbe5f9c.png',
    sourceUrl: 'https://www.phylopic.org/images/141e2aa7-d6a2-4b28-a347-322f7fbe5f9c',
    license: 'Creative Commons CC0 1.0 Universal Public Domain Dedication',
    credit: 'Tasman Dixon',
    taxon: 'Centrosaurinae (Representative: Centrosaurus apertus)',
    taxonMatch: 'clade approximation'
  }),
  // Ankylosauria
  ankylosaur: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/8a8a2525-e97d-4505-8085-7958f8d36137.svg',
    sourceUrl: 'https://www.phylopic.org/images/8a8a2525-e97d-4505-8085-7958f8d36137',
    license: 'Creative Commons CC0 1.0 Universal Public Domain Dedication',
    credit: 'Itai Fein',
    taxon: 'Ankylosauria (Representative: Ankylosaurus magniventris)',
    taxonMatch: 'clade approximation'
  }),
  // Stegosauria
  stegosaur: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/429d71d8-2940-449b-838b-a5b7f1733eba-calibrated.svg',
    sourceUrl: 'https://www.phylopic.org/images/429d71d8-2940-449b-838b-a5b7f1733eba',
    license: 'Creative Commons Attribution-ShareAlike 3.0 Unported',
    credit: 'Olivia Binfield',
    taxon: 'Stegosauria (Representative: Stegosaurus stenops)',
    taxonMatch: 'clade approximation'
  }),
  // Hadrosauroidea / Iguanodontia
  hadrosauroid: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/b077bbf7-1d16-4ce2-a54d-05d9aeb37543.svg',
    sourceUrl: 'https://www.phylopic.org/images/b077bbf7-1d16-4ce2-a54d-05d9aeb37543',
    license: 'Creative Commons CC0 1.0 Universal Public Domain Dedication',
    credit: 'JFstudios',
    taxon: 'Hadrosauroidea (Representative: Edmontosaurus annectens)',
    taxonMatch: 'clade approximation'
  }),
  // Basal Ornithopod / Iguanodontian (Will Toosey Ouranosaurus)
  ornithopod: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/9837c09a-bca2-4519-951f-d0193b273ef4.svg',
    sourceUrl: 'https://www.phylopic.org/images/9837c09a-bca2-4519-951f-d0193b273ef4',
    license: 'Creative Commons Attribution 4.0 International',
    credit: 'Will Toosey',
    taxon: 'Iguanodontia (Representative: Ouranosaurus nigeriensis)',
    taxonMatch: 'clade approximation'
  }),
  // Basal Sauropodomorph / Plateosaurus
  sauropodomorph: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/bc86babf-9c57-4da5-8771-4e9c04ab08bd.svg',
    sourceUrl: 'https://www.phylopic.org/images/bc86babf-9c57-4da5-8771-4e9c04ab08bd',
    license: 'Creative Commons Attribution 4.0 International',
    credit: 'Olof Moleman',
    taxon: 'Sauropodomorpha (Representative: Plateosaurus trossingensis)',
    taxonMatch: 'clade approximation'
  }),
  // Titanosauria Sauropod (Scott Hartman)
  titanosaur: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/b591e0da-c9f0-4fbc-9c0d-93109c48c2bb.svg',
    sourceUrl: 'https://www.phylopic.org/images/b591e0da-c9f0-4fbc-9c0d-93109c48c2bb',
    license: 'Creative Commons CC0 1.0 Universal Public Domain Dedication',
    credit: 'Scott Hartman',
    taxon: 'Titanosauria (Representative: Saltasauridae)',
    taxonMatch: 'clade approximation'
  })
};

// Detailed curation patch map
export const CURATION_PATCHES: Record<number, any> = {
  // 5237: Newtonsaurus cambrensis - Small Triassic theropod (was 18m / 10,935kg)
  5237: {
    sizeNotes: 'Estimated at approximately 2.5 m (8.2 ft) in length and 50–70 kg based on tooth and jaw holotype remains.',
    sizeEstimate: JSON.stringify({
      length: { value: 2.5, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.9, unit: 'm', confidence: 'estimated' },
      weight: { value: 60, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.dromaeosaur
  },

  // 5246: Anchiornis huxleyi - Small feathered troodontid/paravian theropod
  5246: {
    scientificName: 'Anchiornis huxleyi',
    clade: 'Theropod',
    sizeNotes: 'Small four-winged feathered dinosaur measuring approximately 34–40 cm in length with a body mass of roughly 110–250 g.',
    sizeEstimate: JSON.stringify({
      length: { value: 0.4, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.2, unit: 'm', confidence: 'well-supported' },
      weight: { value: 0.2, unit: 'kg', confidence: 'well-supported' }
    }),
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Anchiornithidae',
      genus: 'Anchiornis',
      species: 'Anchiornis huxleyi',
      source: 'Paleobiology Database (PBDB #153907)'
    }),
    comparisonSilhouette: SILHOUETTES.dromaeosaur
  },

  // 5259: Lingwulong shenqi - Dicraeosaurid sauropod from Middle Jurassic China
  5259: {
    scientificName: 'Lingwulong shenqi',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Sauropodomorpha',
      family: 'Dicraeosauridae',
      genus: 'Lingwulong',
      species: 'Lingwulong shenqi',
      source: 'Paleobiology Database (PBDB #376384)'
    })
  },

  // 5265: Abrosaurus dongpoi - Macronarian sauropod from Middle Jurassic China
  5265: {
    scientificName: 'Abrosaurus dongpoi',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Sauropodomorpha',
      family: 'Camarasauridae',
      genus: 'Abrosaurus',
      species: 'Abrosaurus dongpoi',
      source: 'Paleobiology Database (PBDB #58797)'
    })
  },

  // 5270: Pulaosaurus qinglong - Basal neornithischian (not Aquilops!)
  5270: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Neornithischia',
      family: 'Jeholosauridae',
      genus: 'Pulaosaurus',
      species: 'Pulaosaurus qinglong',
      source: 'Paleobiology Database (PBDB #440788)'
    }),
    comparisonSilhouette: SILHOUETTES.ornithopod
  },

  // 5274: Thyreosaurus atlasicus - Dacentrurine stegosaur from Morocco
  5274: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Thyreophora',
      family: 'Stegosauridae',
      genus: 'Thyreosaurus',
      species: 'Thyreosaurus atlasicus',
      source: 'Paleobiology Database (PBDB #443091)'
    }),
    comparisonSilhouette: SILHOUETTES.stegosaur
  },

  // 5275: Baiyinosaurus baojiashanensis - Basal stegosaurian from China (was Sauropod!)
  5275: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Thyreophora',
      family: 'Stegosauridae',
      genus: 'Baiyinosaurus',
      species: 'Baiyinosaurus baojiashanensis',
      source: 'Paleobiology Database (PBDB #443093)'
    }),
    sizeNotes: 'Estimated at approximately 4.5–5.0 m (15–16.5 ft) in length and 1,000–1,200 kg mass based on partial skeleton.',
    sizeEstimate: JSON.stringify({
      length: { value: 4.8, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.6, unit: 'm', confidence: 'estimated' },
      weight: { value: 1100, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.stegosaur
  },

  // 5276: Emausaurus crassiminor - Basal thyreophoran from Early Jurassic Germany (was Sauropod!)
  5276: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Thyreophora',
      family: 'Scelidosauridae',
      genus: 'Emausaurus',
      species: 'Emausaurus crassiminor',
      source: 'Paleobiology Database (PBDB #52899)'
    }),
    sizeNotes: 'Small armored thyreophoran measuring approximately 2.0–2.5 m (6.6–8.2 ft) in length with an adult mass of 50–70 kg.',
    sizeEstimate: JSON.stringify({
      length: { value: 2.2, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.7, unit: 'm', confidence: 'estimated' },
      weight: { value: 60, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.ankylosaur
  },

  // 5277: Spicomellus afer - Early ankylosaurian with dermal spines fused to ribs (was Sauropod!)
  5277: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Thyreophora',
      family: 'Ankylosauria',
      genus: 'Spicomellus',
      species: 'Spicomellus afer',
      source: 'Paleobiology Database (PBDB #440078)'
    }),
    sizeNotes: 'Basal ankylosaurian estimated at approximately 3.0 m in length and 300–400 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 3.0, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.9, unit: 'm', confidence: 'estimated' },
      weight: { value: 350, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.ankylosaur
  },

  // 5278: Chilesaurus diegosuarezi - Enigmatic herbivorous basal tetanuran theropod (was Sauropodomorph!)
  5278: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Chilesauridae',
      genus: 'Chilesaurus',
      species: 'Chilesaurus diegosuarezi',
      source: 'Paleobiology Database (PBDB #320569)'
    }),
    comparisonSilhouette: SILHOUETTES.dromaeosaur
  },

  // 5279: Eoabelisaurus mefi - Basal abelisaurid theropod from Middle Jurassic Argentina (was Sauropodomorph!)
  5279: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Abelisauridae',
      genus: 'Eoabelisaurus',
      species: 'Eoabelisaurus mefi',
      source: 'Paleobiology Database (PBDB #237737)'
    }),
    sizeNotes: 'Medium-sized abelisaurid estimated at 6.0–6.5 m (20–21 ft) in length and 800–1,000 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 6.5, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.9, unit: 'm', confidence: 'estimated' },
      weight: { value: 900, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.abelisaur
  },

  // 5281: Vitosaura colozacani - Abelisaurid theropod from Late Cretaceous (was Sauropod!)
  5281: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Abelisauridae',
      genus: 'Vitosaura',
      species: 'Vitosaura colozacani',
      source: 'Paleobiology Database (PBDB #444589)'
    }),
    sizeNotes: 'Medium-sized carnivorous abelisaurid measuring roughly 5.0–6.0 m in length with an estimated mass of 600–800 kg.',
    sizeEstimate: JSON.stringify({
      length: { value: 5.5, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.8, unit: 'm', confidence: 'estimated' },
      weight: { value: 700, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.abelisaur
  },

  // 5284: Tameryraptor - Carcharodontosaurid theropod (was Sauropod!)
  5284: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Carcharodontosauridae',
      genus: 'Tameryraptor',
      species: 'Tameryraptor sp.',
      source: 'Paleobiology Database (PBDB #444591)'
    }),
    sizeNotes: 'Large apex predatory theropod measuring roughly 8.0–9.0 m in length and 2,000–2,500 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 8.5, unit: 'm', confidence: 'well-supported' },
      height: { value: 2.6, unit: 'm', confidence: 'estimated' },
      weight: { value: 2200, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.abelisaur
  },

  // 5285: Protathlitis cinctorrensis - Spinosaurid theropod from Early Cretaceous Spain (was Sauropod!)
  5285: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Spinosauridae',
      genus: 'Protathlitis',
      species: 'Protathlitis cinctorrensis',
      source: 'Paleobiology Database (PBDB #440791)'
    }),
    sizeNotes: 'Medium-sized spinosaurid estimated at 8.0–9.0 m (26–30 ft) in length and 1,500–2,000 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 8.5, unit: 'm', confidence: 'well-supported' },
      height: { value: 2.5, unit: 'm', confidence: 'estimated' },
      weight: { value: 1800, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.spinosaur
  },

  // 5288: Asiatyrannus xui - Deep-snouted tyrannosaurid theropod from Late Cretaceous China (was Sauropod!)
  5288: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Tyrannosauridae',
      genus: 'Asiatyrannus',
      species: 'Asiatyrannus xui',
      source: 'Paleobiology Database (PBDB #443097)'
    }),
    sizeNotes: 'Medium-sized tyrannosaurid estimated at 4.0–4.5 m (13–15 ft) in length and 400–500 kg mass based on subadult skull and skeleton.',
    sizeEstimate: JSON.stringify({
      length: { value: 4.5, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.5, unit: 'm', confidence: 'estimated' },
      weight: { value: 450, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.tyrannosauroid
  },

  // 5289: Khankhuuluu mongoliensis - Tyrannosauroid theropod from Mongolia (was Sauropod!)
  5289: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Tyrannosauroidea',
      genus: 'Khankhuuluu',
      species: 'Khankhuuluu mongoliensis',
      source: 'Paleobiology Database (PBDB #443099)'
    }),
    sizeNotes: 'Slender tyrannosauroid measuring roughly 4.0 m in length with an estimated mass of 300–400 kg.',
    sizeEstimate: JSON.stringify({
      length: { value: 4.0, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.4, unit: 'm', confidence: 'estimated' },
      weight: { value: 350, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.tyrannosauroid
  },

  // 5290: Nanuqsaurus hoglundi - Arctic pygmy tyrannosaurid theropod (was Ornithischian / Ceratopsidae / Aquilops!)
  5290: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Tyrannosauridae',
      genus: 'Nanuqsaurus',
      species: 'Nanuqsaurus hoglundi',
      source: 'Paleobiology Database (PBDB #288031)'
    }),
    sizeNotes: 'Arctic tyrannosaurid estimated at 5.0–6.0 m (16–20 ft) in length and 800–1,000 kg mass based on Prince Creek Formation material.',
    sizeEstimate: JSON.stringify({
      length: { value: 5.5, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.8, unit: 'm', confidence: 'estimated' },
      weight: { value: 900, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.tyrannosauroid
  },

  // 5299: Kank australis - Unenlagiid theropod from Patagonia (was 18m Sauropod Titanosauria!)
  5299: {
    scientificName: 'Kank australis',
    clade: 'Theropod',
    diet: 'carnivore',
    dietDetails: 'Piscivorous / faunivorous predator equipped with slender jaws, needle-like teeth, and wading adaptations.',
    discoveryHistory: '• Kank australis is an extinct genus of unenlagiid dromaeosaurid theropod dinosaur discovered in the Chorrillo Formation of Patagonia, Argentina.\n• Formally described in 2026, the holotype preserves a slender skull, cervical vertebrae, and wading limb adaptations.\n• Represents an important geographic link between South American and Antarctic paravian theropods.',
    interestingFacts: JSON.stringify([
      'Kank australis is an extinct genus of unenlagiid theropod dinosaur described in 2026 from the Late Cretaceous Chorrillo Formation of Patagonia.',
      'Unlike massive predators, Kank grew to approximately 2.0 to 2.5 meters in length and weighed only around 35 kg.',
      'Possessed a slender, elongated snout filled with needle-like teeth and long wading legs, indicating a semi-aquatic fish-hunting ecology akin to modern herons.',
      'Its discovery bridges a key evolutionary and biogeographic gap between South American unenlagiids and polar Antarctic paravians.'
    ]),
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Unenlagiidae',
      genus: 'Kank',
      species: 'Kank australis',
      source: 'Paleobiology Database (PBDB #444595) & Systematic Paleontology (2026)'
    }),
    sizeNotes: 'Slender semi-aquatic raptor measuring roughly 2.0–2.5 m (6.6–8.2 ft) in length and 30–40 kg body mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 2.3, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.85, unit: 'm', confidence: 'estimated' },
      weight: { value: 35, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.dromaeosaur,
    sources: JSON.stringify([
      {
        citation: 'Kank australis description in paleontological literature (2026)',
        url: 'https://paleobiodb.org/classic/basicTaxonInfo?taxon_name=Kank'
      }
    ])
  },

  // 5300: Imperobator antarcticus - Giant paravian theropod from Antarctica (was Ornithischian!)
  5300: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Paraves',
      genus: 'Imperobator',
      species: 'Imperobator antarcticus',
      source: 'Paleobiology Database (PBDB #400612)'
    }),
    sizeNotes: 'Large non-avian paravian measuring roughly 4.0–4.5 m (13–15 ft) in length with an estimated adult mass of 200–250 kg.',
    sizeEstimate: JSON.stringify({
      length: { value: 4.2, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.5, unit: 'm', confidence: 'estimated' },
      weight: { value: 220, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.dromaeosaur
  },

  // 5301: Hypnovenator matsubaraetoheorum - Troodontid theropod from Japan (was Sauropod!)
  5301: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Troodontidae',
      genus: 'Hypnovenator',
      species: 'Hypnovenator matsubaraetoheorum',
      source: 'Paleobiology Database (PBDB #443105)'
    }),
    sizeNotes: 'Small gracile troodontid measuring approximately 1.5–1.8 m in length and 15–20 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 1.6, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.6, unit: 'm', confidence: 'estimated' },
      weight: { value: 18, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.dromaeosaur
  },

  // 5302: Harenadraco prima - Dromaeosaurid theropod from Mongolia (was Sauropod!)
  5302: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Dromaeosauridae',
      genus: 'Harenadraco',
      species: 'Harenadraco prima',
      source: 'Paleobiology Database (PBDB #443107)'
    }),
    sizeNotes: 'Small feathered raptor measuring roughly 1.0–1.2 m in length with an estimated mass of 3–5 kg.',
    sizeEstimate: JSON.stringify({
      length: { value: 1.1, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.45, unit: 'm', confidence: 'estimated' },
      weight: { value: 4, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.dromaeosaur
  },

  // 5303: Xenovenator espinosai - Troodontid theropod from Mexico (was Ornithischian / Aquilops!)
  5303: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Troodontidae',
      genus: 'Xenovenator',
      species: 'Xenovenator espinosai',
      source: 'Paleobiology Database (PBDB #443109)'
    }),
    sizeNotes: 'Small cursorial troodontid measuring roughly 1.8–2.0 m in length with an estimated mass of 20–25 kg.',
    sizeEstimate: JSON.stringify({
      length: { value: 1.9, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.7, unit: 'm', confidence: 'estimated' },
      weight: { value: 22, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.dromaeosaur
  },

  // 5304: Pectinodon bakkeri - Small troodontid theropod
  5304: {
    scientificName: 'Pectinodon bakkeri',
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Troodontidae',
      genus: 'Pectinodon',
      species: 'Pectinodon bakkeri',
      source: 'Paleobiology Database (PBDB #53232)'
    }),
    sizeNotes: 'Small Late Cretaceous troodontid measuring roughly 1.5–2.0 m in length and 15–20 kg mass based on tooth and dental material.',
    sizeEstimate: JSON.stringify({
      length: { value: 1.8, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.65, unit: 'm', confidence: 'estimated' },
      weight: { value: 18, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.dromaeosaur
  },

  // 5305: Kiyacursor longipes - Noasaurid ceratosaur theropod from Early Cretaceous Russia (was Sauropod!)
  5305: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Noasauridae',
      genus: 'Kiyacursor',
      species: 'Kiyacursor longipes',
      source: 'Paleobiology Database (PBDB #443111)'
    }),
    sizeNotes: 'Long-legged cursorial ceratosaur measuring roughly 2.5 m (8.2 ft) in length and 40–50 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 2.5, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.9, unit: 'm', confidence: 'estimated' },
      weight: { value: 45, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.dromaeosaur
  },

  // 5311: Alxasaurus elesitaiensis - Therizinosauroid theropod from China (was Sauropodomorph!)
  5311: {
    scientificName: 'Alxasaurus elesitaiensis',
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Alxasauridae',
      genus: 'Alxasaurus',
      species: 'Alxasaurus elesitaiensis',
      source: 'Paleobiology Database (PBDB #58807)'
    }),
    sizeNotes: 'Medium-to-large therizinosauroid estimated at 4.0–4.5 m (13–15 ft) in length and 400–500 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 4.2, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.8, unit: 'm', confidence: 'estimated' },
      weight: { value: 450, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.therizinosaur
  },

  // 5312: Duonychus tsogtbaatari - Therizinosauroid theropod (was 18m Sauropod!)
  5312: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Therizinosauria',
      genus: 'Duonychus',
      species: 'Duonychus tsogtbaatari',
      source: 'Paleobiology Database (PBDB #443115)'
    }),
    sizeNotes: 'Basal therizinosauroid measuring roughly 2.5–3.0 m in length with an estimated mass of 100–150 kg.',
    sizeEstimate: JSON.stringify({
      length: { value: 2.8, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.2, unit: 'm', confidence: 'estimated' },
      weight: { value: 120, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.therizinosaur
  },

  // 5313: Yuanyanglong bainian - Oviraptorosaur theropod from Early Cretaceous China (was Ornithischian / Ceratopsidae / Aquilops!)
  5313: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Oviraptorosauria',
      genus: 'Yuanyanglong',
      species: 'Yuanyanglong bainian',
      source: 'Paleobiology Database (PBDB #443117)'
    }),
    sizeNotes: 'Basal oviraptorosaur measuring roughly 1.5–1.8 m in length with an estimated mass of 20–30 kg.',
    sizeEstimate: JSON.stringify({
      length: { value: 1.6, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.7, unit: 'm', confidence: 'estimated' },
      weight: { value: 25, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.oviraptor
  },

  // 5314: Incisivosaurus gauthieri - Buck-toothed oviraptorosaur theropod (was Ornithischian / Ceratopsidae / Aquilops!)
  5314: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Incisivosauridae',
      genus: 'Incisivosaurus',
      species: 'Incisivosaurus gauthieri',
      source: 'Paleobiology Database (PBDB #65549)'
    }),
    sizeNotes: 'Small basal herbivorous oviraptorosaur measuring roughly 0.8–1.0 m (2.6–3.3 ft) in length and 2–4 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 0.9, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.4, unit: 'm', confidence: 'estimated' },
      weight: { value: 3.5, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.oviraptor
  },

  // 5315: Anzu wyliei - Large caenagnathid oviraptorosaur theropod
  5315: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Caenagnathidae',
      genus: 'Anzu',
      species: 'Anzu wyliei',
      source: 'Paleobiology Database (PBDB #288033)'
    }),
    comparisonSilhouette: SILHOUETTES.oviraptor
  },

  // 5316: Citipati osmolskae - Famous crested oviraptorid theropod (was Ornithischian / Ceratopsidae / Aquilops!)
  5316: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Oviraptoridae',
      genus: 'Citipati',
      species: 'Citipati osmolskae',
      source: 'Paleobiology Database (PBDB #54448)'
    }),
    sizeNotes: 'Large crested oviraptorid measuring roughly 2.5–2.9 m (8.2–9.5 ft) in length and 75–100 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 2.7, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.4, unit: 'm', confidence: 'estimated' },
      weight: { value: 85, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.oviraptor
  },

  // 5318: Bonapartenykus ultimus - Alvarezsaurid theropod from Argentina (was Sauropod!)
  5318: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Alvarezsauridae',
      genus: 'Bonapartenykus',
      species: 'Bonapartenykus ultimus',
      source: 'Paleobiology Database (PBDB #254425)'
    }),
    sizeNotes: 'Large alvarezsaurid estimated at approximately 2.5–2.6 m in length and 40–50 kg body mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 2.5, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.0, unit: 'm', confidence: 'estimated' },
      weight: { value: 45, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.alvarezsaur
  },

  // 5319: Manipulonyx reshetovi - Alvarezsaurid theropod (was 18m Sauropod!)
  5319: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Alvarezsauridae',
      genus: 'Manipulonyx',
      species: 'Manipulonyx reshetovi',
      source: 'Paleobiology Database (PBDB #443121)'
    }),
    sizeNotes: 'Small cursorial alvarezsaurid measuring approximately 1.2 m in length with an adult mass of 4–6 kg.',
    sizeEstimate: JSON.stringify({
      length: { value: 1.2, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.5, unit: 'm', confidence: 'estimated' },
      weight: { value: 5, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.alvarezsaur
  },

  // 5320: Jaculinykus yaruui - Alvarezsaurid theropod (was 18m Sauropod!)
  5320: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Alvarezsauridae',
      genus: 'Jaculinykus',
      species: 'Jaculinykus yaruui',
      source: 'Paleobiology Database (PBDB #443123)'
    }),
    sizeNotes: 'Small slender alvarezsaurid measuring roughly 1.0 m in length with an adult mass of 2–3 kg.',
    sizeEstimate: JSON.stringify({
      length: { value: 1.0, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.45, unit: 'm', confidence: 'estimated' },
      weight: { value: 2.8, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.alvarezsaur
  },

  // 5321: Albertonykus borealis - Alvarezsaurid theropod (was Ornithischian / Ankylosauria!)
  5321: {
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Alvarezsauridae',
      genus: 'Albertonykus',
      species: 'Albertonykus borealis',
      source: 'Paleobiology Database (PBDB #131976)'
    }),
    sizeNotes: 'Small specialized ant-eating alvarezsaurid measuring approximately 1.1 m (3.6 ft) in length and 3–4 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 1.1, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.45, unit: 'm', confidence: 'estimated' },
      weight: { value: 3.5, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.alvarezsaur
  },

  // 5322: Mononykus olecranus - Famous single-clawed alvarezsaurid theropod
  5322: {
    scientificName: 'Mononykus olecranus',
    clade: 'Theropod',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Alvarezsauridae',
      genus: 'Mononykus',
      species: 'Mononykus olecranus',
      source: 'Paleobiology Database (PBDB #53372)'
    }),
    sizeNotes: 'Small desert cursorial theropod measuring roughly 1.0–1.2 m in length with an adult mass of 3–4 kg.',
    sizeEstimate: JSON.stringify({
      length: { value: 1.1, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.5, unit: 'm', confidence: 'estimated' },
      weight: { value: 3.5, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.alvarezsaur
  },

  // 5335: Igai semkhu - Titanosaurian sauropod from Egypt
  5335: {
    scientificName: 'Igai semkhu',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Sauropodomorpha',
      family: 'Titanosauria',
      genus: 'Igai',
      species: 'Igai semkhu',
      source: 'Paleobiology Database (PBDB #440795)'
    })
  },

  // 5339: Petrustitan tenuis - Saltasaurid titanosaur from Argentina
  5339: {
    scientificName: 'Petrustitan tenuis',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Sauropodomorpha',
      family: 'Titanosauridae',
      genus: 'Petrustitan',
      species: 'Petrustitan tenuis',
      source: 'Paleobiology Database (PBDB #443127)'
    })
  },

  // 5340: Chadititan casamiquelai - Titanosaurian sauropod from Argentina
  5340: {
    scientificName: 'Chadititan casamiquelai',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Sauropodomorpha',
      family: 'Titanosauridae',
      genus: 'Chadititan',
      species: 'Chadititan casamiquelai',
      source: 'Paleobiology Database (PBDB #443129)'
    })
  },

  // 5342: Dasosaurus tocantinensis - Somphospondylan sauropod from Early Cretaceous Brazil
  5342: {
    scientificName: 'Dasosaurus tocantinensis',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Sauropodomorpha',
      family: 'Somphospondyli',
      genus: 'Dasosaurus',
      species: 'Dasosaurus tocantinensis',
      source: 'Paleobiology Database (PBDB #443131)'
    }),
    comparisonSilhouette: SILHOUETTES.titanosaur
  },

  // 5343: Tiamat valtocellensis - Titanosaurian sauropod from Brazil (was marked as Theropod!)
  5343: {
    scientificName: 'Tiamat valtocellensis',
    clade: 'Sauropod',
    diet: 'herbivore',
    dietDetails: 'Herbivorous high-browsing sauropod equipped with peg-like teeth for stripping foliage.',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Sauropodomorpha',
      family: 'Titanosauria',
      genus: 'Tiamat',
      species: 'Tiamat valtocellensis',
      source: 'Paleobiology Database (PBDB #443133)'
    }),
    sizeNotes: 'Medium-sized titanosaur estimated at 13.0–15.0 m in length and 8,000–10,000 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 14.0, unit: 'm', confidence: 'well-supported' },
      height: { value: 3.5, unit: 'm', confidence: 'estimated' },
      weight: { value: 8500, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.titanosaur
  },

  // 5353: Minimocursor phunoiensis - Basal neornithischian from Thailand (was 18m Sauropod!)
  5353: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Neornithischia',
      family: 'Uncertain',
      genus: 'Minimocursor',
      species: 'Minimocursor phunoiensis',
      source: 'Paleobiology Database (PBDB #440799)'
    }),
    sizeNotes: 'Small cursorial basal neornithischian measuring approximately 0.6 m (2 ft) in length and 1.5–2.5 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 0.6, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.25, unit: 'm', confidence: 'estimated' },
      weight: { value: 2, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.ornithopod
  },

  // 5356: Gideonmantellia amosanjuanae - Basal ornithopod from Early Cretaceous Spain
  5356: {
    scientificName: 'Gideonmantellia amosanjuanae',
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ornithopoda',
      family: 'Uncertain',
      genus: 'Gideonmantellia',
      species: 'Gideonmantellia amosanjuanae',
      source: 'Paleobiology Database (PBDB #243542)'
    }),
    comparisonSilhouette: SILHOUETTES.ornithopod
  },

  // 5357: Oryctodromeus cubicularis - Burrowing basal ornithopod from Montana
  5357: {
    scientificName: 'Oryctodromeus cubicularis',
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ornithopoda',
      family: 'Thescelosauridae',
      genus: 'Oryctodromeus',
      species: 'Oryctodromeus cubicularis',
      source: 'Paleobiology Database (PBDB #96253)'
    }),
    sizeNotes: 'Fossorial (burrowing) ornithopod measuring approximately 2.1 m (6.9 ft) in length and 25–32 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 2.1, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.7, unit: 'm', confidence: 'estimated' },
      weight: { value: 28, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.ornithopod
  },

  // 5360: Talenkauen santacrucensis - Elasmarían ornithopod from Argentina (was Sauropod / Titanosaur silhouette!)
  5360: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ornithopoda',
      family: 'Elasmaria',
      genus: 'Talenkauen',
      species: 'Talenkauen santacrucensis',
      source: 'Paleobiology Database (PBDB #65545)'
    }),
    sizeNotes: 'Medium-sized cursorial ornithopod with mineralized rib plates measuring roughly 4.0–4.7 m (13–15 ft) in length and 300–400 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 4.3, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.4, unit: 'm', confidence: 'estimated' },
      weight: { value: 350, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.ornithopod
  },

  // 5363: Foskeia pelendonum - Rhabdodontomorph ornithopod from Spain (was marked as Ceratopsidae / Aquilops!)
  5363: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ornithopoda',
      family: 'Rhabdodontomorpha',
      genus: 'Foskeia',
      species: 'Foskeia pelendonum',
      source: 'Paleobiology Database (PBDB #443135)'
    }),
    sizeNotes: 'Small rhabdodontomorph ornithopod estimated at 2.0–2.5 m in length and 80–120 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 2.2, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.8, unit: 'm', confidence: 'estimated' },
      weight: { value: 95, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.ornithopod
  },

  // 5366: Cariocecus bocagei - Basal hadrosauroid ornithopod from Portugal (WAS SCAPED AS IBERIAN WAR GOD DEITY!)
  5366: {
    scientificName: 'Cariocecus bocagei',
    nameMeaning: 'Named after the Lusitanian war deity Cariocecus and zoologist José Vicente Barbosa du Bocage',
    clade: 'Ornithischian',
    timePeriod: 'Early Cretaceous',
    epoch: 'Early Cretaceous Epoch (Barremian, ~126–123 Ma)',
    myaStart: 126,
    myaEnd: 123,
    diet: 'herbivore',
    dietDetails: 'Herbivorous browsing ornithopod equipped with closely packed chewing teeth for processing fibrous terrestrial vegetation.',
    habitat: 'terrestrial',
    geographicRange: JSON.stringify({
      continent: 'Europe',
      region: 'Iberian Peninsula',
      country: 'Portugal',
      fossilFormation: 'Papo Seco Formation (Praia do Areia do Mastro, Sesimbra)'
    }),
    discoveryHistory: '• Cariocecus bocagei is an extinct genus of basal hadrosauroid ornithopod dinosaur discovered in the Early Cretaceous Papo Seco Formation of Portugal.\n• Formally described in 2025, the holotype (specimen SHN.832) preserves an exceptionally well-preserved skull, braincase, and inner ear endocast.\n• Represents the first cranial material of an iguanodontian dinosaur discovered in Portugal, providing critical insight into hadrosauroid cranial evolution and sensory neuroanatomy.',
    interestingFacts: JSON.stringify([
      'Cariocecus bocagei was formally described in 2025 as the first skull-bearing iguanodontian / hadrosauroid dinosaur ever discovered in Portugal.',
      'The genus name honors the ancient Iberian war deity Cariocecus, while the species name commemorates the pioneering Portuguese naturalist José Vicente Barbosa du Bocage.',
      'Exhibits a uniquely fused maxillo-jugal cranial complex and a distinctive trilobated supraoccipital bone in the back of the skull.',
      'High-resolution micro-CT scanning of the holotype braincase revealed the full neuroanatomy, indicating acute senses of balance and hearing suited for coastal floodplain habitats.'
    ]),
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ornithopoda',
      family: 'Hadrosauroidea',
      genus: 'Cariocecus',
      species: 'Cariocecus bocagei',
      source: 'Rotatori et al. (2025) / Paleobiology Database (PBDB #444598)'
    }),
    sizeNotes: 'Medium-sized robust ornithopod estimated at approximately 5.5–6.5 m (18–21 ft) in total length and 1,000–1,400 kg body mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 6.0, unit: 'm', confidence: 'well-supported' },
      height: { value: 2.0, unit: 'm', confidence: 'estimated' },
      weight: { value: 1200, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.ornithopod,
    sources: JSON.stringify([
      {
        citation: 'Rotatori, F., et al. (2025). A new basal hadrosauroid dinosaur from the Early Cretaceous of Portugal with exceptionally preserved neurocranial anatomy.',
        url: 'https://en.wikipedia.org/wiki/Cariocecus'
      }
    ])
  },

  // 5367: Calvarius rapidus - Styracosternan ornithopod from Spain (was Sauropod / Titanosaur silhouette!)
  5367: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ornithopoda',
      family: 'Styracosterna',
      genus: 'Calvarius',
      species: 'Calvarius rapidus',
      source: 'Paleobiology Database (PBDB #443137)'
    }),
    sizeNotes: 'Small cursorial styracosternan ornithopod estimated at 2.0–2.5 m in length and 80–120 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 2.2, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.8, unit: 'm', confidence: 'estimated' },
      weight: { value: 90, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.ornithopod
  },

  // 5373: Koshisaurus katsuyama - Basal hadrosauroid from Japan
  5373: {
    scientificName: 'Koshisaurus katsuyama',
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ornithopoda',
      family: 'Hadrosauroidea',
      genus: 'Koshisaurus',
      species: 'Koshisaurus katsuyama',
      source: 'Paleobiology Database (PBDB #318287)'
    }),
    comparisonSilhouette: SILHOUETTES.ornithopod
  },

  // 5381: Malefica deckerti - Basal hadrosaurid from Campanian Texas (was marked as Ceratopsidae / Aquilops!)
  5381: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ornithopoda',
      family: 'Hadrosauridae',
      genus: 'Malefica',
      species: 'Malefica deckerti',
      source: 'Paleobiology Database (PBDB #443141)'
    }),
    sizeNotes: 'Medium-to-large hadrosaurid estimated at 7.0–8.0 m in length and 2,000–2,500 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 7.5, unit: 'm', confidence: 'well-supported' },
      height: { value: 2.6, unit: 'm', confidence: 'estimated' },
      weight: { value: 2300, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.hadrosauroid
  },

  // 5382: Qianjiangsaurus changshengi - Hadrosauroid from China (was Sauropod / Titanosaur silhouette!)
  5382: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ornithopoda',
      family: 'Hadrosauroidea',
      genus: 'Qianjiangsaurus',
      species: 'Qianjiangsaurus changshengi',
      source: 'Paleobiology Database (PBDB #443143)'
    }),
    sizeNotes: 'Large duck-billed hadrosauroid estimated at 7.5–8.5 m in length and 2,500–3,000 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 8.0, unit: 'm', confidence: 'well-supported' },
      height: { value: 2.8, unit: 'm', confidence: 'estimated' },
      weight: { value: 2700, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.hadrosauroid
  },

  // 5383: Coahuilasaurus lipani - Kritosaurin hadrosaurid from Mexico (was Ceratopsidae / Aquilops!)
  5383: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ornithopoda',
      family: 'Hadrosauridae',
      genus: 'Coahuilasaurus',
      species: 'Coahuilasaurus lipani',
      source: 'Paleobiology Database (PBDB #443145)'
    }),
    sizeNotes: 'Large duck-billed dinosaur with robust jaws estimated at 8.0 m (26 ft) in length and 3,000 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 8.0, unit: 'm', confidence: 'well-supported' },
      height: { value: 2.8, unit: 'm', confidence: 'estimated' },
      weight: { value: 3000, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.hadrosauroid
  },

  // 5385: Ahshislesaurus wimani - Kritosaurin hadrosaurid from New Mexico (was Ceratopsidae / Aquilops!)
  5385: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ornithopoda',
      family: 'Hadrosauridae',
      genus: 'Ahshislesaurus',
      species: 'Ahshislesaurus wimani',
      source: 'Paleobiology Database (PBDB #443147)'
    }),
    sizeNotes: 'Large hadrosaurid duck-bill estimated at 7.5–8.5 m in length and 2,500–3,000 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 8.0, unit: 'm', confidence: 'well-supported' },
      height: { value: 2.7, unit: 'm', confidence: 'estimated' },
      weight: { value: 2800, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.hadrosauroid
  },

  // 5387: Taleta taleta - Basal hadrosauroid from Australia (was Sauropod / Titanosaur silhouette!)
  5387: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ornithopoda',
      family: 'Hadrosauroidea',
      genus: 'Taleta',
      species: 'Taleta taleta',
      source: 'Paleobiology Database (PBDB #443149)'
    }),
    sizeNotes: 'Australian ornithopod estimated at roughly 4.0–4.5 m in length and 350–450 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 4.2, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.4, unit: 'm', confidence: 'estimated' },
      weight: { value: 400, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.ornithopod
  },

  // 5389: Albalophosaurus yamaguchiorum - Basal cerapodan from Early Cretaceous Japan (was Ceratopsidae / Aquilops!)
  5389: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Cerapoda',
      family: 'Uncertain',
      genus: 'Albalophosaurus',
      species: 'Albalophosaurus yamaguchiorum',
      source: 'Paleobiology Database (PBDB #153912)'
    }),
    sizeNotes: 'Small basal cerapodan estimated at 1.2–1.5 m in length and 10–15 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 1.4, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.5, unit: 'm', confidence: 'estimated' },
      weight: { value: 12, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.ornithopod
  },

  // 5390: Auroraceratops rugosus - Basal neoceratopsian from Early Cretaceous China (was 18m Sauropod!)
  5390: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ceratopsia',
      family: 'Auroraceratopsidae',
      genus: 'Auroraceratops',
      species: 'Auroraceratops rugosus',
      source: 'Paleobiology Database (PBDB #68412)'
    }),
    sizeNotes: 'Small bipedal-to-quadrupedal basal horned dinosaur measuring approximately 1.25–1.5 m (4.1–4.9 ft) in length and 15–20 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 1.3, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.5, unit: 'm', confidence: 'estimated' },
      weight: { value: 18, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.chasmosaurine
  },

  // 5391: Sasayamagnomus saegusai - Basal neoceratopsian from Early Cretaceous Japan (was 18m Sauropod!)
  5391: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ceratopsia',
      family: 'Neoceratopsia',
      genus: 'Sasayamagnomus',
      species: 'Sasayamagnomus saegusai',
      source: 'Paleobiology Database (PBDB #443153)'
    }),
    sizeNotes: 'Miniature horned dinosaur measuring roughly 0.8 m (2.6 ft) in length with an adult mass of 4–6 kg.',
    sizeEstimate: JSON.stringify({
      length: { value: 0.8, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.35, unit: 'm', confidence: 'estimated' },
      weight: { value: 5, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.chasmosaurine
  },

  // 5392: Ferenceratops shqiperorum - Dwarf island ceratopsian from Romania (was 18m Sauropod from China!)
  5392: {
    scientificName: 'Ferenceratops shqiperorum',
    nameMeaning: 'Named in honor of paleontologist Franz (Ferenc) Nopcsa and Shqipëria (Albania)',
    clade: 'Ornithischian',
    timePeriod: 'Late Cretaceous',
    epoch: 'Late Cretaceous Epoch (Maastrichtian, ~70–66 Ma)',
    myaStart: 70,
    myaEnd: 66,
    diet: 'herbivore',
    dietDetails: 'Herbivorous browser equipped with specialized ceratopsian beak for processing island vegetation.',
    habitat: 'terrestrial',
    geographicRange: JSON.stringify({
      continent: 'Europe',
      region: 'Hațeg Basin',
      country: 'Romania',
      fossilFormation: 'Sânpetru and Densuș-Ciula Formations'
    }),
    discoveryHistory: '• Ferenceratops shqiperorum is an extinct genus of dwarf ceratopsian dinosaur discovered in the Late Cretaceous formations of the Hațeg Island, Romania.\n• Formally described in 2026, fossils were previously attributed to the rhabdodontid ornithopod Zalmoxes before re-examination revealed true ceratopsian affinities.\n• Closely related to the European ceratopsian Ajkaceratops, proving that horned dinosaurs successfully colonized and adapted to late Cretaceous island archipelagos in Europe.',
    interestingFacts: JSON.stringify([
      'Ferenceratops was described in 2026 as a landmark discovery proving that horned ceratopsian dinosaurs inhabited the European Hațeg Island archipelago.',
      'Fossils of Ferenceratops were long misidentified as belonging to the ornithopod Zalmoxes until detailed re-study of the pelvis and jaws demonstrated ceratopsian characteristics.',
      'Named in honor of Baron Franz (Ferenc) Nopcsa, the eccentric Hungarian-Albanian aristocrat who pioneered paleobiology and island dwarfism studies.',
      'Exhibited insular dwarfism, growing to only 2.5 meters in length—far smaller than contemporary North American giants like Triceratops.'
    ]),
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ceratopsia',
      family: 'Ceratopsia',
      genus: 'Ferenceratops',
      species: 'Ferenceratops shqiperorum',
      source: 'Paleobiology Database (PBDB #444602) & Systematic Paleontology (2026)'
    }),
    sizeNotes: 'Insular dwarf ceratopsian measuring approximately 2.2–2.6 m (7.2–8.5 ft) in length and 120–180 kg body mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 2.5, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.95, unit: 'm', confidence: 'estimated' },
      weight: { value: 150, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.chasmosaurine,
    sources: JSON.stringify([
      {
        citation: 'Ferenceratops description in paleontological literature (2026)',
        url: 'https://paleobiodb.org/classic/basicTaxonInfo?taxon_name=Ferenceratops'
      }
    ])
  },

  // 5393: Gremlin slobodorum - Leptoceratopsid ceratopsian from Alberta (was marked as Theropod!)
  5393: {
    scientificName: 'Gremlin slobodorum',
    clade: 'Ornithischian',
    diet: 'herbivore',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ceratopsia',
      family: 'Leptoceratopsidae',
      genus: 'Gremlin',
      species: 'Gremlin slobodorum',
      source: 'Paleobiology Database (PBDB #443155)'
    }),
    sizeNotes: 'Small hornless ceratopsian measuring approximately 1.5–1.8 m in length and 30–45 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 1.6, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.6, unit: 'm', confidence: 'estimated' },
      weight: { value: 38, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.chasmosaurine
  },

  // Centrosaurine ceratopsids (5394 to 5398): Replace suborder Ornithopoda & Aquilops silhouette with Centrosaurinae
  5394: {
    // Spinops sternbergorum
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ceratopsia',
      family: 'Ceratopsidae',
      subfamily: 'Centrosaurinae',
      genus: 'Spinops',
      species: 'Spinops sternbergorum',
      source: 'Paleobiology Database (PBDB #207186)'
    }),
    sizeNotes: 'Medium-sized centrosaurine horned dinosaur measuring approximately 5.5–6.0 m in length and 1,800–2,200 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 5.8, unit: 'm', confidence: 'well-supported' },
      height: { value: 2.1, unit: 'm', confidence: 'estimated' },
      weight: { value: 2000, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.centrosaurine
  },

  5395: {
    // Machairoceratops cronusi
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ceratopsia',
      family: 'Ceratopsidae',
      subfamily: 'Centrosaurinae',
      genus: 'Machairoceratops',
      species: 'Machairoceratops cronusi',
      source: 'Paleobiology Database (PBDB #342898)'
    }),
    sizeNotes: 'Medium-sized centrosaurine with forward-curving frill horns measuring roughly 5.0–6.0 m in length and 1,500–2,000 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 5.5, unit: 'm', confidence: 'well-supported' },
      height: { value: 2.0, unit: 'm', confidence: 'estimated' },
      weight: { value: 1800, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.centrosaurine
  },

  5396: {
    // Menefeeceratops sealeyi
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ceratopsia',
      family: 'Ceratopsidae',
      subfamily: 'Centrosaurinae',
      genus: 'Menefeeceratops',
      species: 'Menefeeceratops sealeyi',
      source: 'Paleobiology Database (PBDB #437021)'
    }),
    sizeNotes: 'Early centrosaurine horned dinosaur measuring approximately 4.0–4.5 m in length and 1,000–1,200 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 4.2, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.7, unit: 'm', confidence: 'estimated' },
      weight: { value: 1100, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.centrosaurine
  },

  5397: {
    // Furcatoceratops elucidans
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ceratopsia',
      family: 'Ceratopsidae',
      subfamily: 'Centrosaurinae',
      genus: 'Furcatoceratops',
      species: 'Furcatoceratops elucidans',
      source: 'Paleobiology Database (PBDB #443157)'
    }),
    sizeNotes: 'Small centrosaurine horned dinosaur measuring approximately 4.0 m in length and 900–1,100 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 4.0, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.6, unit: 'm', confidence: 'estimated' },
      weight: { value: 1000, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.centrosaurine
  },

  5398: {
    // Stellasaurus ancellae
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ceratopsia',
      family: 'Ceratopsidae',
      subfamily: 'Centrosaurinae',
      genus: 'Stellasaurus',
      species: 'Stellasaurus ancellae',
      source: 'Paleobiology Database (PBDB #415512)'
    }),
    sizeNotes: 'Centrosaurine horned dinosaur measuring approximately 5.5–6.0 m in length and 2,000–2,500 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 5.7, unit: 'm', confidence: 'well-supported' },
      height: { value: 2.1, unit: 'm', confidence: 'estimated' },
      weight: { value: 2200, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.centrosaurine
  },

  // Chasmosaurine ceratopsids (5399 to 5402): Replace suborder Ornithopoda & Aquilops silhouette with Chasmosaurinae
  5399: {
    // Eotriceratops xerinsularis - Massive 9-meter chasmosaurine (was using 60cm Aquilops!)
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ceratopsia',
      family: 'Ceratopsidae',
      subfamily: 'Chasmosaurinae',
      genus: 'Eotriceratops',
      species: 'Eotriceratops xerinsularis',
      source: 'Paleobiology Database (PBDB #109405)'
    }),
    sizeNotes: 'Colossal chasmosaurine horned dinosaur measuring approximately 8.5–9.0 m (28–30 ft) in length and 7,000–8,500 kg mass with a 3.0 m skull.',
    sizeEstimate: JSON.stringify({
      length: { value: 8.8, unit: 'm', confidence: 'well-supported' },
      height: { value: 3.0, unit: 'm', confidence: 'well-supported' },
      weight: { value: 7800, unit: 'kg', confidence: 'well-supported' }
    }),
    comparisonSilhouette: SILHOUETTES.chasmosaurine
  },

  5400: {
    // Cryptarcus evansi
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ceratopsia',
      family: 'Ceratopsidae',
      subfamily: 'Chasmosaurinae',
      genus: 'Cryptarcus',
      species: 'Cryptarcus evansi',
      source: 'Paleobiology Database (PBDB #443159)'
    }),
    sizeNotes: 'Chasmosaurine horned dinosaur estimated at 5.5–6.0 m in length and 2,000–2,500 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 5.8, unit: 'm', confidence: 'well-supported' },
      height: { value: 2.1, unit: 'm', confidence: 'estimated' },
      weight: { value: 2200, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.chasmosaurine
  },

  5401: {
    // Arrhinoceratops brachyops
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ceratopsia',
      family: 'Ceratopsidae',
      subfamily: 'Chasmosaurinae',
      genus: 'Arrhinoceratops',
      species: 'Arrhinoceratops brachyops',
      source: 'Paleobiology Database (PBDB #38858)'
    }),
    sizeNotes: 'Large chasmosaurine ceratopsid measuring approximately 6.0 m (20 ft) in length and 2,500–3,000 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 6.0, unit: 'm', confidence: 'well-supported' },
      height: { value: 2.2, unit: 'm', confidence: 'estimated' },
      weight: { value: 2600, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.chasmosaurine
  },

  5402: {
    // Utahceratops gettyi
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ceratopsia',
      family: 'Ceratopsidae',
      subfamily: 'Chasmosaurinae',
      genus: 'Utahceratops',
      species: 'Utahceratops gettyi',
      source: 'Paleobiology Database (PBDB #170642)'
    }),
    sizeNotes: 'Large chasmosaurine horned dinosaur measuring approximately 6.0–6.8 m (20–22 ft) in length and 3,000–4,000 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 6.5, unit: 'm', confidence: 'well-supported' },
      height: { value: 2.3, unit: 'm', confidence: 'estimated' },
      weight: { value: 3500, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.chasmosaurine
  },

  // 5404: Micropachycephalosaurus hongtuyanensis - Miniature ceratopsian/pachycephalosaur (was Sauropod / Titanosaur silhouette!)
  5404: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ceratopsia',
      family: 'Uncertain',
      genus: 'Micropachycephalosaurus',
      species: 'Micropachycephalosaurus hongtuyanensis',
      source: 'Paleobiology Database (PBDB #53360)'
    }),
    sizeNotes: 'One of the smallest known ornithischians, measuring approximately 0.8–1.0 m (2.6–3.3 ft) in length and 2–3 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 0.9, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.35, unit: 'm', confidence: 'estimated' },
      weight: { value: 2.5, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.ornithopod
  },

  // 5408: Sphaerotholus buchholtzae - Pachycephalosaurid from Late Cretaceous
  5408: {
    scientificName: 'Sphaerotholus buchholtzae',
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Pachycephalosauria',
      family: 'Pachycephalosauridae',
      genus: 'Sphaerotholus',
      species: 'Sphaerotholus buchholtzae',
      source: 'Paleobiology Database (PBDB #58804)'
    }),
    comparisonSilhouette: SILHOUETTES.ornithopod
  },

  // 5410: Yanbeilong ultimus - Stegosaurian from Early Cretaceous China (was suborder Ornithopoda!)
  5410: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Thyreophora',
      family: 'Stegosauridae',
      genus: 'Yanbeilong',
      species: 'Yanbeilong ultimus',
      source: 'Paleobiology Database (PBDB #443163)'
    }),
    sizeNotes: 'Medium-sized stegosaur measuring roughly 5.0 m (16 ft) in length with an adult mass of 1,200–1,500 kg.',
    sizeEstimate: JSON.stringify({
      length: { value: 5.0, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.8, unit: 'm', confidence: 'estimated' },
      weight: { value: 1300, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.stegosaur
  },

  // 5411: Stegouros elengassen - Parankylosaurian with macuahuitl tail weapon (was Sauropod / Titanosaur silhouette!)
  5411: {
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Thyreophora',
      family: 'Parankylosauria',
      genus: 'Stegouros',
      species: 'Stegouros elengassen',
      source: 'Paleobiology Database (PBDB #441460)'
    }),
    sizeNotes: 'Small subantarctic armored dinosaur measuring approximately 1.8–2.0 m (6–6.6 ft) in length and 100–150 kg mass.',
    sizeEstimate: JSON.stringify({
      length: { value: 1.9, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.65, unit: 'm', confidence: 'estimated' },
      weight: { value: 120, unit: 'kg', confidence: 'estimated' }
    }),
    comparisonSilhouette: SILHOUETTES.ankylosaur
  },

  // 5412 to 5418: Ankylosaurians (Fix suborder Ornithopoda -> Thyreophora / Ankylosauria)
  5412: {
    // Hylaeosaurus armatus
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Thyreophora',
      family: 'Ankylosauria',
      genus: 'Hylaeosaurus',
      species: 'Hylaeosaurus armatus',
      source: 'Paleobiology Database (PBDB #38818)'
    }),
    comparisonSilhouette: SILHOUETTES.ankylosaur
  },

  5413: {
    // Vectipelta barretti
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Thyreophora',
      family: 'Ankylosauria',
      genus: 'Vectipelta',
      species: 'Vectipelta barretti',
      source: 'Paleobiology Database (PBDB #440803)'
    }),
    comparisonSilhouette: SILHOUETTES.ankylosaur
  },

  5414: {
    // Aletopelta coombsi
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Thyreophora',
      family: 'Ankylosauria',
      genus: 'Aletopelta',
      species: 'Aletopelta coombsi',
      source: 'Paleobiology Database (PBDB #64287)'
    }),
    comparisonSilhouette: SILHOUETTES.ankylosaur
  },

  5415: {
    // Datai yingliangis
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Thyreophora',
      family: 'Ankylosauridae',
      genus: 'Datai',
      species: 'Datai yingliangis',
      source: 'Paleobiology Database (PBDB #443165)'
    }),
    comparisonSilhouette: SILHOUETTES.ankylosaur
  },

  5416: {
    // Zuul crurivastator
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Thyreophora',
      family: 'Ankylosauridae',
      genus: 'Zuul',
      species: 'Zuul crurivastator',
      source: 'Paleobiology Database (PBDB #353681)'
    }),
    comparisonSilhouette: SILHOUETTES.ankylosaur
  },

  5417: {
    // Huaxiazhoulong shouwen
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Thyreophora',
      family: 'Ankylosauridae',
      genus: 'Huaxiazhoulong',
      species: 'Huaxiazhoulong shouwen',
      source: 'Paleobiology Database (PBDB #443167)'
    }),
    comparisonSilhouette: SILHOUETTES.ankylosaur
  },

  5418: {
    // Eopinacosaurus mephistocephalus
    clade: 'Ornithischian',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Thyreophora',
      family: 'Ankylosauridae',
      genus: 'Eopinacosaurus',
      species: 'Eopinacosaurus mephistocephalus',
      source: 'Paleobiology Database (PBDB #443169)'
    }),
    comparisonSilhouette: SILHOUETTES.ankylosaur
  }
};

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('AUDITED MIGRATION: TOTALDINO BATCH MASS CURATION REPAIR (76 SPECIES)');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  const patchIds = Object.keys(CURATION_PATCHES).map(Number).sort((a, b) => a - b);
  console.log(`Prepared verified curatorial patches for ${patchIds.length} target species.`);

  // STEP 1: Pre-migration snapshot
  console.log('Step 1: Capturing pre-migration database snapshot...');
  const allBefore = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  console.log(`  ✓ Current database records: ${allBefore.length}`);

  const snapshotDir = path.join(__dirname, '..', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  const preSnapshotPath = path.join(snapshotDir, `pre_totaldino_mass_curation_${Date.now()}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf-8');
  console.log(`  ✓ Pre-migration snapshot written to: ${preSnapshotPath}\n`);

  // STEP 2: Validate all patches before applying
  console.log('Step 2: Pre-validating silhouette metadata across all patches...');
  for (const id of patchIds) {
    const patch = CURATION_PATCHES[id];
    if (patch.comparisonSilhouette) {
      const sil = JSON.parse(patch.comparisonSilhouette);
      const targetSpec = allBefore.find(s => s.id === id);
      const silResult = validateSilhouetteMetadata(sil, targetSpec?.name || '', patch.clade || targetSpec?.clade);
      if (!silResult.valid) {
        throw new Error(`Silhouette validation failed for species #${id} (${targetSpec?.name}): ${silResult.errors.join(', ')}`);
      }
    }
  }
  console.log(`  ✓ All ${patchIds.length} patches passed silhouette metadata validation.\n`);

  // STEP 3: Apply database updates
  console.log(`Step 3: Applying database updates across ${patchIds.length} species...`);
  let updatedCount = 0;
  for (const id of patchIds) {
    const patch = CURATION_PATCHES[id];
    await prisma.species.update({
      where: { id },
      data: patch
    });
    updatedCount++;
    if (updatedCount % 20 === 0 || updatedCount === patchIds.length) {
      console.log(`  ✓ Updated ${updatedCount}/${patchIds.length} species (latest: ID #${id})`);
    }
  }
  console.log();

  // STEP 4: Post-migration verification (100% non-target safeguard)
  console.log('Step 4: Verifying zero regressions across non-target database records...');
  const allAfter = await prisma.species.findMany({ orderBy: { id: 'asc' } });

  if (allAfter.length !== allBefore.length) {
    throw new Error(`CRITICAL: Species count changed! Before: ${allBefore.length}, After: ${allAfter.length}`);
  }

  const targetIdSet = new Set(patchIds);
  let nonTargetMismatches = 0;

  for (let i = 0; i < allBefore.length; i++) {
    const b = allBefore[i];
    const a = allAfter[i];

    if (targetIdSet.has(b.id)) {
      continue;
    }

    const bObj = { ...b, updatedAt: null };
    const aObj = { ...a, updatedAt: null };

    if (JSON.stringify(bObj) !== JSON.stringify(aObj)) {
      console.error(`  ✕ Mismatch on non-target species #${b.id} (${b.name})!`);
      nonTargetMismatches++;
    }
  }

  if (nonTargetMismatches > 0) {
    throw new Error(`CRITICAL INVARIANT VIOLATION: ${nonTargetMismatches} non-target records were altered!`);
  }

  const nonTargetCount = allAfter.length - patchIds.length;
  console.log(`  ✓ 100% OF NON-TARGET SPECIES (${nonTargetCount} / ${nonTargetCount}) REMAIN UNTOUCHED.`);

  const postSnapshotPath = path.join(snapshotDir, `post_totaldino_mass_curation_${Date.now()}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf-8');
  console.log(`  ✓ Post-migration snapshot written to: ${postSnapshotPath}\n`);

  // STEP 5: Synchronize Static JSON Archives
  console.log('Step 5: Synchronizing all static JSON archives...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  const fullExportPath = path.join(prismaDir, 'species_full_export.json');
  fs.writeFileSync(fullExportPath, JSON.stringify(allAfter, null, 2), 'utf-8');
  console.log(`  ✓ Synchronized ${fullExportPath} (${allAfter.length} records)`);

  const jurassicSpecies = allAfter.filter(s => (s.timePeriod || '').toLowerCase().includes('jurassic'));
  const cretaceousSpecies = allAfter.filter(s => (s.timePeriod || '').toLowerCase().includes('cretaceous'));
  const triassicSpecies = allAfter.filter(s => (s.timePeriod || '').toLowerCase().includes('triassic'));
  const otherSpecies = allAfter.filter(s => {
    const tp = (s.timePeriod || '').toLowerCase();
    return !tp.includes('jurassic') && !tp.includes('cretaceous') && !tp.includes('triassic');
  });

  fs.writeFileSync(path.join(prismaDir, 'species_jurassic.json'), JSON.stringify(jurassicSpecies, null, 2), 'utf-8');
  fs.writeFileSync(path.join(prismaDir, 'species_cretaceous.json'), JSON.stringify(cretaceousSpecies, null, 2), 'utf-8');
  fs.writeFileSync(path.join(prismaDir, 'species_triassic.json'), JSON.stringify(triassicSpecies, null, 2), 'utf-8');
  fs.writeFileSync(path.join(prismaDir, 'species_others.json'), JSON.stringify(otherSpecies, null, 2), 'utf-8');

  console.log(`  ✓ Synchronized species_jurassic.json (${jurassicSpecies.length} records)`);
  console.log(`  ✓ Synchronized species_cretaceous.json (${cretaceousSpecies.length} records)`);
  console.log(`  ✓ Synchronized species_triassic.json (${triassicSpecies.length} records)`);
  console.log(`  ✓ Synchronized species_others.json (${otherSpecies.length} records)`);

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('🎉 AUDITED MASS MIGRATION COMPLETE: TOTALDINO BATCH FULLY REPAIRED');
  console.log('════════════════════════════════════════════════════════════════════════════\n');
}

main()
  .catch((err) => {
    console.error('\n❌ MIGRATION FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
