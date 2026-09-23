<div align="center">
  <img src="frontend/public/logo.png" alt="Prehistorica Museum Crest" width="160" />
  <h1>🏛️ PREHISTORICA</h1>
  <h3>The Modern Museum Pavilion Encyclopedia & AI Research Pavilion</h3>
  <p><strong>A premium, full-stack, architectural digital museum dedicated to cataloging, visualizing, and researching Earth's prehistoric fauna with grounded AI.</strong></p>
  <p><em>Spanning 540 million years of natural history across 596 verified species, 31 global fossil formations, and 10 geologic eras.</em></p>
</div>

---

## 🌟 Modern Museum Pavilion Highlights

### 🎨 Explicit Art Direction — Rejecting Generic SaaS Aesthetics
Built around **The Modern Museum Pavilion** visual language. **Prehistorica** explicitly rejects generic AI-generated dark dashboards, blurred frosted glass, and uniform grid boxes:
- **Official Museum Crest**: Distinctive hand-crafted archival seal depicting iconic prehistoric clades (Pterosauria, Tyrannosauroidea, Ceratopsia, early Synapsida) surrounding an ammonite fossil shield with laurel bone knotwork.
- **Editorial Typographic Hierarchy**: Monospaced exhibit tags, serif scientific nomenclature, and high-contrast amber headers.
- **Asymmetric Spatial Focus**: 1–2 dominant architectural elements per screen with varied scale and broken grid rhythm.
- **1:1 Metric Caliper Scale Comparison Stage**: Highly calibrated metric projection stage comparing animals directly against reference silhouettes (Human, Car, Bus, Elephant).
- **Interactive Geologic Time-Map**: Fluid paleogeographic exploration of fossil formations across geological eras.
- **AI Research Pavilion**: Grounded paleontological RAG agent, osteology fossil vision identifier, biomechanical matchup simulator, vector semantic search, and paleo-trophic web synthesizer.

---

## 🤖 Strategic AI Features (The AI Research Pavilion)

Prehistorica integrates five high-impact AI capabilities specifically designed for vertebrate paleontology, powered by Google's Free Gemini API and Supabase PostgreSQL `pgvector`:

### 1. 🏛️ "The Chief Curator" — Grounded Paleontological RAG Agent
- **Grounded Retrieval-Augmented Generation (RAG)**: Generates 768-dimensional embeddings of visitor questions, runs vector cosine similarity (`<=>`) over the 596 species records, and injects verified specimen diagnoses as ground truth.
- **Curatorial Tone & Inline Hyperlinks**: Speaks as a senior vertebrate paleontologist and embeds direct markdown hyperlinks to Prehistorica exhibits (e.g. `[Spinosaurus](/species/2061)`).
- **Audio & Accessibility**: Includes Web Speech API voice synthesis narration, curated inquiry prompts, and interactive grounded specimen source cards.
- **Access**: Click **"Curator"** in the top navigation bar or the floating action button at the bottom right.

### 2. 📸 "Fossil Lens" — Multimodal Fossil & Bone Identifier
- **Comparative Osteology Vision**: Drag-and-drop or upload photos of fossil teeth, claws, vertebrae, or slabs (or choose curated museum specimens).
- **Client-Side Optimization**: Automatically resizes and compresses imagery to a maximum of $800 \times 800$ canvas coordinates for sub-second upload speeds.
- **Structured Diagnostics**: Evaluates authenticity (genuine fossil vs replica/pseudofossil), anatomical element, diagnostic bone morphology, and matching taxa.
- **Exhibit Integration**: Matches identified taxa against Prehistorica records, displaying the authentic 2D lateral silhouette and exhibit links.
- **Access**: Click **"Fossil Lens"** in the top navigation bar.

### 3. ⚔️ Caliper Runway Biomechanical Interaction & Matchup Engine
- **Deterministic Temporal Check**: Computes chronological overlap mathematically ($0 \text{ Ma}$ vs separated by millions of years) before invoking the LLM.
- **Biomechanical Metrics**: Estimates mass ratio differentials, basion-cranial bite forces in Newtons ($N$), kinetic advantages, and offensive/defensive adaptations.
- **Zero-Token Persistent Cache**: Simulations are cached permanently in `RunwayMatchupCache` in PostgreSQL. Repeat matchups load in **0 milliseconds** with **zero API quota used**.
- **Access**: On the **Caliper Runway** (`/runway`), place 2 species on the stage and click **"Simulate Matchup (AI)"**.

