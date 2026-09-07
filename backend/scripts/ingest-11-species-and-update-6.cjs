const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
require('dotenv').config({ path: 'backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const supabaseUrl = process.env.SUPABASE_URL || 'https://bbsmxcoywionsvmfznah.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

async function uploadToSupabase(fileName, buffer, contentType) {
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

// 1. Existing species media updates
const EXISTING_UPDATES = [
  {
    id: 845,
    name: 'Dracorex',
    scientificName: 'Dracorex hogwartsia',
    getNewMedia: (currentMediaStr) => {
      let mediaArr = [];
      try { mediaArr = JSON.parse(currentMediaStr) || []; } catch(e){}
      const nonArt = mediaArr.filter(m => m.type !== 'art');
      const newArt = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Dracorex_BW.jpg',
        type: 'art',
        credit: 'Nobu Tamura (CC BY 3.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dracorex_BW.jpg'
      };
      return JSON.stringify([newArt, ...nonArt]);
    }
  },
  {
    id: 513,
    name: 'Dreadnoughtus',
    scientificName: 'Dreadnoughtus schrani',
    getNewMedia: () => {
      const newArt = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Dreadnoughtus_NT_small.jpg',
        type: 'art',
        credit: 'Nobu Tamura (CC BY-SA 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dreadnoughtus_NT_small.jpg'
      };
      return JSON.stringify([newArt]);
    }
  },
  {
    id: 466,
    name: 'Styracosaurus',
    scientificName: 'Styracosaurus albertensis',
    getNewMedia: (currentMediaStr) => {
      let mediaArr = [];
      try { mediaArr = JSON.parse(currentMediaStr) || []; } catch(e){}
      const nonArt = mediaArr.filter(m => m.type !== 'art');
      const newArt = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Styracosaurus_dinosaur.png',
        type: 'art',
        credit: 'Mariana Ruiz LadyofHats (Public Domain)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Styracosaurus_dinosaur.png'
      };
      return JSON.stringify([newArt, ...nonArt]);
    }
  },
  {
    id: 475,
    name: 'Sinoceratops',
    scientificName: 'Sinoceratops zhuchengensis',
    getNewMedia: (currentMediaStr) => {
      let mediaArr = [];
      try { mediaArr = JSON.parse(currentMediaStr) || []; } catch(e){}
      const nonArt = mediaArr.filter(m => m.type !== 'art');
      const newArt = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Sinoceratops_zhuchengensis.png',
        type: 'art',
        credit: 'Connor Ashbridge (CC BY 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Sinoceratops_zhuchengensis.png'
      };
      return JSON.stringify([newArt, ...nonArt]);
    }
  },
  {
    id: 185,
    name: 'Dryosaurus',
    scientificName: 'Dryosaurus altus',
    getNewMedia: (currentMediaStr) => {
      let mediaArr = [];
      try { mediaArr = JSON.parse(currentMediaStr) || []; } catch(e){}
      const nonArt = mediaArr.filter(m => m.type !== 'art');
      const newArt = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Dryosaurus_TD.png',
        type: 'art',
        credit: 'TotalDino (CC BY 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dryosaurus_TD.png'
      };
      return JSON.stringify([newArt, ...nonArt]);
    }
  },
  {
    id: 1749,
    name: 'Iguanodon bernissartensis',
    scientificName: 'Iguanodon bernissartensis',
    getNewMedia: (currentMediaStr) => {
      let mediaArr = [];
      try { mediaArr = JSON.parse(currentMediaStr) || []; } catch(e){}
      const nonArt = mediaArr.filter(m => m.type !== 'art');
      const newArt = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Iguanodon_new_NT.jpg',
        type: 'art',
        credit: 'Nobu Tamura (CC BY-SA 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Iguanodon_new_NT.jpg'
      };
      return JSON.stringify([newArt, ...nonArt]);
    }
  }
];

