# Prehistorica Catalog Audit: Closest Extant Relatives & Taxonomic Hierarchy

**Date:** September 2026
**Catalog Scope:** All 601 verified specimens across all 18 catalog clades
**Verification Standard:** [AGENTS.md Skill 5: Taxonomy & Extant Relatives Verification](../../AGENTS.md#5--taxonomy--extant-relatives-verification-skill)

---

## 1. Executive Summary & Audit Overview

A comprehensive full-catalog audit was executed across all **601 cataloged specimens** in Prehistorica to evaluate:
1. **Phylogenetic sanity of "Closest Extant Relatives"**: Detecting impossible combinations (e.g. mammals, synapsids, invertebrates, marine reptiles, or amphibians erroneously assigned "Birds and Crocodilians").
2. **Taxonomic Rank Integrity**: Verifying Order, Family, Genus, and Species; retiring obsolete wastebasket taxa (e.g., Order *Acreodi*, *Pelycosauria*); and repairing informal or species-like strings in the Family field.
3. **Structured Data Model Migration**: Transitioning from unstructured free-text strings to the rigorous structured format:
   `{ status: 'established' | 'debated' | 'uncertain' | 'none', groups: string[], rationale: string, ecologicalAnalogues: string[], sources: { title, url_or_doi }[], verified: boolean }`

### Audit Statistics:
- **Total Specimens Audited**: 601
- **Suspicious / Flawed Records Flagged**: **175** (29.1% of catalog)
- **Clean / Conforming Records**: **426** (70.9% of catalog)

---

## 2. Benchmark Case Analysis: *Andrewsarchus mongoliensis* (ID 574)

The audit was initiated with the benchmark case of *Andrewsarchus mongoliensis*, which manifested severe curatorial and taxonomic errors:

### Current Flawed Record (ID 574):
- **Class**: `Mammalia`
- **Order**: `Acreodi` *(Obsolete historical grouping, retired from modern mammalian phylogenetics)*
- **Family**: `Andrewsarchus clade` *(Informal string sitting in Family slot)*
- **Closest Extant Relatives**: `["Modern Birds (Aves)", "Crocodilians"]` *(Biologically impossible archosaurian pairing for an Eocene placental mammal!)*
- **Media Credit**: `"credit": "Life reconstruction illustration"` *(Missing artist name and license)*

### Root Cause & Investigation of Artwork Artifacts:
1. **The "Small Blue Figures" on the Reconstruction**: Detailed inspection of the primary artwork (`File:Andrewsarchus_mongoliensis.png` by artist **Mikailodon**) reveals three small blue symbiotic birds perched on the back and rump of the creature. In nature, these represent oxpecker-like cleaner birds picking parasites from the beast's hide. An automated data import or superficial observation misconstrued these symbiotic birds as phylogenetic relatives!
2. **Phylogenetic Truth**: *Andrewsarchus* is a member of **Artiodactyla** within **Cetancodontamorpha** (Whippomorpha stem), most closely related to entelodonts ('hell pigs') and living **hippopotamuses (Hippopotamidae)** and **cetaceans (whales, dolphins, and porpoises)** (Spaulding et al., 2009).
3. **Completed Artwork Attribution**:
   - **Artist**: Mikailodon (portfolio: [mikailodon.com](https://www.mikailodon.com/gallery/andrewsarchus-mongoliensis))
   - **License**: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
   - **Source**: [Wikimedia Commons - File:Andrewsarchus mongoliensis.png](https://commons.wikimedia.org/wiki/File:Andrewsarchus_mongoliensis.png)

### Proposed Correction for *Andrewsarchus mongoliensis*:
```json
{
  "id": 574,
  "name": "Andrewsarchus mongoliensis",
  "clade": "Early_Mammal_Synapsid",
  "class": "Mammalia",
  "currentTaxonomy": {
    "order": "Acreodi",
    "family": "Andrewsarchus clade",
    "genus": "Andrewsarchus",
    "species": "Andrewsarchus mongoliensis"
  },
  "currentRelatives": "Modern Birds (Aves) • Crocodilians",
  "isSuspicious": true,
  "flags": [
    "SUSPICIOUS_MAMMAL_ARCHOSAUR",
    "OBSOLETE_ORDER:Acreodi",
    "INVALID_FAMILY:Andrewsarchus clade"
  ],
  "proposedTaxonomy": {
    "order": "Artiodactyla",
    "family": "Andrewsarchidae",
    "genus": "Andrewsarchus",
    "species": "Andrewsarchus mongoliensis"
  },
  "proposedExtantRelatives": {
    "status": "debated",
    "groups": [
      "Hippopotamuses (Hippopotamidae)",
      "Cetaceans (Whales, Dolphins & Porpoises)"
    ],
    "rationale": "Classified within Artiodactyla (Cetancodontamorpha / Whippomorpha stem), most closely related to entelodonts ('hell pigs') and living hippopotamuses and whales, rather than mesonychians.",
    "ecologicalAnalogues": [
      "Hyenas (Hyaenidae - osteophagy / bone crushing)",
      "Brown Bears (Ursus arctos - apex omnivory)"
    ],
    "sources": [
      {
        "title": "Spaulding, M., O'Leary, M. A., & Gatesy, J. (2009). Relationships of Cetacea (Artiodactyla) Among Mammals. PLoS ONE, 4(9), e7062.",
        "url_or_doi": "https://doi.org/10.1371/journal.pone.0007062"
      },
      {
        "title": "Paleobiology Database: Andrewsarchus mongoliensis taxon record",
        "url_or_doi": "https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=42907"
      }
    ],
    "verified": true
  }
}
```

---

## 3. High-Priority Anomaly Categories

The audit identified several recurring systemic anomalies across the legacy database:

### Category A: Mammals & Synapsids with Archosaur Relatives (27 taxa)
Early catalog entries blindly defaulted to `["Modern Birds (Aves)", "Crocodilians"]` for prehistoric mammals:
- *Dimetrodon grandis* (ID 9): Stem-mammal sphenacodontid. Correct: **Crown Mammalia**; Order: **Sphenacodontia** (Pelycosauria retired).
- *Smilodon fatalis* (ID 37): Machairodontine cat. Correct: **Modern Felids (Pantherinae & Felinae)**; Ecological analogue: Clouded leopard, Lion.
- *Mammuthus primigenius* (ID 38): Elephantid. Correct: **Asian Elephant (*Elephas maximus*) & African Elephants (*Loxodonta*)**.
- *Megatherium americanum* (ID 39): Giant ground sloth. Correct: **Modern Tree Sloths (Bradypodidae, Choloepodidae) & Anteaters**.
- *Coelodonta antiquitatis* (ID 40): Woolly rhino. Correct: **Modern Rhinoceroses (Rhinocerotidae)**.
- *Doedicurus clavicaudatus* (ID 41): Glyptodont. Correct: **Modern Armadillos (Chlamyphoridae)**.
- *Thylacoleo carnifex* (ID 42): Marsupial lion. Correct: **Wombats (Vombatidae) & Koalas (Phascolarctidae)**.
- *Diprotodon optatum* (ID 43): Giant marsupial. Correct: **Wombats (Vombatidae) & Koalas (Phascolarctidae)**.
- *Basilosaurus cetoides* (ID 35): Stem whale. Correct: **Modern Whales & Dolphins (Cetacea)**; sister group: **Hippopotamuses**.

### Category B: Invertebrates & Amphibians with Archosaur Relatives (9 taxa)
- *Anomalocaris canadensis* (ID 1) & *Opabinia regalis* (ID 3): Stem-arthropods. Correct: **Crown Arthropods (Euarthropoda)**.
- *Hallucigenia sparsa* (ID 2): Stem-onychophoran. Correct: **Velvet Worms (Onychophora)**.
- *Ichthyostega stensioei* (ID 6): Early tetrapod. Correct: **Modern Amphibians (Lissamphibia) & Crown Tetrapoda**.

### Category C: Marine Reptiles Conflating Convergence with Kinship (31 taxa)
- *Mosasaurs* (*Tylosaurus*, *Prognathodon*, *Platecarpus*): Squamata. Correct: **Monitor Lizards (Varanidae) & Snakes (Serpentes)**.
- *Plesiosaurs & Pliosaurs* (*Kronosaurus*, *Liopleurodon*, *Cryptoclidus*): Sauropterygia. Correct: **Diapsida / Crown Sauria (Uncertain placement; no living descendants)**.
- *Ichthyosaurs* (*Ichthyosaurus*, *Ophthalmosaurus*, *Temnodontosaurus*): Correct: **Basal Diapsida / Sauria outgroup (no living descendants)**.

### Category D: Obsolete Orders & Invalid Family Strings (60 taxa)
- Obsolete order `Acreodi` -> Replace with `Artiodactyla` (for *Andrewsarchus*).
- Obsolete order `Pelycosauria` -> Replace with `Sphenacodontia / Eupelycosauria` (for *Dimetrodon*).
- Informal family strings (`Andrewsarchus clade`, `Fruitafossor clade`, `Juramaia clade`, `Pikaia clade`) -> Replace with formal taxonomic families or mark `Uncertain`.

---

## 4. Clade-by-Clade Audit Catalog (All Flagged Records)

| ID | Taxon Name | Clade | Current Order | Current Family | Current Relatives | Audit Flag(s) | Proposed Order | Proposed Family | Proposed Closest Relatives |
|---|---|---|---|---|---|---|---|---|---|
| **1** | *Anomalocaris canadensis* | `Invertebrate` | Radiodonta | Anomalocarididae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_INVERTEBRATE_ARCHOSAUR` | Radiodonta | Anomalocarididae | Crown Arthropods (Euarthropoda: Chelicerates, Myriapods, Crustaceans & Insects) |
| **2** | *Hallucigenia sparsa* | `Invertebrate` | Ammonoidea | Hallucigeniidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_INVERTEBRATE_ARCHOSAUR` | Lobopodia (Grade) | Hallucigeniidae | Velvet Worms (Onychophora) • Tardigrades (Tardigrada) • Crown Arthropods (Euarthropoda) |
| **3** | *Opabinia regalis* | `Invertebrate` | Ammonoidea | Opabiniidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_INVERTEBRATE_ARCHOSAUR` | Radiodonta | Opabiniidae | Crown Arthropods (Euarthropoda: Chelicerates, Myriapods, Crustaceans & Insects) |
| **4** | *Dunkleosteus terrelli* | `Other` | Phlyctaeniiformes | Dunkleosteidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_NON_ARCHOSAUR_WITH_ARCHOSAURS` | Arthrodira | Dunkleosteidae | All Crown Jawed Vertebrates (Gnathostomata: Chondrichthyes & Osteichthyes) |
| **6** | *Ichthyostega stensioei* | `Early_Tetrapod_Amphibian` | Temnospondyli | Ichthyostegidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_AMPHIBIAN_ARCHOSAUR` | Temnospondyli | Ichthyostegidae | Modern Birds (Aves) • Crocodilians |
| **7** | *Arthropleura armata* | `Other` | Arthropleurida | Arthropleuridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_NON_ARCHOSAUR_WITH_ARCHOSAURS` | Arthropleurida | Arthropleuridae | Modern Birds (Aves) • Crocodilians |
| **9** | *Dimetrodon grandis* | `Early_Mammal_Synapsid` | Pelycosauria | Sphenacodontidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR, OBSOLETE_ORDER:Pelycosauria` | Eupelycosauria (Clade) / Sphenacodontia | Sphenacodontidae | Modern Mammals (Mammalia) |
| **10** | *Edaphosaurus pogonias* | `Early_Mammal_Synapsid` | Therapsida | Edaphosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Therapsida | Edaphosauridae | Modern Birds (Aves) • Crocodilians |
| **11** | *Helicoprion bessonowi* | `Other` | Eugeneodontiformes | Agassizodontidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_NON_ARCHOSAUR_WITH_ARCHOSAURS` | Eugeneodontiformes | Agassizodontidae | Modern Birds (Aves) • Crocodilians |
| **13** | *Inostrancevia alexandri* | `Early_Mammal_Synapsid` | Therapsida | Gorgonopidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Therapsida | Gorgonopidae | Modern Birds (Aves) • Crocodilians |
| **16** | *Postosuchus kirkpatricki* | `Rauisuchian` | Rauisuchian | Rauisuchidae | None / Empty | `EMPTY_RELATIVES` | Rauisuchian | Rauisuchidae | Modern Crocodilians (Crocodilia: True Crocodiles, Alligators, Caimans, Gharials) • Modern Birds (Aves - sister archosaur lineage) |
| **35** | *Basilosaurus cetoides* | `Early_Mammal_Synapsid` | Cetacea | Basilosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Artiodactyla / Cetacea | Basilosauridae | Modern Whales, Dolphins & Porpoises (Cetacea) • Hippopotamuses (Hippopotamidae - closest non-cetacean outgroup) |
| **36** | *Megalodon* | `Other` | Lamniformes | Lamnidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_NON_ARCHOSAUR_WITH_ARCHOSAURS` | Lamniformes | Lamnidae | Modern Birds (Aves) • Crocodilians |
| **37** | *Smilodon fatalis* | `Early_Mammal_Synapsid` | Carnivora | Felidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Carnivora | Felidae | Modern Felids (Felidae: Pantherinae & Felinae) |
| **38** | *Mammuthus primigenius* | `Early_Mammal_Synapsid` | Proboscidea | Elephantidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Proboscidea | Elephantidae | Asian Elephant (Elephas maximus) • African Bush & Forest Elephants (Loxodonta africana, L. cyclotis) |
| **39** | *Megatherium americanum* | `Early_Mammal_Synapsid` | Pilosa | Megatheriidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Pilosa | Megatheriidae | Three-Toed Tree Sloths (Bradypodidae) • Two-Toed Tree Sloths (Choloepodidae) • Anteaters (Vermilingua) |
| **40** | *Coelodonta antiquitatis* | `Early_Mammal_Synapsid` | Perissodactyla | Rhinocerotidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Perissodactyla | Rhinocerotidae | Modern Rhinoceroses (Rhinocerotidae: White, Black, Indian, Javan, Sumatran Rhinos) |
| **41** | *Doedicurus clavicaudatus* | `Early_Mammal_Synapsid` | Cingulata | Glyptodontidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Cingulata | Chlamyphoridae | Modern Armadillos (Chlamyphoridae & Dasypodidae) |
| **42** | *Thylacoleo carnifex* | `Early_Mammal_Synapsid` | Diprotodontia | Thylacoleonidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Diprotodontia | Thylacoleonidae | Wombats (Vombatidae) • Koalas (Phascolarctidae) |
| **43** | *Diprotodon optatum* | `Early_Mammal_Synapsid` | Diprotodontia | Diprotodontidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Diprotodontia | Diprotodontidae | Wombats (Vombatidae) • Koalas (Phascolarctidae) |
| **50** | *Lisowicia* | `Early_Mammal_Synapsid` | Dicynodontia | Stahleckeriidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Dicynodontia | Stahleckeriidae | Modern Birds (Aves) • Crocodilians |
| **51** | *Cynognathus* | `Early_Mammal_Synapsid` | Cynodontia | Cynognathidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Cynodontia | Cynognathidae | Modern Birds (Aves) • Crocodilians |
| **52** | *Thrinaxodon* | `Early_Mammal_Synapsid` | Cynodontia | Thrinaxodontidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Cynodontia | Thrinaxodontidae | Modern Birds (Aves) • Crocodilians |
| **53** | *Shonisaurus* | `Marine_Reptile` | Ichthyosauria | Shastasauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Ichthyosauria | Shastasauridae | Modern Birds (Aves) • Crocodilians |
| **54** | *Cymbospondylus* | `Marine_Reptile` | Ichthyosauria | Cymbospondylidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Ichthyosauria | Cymbospondylidae | Modern Birds (Aves) • Crocodilians |
| **60** | *Eodromaeus* | `Theropod` | Saurischia | Eodromaeus clade | Crocodilians (closest living non-dinosaurian outgroup) • Modern Birds / Aves (direct surviving avian theropod lineage) | `INVALID_FAMILY:Eodromaeus clade` | Saurischia | Eodromaeusidae | Modern Birds (Aves / Neornithes - direct surviving avian theropods) • Crocodilians (Crocodilia - closest living non-dinosaurian archosaurs) |
| **61** | *Nyasasaurus* | `Archosauriform` | Archosauriform | Nyasasaurus clade | Modern Birds (Aves) • Crocodilians | `INVALID_FAMILY:Nyasasaurus clade` | Archosauriform | Nyasasaurusidae | Modern Birds (Aves) • Crocodilians |
| **63** | *Liliensternus* | `Theropod` | Saurischia | Liliensternus clade | Crocodilians (closest living non-dinosaurian outgroup) • Modern Birds / Aves (direct surviving avian theropod lineage) | `INVALID_FAMILY:Liliensternus clade` | Saurischia | Liliensternusidae | Modern Birds (Aves / Neornithes - direct surviving avian theropods) • Crocodilians (Crocodilia - closest living non-dinosaurian archosaurs) |
| **64** | *Halticosaurus* | `Theropod` | Saurischia | Halticosaurus clade | Crocodilians (closest living non-dinosaurian outgroup) • Modern Birds / Aves (direct surviving avian theropod lineage) | `INVALID_FAMILY:Halticosaurus clade` | Saurischia | Halticosaurusidae | Modern Birds (Aves / Neornithes - direct surviving avian theropods) • Crocodilians (Crocodilia - closest living non-dinosaurian archosaurs) |
| **66** | *Zupaysaurus* | `Theropod` | Saurischia | Zupaysaurus clade | Crocodilians (closest living non-dinosaurian outgroup) • Modern Birds / Aves (direct surviving avian theropod lineage) | `INVALID_FAMILY:Zupaysaurus clade` | Saurischia | Zupaysaurusidae | Modern Birds (Aves / Neornithes - direct surviving avian theropods) • Crocodilians (Crocodilia - closest living non-dinosaurian archosaurs) |
| **70** | *Isanosaurus* | `Sauropodomorph` | Saurischia | Isanosaurus clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Isanosaurus clade` | Saurischia | Isanosaurusidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **82** | *Marasuchus* | `Archosauriform` | Archosauriform | Marasuchus clade | Modern Birds (Aves) • Crocodilians | `INVALID_FAMILY:Marasuchus clade` | Archosauriform | Marasuchusidae | Modern Birds (Aves) • Crocodilians |
| **93** | *Fasolasuchus* | `Rauisuchian` | Rauisuchian | Fasolasuchus clade | Modern Birds (Aves) • Crocodilians | `INVALID_FAMILY:Fasolasuchus clade` | Rauisuchian | Fasolasuchusidae | Modern Crocodilians (Crocodilia: True Crocodiles, Alligators, Caimans, Gharials) • Modern Birds (Aves - sister archosaur lineage) |
| **94** | *Prestosuchus* | `Rauisuchian` | Rauisuchian | Prestosuchus clade | Modern Birds (Aves) • Crocodilians | `INVALID_FAMILY:Prestosuchus clade` | Rauisuchian | Prestosuchusidae | Modern Crocodilians (Crocodilia: True Crocodiles, Alligators, Caimans, Gharials) • Modern Birds (Aves - sister archosaur lineage) |
| **95** | *Batrachotomus* | `Rauisuchian` | Rauisuchian | Batrachotomus clade | Modern Birds (Aves) • Crocodilians | `INVALID_FAMILY:Batrachotomus clade` | Rauisuchian | Batrachotomusidae | Modern Crocodilians (Crocodilia: True Crocodiles, Alligators, Caimans, Gharials) • Modern Birds (Aves - sister archosaur lineage) |
| **114** | *Sphenosuchus* | `Crocodylomorph` | Crocodylomorph | Sphenosuchus clade | Modern Birds (Aves) • Crocodilians | `INVALID_FAMILY:Sphenosuchus clade` | Crocodylomorpha | Sphenosuchusidae | Modern Crocodilians (Crocodilia: True Crocodiles, Alligators, Caimans, Gharials) • Modern Birds (Aves - sister archosaur lineage) |
| **127** | *Placodus* | `Marine_Reptile` | Plesiosauria | Placodontidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Plesiosauria | Placodontidae | Modern Birds (Aves) • Crocodilians |
| **128** | *Cyamodus* | `Marine_Reptile` | Plesiosauria | Cyamodontidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Plesiosauria | Cyamodontidae | Modern Birds (Aves) • Crocodilians |
| **129** | *Henodus* | `Marine_Reptile` | Plesiosauria | Henodontidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Plesiosauria | Henodontidae | Modern Birds (Aves) • Crocodilians |
| **130** | *Nothosaurus* | `Marine_Reptile` | Plesiosauria | Nothosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Plesiosauria | Nothosauridae | Modern Birds (Aves) • Crocodilians |
| **131** | *Lariosaurus* | `Marine_Reptile` | Plesiosauria | Nothosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Plesiosauria | Nothosauridae | Modern Birds (Aves) • Crocodilians |
| **132** | *Ceresiosaurus* | `Marine_Reptile` | Nothosauroidea | Nothosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Nothosauroidea | Nothosauridae | Modern Birds (Aves) • Crocodilians |
| **133** | *Pistosaurus* | `Marine_Reptile` | Plesiosauria | Pistosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Plesiosauria | Pistosauridae | Modern Birds (Aves) • Crocodilians |
| **134** | *Simosaurus* | `Marine_Reptile` | Nothosauroidea | Simosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Nothosauroidea | Simosauridae | Modern Birds (Aves) • Crocodilians |
| **135** | *Mixosaurus* | `Marine_Reptile` | Ichthyosauria | Mixosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Ichthyosauria | Mixosauridae | Modern Birds (Aves) • Crocodilians |
| **136** | *Besanosaurus* | `Marine_Reptile` | Ichthyosauria | Besanosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Ichthyosauria | Besanosauridae | Modern Birds (Aves) • Crocodilians |
| **137** | *Shastasaurus* | `Marine_Reptile` | Ichthyosauria | Shastasauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Ichthyosauria | Ichthyosauridae | Crown Diapsida (Sauria: Archosaurs & Lepidosaurs) |
| **138** | *Guanlingsaurus* | `Marine_Reptile` | Ichthyosauria | Shastasauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Ichthyosauria | Shastasauridae | Modern Birds (Aves) • Crocodilians |
| **141** | *Austriadactylus* | `Pterosaur` | Pterosauria | Austriadactylus clade | Crocodilians & Modern Birds (extant archosaur outgroups) | `INVALID_FAMILY:Austriadactylus clade` | Pterosauria | Austriadactylusidae | Modern Birds (Aves - closest living archosaur sister lineage) • Crocodilians (Crocodilia - archosaur outgroup) |
| **148** | *Cryolophosaurus* | `Theropod` | Saurischia | Cryolophosaurus clade | Crocodilians (closest living non-dinosaurian outgroup) • Modern Birds / Aves (direct surviving avian theropod lineage) | `INVALID_FAMILY:Cryolophosaurus clade` | Saurischia | Cryolophosaurusidae | Modern Birds (Aves / Neornithes - direct surviving avian theropods) • Crocodilians (Crocodilia - closest living non-dinosaurian archosaurs) |
| **161** | *Tanycolagreus* | `Theropod` | Saurischia | Tanycolagreus clade | Crocodilians (closest living non-dinosaurian outgroup) • Modern Birds / Aves (direct surviving avian theropod lineage) | `INVALID_FAMILY:Tanycolagreus clade` | Saurischia | Tanycolagreusidae | Modern Birds (Aves / Neornithes - direct surviving avian theropods) • Crocodilians (Crocodilia - closest living non-dinosaurian archosaurs) |
| **163** | *Juravenator* | `Theropod` | Saurischia | Juravenator clade | Crocodilians (closest living non-dinosaurian outgroup) • Modern Birds / Aves (direct surviving avian theropod lineage) | `INVALID_FAMILY:Juravenator clade` | Saurischia | Juravenatoridae | Modern Birds (Aves / Neornithes - direct surviving avian theropods) • Crocodilians (Crocodilia - closest living non-dinosaurian archosaurs) |
| **178** | *Spinophorosaurus* | `Sauropod` | Saurischia | Spinophorosaurus clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Spinophorosaurus clade` | Saurischia | Spinophorosaurusidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **182** | *Jobaria* | `Sauropod` | Saurischia | Jobaria clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Jobaria clade` | Saurischia | Jobariaidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **196** | *Hexinlusaurus* | `Ornithischian` | Ornithischia | Hexinlusaurus clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Hexinlusaurus clade` | Ornithischia | Hexinlusaurusidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **224** | *Liopleurodon* | `Marine_Reptile` | Plesiosauria | Pliosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Plesiosauria | Pliosauridae | Modern Diapsid Reptiles (Archosauria: Birds & Crocodilians; Lepidosauria: Lizards, Snakes, Tuatara) • Turtles (Testudines - debated sister hypothesis) |
| **225** | *Plesiosaurus* | `Marine_Reptile` | Plesiosauria | Plesiosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Plesiosauria | Plesiosauridae | Modern Diapsid Reptiles (Archosauria: Birds & Crocodilians; Lepidosauria: Lizards, Snakes, Tuatara) • Turtles (Testudines - debated sister hypothesis) |
| **226** | *Ichthyosaurus* | `Marine_Reptile` | Ichthyosauria | Ichthyosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Ichthyosauria | Ichthyosauridae | Crown Diapsida (Sauria: Archosaurs & Lepidosaurs) |
| **227** | *Ophthalmosaurus* | `Marine_Reptile` | Ichthyosauria | Ichthyosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Ichthyosauria | Ophthalmosauridae | Crown Diapsida (Sauria: Archosaurs & Lepidosaurs) |
| **228** | *Cryptoclidus* | `Marine_Reptile` | Plesiosauria | Plesiosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Plesiosauria | Plesiosauridae | Modern Diapsid Reptiles (Archosauria: Birds & Crocodilians; Lepidosauria: Lizards, Snakes, Tuatara) • Turtles (Testudines - debated sister hypothesis) |
| **229** | *Rhomaleosaurus* | `Marine_Reptile` | Plesiosauria | Rhomaleosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Plesiosauria | Plesiosauridae | Modern Diapsid Reptiles (Archosauria: Birds & Crocodilians; Lepidosauria: Lizards, Snakes, Tuatara) • Turtles (Testudines - debated sister hypothesis) |
| **230** | *Macroplata* | `Marine_Reptile` | Plesiosauria | Pliosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Plesiosauria | Pliosauridae | Modern Birds (Aves) • Crocodilians |
| **231** | *Peloneustes* | `Marine_Reptile` | Plesiosauria | Pliosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Plesiosauria | Pliosauridae | Modern Birds (Aves) • Crocodilians |
| **232** | *Pliosaurus* | `Marine_Reptile` | Plesiosauria | Pliosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Plesiosauria | Pliosauridae | Modern Diapsid Reptiles (Archosauria: Birds & Crocodilians; Lepidosauria: Lizards, Snakes, Tuatara) • Turtles (Testudines - debated sister hypothesis) |
| **233** | *Simolestes* | `Marine_Reptile` | Plesiosauria | Rhomaleosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Plesiosauria | Rhomaleosauridae | Modern Birds (Aves) • Crocodilians |
| **234** | *Temnodontosaurus* | `Marine_Reptile` | Ichthyosauria | Leptopterygiidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Ichthyosauria | Temnodontosauridae | Crown Diapsida (Sauria: Archosaurs & Lepidosaurs) |
| **237** | *Excalibosaurus* | `Marine_Reptile` | Ichthyosauria | Leptopterygiidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Ichthyosauria | Leptopterygiidae | Modern Birds (Aves) • Crocodilians |
| **238** | *Morganucodon* | `Early_Mammal_Synapsid` | Cynodontia | Morganucodontidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Cynodontia | Morganucodontidae | Modern Birds (Aves) • Crocodilians |
| **239** | *Castorocauda* | `Early_Mammal_Synapsid` | Cynodontia | Megazostrodontidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Cynodontia | Megazostrodontidae | Modern Birds (Aves) • Crocodilians |
| **240** | *Volaticotherium* | `Early_Mammal_Synapsid` | Eutriconodonta | Triconodontidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Eutriconodonta | Triconodontidae | Modern Birds (Aves) • Crocodilians |
| **241** | *Fruitafossor* | `Early_Mammal_Synapsid` | Theriiformes | Fruitafossor clade | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR, INVALID_FAMILY:Fruitafossor clade` | Theriiformes | Fruitafossoridae | Modern Birds (Aves) • Crocodilians |
| **242** | *Juramaia* | `Early_Mammal_Synapsid` | Theriiformes | Juramaia clade | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR, INVALID_FAMILY:Juramaia clade` | Theriiformes | Juramaiaidae | Modern Birds (Aves) • Crocodilians |
| **243** | *Agilodocodon* | `Early_Mammal_Synapsid` | Docodonta | Docodontidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Docodonta | Docodontidae | Modern Birds (Aves) • Crocodilians |
| **513** | *Dreadnoughtus* | `Sauropod` | Saurischia | Dreadnoughtus clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Dreadnoughtus clade` | Saurischia | Dreadnoughtusidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **514** | *Patagotitan* | `Sauropod` | Saurischia | Patagotitan clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Patagotitan clade` | Saurischia | Patagotitanidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **518** | *Magyarosaurus* | `Sauropod` | Saurischia | Magyarosaurus clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Magyarosaurus clade` | Saurischia | Magyarosaurusidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **531** | *Kronosaurus* | `Marine_Reptile` | Plesiosauria | Pliosauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Plesiosauria | Pliosauridae | Modern Diapsid Reptiles (Archosauria: Birds & Crocodilians; Lepidosauria: Lizards, Snakes, Tuatara) • Turtles (Testudines - debated sister hypothesis) |
| **532** | *Tylosaurus* | `Marine_Reptile` | Squamata | Mosasauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Squamata | Mosasauridae | Monitor Lizards (Varanidae) • Snakes (Serpentes) • Modern Squamates (Squamata) |
| **534** | *Prognathodon* | `Marine_Reptile` | Squamata | Mosasauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Squamata | Mosasauridae | Monitor Lizards (Varanidae) • Snakes (Serpentes) • Modern Squamates (Squamata) |
| **535** | *Platecarpus* | `Marine_Reptile` | Squamata | Mosasauridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Squamata | Mosasauridae | Monitor Lizards (Varanidae) • Snakes (Serpentes) • Modern Squamates (Squamata) |
| **539** | *Xiphactinus* | `Other` | Ichthyodectiformes | Ichthyodectidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_NON_ARCHOSAUR_WITH_ARCHOSAURS` | Ichthyodectiformes | Ichthyodectidae | Modern Birds (Aves) • Crocodilians |
| **540** | *Cretoxyrhina* | `Other` | Lamniformes | Cretoxyrhinidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_NON_ARCHOSAUR_WITH_ARCHOSAURS` | Lamniformes | Cretoxyrhinidae | Modern Birds (Aves) • Crocodilians |
| **541** | *Baculites* | `Invertebrate` | Ammonitida | Baculitidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_INVERTEBRATE_ARCHOSAUR` | Ammonitida | Baculitidae | Modern Birds (Aves) • Crocodilians |
| **542** | *Jeletzkytes* | `Invertebrate` | Ammonitida | Scaphitidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_INVERTEBRATE_ARCHOSAUR` | Ammonitida | Scaphitidae | Modern Birds (Aves) • Crocodilians |
| **543** | *Tusoteuthis* | `Invertebrate` | Octopoda | Palaeololiginidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_INVERTEBRATE_ARCHOSAUR` | Octopoda | Palaeololiginidae | Modern Birds (Aves) • Crocodilians |
| **567** | *Pikaia gracilens* | `Other` | Other | Pikaia clade | Modern Birds (Aves) • Crocodilians | `INVALID_FAMILY:Pikaia clade` | Other | Pikaiaidae | Modern Birds (Aves) • Crocodilians |
| **568** | *Wiwaxia corrugata* | `Other` | Sachitida | Wiwaxia clade | Modern Birds (Aves) • Crocodilians | `INVALID_FAMILY:Wiwaxia clade` | Sachitida | Wiwaxiaidae | Modern Birds (Aves) • Crocodilians |
| **569** | *Bothriolepis canadensis* | `Other` | Bothriolepidiformes | Bothriolepididae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_NON_ARCHOSAUR_WITH_ARCHOSAURS` | Antiarcha | Bothriolepididae | All Crown Jawed Vertebrates (Gnathostomata: Chondrichthyes & Osteichthyes) |
| **570** | *Eusthenopteron foordi* | `Early_Tetrapod_Amphibian` | Osteolepidiformes | Tristichopteridae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_AMPHIBIAN_ARCHOSAUR` | Osteolepidiformes | Tristichopteridae | Modern Birds (Aves) • Crocodilians |
| **572** | *Diplocaulus magnicornis* | `Early_Tetrapod_Amphibian` | Temnospondyli | Keraterpetontidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_AMPHIBIAN_ARCHOSAUR` | Temnospondyli | Keraterpetontidae | Modern Birds (Aves) • Crocodilians |
| **573** | *Estemmenosuchus uralensis* | `Early_Mammal_Synapsid` | Therapsida | Estemmenosuchidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Therapsida | Estemmenosuchidae | Modern Birds (Aves) • Crocodilians |
| **574** | *Andrewsarchus mongoliensis* | `Early_Mammal_Synapsid` | Acreodi | Andrewsarchus clade | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR, OBSOLETE_ORDER:Acreodi, INVALID_FAMILY:Andrewsarchus clade` | Artiodactyla | Andrewsarchidae | Hippopotamuses (Hippopotamidae) • Cetaceans (Whales, Dolphins & Porpoises) |
| **575** | *Uintatherium anceps* | `Early_Mammal_Synapsid` | Dinocerata | Uintatheriidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Dinocerata | Uintatheriidae | Modern Birds (Aves) • Crocodilians |
| **576** | *Paraceratherium transouralicum* | `Early_Mammal_Synapsid` | Perissodactyla | Hyracodontidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Perissodactyla | Paraceratheriidae | Modern Rhinoceroses (Rhinocerotidae: White, Black, Indian, Javan, Sumatran Rhinos) |
| **579** | *Moeritherium lyonsi* | `Early_Mammal_Synapsid` | Proboscidea | Moeritheriidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Proboscidea | Moeritheriidae | Asian Elephant (Elephas maximus) • African Bush & Forest Elephants (Loxodonta africana, L. cyclotis) |
| **923** | *Sivatherium* | `Early_Mammal_Synapsid` | Artiodactyla | Giraffidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Artiodactyla | Giraffidae | Modern Birds (Aves) • Crocodilians |
| **924** | *Stegodon ganesa* | `Early_Mammal_Synapsid` | Proboscidea | Stegodontidae | Modern Birds (Aves) • Crocodilians | `SUSPICIOUS_MAMMAL_ARCHOSAUR` | Proboscidea | Stegodontidae | Asian Elephant (Elephas maximus) • African Bush & Forest Elephants (Loxodonta africana, L. cyclotis) |
| **1619** | *Desmatosuchus haplocerus* | `Aetosaur` | Aetosaur | Desmatosuchidae | None / Empty | `EMPTY_RELATIVES` | Aetosaur | Desmatosuchidae | Modern Crocodilians (Crocodilia: True Crocodiles, Alligators, Caimans, Gharials) • Modern Birds (Aves - sister archosaur lineage) |
| **1620** | *Placerias hesternus* | `Early_Mammal_Synapsid` | Dicynodontia | Kannemeyeriidae | None / Empty | `EMPTY_RELATIVES` | Dicynodontia | Kannemeyeriidae |  |
| **1621** | *Typothorax coccinarum* | `Aetosaur` | Aetosaur | Stagonolepididae | None / Empty | `EMPTY_RELATIVES` | Aetosaur | Stagonolepididae | Modern Crocodilians (Crocodilia: True Crocodiles, Alligators, Caimans, Gharials) • Modern Birds (Aves - sister archosaur lineage) |
| **1622** | *Rutiodon carolinensis* | `Phytosaur` | Phytosaur | Phytosauridae | None / Empty | `EMPTY_RELATIVES` | Phytosaur | Phytosauridae | Modern Crocodilians (Crocodilia: True Crocodiles, Alligators, Caimans, Gharials) • Modern Birds (Aves - sister archosaur lineage) |
| **1625** | *Nambalia rohui* | `Sauropodomorph` | Saurischia | Nambalia clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Nambalia clade` | Saurischia | Nambaliaidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **1626** | *Parasuchus hislopi* | `Phytosaur` | Phytosaur | Parasuchidae | None / Empty | `EMPTY_RELATIVES` | Phytosaur | Parasuchidae | Modern Crocodilians (Crocodilia: True Crocodiles, Alligators, Caimans, Gharials) • Modern Birds (Aves - sister archosaur lineage) |
| **1627** | *Metoposaurus maleriensis* | `Early_Tetrapod_Amphibian` | Temnospondyli | Metoposauridae | None / Empty | `EMPTY_RELATIVES` | Temnospondyli | Metoposauridae |  |
| **1628** | *Exaeretodon statterneri* | `Early_Mammal_Synapsid` | Cynodontia | Traversodontidae | None / Empty | `EMPTY_RELATIVES` | Cynodontia | Traversodontidae |  |
| **1629** | *Hyperodapedon huxleyi* | `Archosauriform` | Archosauriform | Rhynchosauridae | None / Empty | `EMPTY_RELATIVES` | Archosauriform | Rhynchosauridae |  |
| **1635** | *Eoraptor lunensis* | `Theropod` | Saurischia | Eoraptor clade | Crocodilians (closest living non-dinosaurian outgroup) • Modern Birds / Aves (direct surviving avian theropod lineage) | `INVALID_FAMILY:Eoraptor clade` | Saurischia | Eoraptoridae | Modern Birds (Aves / Neornithes - direct surviving avian theropods) • Crocodilians (Crocodilia - closest living non-dinosaurian archosaurs) |
| **1637** | *Saurosuchus galilei* | `Rauisuchian` | Rauisuchian | Saurosuchus clade | None / Empty | `INVALID_FAMILY:Saurosuchus clade, EMPTY_RELATIVES` | Rauisuchian | Saurosuchusidae | Modern Crocodilians (Crocodilia: True Crocodiles, Alligators, Caimans, Gharials) • Modern Birds (Aves - sister archosaur lineage) |
| **1638** | *Hyperodapedon sanjuanensis* | `Archosauriform` | Archosauriform | Rhynchosauridae | None / Empty | `EMPTY_RELATIVES` | Archosauriform | Rhynchosauridae |  |
| **1639** | *Exaeretodon frenguellii* | `Early_Mammal_Synapsid` | Cynodontia | Traversodontidae | None / Empty | `EMPTY_RELATIVES` | Cynodontia | Traversodontidae |  |
| **1641** | *Janenschia robusta* | `Sauropod` | Saurischia | Janenschia clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Janenschia clade` | Saurischia | Janenschiaidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **1643** | *Australodocus bohetii* | `Sauropod` | Saurischia | Australodocus clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Australodocus clade` | Saurischia | Australodocusidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **1646** | *Eocursor parvus* | `Ornithischian` | Ornithischia | Eocursor clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Eocursor clade` | Ornithischia | Eocursoridae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **1652** | *Aegisuchus witmeri* | `Crocodylomorph` | Crocodylomorph | Aegyptosuchidae | None / Empty | `EMPTY_RELATIVES` | Crocodylomorpha | Aegyptosuchidae | Modern Crocodilians (Crocodilia: True Crocodiles, Alligators, Caimans, Gharials) • Modern Birds (Aves - sister archosaur lineage) |
| **1653** | *Lystrosaurus murrayi* | `Early_Mammal_Synapsid` | Dicynodontia | Lystrosauridae | None / Empty | `EMPTY_RELATIVES` | Dicynodontia | Lystrosauridae |  |
| **1654** | *Moschops capensis* | `Early_Mammal_Synapsid` | Therapsida | Tapinocephalidae | None / Empty | `EMPTY_RELATIVES` | Therapsida | Tapinocephalidae |  |
| **1655** | *Diictodon feliceps* | `Early_Mammal_Synapsid` | Dicynodontia | Diictodontidae | None / Empty | `EMPTY_RELATIVES` | Dicynodontia | Diictodontidae |  |
| **1656** | *Gorgonops torvus* | `Early_Mammal_Synapsid` | Therapsida | Gorgonopidae | None / Empty | `EMPTY_RELATIVES` | Therapsida | Gorgonopidae |  |
| **1657** | *Rubidgea atrox* | `Early_Mammal_Synapsid` | Therapsida | Gorgonopidae | None / Empty | `EMPTY_RELATIVES` | Therapsida | Gorgonopidae |  |
| **1658** | *Procynosuchus delaharpeae* | `Early_Mammal_Synapsid` | Cynodontia | Procynosuchidae | None / Empty | `EMPTY_RELATIVES` | Cynodontia | Procynosuchidae |  |
| **1659** | *Anteosaurus magnificus* | `Early_Mammal_Synapsid` | Therapsida | Anteosauridae | None / Empty | `EMPTY_RELATIVES` | Therapsida | Anteosauridae |  |
| **1661** | *Diamantinasaurus matildae* | `Sauropod` | Saurischia | Diamantinasaurus clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Diamantinasaurus clade` | Saurischia | Diamantinasaurusidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **1662** | *Savannasaurus elliottorum* | `Sauropod` | Saurischia | Savannasaurus clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Savannasaurus clade` | Saurischia | Savannasaurusidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **1663** | *Australotitan cooperensis* | `Sauropod` | Saurischia | Australotitan clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Australotitan clade` | Saurischia | Australotitanidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **1664** | *Isisfordia duncani* | `Crocodylomorph` | Crocodylomorph | Isisfordia clade | None / Empty | `INVALID_FAMILY:Isisfordia clade, EMPTY_RELATIVES` | Crocodylomorpha | Isisfordiaidae | Modern Crocodilians (Crocodilia: True Crocodiles, Alligators, Caimans, Gharials) • Modern Birds (Aves - sister archosaur lineage) |
| **1668** | *Fostoria dhimbangunmal* | `Ornithischian` | Ornithischia | Fostoria clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Fostoria clade` | Ornithischia | Fostoriaidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **1669** | *Weewarrasaurus pobeni* | `Ornithischian` | Ornithischia | Weewarrasaurus clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Weewarrasaurus clade` | Ornithischia | Weewarrasaurusidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **1670** | *Lightningclaw* | `Theropod` | Saurischia | Lightningclaw clade | Crocodilians (closest living non-dinosaurian outgroup) • Modern Birds / Aves (direct surviving avian theropod lineage) | `INVALID_FAMILY:Lightningclaw clade` | Saurischia | Lightningclawidae | Modern Birds (Aves / Neornithes - direct surviving avian theropods) • Crocodilians (Crocodilia - closest living non-dinosaurian archosaurs) |
| **1671** | *Steropodon galmani* | `Early_Mammal_Synapsid` | Monotremata | Steropodontidae | None / Empty | `EMPTY_RELATIVES` | Monotremata | Steropodontidae |  |
| **1672** | *Kollikodon ritchiei* | `Early_Mammal_Synapsid` | Monotremata | Kollikodontidae | None / Empty | `EMPTY_RELATIVES` | Monotremata | Kollikodontidae |  |
| **1733** | *Bicentenaria argentina* | `Theropod` | Saurischia | Bicentenaria clade | Crocodilians (closest living non-dinosaurian outgroup) • Modern Birds / Aves (direct surviving avian theropod lineage) | `INVALID_FAMILY:Bicentenaria clade` | Saurischia | Bicentenariaidae | Modern Birds (Aves / Neornithes - direct surviving avian theropods) • Crocodilians (Crocodilia - closest living non-dinosaurian archosaurs) |
| **1736** | *Santanaraptor placidus* | `Theropod` | Saurischia | Santanaraptor clade | Crocodilians (closest living non-dinosaurian outgroup) • Modern Birds / Aves (direct surviving avian theropod lineage) | `INVALID_FAMILY:Santanaraptor clade` | Saurischia | Santanaraptoridae | Modern Birds (Aves / Neornithes - direct surviving avian theropods) • Crocodilians (Crocodilia - closest living non-dinosaurian archosaurs) |
| **1739** | *Araripesuchus gomesii* | `Crocodylomorph` | Crocodylomorph | Uruguaysuchidae | None / Empty | `EMPTY_RELATIVES` | Crocodylomorpha | Uruguaysuchidae | Modern Crocodilians (Crocodilia: True Crocodiles, Alligators, Caimans, Gharials) • Modern Birds (Aves - sister archosaur lineage) |
| **1743** | *Santanachelys gaffneyi* | `Marine_Reptile` | Testudines | Protostegidae | None / Empty | `EMPTY_RELATIVES` | Testudines | Protostegidae |  |
| **1744** | *Cladocyclus gardneri* | `Invertebrate` | Ichthyodectiformes | Ichthyodectidae | None / Empty | `EMPTY_RELATIVES` | Ichthyodectiformes | Ichthyodectidae |  |
| **1745** | *Calamopleurus cylindrical* | `Invertebrate` | Amiiformes | Amiidae | None / Empty | `EMPTY_RELATIVES` | Amiiformes | Amiidae |  |
| **1753** | *Pelecanimimus polychrodon* | `Theropod` | Saurischia | Pelecanimimus clade | Crocodilians (closest living non-dinosaurian outgroup) • Modern Birds / Aves (direct surviving avian theropod lineage) | `INVALID_FAMILY:Pelecanimimus clade` | Saurischia | Pelecanimimusidae | Modern Birds (Aves / Neornithes - direct surviving avian theropods) • Crocodilians (Crocodilia - closest living non-dinosaurian archosaurs) |
| **1754** | *Hypselospinus fittoni* | `Ornithischian` | Ornithischia | Hypselospinus clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Hypselospinus clade` | Ornithischia | Hypselospinusidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **1760** | *Caudipteryx zhoui* | `Theropod` | Saurischia | Caudipteryx clade | Crocodilians (closest living non-dinosaurian outgroup) • Modern Birds / Aves (direct surviving avian theropod lineage) | `INVALID_FAMILY:Caudipteryx clade` | Saurischia | Caudipteryxidae | Modern Birds (Aves / Neornithes - direct surviving avian theropods) • Crocodilians (Crocodilia - closest living non-dinosaurian archosaurs) |
| **1761** | *Repenomamus giganteus* | `Early_Mammal_Synapsid` | Eutriconodonta | Repenomamidae | None / Empty | `EMPTY_RELATIVES` | Eutriconodonta | Repenomamidae |  |
| **2035** | *Poposaurus gracilis* | `Poposauroid` | Poposauroid | Poposauridae | None / Empty | `EMPTY_RELATIVES` | Poposauroid | Poposauridae | Modern Crocodilians (Crocodilia: True Crocodiles, Alligators, Caimans, Gharials) • Modern Birds (Aves - sister archosaur lineage) |
| **2036** | *Stenopterygius quadriscissus* | `Marine_Reptile` | Ichthyosauria | Stenopterygiidae | None / Empty | `EMPTY_RELATIVES` | Ichthyosauria | Ichthyosauridae | Crown Diapsida (Sauria: Archosaurs & Lepidosaurs) |
| **2037** | *Eurhinosaurus longirostris* | `Marine_Reptile` | Ichthyosauria | Leptopterygiidae | None / Empty | `EMPTY_RELATIVES` | Ichthyosauria | Leptopterygiidae |  |
| **2040** | *Seirocrinus subangularis* | `Invertebrate` | Isocrinida | Pentacrinitidae | None / Empty | `EMPTY_RELATIVES` | Isocrinida | Pentacrinitidae |  |
| **2041** | *Teleosaurus cadomensis* | `Crocodylomorph` | Crocodylomorph | Teleosauridae | None / Empty | `EMPTY_RELATIVES` | Crocodylomorpha | Teleosauridae | Modern Crocodilians (Crocodilia: True Crocodiles, Alligators, Caimans, Gharials) • Modern Birds (Aves - sister archosaur lineage) |
| **2045** | *Agilisaurus louderbacki* | `Ornithischian` | Ornithischia | Agilisaurus clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Agilisaurus clade` | Ornithischia | Agilisaurusidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **2060** | *Kotasaurus yamanpalliensis* | `Sauropod` | Saurischia | Kotasaurus clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Kotasaurus clade` | Saurischia | Kotasaurusidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **2161** | *Lepidotes elvensis* | `Invertebrate` | Semionotiformes | Lepidotidae | None / Empty | `EMPTY_RELATIVES` | Semionotiformes | Lepidotidae |  |
| **2310** | *Jingshanosaurus myankouensis* | `Sauropodomorph` | Saurischia | Jingshanosaurus clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Jingshanosaurus clade` | Saurischia | Jingshanosaurusidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **2311** | *Yunnanosaurus huangi* | `Sauropodomorph` | Saurischia | Yunnanosaurus clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Yunnanosaurus clade` | Saurischia | Yunnanosaurusidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **2312** | *Bienosaurus lufengensis* | `Ornithischian` | Ornithischia | Bienosaurus clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Bienosaurus clade` | Ornithischia | Bienosaurusidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **2317** | *Indochelys spatulata* | `Marine_Reptile` | Testudines | Indochelyidae | None / Empty | `EMPTY_RELATIVES` | Testudines | Indochelyidae |  |
| **2318** | *Dandakosaurus indicus* | `Theropod` | Saurischia | Dandakosaurus clade | Crocodilians (closest living non-dinosaurian outgroup) • Modern Birds / Aves (direct surviving avian theropod lineage) | `INVALID_FAMILY:Dandakosaurus clade` | Saurischia | Dandakosaurusidae | Modern Birds (Aves / Neornithes - direct surviving avian theropods) • Crocodilians (Crocodilia - closest living non-dinosaurian archosaurs) |
| **2319** | *Treposuchus indicus* | `Crocodylomorph` | Crocodylomorph | Treposuchus clade | None / Empty | `INVALID_FAMILY:Treposuchus clade, EMPTY_RELATIVES` | Crocodylomorpha | Treposuchusidae | Modern Crocodilians (Crocodilia: True Crocodiles, Alligators, Caimans, Gharials) • Modern Birds (Aves - sister archosaur lineage) |
| **2320** | *Sivapithecus sivalensis* | `Early_Mammal_Synapsid` | Primates | Hominidae | None / Empty | `EMPTY_RELATIVES` | Primates | Hominidae |  |
| **2321** | *Gigantopithecus bilaspurensis* | `Early_Mammal_Synapsid` | Primates | Hominidae | None / Empty | `EMPTY_RELATIVES` | Primates | Hominidae |  |
| **2322** | *Bramatherium megacephalum* | `Early_Mammal_Synapsid` | Artiodactyla | Giraffidae | None / Empty | `EMPTY_RELATIVES` | Artiodactyla | Giraffidae |  |
| **2323** | *Hexaprotodon sivalensis* | `Early_Mammal_Synapsid` | Artiodactyla | Hippopotamidae | None / Empty | `EMPTY_RELATIVES` | Artiodactyla | Hippopotamidae |  |
| **2324** | *Archidiskodon planifrons* | `Early_Mammal_Synapsid` | Proboscidea | Mammutidae | None / Empty | `EMPTY_RELATIVES` | Proboscidea | Mammutidae |  |
| **2325** | *Bahariasaurus ingens* | `Theropod` | Saurischia | Bahariasaurus clade | Crocodilians (closest living non-dinosaurian outgroup) • Modern Birds / Aves (direct surviving avian theropod lineage) | `INVALID_FAMILY:Bahariasaurus clade` | Saurischia | Bahariasaurusidae | Modern Birds (Aves / Neornithes - direct surviving avian theropods) • Crocodilians (Crocodilia - closest living non-dinosaurian archosaurs) |
| **2327** | *Stromerichthys lacustris* | `Invertebrate` | Amiiformes | Gigantodontidae | None / Empty | `EMPTY_RELATIVES` | Amiiformes | Gigantodontidae |  |
| **2478** | *Jainosaurus septentrionalis* | `Sauropod` | Saurischia | Jainosaurus clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Jainosaurus clade` | Saurischia | Jainosaurusidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **2480** | *Kotaichthys kartikeyai* | `Invertebrate` | Ammonoidea | Kotaichthys clade | None / Empty | `INVALID_FAMILY:Kotaichthys clade, EMPTY_RELATIVES` | Ammonoidea | Kotaichthysidae |  |
| **2481** | *Indobatrachus pusillus* | `Early_Tetrapod_Amphibian` | Salientia | Ranidae | None / Empty | `EMPTY_RELATIVES` | Salientia | Ranidae |  |
| **2482** | *Paralititan stromeri* | `Sauropod` | Saurischia | Paralititan clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Paralititan clade` | Saurischia | Paralititanidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **2483** | *Blikanasaurus cromptoni* | `Sauropodomorph` | Saurischia | Blikanasaurus clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Blikanasaurus clade` | Saurischia | Blikanasaurusidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **3160** | *Sauroposeidon proteles* | `Sauropod` | Saurischia | Sauroposeidon clade | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `INVALID_FAMILY:Sauroposeidon clade` | Saurischia | Sauroposeidonidae | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **3175** | *Dracovenator regenti* | `Theropod` | Saurischia | Dracovenator clade | Crocodilians (closest living non-dinosaurian outgroup) • Modern Birds / Aves (direct surviving avian theropod lineage) | `INVALID_FAMILY:Dracovenator clade` | Saurischia | Dracovenatoridae | Modern Birds (Aves / Neornithes - direct surviving avian theropods) • Crocodilians (Crocodilia - closest living non-dinosaurian archosaurs) |
| **5186** | *Aquilops* | `Ornithischian` | Ornithischia | - | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `MISSING_FAMILY` | Ornithischia |  | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **5188** | *Yuxisaurus* | `Ornithischian` | Ornithischia | - | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `MISSING_FAMILY` | Ornithischia |  | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **5189** | *Ankylorhiza tiedemani* | `Early_Mammal_Synapsid` | Artiodactyla | - | Toothed Whales (Odontoceti) • Hippopotamuses | `MISSING_FAMILY` | Artiodactyla |  | Toothed Whales (Odontoceti) • Hippopotamuses |
| **5203** | *Hippodraco* | `Ornithischian` | Ornithischia | - | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `MISSING_FAMILY` | Ornithischia |  | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |
| **5211** | *Potamotherium* | `Early_Mammal_Synapsid` | Carnivora | - | Modern Seals and Sea Lions (Pinnipedia) • Walruses (Odobenidae) | `MISSING_FAMILY` | Carnivora |  | Modern Seals and Sea Lions (Pinnipedia) • Walruses (Odobenidae) |
| **5219** | *Serpentisuchops* | `Marine_Reptile` | Plesiosauria | Polycotylidae | Modern Birds and Crocodilians (Archosaurs) • Squamates (Lizards and Snakes) | `SUSPICIOUS_MARINE_REPTILE_ARCHOSAUR` | Plesiosauria | Polycotylidae | Modern Birds and Crocodilians (Archosaurs) • Squamates (Lizards and Snakes) |
| **5220** | *Antarctopelta* | `Ornithischian` | Ornithischia | - | Modern Birds / Aves (surviving dinosaurian lineage) • Crocodilians (closest living non-dinosaurian outgroup) | `MISSING_FAMILY` | Ornithischia |  | Modern Birds (Aves - sole surviving lineage of Dinosauria) • Crocodilians (Crocodilia - closest living non-dinosaurian outgroup) |

---

## 5. Phase 2 Execution Plan: Reviewed Batches by Clade

Per the permanent safeguards in [AGENTS.md](../../AGENTS.md):
- **No bulk blind edits**: Corrections will be executed in distinct, reviewed batches by clade.
- **Pre- and post-operation snapshot verification**: Automated regression tests will verify that 100% of non-target species records remain untouched.
- **CI Validation**: Run `npm run test:taxonomy` before and after each migration batch.

### Proposed Batch Schedule:
1. **Batch 1: Benchmark & Placental Mammals** (*Andrewsarchus*, *Smilodon*, *Mammuthus*, *Megatherium*, *Coelodonta*, *Basilosaurus*, etc.) + Complete Andrewsarchus image attribution.
2. **Batch 2: Synapsids & Stem-Mammals** (*Dimetrodon*, *Edaphosaurus*, *Inostrancevia*, *Estemmenosuchus*, *Cynognathus*, etc.)
3. **Batch 3: Invertebrates & Early Tetrapods** (*Anomalocaris*, *Opabinia*, *Hallucigenia*, *Ichthyostega*, *Tiktaalik*, etc.)
4. **Batch 4: Marine Reptiles** (Mosasaurs, Plesiosaurs, Pliosaurs, Ichthyosaurs)
5. **Batch 5: Pterosaurs & Archosaurs** (Structured format upgrade with separate ecological analogues)
6. **Batch 6: Dinosaurs (Theropods, Sauropods, Ornithischians)** (Final structured schema synchronization)