### 4. 🧠 Natural Language Semantic Discovery ("Natural Query Engine")
- **Conceptual Exploration**: Search by evolutionary concepts, adaptations, or ecological niches rather than exact keywords (e.g. *"Apex predators with sail-like dorsal structures"*, *"Early Triassic synapsids that survived the Great Dying"*).
- **PostgreSQL pgvector & HNSW**: Queries are projected into 768-dimensional vectors with `gemini-embedding-2` and matched via an HNSW cosine index in under $100 \text{ ms}$.
- **Access**: Toggle **"AI Semantic Mode"** in the header search bar or explore filtered matches on the **Catalog** (`/browse?semantic=...`).

### 5. 🌿 Deep-Time Paleo-Biome & Trophic Food Web Synthesizer
- **Multi-Tier Ecological Pyramids**: Synthesizes trophic networks for fossil formations (e.g., *Hell Creek*, *Morrison*, *Solnhofen Archipelago*, *Yixian*), grouping taxa into Primary Producers, Primary Consumers, Mesopredators, Apex Predators, and Decomposers.
- **Environmental Stressor Simulation**: Interactive collapse testing under four scenarios: *Baseline Equilibrium*, *Marine Regression & Megadrought*, *Flood Basalt Volcanism*, and *Hyperthermal Spike*.
- **Cached Architecture**: Caches synthesized food webs in `BiomeFoodWebCache` for instant zero-token repeat loads.
- **Access**: In **Time-Map** (`/timemap`), select any formation pin and click **"Food Web (AI)"**.

---

## ⚡ Free-Tier Engineering & Reliability Architecture

All five AI features are engineered to run comfortably within Google's **Free Gemini API tier**:

1. **pgvector Search Offloading**: The Natural Query Engine uses `gemini-embedding-2` (high RPM limits), entirely bypassing LLM generation quota.
2. **Persistent Database Caching**: Runway matchups and formation food webs are stored in PostgreSQL on first run; subsequent visitor visits consume **0 tokens**.
3. **Deterministic Chronology Guard**: Temporal coexistence is evaluated programmatically; anachronistic encounters are flagged before calling the AI.
4. **Resilient Model Cascade**: If high-demand spikes cause transient 503 errors on the primary model, requests automatically cascade across `['gemini-3.5-flash-lite', 'gemini-3-flash-preview', 'gemini-flash-latest']` with exponential backoff.
5. **Dual-Stack DNS Optimization**: Configured `dns.setDefaultResultOrder('ipv4first')` to eliminate Windows Node.js dual-stack IPv6 latency.
6. **Express Rate Limiting**: Enforces 12 RPM per IP on LLM generation and 40 RPM on embeddings to protect against quota exhaustion.

---

## 🦖 Core Museum Features

### 1. 🔍 Catalog Pavilion & Architectural Search
- **596 Verified Species**: Comprehensive database covering Theropods, Sauropods, Ornithischians, Pterosaurs, Marine Reptiles, Early Synapsids, Amphibians, and Invertebrates.
- **Combinable Filters**: Search across taxonomic clade, dietary type, habitat, geologic era, geographic region, and size scale.
- **Collapsible Mobile Drawer**: Mobile-first filter panel with slide-over drawer navigation for touchscreens.
- **Enriched Scientific Fact Banks**: 100% of species cataloged with verified, peer-reviewed paleontological and anatomical facts.

### 2. 🎨 Verified Paleoart Media Hierarchy
- **Strict Tier Classification**:
  - **Tier 1 (Highest Priority)**: Coloured, full-size PNG species-specific life reconstructions showing the complete living animal in naturalistic posture.
  - **Tier 2**: Full-scene colored restorations and landscape paleoart.
  - **Tier 3**: Monochrome / silhouette life restorations.
  - **Tier 4**: Authentic skeletal mounts, fossil photographs, and holotype diagrams (fallback when no life art exists).
  - **Tier 5**: Pending placeholders for rare species with zero public domain artwork.
- **2D Scale Calibration Invariant**: Silhouettes used for the 2D Metric Projection Stage must depict the complete, horizontal lateral body profile of the animal in naturalistic walking/flying posture. Partial skull/crest busts or diagonally rearing poses are strictly prohibited.
- **Licensing & Attribution Compliance**: 100% CC-BY, CC-BY-SA, and Public Domain attribution metadata preserved.
- **Supabase Storage Integration**: Self-hosted image pipeline storing high-res media directly inside public Supabase Storage buckets (`species-media/` and `species-silhouettes/`).

### 3. 📐 1:1 Calibrated 2D Scale Comparison & Multi-Specimen Runway
- **2D Metric Projection Stage**:
  - 1:1 calibrated physical scale projection with dynamic architectural caliper dimension lines.
  - Interactive reference model switcher: **Human (1.8m)**, **Sedan Vehicle (4.5m)**, **Transit Bus (11.5m)**, and **African Bush Elephant (3.3m)**.
  - Metric grid toggle, orientation flip, and smart occlusion handling.