// 2. 11 New species data with exact schema enums
const NEW_SPECIES = [
  {
    id: 5156,
    name: 'Thanatosdrakon',
    scientificName: 'Thanatosdrakon amaru',
    nameMeaning: 'Dragon of death, winged serpent deity',
    timePeriod: 'Late Cretaceous',
    epoch: 'Late Cretaceous (Coniacian–Santonian)',
    myaStart: 89.6,
    myaEnd: 86.0,
    diet: 'carnivore',
    dietDetails: 'Apex carnivorous predator preying on small-to-medium terrestrial vertebrates, dinosaur hatchlings, and reptiles.',
    habitat: 'terrestrial',
    clade: 'Pterosaur',
    geographicRange: JSON.stringify({
      continent: 'South America',
      region: 'Neuquén Basin',
      country: 'Argentina',
      fossilFormation: 'Plottier Formation'
    }),
    taxonomy: JSON.stringify({
      kingdom: 'Animalia',
      phylum: 'Chordata',
      clade: 'Pterosauria',
      order: 'Pterosauria',
      suborder: 'Pterodactyloidea',
      family: 'Azhdarchidae',
      genus: 'Thanatosdrakon',
      species: 'Thanatosdrakon amaru'
    }),
    taxonomicStatus: 'valid',
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/ThanatosdrakonJF.png',
        type: 'art',
        credit: 'Jfstudiospaleoart (CC BY-SA 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:ThanatosdrakonJF.png'
      }
    ]),
    discoveryHistory: 'Discovered in Mendoza Province, Argentina during civil works construction and described in 2022 by Leonardo D. Ortiz David, Bernardo J. González Riga, and Alexander W. A. Kellner based on holotype UNCUYO-LD 307 and a gigantic paratype UNCUYO-LD 350.',
    interestingFacts: JSON.stringify([
      'The largest pterosaur ever discovered in South America, possessing an immense estimated wingspan of approximately 9 meters (30 feet).',
      'One of the oldest known giant azhdarchids, living millions of years before the famous terminal Cretaceous giants Quetzalcoatlus and Hatzegopteryx.',
      'Its generic name translates to "dragon of death" (Thanatos + drakon), while the species epithet honors Amaru, the mythical winged flying serpent in Quechua Andean cosmology.',
      'Skeletal adaptations in its cervical vertebrae and robust limb girdles indicate it was a terrestrial stalker that hunted prey efficiently on the ground in semi-arid braided floodplains.'
    ]),
    sizeNotes: 'Based on holotype UNCUYO-LD 307 (~7 m wingspan) and large adult paratype UNCUYO-LD 350 (~9 m wingspan).',
    sizeEstimate: JSON.stringify({
      wingspan: { value: 9.0, unit: 'm', confidence: 'well-supported' },
      height: { value: 4.8, unit: 'm', confidence: 'estimated' },
      weight: { value: 250, unit: 'kg', confidence: 'estimated' }
    }),
    sizeComparisonToHuman: true,
    silhouetteUuid: 'bb407d49-45f6-47f5-95c7-359115bfca64',
    silhouetteCredit: 'jack liddle',
    silhouetteLicense: 'Attribution 4.0 International (CC BY 4.0)',
    silhouetteTaxon: 'Thanatosdrakon amaru',
    silhouetteTier: 'species-specific',
    extinctionEvent: 'Santonian Faunal Turnover (~86 MYA)',
    closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)', 'Crocodilians (Crocodilia)']),
    sources: JSON.stringify([
      {
        citation: "Ortiz David, L. D., González Riga, B. J., & Kellner, A. W. A. (2022). Thanatosdrakon amaru, gen. et sp. nov., an azhdarchid pterosaur from the upper Cretaceous of Mendoza, Argentina. Cretaceous Research, 135, 105180.",
        url: 'https://doi.org/10.1016/j.cretres.2022.105180'
      }
    ]),
    placeholder: false
  },
  {
    id: 5157,
    name: 'Oxalaia',
    scientificName: 'Oxalaia quilombensis',
    nameMeaning: 'Oxalá (deity), of the quilombos',
    timePeriod: 'Late Cretaceous',
    epoch: 'Late Cretaceous (Cenomanian)',
    myaStart: 98.0,
    myaEnd: 93.5,
    diet: 'carnivore',
    dietDetails: 'Piscivore and opportunistic carnivore hunting giant lobe-finned coelacanths (Mawsonia), sawfish, and coastal terrestrial fauna.',
    habitat: 'semi_aquatic',
    clade: 'Theropod',
    geographicRange: JSON.stringify({
      continent: 'South America',
      region: 'São Luís Basin',
      country: 'Brazil',
      fossilFormation: 'Alcântara Formation'
    }),
    taxonomy: JSON.stringify({
      kingdom: 'Animalia',
      phylum: 'Chordata',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Spinosauridae',
      genus: 'Oxalaia',
      species: 'Oxalaia quilombensis'
    }),
    taxonomicStatus: 'valid',
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Oxalaia_quilombensis_life_reconstruction_by_PaleoGeek.png',
        type: 'art',
        credit: 'PaleoGeekSquared (CC BY-SA 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Oxalaia_quilombensis_life_reconstruction_by_PaleoGeek.png'
      }
    ]),
    discoveryHistory: 'Discovered in 1999 on Cajual Island, Maranhão, Brazil, and described in 2011 by Alexander W. A. Kellner and colleagues based on holotype MN 6117-V. Tragic loss occurred in September 2018 when the holotype was destroyed in the National Museum of Brazil fire.',
    interestingFacts: JSON.stringify([
      'The largest carnivorous dinosaur discovered in Brazil, estimated between 12 and 14 meters (39 to 46 feet) in total length and weighing 5 to 7 tonnes.',
      'A true spinosaurine theropod closely related to the African Spinosaurus aegyptianus, demonstrating a paleobiogeographic connection between South America and Africa during the mid-Cretaceous.',
      'Its generic name honors Oxalá, the supreme male deity in Afro-Brazilian Candomblé religion, while quilombensis recognizes the quilombos of Cajual Island established by escaped African slaves.',
      'Possessed a distinctly expanded spoon-shaped terminal rosette at the tip of its long snout housing paired premaxillary teeth adapted to snatching slippery aquatic prey.'
    ]),
    sizeNotes: 'Based on holotype premaxillae MN 6117-V and isolated maxilla fragment MN 6119-V, scaled against Spinosaurus.',
    sizeEstimate: JSON.stringify({
      length: { value: 13.0, unit: 'm', confidence: 'estimated' },
      height: { value: 3.8, unit: 'm', confidence: 'estimated' },
      weight: { value: 6000, unit: 'kg', confidence: 'estimated' }
    }),
    sizeComparisonToHuman: true,
    silhouetteUuid: '8284190f-a528-4da0-b86e-63bc5badb950',
    silhouetteCredit: 'Connor Ashbridge',
    silhouetteLicense: 'Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)',
    silhouetteTaxon: 'Oxalaia quilombensis',
    silhouetteTier: 'species-specific',
    extinctionEvent: 'Cenomanian-Turonian Boundary Anoxic Event (~93.9 MYA)',
    closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)']),
    sources: JSON.stringify([
      {
        citation: "Kellner, A. W. A., Machado, E. B., Azevedo, S. A. K., Henriques, D. D. R., & Carvalho, L. B. (2011). A new dinosaur (Theropoda, Spinosauridae) from the Cretaceous (Cenomanian)-Alcântara Formation, Cajual Island, Brazil. Anais da Academia Brasileira de Ciências, 83(1), 99-108.",
        url: 'https://doi.org/10.1590/S0001-37652011000100006'
      }
    ]),
    placeholder: false
  },
  {
    id: 5158,
    name: 'Clidastes',
    scientificName: 'Clidastes propython',
    nameMeaning: 'Key joint, before the serpent',
    timePeriod: 'Late Cretaceous',
    epoch: 'Late Cretaceous (Santonian–Campanian)',
    myaStart: 86.0,
    myaEnd: 75.0,
    diet: 'carnivore',
    dietDetails: 'Agile marine predator preying on cephalopods, teleost fish, marine birds (such as Ichthyornis), and smaller marine reptiles.',
    habitat: 'marine',
    clade: 'Marine_Reptile',
    geographicRange: JSON.stringify({
      continent: 'North America',
      region: 'Western Interior Seaway & Gulf Coast',
      country: 'United States',
      fossilFormation: 'Niobrara Formation & Mooreville Chalk'
    }),
    taxonomy: JSON.stringify({
      kingdom: 'Animalia',
      phylum: 'Chordata',
      clade: 'Squamata',
      order: 'Squamata',
      suborder: 'Sauria',
      family: 'Mosasauridae',
      genus: 'Clidastes',
      species: 'Clidastes propython'
    }),
    taxonomicStatus: 'valid',
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Ichthyornis_%26_Clidastes.png',
        type: 'art',
        credit: 'SmirnovaNataliaArt (CC BY-SA 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ichthyornis_%26_Clidastes.png'
      }
    ]),
    discoveryHistory: 'Named in 1868 by pioneering American paleontologist Edward Drinker Cope based on an articulated skeleton from Uniontown, Alabama. Cope was amazed by its interlocking vertebral articulations.',
    interestingFacts: JSON.stringify([
      'One of the fastest and most agile of all mosasaurs, measuring between 3 and 5.5 meters (10 to 18 feet) with a slender, hydrodynamically streamlined body.',
      'Its generic name refers to its unique interlocking "key" joints (zygosphene-zygantrum articulations) that stabilized its spinal column during rapid lateral undulations.',
      'Possessed a downward-bent caudal fluke supporting a crescent-shaped shark-like vertical tail fin that produced rapid bursts of forward acceleration.',
      'Coprolites and tooth marks confirm it regularly hunted diving marine avians such as Ichthyornis and Hesperornis in coastal inland seas.'
    ]),
    sizeNotes: 'Based on complete articulated skeletons from the Mooreville Chalk and Smoky Hill Chalk.',
    sizeEstimate: JSON.stringify({
      length: { value: 4.5, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.6, unit: 'm', confidence: 'well-supported' },
      weight: { value: 250, unit: 'kg', confidence: 'estimated' }
    }),
    sizeComparisonToHuman: true,
    silhouetteUuid: '05d5c2c0-78c5-48e3-b8ca-5243a6bba401',
    silhouetteCredit: 'Cy Marchant',
    silhouetteLicense: 'Attribution 4.0 International (CC BY 4.0)',
    silhouetteTaxon: 'Clidastes propython',
    silhouetteTier: 'species-specific',
    extinctionEvent: 'Campanian Marine Turnover (~75 MYA)',
    closestLivingRelatives: JSON.stringify(['Monitor Lizards (Varanidae)', 'Snakes (Serpentes)']),
    sources: JSON.stringify([
      {
        citation: "Cope, E. D. (1868). Remarks on a new enaliosaurian, Elasmosaurus platyurus, and Clidastes propython. Proceedings of the Academy of Natural Sciences of Philadelphia, 20, 92-93.",
        url: 'https://www.biodiversitylibrary.org/page/26298918'
      },
      {
        citation: "Lindgren, J., Polcyn, M. J., & Young, B. A. (2011). Skin pigmentation provides evidence of convergent melanism in extinct marine reptiles. Nature, 506(7489), 484-488.",
        url: 'https://doi.org/10.1038/nature12899'
      }
    ]),
    placeholder: false
  },
  {
    id: 5159,
    name: 'Protoceratops',
    scientificName: 'Protoceratops andrewsi',
    nameMeaning: 'First horned face of Andrews',
    timePeriod: 'Late Cretaceous',
    epoch: 'Late Cretaceous (Campanian)',
    myaStart: 75.0,
    myaEnd: 71.0,
    diet: 'herbivore',
    dietDetails: 'Herbivorous low-level browser equipped with a sharp shearing keratinous beak adapted to clipping tough desert vegetation, scrub roots, and cycads.',
    habitat: 'terrestrial',
    clade: 'Ornithischian',
    geographicRange: JSON.stringify({
      continent: 'Asia',
      region: 'Gobi Desert',
      country: 'Mongolia',
      fossilFormation: 'Djadochta Formation'
    }),
    taxonomy: JSON.stringify({
      kingdom: 'Animalia',
      phylum: 'Chordata',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ceratopsia',
      family: 'Protoceratopsidae',
      genus: 'Protoceratops',
      species: 'Protoceratops andrewsi'
    }),
    taxonomicStatus: 'valid',
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Protoceratops_andrewsi_Restoration.png',
        type: 'art',
        credit: 'PaleoNeolitic (CC BY 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Protoceratops_andrewsi_Restoration.png'
      }
    ]),
    discoveryHistory: 'Found in 1922 during the Central Asiatic Expeditions led by Roy Chapman Andrews at the Flaming Cliffs (Bayn Dzak), Gobi Desert. Described in 1923 by Walter Granger and William King Gregory.',
    interestingFacts: JSON.stringify([
      'Famed worldwide for the iconic "Fighting Dinosaurs" specimen discovered in 1971, preserved locked in mortal combat with a Velociraptor that was buried instantly by a collapsing sand dune.',
      'Unlike its massive ceratopsid descendants (like Triceratops), Protoceratops lacked large brow horns, relying on a robust bony neck frill and muscular jaw adductors.',
      'Hundreds of complete skeletons representing every ontogenetic stage—from embryos in nests and hatchlings to fully grown adults—have been recovered from the Gobi dunes.',
      'Often credited historically as the likely real-world fossil inspiration behind the ancient mythological griffin described by Scythian gold miners and Greek travelers.'
    ]),
    sizeNotes: 'Based on abundant complete skeletons (e.g., AMNH 6251); adults reached ~1.8 to 2.0 meters.',
    sizeEstimate: JSON.stringify({
      length: { value: 1.9, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.65, unit: 'm', confidence: 'well-supported' },
      weight: { value: 120, unit: 'kg', confidence: 'well-supported' }
    }),
    sizeComparisonToHuman: true,
    silhouetteUuid: '14da9eea-59b1-47f4-a752-b0e7a30d6fa4',
    silhouetteCredit: 'Matt Dempsey',
    silhouetteLicense: 'Attribution 4.0 International (CC BY 4.0)',
    silhouetteTaxon: 'Protoceratops andrewsi',
    silhouetteTier: 'species-specific',
    extinctionEvent: 'K-Pg Extinction Event (66 MYA)',
    closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)', 'Crocodilians (Crocodilia)']),
    sources: JSON.stringify([
      {
        citation: "Granger, W., & Gregory, W. K. (1923). Protoceratops andrewsi, a pre-ceratopsian dinosaur from Mongolia. American Museum Novitates, 72, 1-9.",
        url: 'http://hdl.handle.net/2246/3233'
      },
      {
        citation: "Fastovsky, D. E., Weishampel, D. B., Watabe, M., et al. (2011). A nest of juveniles of the basal ceratopsian dinosaur Protoceratops andrewsi from the Djadochta Formation (Late Cretaceous, Campanian), Tugrikinshireh, Mongolia. Journal of Paleontology, 85(6), 1035-1041.",
        url: 'https://doi.org/10.1666/11-008.1'
      }
    ]),
    placeholder: false
  },
  {
    id: 5160,
    name: 'Minmi',
    scientificName: 'Minmi paravertebra',
    nameMeaning: 'Of Minmi Crossing, with paravertebrae',
    timePeriod: 'Early Cretaceous',
    epoch: 'Early Cretaceous (Aptian)',
    myaStart: 120.0,
    myaEnd: 112.0,
    diet: 'herbivore',
    dietDetails: 'Herbivore specialized in low-level browsing, consuming seeds, fruiting bodies, small ferns, and fibrous vascular plants.',
    habitat: 'terrestrial',
    clade: 'Ornithischian',
    geographicRange: JSON.stringify({
      continent: 'Oceania',
      region: 'Eromanga Basin',
      country: 'Australia',
      fossilFormation: 'Bungil Formation'
    }),
    taxonomy: JSON.stringify({
      kingdom: 'Animalia',
      phylum: 'Chordata',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Thyreophora',
      family: 'Parankylosauria',
      genus: 'Minmi',
      species: 'Minmi paravertebra'
    }),
    taxonomicStatus: 'valid',
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Minmi_paravertebra_dinosauria.png',
        type: 'art',
        credit: 'Mariana Ruiz LadyofHats (Public domain)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Minmi_paravertebra_dinosauria.png'
      }
    ]),
    discoveryHistory: 'Discovered in 1964 by Alan Bartholomai near Minmi Crossing, Roma, Queensland. Formally described by Ralph E. Molnar in 1980 (QM F10321) as Australia\'s first discovered armored dinosaur.',
    interestingFacts: JSON.stringify([
      'Possesses unique horizontal bony rods running parallel along both sides of its backbone, termed "paravertebrae", which stiffened its spine while allowing rapid running.',
      'Unlike the massive ankylosaurs of North America and Asia, Minmi was a small, agile Gondwanan quadruped measuring only 2.5 to 3.0 meters (8.2 to 10 feet) long.',
      'Fossilized cololite (gut contents) preserved in an Australian specimen provided the direct microscopic evidence of dinosaur diet, showing cuticles of flowering plants, seeds, and fern spores.',
      'Has the shortest generic dinosaur name alongside modern designations like Yi and Mei, honoring the indigenous Australian geographical locality of Minmi Crossing.'
    ]),
    sizeNotes: 'Based on holotype QM F10321; adult length ~2.5–3.0 meters.',
    sizeEstimate: JSON.stringify({
      length: { value: 2.8, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.85, unit: 'm', confidence: 'well-supported' },
      weight: { value: 300, unit: 'kg', confidence: 'estimated' }
    }),
    sizeComparisonToHuman: true,
    silhouetteUuid: 'bad3e7d0-b8ce-4a7c-ada5-5c2f607ff661',
    silhouetteCredit: 'Cy Marchant',
    silhouetteLicense: 'Attribution 4.0 International (CC BY 4.0)',
    silhouetteTaxon: 'Stegouros elengassen (Parankylosauria approximation)',
    silhouetteTier: 'generic approximation, not species-specific',
    extinctionEvent: 'Mid-Cretaceous Gondwanan Faunal Turnover (~100 MYA)',
    closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)', 'Crocodilians (Crocodilia)']),
    sources: JSON.stringify([
      {
        citation: "Molnar, R. E. (1980). An ankylosaur (Reptilia: Ornithischia) from the Lower Cretaceous of southern Queensland. Memoirs of the Queensland Museum, 20(1), 65-75.",
        url: 'https://www.biodiversitylibrary.org/part/303975'
      },
      {
        citation: "Molnar, R. E., & Clifford, H. T. (2001). An ankylosaurian cololite from Queensland, Australia. In The Armored Dinosaurs (pp. 399-412). Indiana University Press.",
        url: 'https://iupress.org/9780253339645/the-armored-dinosaurs/'
      }
    ]),
    placeholder: false
  },
  {
    id: 5161,
    name: 'Elasmotherium',
    scientificName: 'Elasmotherium sibiricum',
    nameMeaning: 'Laminated beast of Siberia (Siberian Unicorn)',
    timePeriod: 'Pleistocene',
    epoch: 'Late Pleistocene',
    myaStart: 2.6,
    myaEnd: 0.039,
    diet: 'herbivore',
    dietDetails: 'Hypsodont herbivorous grazer consuming abrasive dry steppe grasses, tubers, and herbs in sub-Arctic steppe environments.',
    habitat: 'terrestrial',
    clade: 'Early_Mammal_Synapsid',
    geographicRange: JSON.stringify({
      continent: 'Eurasia',
      region: 'Pontic-Caspian Steppe & Siberia',
      country: 'Russia, Kazakhstan, Ukraine',
      fossilFormation: 'Late Pleistocene River Alluvium'
    }),
    taxonomy: JSON.stringify({
      kingdom: 'Animalia',
      phylum: 'Chordata',
      clade: 'Mammalia',
      order: 'Perissodactyla',
      suborder: 'Ceratomorpha',
      family: 'Rhinocerotidae',
      genus: 'Elasmotherium',
      species: 'Elasmotherium sibiricum'
    }),
    taxonomicStatus: 'valid',
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Elasmotherium_sib1225.jpg',
        type: 'art',
        credit: 'Dmitry Bogdanov (CC BY-SA 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Elasmotherium_sib1225.jpg'
      }
    ]),
    discoveryHistory: 'First described in 1808 by Johann Fischer von Waldheim from a lower jaw in the Museum of Moscow University. Landmark ancient DNA research in 2018 established that it persisted until ~39,000 years ago.',
    interestingFacts: JSON.stringify([
      'Popularly dubbed the "Siberian Unicorn", this enormous Pleistocene rhinoceros reached up to 5 meters in length and weighed between 3.5 and 5 metric tonnes.',
      'Anchored a massive central cranial dome on its forehead that supported a gigantic keratinous horn, far larger than that of any living rhinoceros species.',
      'High-resolution radiocarbon dating and ancient mitochondrial genome sequencing published in Nature (2018) proved it survived until approximately 39,000 years ago, directly coexisting with early modern humans and Neanderthals.',
      'Possessed remarkably high-crowned (hypsodont) prismatic cheek teeth with complex enamel folding adapted specifically for grinding down silica-rich abrasive grasses.'
    ]),
    sizeNotes: 'Based on complete mounted skeletons in Russian paleontological institutions; shoulder height ~2.0–2.5 m.',
    sizeEstimate: JSON.stringify({
      length: { value: 4.8, unit: 'm', confidence: 'well-supported' },
      height: { value: 2.2, unit: 'm', confidence: 'well-supported' },
      weight: { value: 4000, unit: 'kg', confidence: 'well-supported' }
    }),
    sizeComparisonToHuman: true,
    silhouetteUuid: 'fd7c9a00-55e6-470a-a48a-f9c49a17da43',
    silhouetteCredit: 'Michael Tripoli',
    silhouetteLicense: 'Attribution 4.0 International (CC BY 4.0)',
    silhouetteTaxon: 'Elasmotherium sibiricum',
    silhouetteTier: 'species-specific',
    extinctionEvent: 'Quaternary Megafauna Extinction (~39,000 BP)',
    closestLivingRelatives: JSON.stringify(['Modern Rhinoceroses (Rhinocerotidae)']),
    sources: JSON.stringify([
      {
        citation: "Kosintsev, P., Mitchell, K. J., Devièse, T., et al. (2019). Evolution and extinction of the giant rhinoceros Elasmotherium sibiricum sheds light on late Quaternary megafaunal extinctions. Nature Ecology & Evolution, 3(1), 31-38.",
        url: 'https://doi.org/10.1038/s41559-018-0722-0'
      }
    ]),
    placeholder: false
  },
  {
    id: 5162,
    name: 'Nanaimoteuthis',
    scientificName: 'Nanaimoteuthis haggarti',
    nameMeaning: 'Nanaimo squid of Haggart',
    timePeriod: 'Late Cretaceous',
    epoch: 'Late Cretaceous (Santonian)',
    myaStart: 85.8,
    myaEnd: 83.6,
    diet: 'carnivore',
    dietDetails: 'Active pelagic predator and opportunistic detritivore feeding on crustaceans, small fish, and organic particles in deep marine shelf waters.',
    habitat: 'marine',
    clade: 'Invertebrate',
    geographicRange: JSON.stringify({
      continent: 'North America',
      region: 'Vancouver Island',
      country: 'Canada',
      fossilFormation: 'Haslam Formation (Nanaimo Group)'
    }),
    taxonomy: JSON.stringify({
      kingdom: 'Animalia',
      phylum: 'Mollusca',
      clade: 'Cephalopoda',
      order: 'Vampyromorpha',
      suborder: 'Coleoidea',
      family: 'Vampyroteuthidae',
      genus: 'Nanaimoteuthis',
      species: 'Nanaimoteuthis haggarti'
    }),
    taxonomicStatus: 'valid',
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Nanaimoteuthis_haggarti.png',
        type: 'art',
        credit: 'Connor Ashbridge (CC BY 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Nanaimoteuthis_haggarti.png'
      }
    ]),
    discoveryHistory: 'Discovered in Cretaceous marine strata of the Haslam Formation on Vancouver Island, British Columbia. Described based on exceptionally preserved chitinous lower beaks by Dirk Fuchs, James W. Haggart, and René Hoffmann.',
    interestingFacts: JSON.stringify([
      'An ancient Mesozoic relative of the enigmatic modern vampire squid (Vampyroteuthis infernalis), inhabiting the Pacific shelf seas during the Late Cretaceous.',
      'Identified from remarkably preserved calcified lower jaws (beaks) exhibiting specialized hadrocheliate anatomy adapted for biting through crustacean carapaces.',
      'Its generic name honors the Nanaimo Group geological sequence of British Columbia, while the species honors Geological Survey of Canada paleontologist James W. Haggart.',
      'Demonstrates that coleoid cephalopods with vampire squid affinities occupied varied ecological niches across the Pacific rim tens of millions of years before modern deep-sea specialists.'
    ]),
    sizeNotes: 'Estimated from fossilized chitinous beak measurements; mantle length ~25–40 cm, total length ~0.8 m.',
    sizeEstimate: JSON.stringify({
      length: { value: 0.8, unit: 'm', confidence: 'estimated' },
      height: { value: 0.2, unit: 'm', confidence: 'estimated' },
      weight: { value: 2.0, unit: 'kg', confidence: 'estimated' }
    }),
    sizeComparisonToHuman: true,
    silhouetteUuid: 'a6be7f5c-82bb-42b8-8b17-fb0b8b2d277d',
    silhouetteCredit: 'Kurtis Wothe and Giovanna Sainz',
    silhouetteLicense: 'CC0 1.0 Universal Public Domain Dedication',
    silhouetteTaxon: 'Vampyroteuthis infernalis (Vampyromorpha approximation)',
    silhouetteTier: 'generic approximation, not species-specific',
    extinctionEvent: 'K-Pg Extinction Event (66 MYA)',
    closestLivingRelatives: JSON.stringify(['Vampire Squid (Vampyroteuthis infernalis)', 'Octopuses (Octopoda)']),
    sources: JSON.stringify([
      {
        citation: "Fuchs, D., Haggart, J. W., & Hoffmann, R. (2019). Nanaimoteuthis haggarti, a new vampyromorph coleoid from the Upper Cretaceous Haslam Formation of British Columbia, Canada. Cretaceous Research, 93, 303-310.",
        url: 'https://doi.org/10.1016/j.cretres.2018.09.019'
      }
    ]),
    placeholder: false
  },
  {
    id: 5163,
    name: 'Lokiceratops',
    scientificName: 'Lokiceratops rangiformis',
    nameMeaning: 'Loki\'s horned face, caribou-shaped',
    timePeriod: 'Late Cretaceous',
    epoch: 'Late Cretaceous (Campanian)',
    myaStart: 78.5,
    myaEnd: 77.5,
    diet: 'herbivore',
    dietDetails: 'Herbivorous browser equipped with robust ceratopsid shearing dental batteries designed for slicing through fibrous cycads, palms, and woody angiosperms.',
    habitat: 'terrestrial',
    clade: 'Ornithischian',
    geographicRange: JSON.stringify({
      continent: 'North America',
      region: 'Kennedy Coulee, Northern Montana',
      country: 'United States',
      fossilFormation: 'Judith River Formation'
    }),
    taxonomy: JSON.stringify({
      kingdom: 'Animalia',
      phylum: 'Chordata',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ceratopsia',
      family: 'Ceratopsidae',
      genus: 'Lokiceratops',
      species: 'Lokiceratops rangiformis'
    }),
    taxonomicStatus: 'valid',
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Lokiceratops_TD.png',
        type: 'art',
        credit: 'TotalDino (CC BY 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lokiceratops_TD.png'
      }
    ]),
    discoveryHistory: 'Discovered in 2019 in the Judith River Formation near the US-Canada border in northern Montana. Formally described in June 2024 by Mark A. Loewen, Joseph J.W. Sertich, and colleagues in the journal PeerJ.',
    interestingFacts: JSON.stringify([
      'Described in 2024, Lokiceratops ranks among the largest centrosaurine ceratopsids ever discovered, stretching 6.7 meters (22 feet) long and weighing 5 tonnes with a skull over 2 meters in length.',
      'Named after the Norse god Loki because of its massive, curving, blade-shaped frill horns that resemble Loki’s mythological bladed horned headgear.',
      'Entirely lacked a nasal horn—a very unusual feature for centrosaurines—replacing it with the largest pair of curving epiparietal frill horns ever documented on a ceratopsian.',
      'Coexisted simultaneously alongside four other distinct horned dinosaur species within the same river basin, demonstrating high regional endemism and ecological niche partitioning in Laramidia.'
    ]),
    sizeNotes: 'Based on holotype EMK 0012, an exceptionally preserved subadult/adult skull and postcrania.',
    sizeEstimate: JSON.stringify({
      length: { value: 6.7, unit: 'm', confidence: 'well-supported' },
      height: { value: 2.1, unit: 'm', confidence: 'well-supported' },
      weight: { value: 5000, unit: 'kg', confidence: 'well-supported' }
    }),
    sizeComparisonToHuman: true,
    silhouetteUuid: '2ddf5f45-1077-43b5-8a70-0647262bdb24',
    silhouetteCredit: 'Mark Loewen',
    silhouetteLicense: 'Attribution 4.0 International (CC BY 4.0)',
    silhouetteTaxon: 'Lokiceratops rangiformis',
    silhouetteTier: 'species-specific',
    extinctionEvent: 'K-Pg Extinction Event (66 MYA)',
    closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)', 'Crocodilians (Crocodilia)']),
    sources: JSON.stringify([
      {
        citation: "Loewen, M. A., Sertich, J. J. W., Sampson, S., et al. (2024). Lokiceratops rangiformis gen. et sp. nov. (Ceratopsidae: Centrosaurinae) from the Campanian Judith River Formation of Montana reveals rapid turnover and high endemism in dinosaur communities. PeerJ, 12, e17224.",
        url: 'https://doi.org/10.7717/peerj.17224'
      }
    ]),
    placeholder: false
  },
  {
    id: 5164,
    name: 'Chasmosaurus',
    scientificName: 'Chasmosaurus belli',
    nameMeaning: 'Chasm lizard of Bell',
    timePeriod: 'Late Cretaceous',
    epoch: 'Late Cretaceous (Campanian)',
    myaStart: 76.5,
    myaEnd: 75.5,
    diet: 'herbivore',
    dietDetails: 'Herbivorous grazer and low-browser feeding on cycads, low-growing conifers, ferns, and flowering angiosperms.',
    habitat: 'terrestrial',
    clade: 'Ornithischian',
    geographicRange: JSON.stringify({
      continent: 'North America',
      region: 'Alberta Coastal Plain',
      country: 'Canada',
      fossilFormation: 'Dinosaur Park Formation'
    }),
    taxonomy: JSON.stringify({
      kingdom: 'Animalia',
      phylum: 'Chordata',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ceratopsia',
      family: 'Ceratopsidae',
      genus: 'Chasmosaurus',
      species: 'Chasmosaurus belli'
    }),
    taxonomicStatus: 'valid',
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Chasmosaurus_BW.jpg',
        type: 'art',
        credit: 'Nobu Tamura (CC BY 3.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Chasmosaurus_BW.jpg'
      }
    ]),
    discoveryHistory: 'First collected by Lawrence Lambe in 1898 along the Red Deer River in Alberta, Canada. Lambe described the species in 1902 and erected the genus Chasmosaurus in 1914.',
    interestingFacts: JSON.stringify([
      'The archetype genus of the Chasmosaurinae subfamily, distinguished by a massive, elongated, heart-shaped neck frill containing enormous open fenestrae ("chasms").',
      'Skin impressions preserved with several specimens revealed large, multi-faceted polygonal scales interspaced with raised circular rosettes along its flank.',
      'Possessed relatively short brow horns and a blunt nasal horn compared to later chasmosaurines like Triceratops and Torosaurus.',
      'Extensive fossil beds in Dinosaur Provincial Park demonstrate that Chasmosaurus herds traversed lush deltaic coastal floodplains bordered by the Western Interior Seaway.'
    ]),
    sizeNotes: 'Based on several complete skeletons including NHMUK R4948 and ROM 843.',
    sizeEstimate: JSON.stringify({
      length: { value: 4.9, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.8, unit: 'm', confidence: 'well-supported' },
      weight: { value: 1800, unit: 'kg', confidence: 'well-supported' }
    }),
    sizeComparisonToHuman: true,
    silhouetteUuid: '9738fe4f-f60b-4f76-a014-f0cf4478d368',
    silhouetteCredit: 'Matt Dempsey',
    silhouetteLicense: 'Attribution 4.0 International (CC BY 4.0)',
    silhouetteTaxon: 'Chasmosaurus belli',
    silhouetteTier: 'species-specific',
    extinctionEvent: 'K-Pg Extinction Event (66 MYA)',
    closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)', 'Crocodilians (Crocodilia)']),
    sources: JSON.stringify([
      {
        citation: "Lambe, L. M. (1914). On Gryposaurus notabilis, a new genus and species of trachodont dinosaur from the Belly River Formation of Alberta, with a description of the skull of Chasmosaurus belli. The Ottawa Naturalist, 27, 145-155.",
        url: 'https://www.biodiversitylibrary.org/page/37021151'
      },
      {
        citation: "Currie, P. J., Holmes, R. B., Ryan, M. J., & Coy, C. (2016). A juvenile chasmosaurine ceratopsid from the Dinosaur Park Formation, Alberta, Canada. Journal of Vertebrate Paleontology, 36(2), e1048348.",
        url: 'https://doi.org/10.1080/02724634.2015.1048348'
      }
    ]),
    placeholder: false
  },
  {
    id: 5165,
    name: 'Kosmoceratops',
    scientificName: 'Kosmoceratops richardsoni',
    nameMeaning: 'Ornate horned face of Richardson',
    timePeriod: 'Late Cretaceous',
    epoch: 'Late Cretaceous (Late Campanian)',
    myaStart: 76.4,
    myaEnd: 75.5,
    diet: 'herbivore',
    dietDetails: 'Herbivorous selective browser cropping tough terrestrial plants, cycads, flowering shrubs, and ferns in coastal wetland lowlands.',
    habitat: 'terrestrial',
    clade: 'Ornithischian',
    geographicRange: JSON.stringify({
      continent: 'North America',
      region: 'Grand Staircase-Escalante National Monument, Utah',
      country: 'United States',
      fossilFormation: 'Kaiparowits Formation'
    }),
    taxonomy: JSON.stringify({
      kingdom: 'Animalia',
      phylum: 'Chordata',
      clade: 'Dinosauria',
      order: 'Ornithischia',
      suborder: 'Ceratopsia',
      family: 'Ceratopsidae',
      genus: 'Kosmoceratops',
      species: 'Kosmoceratops richardsoni'
    }),
    taxonomicStatus: 'valid',
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/KOSMOCERATOPS2.jpg',
        type: 'art',
        credit: 'Luca Mendieta (CC BY-SA 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:KOSMOCERATOPS2.jpg'
      }
    ]),
    discoveryHistory: 'Discovered in 2006 by volunteer Scott Richardson in the Kaiparowits Formation of Utah. Described in 2010 by Scott D. Sampson, Mark A. Loewen, Andrew A. Farke, and colleagues in PLoS ONE based on holotype UMNH VP 17000.',
    interestingFacts: JSON.stringify([
      'The most decorated and ornate ceratopsian dinosaur ever discovered, bearing a total of 15 well-developed individual horns and horn-like processes across its skull—more cranial weaponry and display structures than any other known dinosaur.',
      'Its 15 cranial horns break down into: 1 blade-like nasal horn above the snout, 2 slender pointed brow (postorbital) horns curving outward and forward over the eyes, 2 laterally projecting jugal (cheek) horns, and exactly 10 distinct epioccipital and epiparietal horns ringing the top margin of its parietal frill.',
      'The 10 frill horns curve dramatically forward and downward over the forehead like an elaborate decorative fringe of bangs, an anatomical orientation that was useless for physical combat but perfectly optimized for visual intraspecific socio-sexual signaling.',
      'Lived on the isolated, greenhouse-warmed southern landmass of Laramidia, proving that ceratopsid dinosaurs underwent explosive evolutionary diversification and provincial endemism separated by paleogeographic barriers.'
    ]),
    sizeNotes: 'Based on holotype UMNH VP 17000 (nearly complete adult skull) and referred specimens.',
    sizeEstimate: JSON.stringify({
      length: { value: 4.6, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.8, unit: 'm', confidence: 'well-supported' },
      weight: { value: 1500, unit: 'kg', confidence: 'well-supported' }
    }),
    sizeComparisonToHuman: true,
    silhouetteUuid: 'd0df60c7-4fd3-418e-9521-00a8296a8a14',
    silhouetteCredit: 'Scott D. Sampson, Mark A. Loewen, Andrew A. Farke, Eric M. Roberts, Catherine A. Forster, Joshua A. Smith, Alan L. Titus',
    silhouetteLicense: 'Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)',
    silhouetteTaxon: 'Kosmoceratops richardsoni',
    silhouetteTier: 'species-specific',
    extinctionEvent: 'K-Pg Extinction Event (66 MYA)',
    closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)', 'Crocodilians (Crocodilia)']),
    sources: JSON.stringify([
      {
        citation: "Sampson, S. D., Loewen, M. A., Farke, A. A., Roberts, E. M., Forster, C. A., Smith, J. A., & Titus, A. L. (2010). New horned dinosaurs from Utah provide evidence for intracontinental dinosaur endemism. PLoS ONE, 5(9), e12292.",
        url: 'https://doi.org/10.1371/journal.pone.0012292'
      }
    ]),
    placeholder: false
  },
  {
    id: 5166,
    name: 'Dryptosaurus',
    scientificName: 'Dryptosaurus aquilunguis',
    nameMeaning: 'Tearing lizard with eagle talons',
    timePeriod: 'Late Cretaceous',
    epoch: 'Late Cretaceous (Late Maastrichtian)',
    myaStart: 67.0,
    myaEnd: 66.0,
    diet: 'carnivore',
    dietDetails: 'Apex carnivorous predator preying on hadrosauroids (such as Hadrosaurus foulkii), nodosaurs, and small vertebrates of the Appalachian island continent.',
    habitat: 'terrestrial',
    clade: 'Theropod',
    geographicRange: JSON.stringify({
      continent: 'North America',
      region: 'Appalachian Landmass',
      country: 'United States (New Jersey)',
      fossilFormation: 'Hornerstown / New Egypt Formation'
    }),
    taxonomy: JSON.stringify({
      kingdom: 'Animalia',
      phylum: 'Chordata',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Theropoda',
      family: 'Dryptosauridae',
      genus: 'Dryptosaurus',
      species: 'Dryptosaurus aquilunguis'
    }),
    taxonomicStatus: 'valid',
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Dryptosaurus_aquilunguis.png',
        type: 'art',
        credit: 'Connor Ashbridge (CC BY 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dryptosaurus_aquilunguis.png'
      }
    ]),
    discoveryHistory: 'Unearthed in 1866 by marl quarry workers in Mantua Township, New Jersey. Described by Edward Drinker Cope as "Laelaps", but renamed Dryptosaurus in 1877 by Othniel Charles Marsh because the name was preoccupied by a genus of mite.',
    interestingFacts: JSON.stringify([
      'The apex predator of Appalachia—the isolated eastern North American landmass separated from Laramidia by the Western Interior Seaway during the Late Cretaceous.',
      'Possessed enormous, laterally compressed 8-inch curved raptorial hand claws resembling eagle talons (giving rise to its species name aquilunguis), unlike the stunted arms of Tyrannosaurus rex.',
      'Immortalized in 1897 by paleoartist Charles R. Knight in his legendary watercolor painting "Leaping Laelaps", which was the first artistic depiction to show dinosaurs as dynamic, athletic, warm-blooded animals.',
      'Phylogenetic analyses demonstrate Dryptosaurus is a primitive tyrannosauroid that evolved independently in geographical isolation on Appalachia until the terminal K-Pg extinction event.'
    ]),
    sizeNotes: 'Based on holotype ANSP 9995; estimated adult length ~7.5 meters (25 feet).',
    sizeEstimate: JSON.stringify({
      length: { value: 7.5, unit: 'm', confidence: 'well-supported' },
      height: { value: 2.1, unit: 'm', confidence: 'well-supported' },
      weight: { value: 1500, unit: 'kg', confidence: 'estimated' }
    }),
    sizeComparisonToHuman: true,
    silhouetteUuid: '18bcbf41-94d9-4fac-bccb-da7c710c9275',
    silhouetteCredit: 'Tasman Dixon',
    silhouetteLicense: 'CC0 1.0 Universal Public Domain Dedication',
    silhouetteTaxon: 'Dryptosaurus aquilunguis',
    silhouetteTier: 'species-specific',
    extinctionEvent: 'K-Pg Extinction Event (66 MYA)',
    closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)']),
    sources: JSON.stringify([
      {
        citation: "Cope, E. D. (1866). On the remains of a gigantic extinct dinosaur, from the Cretaceous Green Sand of New Jersey. Proceedings of the Academy of Natural Sciences of Philadelphia, 18, 275-279.",
        url: 'https://www.biodiversitylibrary.org/page/26298547'
      },
      {
        citation: "Brusatte, S. L., Benson, R. B., & Norell, M. A. (2011). The anatomy and systematics of Dryptosaurus aquilunguis (Dinosauria: Theropoda)—a tyrannosauroid from the Cretaceous of North America. American Museum Novitates, 3717, 1-65.",
        url: 'https://doi.org/10.1206/3717.2'
      }
    ]),
    placeholder: false
  }
];

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('INGESTING BATCH: 11 NEW SPECIES (5156..5166) & UPDATING 6 EXISTING SPECIES');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // Step 1: Upload PhyloPic Vector SVGs to Supabase Storage
  console.log('Step 1: Uploading PhyloPic silhouettes to Supabase Storage...');
  const silhouetteMap = new Map();
  for (const sp of NEW_SPECIES) {
    const svgUrl = `https://images.phylopic.org/images/${sp.silhouetteUuid}/vector.svg`;
    console.log(`Downloading vector SVG for ${sp.name} (${sp.silhouetteUuid})...`);
    const svgRes = await fetch(svgUrl);
    if (!svgRes.ok) {
      throw new Error(`Failed to download vector SVG from ${svgUrl} (status ${svgRes.status})`);
    }
    const svgBuf = Buffer.from(await svgRes.arrayBuffer());
    const fileName = `${sp.silhouetteUuid}.svg`;
    const publicUrl = await uploadToSupabase(fileName, svgBuf, 'image/svg+xml');
    console.log(`  -> Supabase asset live: ${publicUrl}`);

    const payload = JSON.stringify({
      url: publicUrl,
      sourceUrl: `https://www.phylopic.org/images/${sp.silhouetteUuid}`,
      license: sp.silhouetteLicense,
      credit: sp.silhouetteCredit,
      taxon: sp.silhouetteTaxon,
      taxonMatch: sp.silhouetteTier
    });
    silhouetteMap.set(sp.id, payload);
  }
  console.log('All 11 silhouettes uploaded successfully.\n');

  // Step 2: Update the 6 existing species
  console.log('Step 2: Updating main paleoart media for 6 existing species...');
  for (const upd of EXISTING_UPDATES) {
    const existing = await prisma.species.findUnique({ where: { id: upd.id } });
    if (!existing) {
      throw new Error(`Target species #${upd.id} (${upd.name}) not found in database!`);
    }
    const newMedia = upd.getNewMedia(existing.media);
    await prisma.species.update({
      where: { id: upd.id },
      data: { media: newMedia }
    });
    console.log(`  [UPDATED #${upd.id}] ${upd.name} (${upd.scientificName})`);
  }
  console.log('6 existing species updated.\n');

  // Step 3: Ingest or upsert 11 new species
  console.log('Step 3: Upserting 11 new species records into database...');
  for (const sp of NEW_SPECIES) {
    const silhouettePayload = silhouetteMap.get(sp.id);
    const { silhouetteUuid, silhouetteCredit, silhouetteLicense, silhouetteTaxon, silhouetteTier, ...dbFields } = sp;

    const upserted = await prisma.species.upsert({
      where: { id: sp.id },
      update: {
        ...dbFields,
        comparisonSilhouette: silhouettePayload
      },
      create: {
        ...dbFields,
        comparisonSilhouette: silhouettePayload
      }
    });
    console.log(`  [UPSERTED #${upserted.id}] ${upserted.name} (${upserted.scientificName})`);
  }
  console.log('All 11 new species successfully saved to database.\n');

  const totalCount = await prisma.species.count();
  console.log(`✅ Total species count in database: ${totalCount} (expected 540).`);
}

main().finally(() => prisma.$disconnect());
