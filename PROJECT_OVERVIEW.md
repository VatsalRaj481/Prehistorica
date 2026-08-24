# Prehistorica — Project Overview & Technical Report

**Project Name**: Prehistorica (Prehistoric Fauna Encyclopedia)  
**Database**: PostgreSQL Database (Prisma ORM)  
**Total Database Roster**: **361 Unique Species** (0 gaps, 0 duplicate rows)

---

## 1. Executive Summary

Prehistorica is an interactive, open-access encyclopedia of prehistoric life covering millions of years of evolutionary history across paleocontinents, geologic eras, and taxonomic clades.

Over recent development passes, the project underwent major database taxonomy auditing, duplicate resolution, open-source image candidate sourcing, search engine case-insensitivity fixes, and responsive UI layout standardization.

---

## 2. Key Accomplishments & Technical Milestones

### A. Database Taxonomy & Data Quality Cleaning
1. **Triassic-Batch Taxonomy Remediation (IDs #44–#142)**:
   - Investigated and corrected 96 species seeded with default `Early_Mammal_Synapsid` clades and placeholder `"[Genus] spp."` scientific names.
   - Restored authentic type species binomials (e.g. *Herrerasaurus ischigualastensis*, *Desmatosuchus haplocerus*, *Plateosaurus trossingensis*, *Silesaurus opolensis*).
2. **Schema & Clade Expansion**:
   - Expanded Prisma `Clade` enum with 9 new paleontological clades: `Sauropodomorph`, `Aetosaur`, `Phytosaur`, `Rauisuchian`, `Poposauroid`, `Crocodylomorph`, `Silesaurid`, `Archosauriform`, `Protorosaur`.
   - Synchronized schema changes cleanly with the PostgreSQL database.
3. **Duplicate Detection & Merging**:
   - Merged extra media items and citations from duplicate pairs before row deletion:
     - `#581` -> `#14` (*Coelophysis bauri*)
     - `#582` -> `#15` (*Plateosaurus trossingensis*)
     - `#583` -> `#16` (*Postosuchus kirkpatricki*)
     - `#784` -> `#23` (*Spinosaurus aegyptiacus*)
   - Total database count stabilized at **361 unique species**.
4. **Spinosaurus Record Cleanup**:
   - Standardized heading to `Spinosaurus` (Genus), restored 8-level taxonomy breadcrumbs, deduplicated discovery history, and fixed broken JSON syntax in `interestingFacts` to populate the *Distinctive Key Scientific Facts* UI component.

---

### B. Open-Source Image Research & Sourcing Pipeline
1. **Automated Research Tools**:
   - Developed `find-species-images.ts` and `search-triassic-batch-images.ts` integrating the PhyloPic REST API and Wikimedia Commons API.
2. **Quality Controls & Strict Filters**:
   - **File Extension Whitelisting**: Restricted candidates strictly to `.jpg`, `.jpeg`, `.png`, `.svg`, `.webp`, `.gif` (excluding PDFs).
   - **Strict Genus Title Matcher**: Candidate filenames must contain the target genus name to eliminate wrong-species co-occurrence matches (e.g. removing *Saurichthys_seefeldensis.jpg* from *Preondactylus*).
   - **Enhanced Suspicious Author Detection**: Flagged ambiguous or machine-readable fallback credit strings (`"No machine-readable author provided... assumed"`) with ⚠️ `[SUSPICIOUS CREDIT]`.
   - **Table Separation**: Separated 🎨 *Life Reconstruction Artwork* candidates from 🦴 *Skeletal & Diagram Matches*.
3. **Massive Image Asset Recovery**:
   - **Before binomial correction**: 96/96 Triassic species returned 0 reconstruction candidates due to searching on broken `"spp."` placeholder names.
   - **After binomial correction**: **94 out of 96 species (97.9%)** now have valid open-licensed life reconstruction candidates!
   - Total missing reconstruction count across the entire 361-species database dropped from **101 down to 7**.
4. **Generated Research Reports**:
   - `backend/reports/image-candidates.md`: Comprehensive candidate report for all 364 original species.
   - `backend/reports/no-reconstruction-candidates.md`: Focused extraction report for zero-candidate species.
   - `backend/reports/triassic-batch-image-candidates.md`: Triassic batch recovery report with before/after metrics and flagged attributions.

---

### C. Frontend UI/UX & Search Engine Enhancements
1. **Case-Insensitive Search Fix**:
   - Added `mode: 'insensitive'` to Prisma PostgreSQL queries (`getSpecies` and `searchAutocomplete`) across `name`, `scientificName`, `nameMeaning`, `geographicRange`, and `taxonomy`.
   - Searching `"allosaurus"` in lowercase now matches `"Allosaurus"` instantly.
2. **Single Unified Search Bar & State Sync**:
   - Unified search UX into a single global autocomplete search bar in `Navbar.tsx`.
   - Bound search bar input state dynamically to URL parameters (`?search=...`). Navigating back, clicking Home, or clearing active filters automatically empties the search input box.
3. **Layout & Media Gallery Polish**:
   - Standardized aspect ratios across `MediaGallery.tsx`, `Home.tsx` Hero card, `Browse.tsx`, and `SpeciesDetail.tsx` using `object-contain` on dark canvases to eliminate visual cropping of fossil diagrams and artwork.
   - Fixed sidebar header text cut-off and button overlap in `Browse.tsx`.

---

## 3. System Architecture & Directory Structure

```text
Prehistorica/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma                 # Database schema & Clade enum definition
│   ├── reports/
│   │   ├── image-candidates.md           # Full species research report
│   │   ├── no-reconstruction-candidates.md # Missing reconstruction extraction report
│   │   └── triassic-batch-image-candidates.md # Triassic recovery report
│   ├── scripts/
│   │   ├── find-species-images.ts        # General image research script
│   │   ├── search-triassic-batch-images.ts # Triassic batch research script
│   │   └── extract-missing-reconstructions.ts
│   └── src/
│       ├── controllers/species.ts        # Express API controller
│       ├── routes/api.ts                 # API route definitions
│       └── server.ts                     # Express server entry point
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Navbar.tsx                # Top navigation header
│       │   ├── SearchAutocomplete.tsx    # Unified global search bar
│       │   ├── MediaGallery.tsx          # Uncropped media viewer
│       │   ├── CompareModal.tsx          # Side-by-side species comparison
│       │   ├── ConfidenceBadge.tsx
│       │   ├── SizeComparisonSilhouette.tsx
│       │   └── TaxonomyBreadcrumbs.tsx
│       ├── pages/
│       │   ├── Home.tsx                  # Landing page & featured hero
│       │   ├── Browse.tsx                # Filterable catalog grid
│       │   ├── SpeciesDetail.tsx         # Detailed species profile
│       │   └── TimeMap.tsx               # Interactive paleogeographic map
│       └── services/api.ts               # Frontend API client
└── PROJECT_OVERVIEW.md
```

---

## 4. Current Operational Status

* **Express Backend Server**: Running locally on `http://localhost:5000` (Health check: `http://localhost:5000/health`).
* **Vite React Frontend**: Running locally on `http://localhost:5173`.