- **Multi-Specimen Caliper Runway (`/runway`)**:
  - Grand architectural runway projecting **up to 6 prehistoric creatures simultaneously** on a unified calibrated Cartesian SVG stage.
  - Real-time length and height caliper lines with tabular numeric badges (`m` and `ft`).
  - Interactive Lineup Tray with drag/reorder controls and quick add from the 596-species roster.
  - **Curated Matchup Presets**: *Clash of Megatheropods*, *Titans of the South*, *Azhdarchid Aerial Armada*, *Armored Bastions*.
  - **Comparative Differential Matrix**: Proportional comparison table highlighting length, height, and mass differentials.

### 4. 🗺️ Interactive Geologic Time-Map & Continental Drift Engine
- **Dual Cartographic Modes**:
  - **Modern Formations**: 31 global fossil formations on an interactive Leaflet dark-matter map.
  - **Deep-Time Continental Drift (`PaleoDriftViewer.tsx`)**: Reconstructed plate tectonics across deep geological epochs (Late Triassic 220 Ma, Late Jurassic 150 Ma, Late Cretaceous 70 Ma, Pleistocene 0.1 Ma).
- **Paleo-Coordinates for Fossil Beds**: Illustrates the true paleogeographic latitudes where ancient strata originated.
- **Indian Subcontinent Showcase**: Special coverage of iconic Indian species (*Rajasaurus*, *Shringasaurus*, *Vasuki*, *Barapasaurus*, *Isisaurus*, *Indosuchus*) mapped to the *Lameta Formation*, *Kota Formation*, *Denwa Formation*, and *Siwalik Hills*.

### 5. 🔒 Database Security & Row-Level Security (RLS)
- **RLS Enabled**: Fully protected PostgreSQL schema tables (`Species` and `SpeciesRelation`).
- **Public Read Access**: Granted `SELECT` policy for `anon` and `authenticated` roles.
- **Blocked Public Writes**: Unauthenticated `INSERT`/`UPDATE`/`DELETE` API requests are rejected by RLS.
- **Bypassed Service Writes**: Backend Express server, CLI ingestion tools, and Prisma ORM connect via direct PostgreSQL credentials, bypassing RLS cleanly.

### 6. 🛡️ Permanent Safeguard & Anti-Regression Invariant
> **This project's core rule: scripts that add species must NEVER modify existing rows. If you need to fix/update an existing species' data, that is a separate, manual, reviewed operation — never part of routine seeding or adding new species.**
- **Insert-Only Guarantee**: `backend/prisma/seed.ts` and `backend/scripts/add-species.ts` strictly execute `create()` for genuinely new rows, and reject or skip existing records by normalized name, scientific name, or genus match.
- **Automated Pre/Post Regression Check**: `backend/scripts/verify-no-regression.ts` captures an immutable SHA-256 snapshot of all 25 protected fields before any operation, and verifies all pre-existing records remain 100% untouched post-operation.
- **Hard Failure on Regression**: If any existing record's fields are altered or deleted, the script fails loudly with exit code `1` and aborts.

### 7. 📖 Archival Field Notebook Pavilion (`/notebook`)
- **Personal Research Desk**: Dedicated visitor binder to manage, bookmark, and study prehistoric species.
- **Inline Field Notes & Hypotheses**: Record osteological observations per creature with local persistence.
- **Thematic Tagging Engine**: Organize specimens into custom tags (`Carnivore Apexes`, `Gondwana Fauna`).
- **One-Click Runway Transfer**: Send saved creatures directly onto the Multi-Specimen Caliper Runway.
- **Curatorial Dossier Export**: Formatted Markdown download and print-ready archival layout.

