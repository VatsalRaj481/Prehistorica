# PROJECT_STATE.md — Diagnostic & Cleanup Final Audit Report

**Date of Audit & Cleanup:** 2026-08-22  
**Repository:** Prehistorica (Prehistoric Fauna Encyclopedia)

---

## 1. Database

### Confirmed
- **Prisma Datasource Configuration:** `backend/prisma/schema.prisma` specifies PostgreSQL provider:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```
- **Environment Variables & Templates:**
  - `backend/.env`: Contains `DATABASE_URL` (with rotated password) and `PORT=5000`.
  - `backend/.env.example`: Created with sanitized placeholders (`DATABASE_URL`, `DIRECT_URL`, `PORT`).
- **Retired Files:** `backend/prisma/dev.db` has been permanently deleted from disk.
- **Runtime & CLI Database Connection:**
  - Express backend server (`http://127.0.0.1:5000`) is connected to PostgreSQL on Supabase.
  - CLI operations (`npx prisma db pull`, `npx prisma db push`, `npx prisma generate`) execute cleanly with `--dns-result-order=ipv4first`.

---

## 2. Security

### Confirmed
- **Gitignore Protection:** `.env` is listed in the root `.gitignore` file.
- **Git History Audit:** `.env` was never committed to git history (0 commits found in `git log --all`).
- **Secret Leaks:** 0 hardcoded passwords, connection strings, or credentials exist outside `.env`. Password rotation completed on Supabase.

---

## 3. Schema & Enums

### Confirmed
- **Prisma Native Enums Defined & Active:**
  - `enum Diet { carnivore, herbivore, omnivore, piscivore, filter_feeder }`
  - `enum Habitat { terrestrial, semi_aquatic, freshwater, aerial, marine }`
  - `enum Clade { Theropod, Sauropod, Ornithischian, Pterosaur, Marine_Reptile, Early_Mammal_Synapsid, Early_Tetrapod_Amphibian, Invertebrate, Other }`
  - `enum TaxonomicStatus { valid, nomen_dubium, synonym, disputed }`

- **Redundant / Duplicate Columns Collapsed & Dropped:**
  - `dietType` → Dropped (collapsed into `diet` Enum)
  - `creatureType` → Dropped (collapsed into `clade` Enum)
  - `taxonomicClassification`, `genus`, `family` → Dropped (collapsed into `taxonomy` JSON object)
  - `locations`, `country`, `fossilFormation` → Dropped (collapsed into `geographicRange` JSON object)
  - `reconstructionImageUrl`, `fossilImageUrl` → Dropped (collapsed into `media` JSON array)
  - `lengthM`, `heightM`, `weightKg` → Dropped (collapsed into `sizeEstimate` JSON object)

- **Database Indexes:**
  - `Species`: `@unique` on `name`, `@@index([clade])`, `@@index([diet])`, `@@index([habitat])`, `@@index([myaStart, myaEnd])`
  - `SpeciesRelation`: `@@unique([speciesId, relatedSpeciesId])`

---

## 4. Data

### Confirmed
- **Row Count:** **364 total species entries** verified intact in Supabase PostgreSQL (0 rows lost).
- **Data Completeness:**
  - `Incomplete Taxonomy`: **0 rows** (100% of rows have family, genus, and species).
  - `Incomplete GeographicRange`: **0 rows** (100% of rows have region, country, and fossil formation).
  - `Incomplete SizeEstimate`: **0 rows** (100% of rows have length/height/weight dimensions).
- **JSON Field Deserialization:** `media`, `taxonomy`, `sizeEstimate`, `geographicRange`, `interestingFacts`, `sources`, and `closestLivingRelatives` deserialize into native JavaScript objects and arrays at the controller layer.

---

## 5. Backend API

### Confirmed
- **Registered Routes (`backend/src/routes/api.ts`):**
  - `GET /api/species` → Filtered roster, search, and pagination
  - `GET /api/species/creature-of-the-day` → Deterministic daily creature
  - `GET /api/species/search/autocomplete` → Real-time header search suggestions
  - `GET /api/species/compare` → Side-by-side spec comparison
  - `GET /api/species/:id` → Single species profile & related species
  - `GET /health` → Health check (`{ "status": "ok" }`)
- **Build & Runtime Status:** Backend TypeScript compiles with 0 errors (`npm run build`). Express daemon server running on port `5000`.

---

## 6. Frontend

### Confirmed
- **TypeScript Build:** `npm run build` completed with 0 errors (`1563 modules transformed`).
- **Components & Pages:** `CompareModal`, `ConfidenceBadge`, `Footer`, `MediaGallery`, `Navbar`, `SearchAutocomplete`, `SizeComparisonSilhouette`, `TaxonomyBreadcrumbs`, `Home`, `Browse`, `TimeMap`, `SpeciesDetail` all updated and rendering against the new canonical API contracts.

---

## 7. Project Hygiene

### Confirmed
- **Backups:** Full database snapshot preserved at `backend/backups/pre-cleanup-2026-08-22T13-36-11-161Z.json` (364 species records).
- **Environment Template:** Created `backend/.env.example`.
- **Database Cleanup:** Deleted legacy `backend/prisma/dev.db`.