### 8. 🎯 Curator Trials & Gamification Pavilion (`/challenge`)
- **Holotype Detective**: 3 progressive diagnostic clues; identify the prehistoric genus with minimal clues.
- **Caliper Metric Guesser**: Estimate total length in meters against the 1.8m human reference with animated reveals.
- **Chronostratigraphic Sorter**: Arrange prehistoric animals from deepest time to most recent with instant chronostratigraphic checks.
- **Curator Rank Progression**: Climb through 5 museum rank tiers based on score and streak.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, TypeScript, TailwindCSS 4.0, Framer Motion |
| **Smooth Scrolling** | Lenis (`lenis`) |
| **Mapping & Icons** | Leaflet, React-Leaflet, Lucide React Icons |
| **AI Intelligence** | Google Gemini API (`@google/genai`), Multimodal Vision, Text Embedding |
| **Vector Database** | PostgreSQL `pgvector` (Cosine distance `<=>`, HNSW index) |
| **Backend API** | Node.js, Express, TypeScript, Zod Schema Validator, Express Rate Limit |
| **Database & ORM** | PostgreSQL, Prisma ORM, Supabase Object Storage |
| **Security & RLS** | PostgreSQL Row-Level Security (RLS), Service Role Bypass |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: Supabase or local instance with `vector` extension enabled
- **Google Gemini API Key**: Free tier key from [Google AI Studio](https://aistudio.google.com/)

---

### 1. Database & Backend Installation

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Configure environment variables in backend/.env
DATABASE_URL="postgresql://postgres:password@host:5432/postgres?schema=public"
PORT=5000
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
GEMINI_API_KEY="your-free-gemini-api-key"

# 4. Generate Prisma Client
npm run prisma:generate

# 5. Seed the database with the pre-compiled 596-species dataset
npm run prisma:seed

# 6. Initialize AI tables & embed all species in pgvector
npx tsx scripts/init-ai-tables.ts
npx tsx scripts/embed-all-species.ts

# 7. Start the Express server
npm run dev
```
The backend API will launch on `http://localhost:5000`.

---

### 2. Frontend Installation

```bash
# 1. Navigate to frontend directory
cd ../frontend

# 2. Install dependencies
npm install

# 3. Start Vite development server
npm run dev
```
The interactive web application will open at `http://localhost:5173`.

---

### 3. Verification & Automated Safeguards

```bash
# Verify 100% database safeguard integrity (596 species untouched)
npm run safeguard:check

# Run end-to-end verification of all 5 AI features
npx tsx scripts/verify-ai-features.ts
```

---

## 📁 Repository Structure

```text
Prehistorica/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma                  # Database schema & RLS definitions
│   │   ├── seed.ts                        # Insert-only seed script with pre/post regression verification
│   │   ├── species_triassic.json          # Verified Triassic fauna dataset
│   │   ├── species_jurassic.json          # Verified Jurassic fauna dataset
│   │   ├── species_cretaceous.json        # Verified Cretaceous fauna dataset
│   │   ├── species_others.json            # Paleozoic & Cenozoic fauna dataset
│   │   └── species_full_export.json       # Complete 596-species master export
│   ├── scripts/
│   │   ├── add-species.ts                 # Ingestion CLI with duplicate rejection & safeguard checks
│   │   ├── verify-no-regression.ts        # Anti-regression snapshot & verification engine
│   │   ├── init-ai-tables.ts              # pgvector & AI auxiliary table initialization
│   │   ├── embed-all-species.ts           # Vector projection of all species into pgvector
│   │   └── verify-ai-features.ts          # Automated end-to-end AI feature verification
│   ├── src/
│   │   ├── app.ts                         # Express application setup & rate limiting
│   │   ├── server.ts                      # Server entry point
│   │   ├── dns-init.ts                    # Windows IPv4 DNS priority configuration
│   │   ├── controllers/
│   │   │   ├── ai.ts                      # Curator, Fossil Lens, Matchup, Semantic & Food Web endpoints
│   │   │   ├── species.ts                 # Species queries & filtering
│   │   │   └── formation.ts               # Fossil formation queries
│   │   ├── services/
│   │   │   ├── gemini.ts                  # Unified Gemini client, fallback cascades & prompt engineering
│   │   │   └── vectorStore.ts             # pgvector cosine similarity search
│   │   └── routes/                        # API route endpoints
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/                            # High-DPI Logo, Multi-size Favicons & SVGs
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChiefCuratorModal.tsx      # RAG docent modal with speech synthesis & exhibit links
│   │   │   ├── FossilLensModal.tsx        # Multimodal osteology fossil identifier
│   │   │   ├── RunwayMatchupModal.tsx     # Biomechanical matchup simulator modal
│   │   │   ├── FoodWebModal.tsx           # Paleo-biome food web & stressor simulation modal
│   │   │   ├── SearchAutocomplete.tsx     # Search bar with AI semantic mode toggle
│   │   │   ├── RunwayStage.tsx            # Calibrated Cartesian SVG runway stage
│   │   │   ├── PaleoDriftViewer.tsx       # Deep-time continental drift viewer
│   │   │   └── TwoDScaleViewer.tsx        # 1:1 metric projection caliper stage
│   │   ├── pages/                         # Home, Browse, SpeciesDetail, TimeMap, CaliperRunway, FieldNotebook, PaleoChallenge
│   │   ├── services/                      # REST API client with AI endpoints & TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── AGENTS.md                              # Curatorial & database safeguard guidelines
├── README.md                              # Complete architectural documentation
└── .gitignore
```

---

## 📜 License & Citation

All software code is open under the **MIT License**.  
All paleoart, illustrations, and media entries preserve their original licenses (`CC BY`, `CC BY-SA`, `Public Domain`) and individual artist credits cited on each specimen exhibit page.
