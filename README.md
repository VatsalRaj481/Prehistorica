<div align="center">
  <img src="frontend/public/logo.png" alt="Prehistorica Museum Crest" width="160" />
  <h1>🏛️ PREHISTORICA</h1>
  <h3>The Modern Museum Pavilion Encyclopedia & AI Research Pavilion</h3>
  <p><strong>A premium, full-stack, architectural digital museum dedicated to cataloging, visualizing, and researching Earth's prehistoric fauna with grounded AI.</strong></p>
  <p><em>Spanning over half a billion years of natural history across 800+ cataloged species, 31 global fossil formations, the Big Five mass extinctions, and 10 geologic eras.</em></p>

  <p>
    <a href="https://github.com/VatsalRaj481/Prehistorica/actions/workflows/ci.yml">
      <img src="https://github.com/VatsalRaj481/Prehistorica/actions/workflows/ci.yml/badge.svg" alt="CI Verification Status" />
    </a>
    <img src="https://img.shields.io/badge/Cataloged%20Species-800%2B-amber.svg" alt="800+ Species" />
    <img src="https://img.shields.io/badge/Mass%20Extinctions-Big%20Five-crimson.svg" alt="Big Five Extinctions" />
    <img src="https://img.shields.io/badge/Frontend-Vercel-black.svg?logo=vercel" alt="Vercel Deployment" />
    <img src="https://img.shields.io/badge/Backend-Render-46E3B7.svg?logo=render" alt="Render Deployment" />
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" />
    </a>
  </p>
</div>

---

## 🌟 Modern Museum Pavilion Highlights

### 🎨 Explicit Art Direction — Rejecting Generic SaaS Aesthetics
Built around **The Modern Museum Pavilion** visual language. **Prehistorica** explicitly rejects generic AI-generated dark dashboards, blurred frosted glass, and uniform grid boxes:
- **Official Museum Crest**: Distinctive archival seal depicting iconic prehistoric clades (Pterosauria, Tyrannosauroidea, Ceratopsia, early Synapsida) surrounding an ammonite fossil shield with laurel bone knotwork.
- **Editorial Typographic Hierarchy**: Monospaced exhibit tags, serif scientific nomenclature, and high-contrast amber headers.
- **Asymmetric Spatial Focus**: Dominant architectural elements per screen with varied scale and broken grid rhythm.
- **1:1 Metric Caliper Scale Comparison Stage**: Highly calibrated metric projection stage comparing animals directly against reference silhouettes (Human, Car, Bus, Elephant).
- **Interactive Geologic Time-Map & Diorama**: Fluid paleogeographic exploration of fossil formations across geological eras with native ecosystem dioramas.
- **The Extinction Gateway**: Deep-time exploration of the Big Five mass extinctions and Phanerozoic paleoclimate curves spanning more than 538 million years.
- **High-Performance In-Memory Cache**: $O(1)$ RAM caching architecture with automatic PostgreSQL change detection and sub-10ms response times.
- **AI Research Pavilion**: Grounded paleontological RAG agent, osteology fossil vision identifier, biomechanical matchup simulator, vector semantic search, and paleo-trophic web synthesizer.

---

## ⚡ High-Performance In-Memory Caching Engine

Prehistorica features a dual-tier in-memory caching system designed for extreme responsiveness and near-zero server latency:

```mermaid
flowchart TD
    Client[Browser / React App] -->|Query| ClientCache{Client RAM Cache}
    ClientCache -- Hit: Instant --> Render[0ms Instant UI Render]
    ClientCache -- Miss --> API[Express Backend API]
    API --> ServerCache{Server In-Memory Cache}
    ServerCache -- Hit < 1ms --> Response[Return JSON]
    ServerCache -- Check DB Telemetry --> DB[(PostgreSQL / Supabase)]
    DB -->|Count + Max updatedAt| ServerCache
```

1. **Backend $O(1)$ In-Memory Cache Manager** (`backend/src/services/speciesCache.ts`):
   - Holds all 800+ cataloged species pre-parsed in volatile RAM, eliminating repetitive database queries and JSON deserialization overhead.
   - Specimen detail lookups execute in **5–14 ms**; catalog queries and filters respond in **6–12 ms** (down from 350+ ms).
   - Minimal memory footprint: **~4.2 MB total RAM** for all 800+ specimens with precomputed phylogenetic rosters and coexisting species bundles.
2. **Automatic Database Change Detection (Option 1 Revalidation)**:
   - Uses lightweight PostgreSQL telemetry (`_count` and `_max(updatedAt)`) taking ~2ms.
   - Dual-mode revalidation: a 30-second background heartbeat plus throttled request checks (15s).
   - Whenever any new species is inserted or an existing record is edited, the server detects the fingerprint change automatically and refreshes the cache without requiring server restarts.
3. **Client-Side Cache Store** (`frontend/src/services/api.ts`):
   - High-speed in-memory LRU Maps for species details, query parameters, search autocomplete, extinctions, and paleoclimate data.
   - Instant zero-latency back/forward navigation across exhibits.

---

## 🤖 Strategic AI Features (The AI Research Pavilion)

Prehistorica integrates five high-impact AI capabilities specifically designed for vertebrate paleontology, powered by Google's Free Gemini API and Supabase PostgreSQL `pgvector`:

### 1. 🏛️ "The Chief Curator" — Grounded Paleontological RAG Agent
- **Grounded Retrieval-Augmented Generation (RAG)**: Generates 768-dimensional embeddings of visitor questions, runs vector cosine similarity (`<=>`) over the cataloged species records, and injects verified specimen diagnoses as ground truth.
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

## 🦖 Core Museum Features

### 1. 🔍 Catalog Pavilion & Architectural Search
- **800+ Cataloged Species**: Comprehensive database covering Theropods, Sauropods, Ornithischians, Pterosaurs, Marine Reptiles, Early Synapsids & Mammals, Amphibians, and Invertebrates (including newly cataloged species and TotalDino priority 1 paleoart additions).
- **Combinable Filters**: Search across taxonomic clade, dietary type, habitat, geologic era, geographic region, and size scale.
- **Collapsible Mobile Drawer**: Mobile-first filter panel with slide-over drawer navigation for touchscreens.
- **Enriched Scientific Fact Banks**: 100% of species cataloged with verified, peer-reviewed paleontological and anatomical facts.

### 2. 🎨 Verified Paleoart Media Hierarchy & Curatorial Upgrades
- **Strict Tier Classification**:
  - **Tier 1 (Highest Priority)**: Coloured, full-size PNG species-specific life reconstructions showing the complete living animal in naturalistic posture (e.g. Dmitry Bogdanov's *Uintatherium*, Tom Parker's *Stokesosaurus*, Nobu Tamura's *Eotyrannus*, *Raptorex*, *Juratyrant*, *Othnielosaurus*, and TotalDino's comprehensive suite of 295+ full-body transparent archosaurian and dinosaurian restorations).
  - **Tier 2**: Full-scene colored restorations and landscape paleoart.
  - **Tier 3**: Monochrome / silhouette life restorations.
  - **Tier 4**: Authentic skeletal mounts, fossil photographs, and holotype diagrams (strictly used only when no life art exists).
  - **Tier 5**: Pending placeholders for rare species with zero public domain artwork.
- **2D Scale Calibration Invariant**: Silhouettes used for the 2D Metric Projection Stage must depict the complete, horizontal lateral body profile of the animal in naturalistic walking/flying posture. Partial skull/crest busts or diagonally rearing poses are strictly prohibited.
- **Licensing & Attribution Compliance**: 100% CC-BY, CC-BY-SA, and Public Domain attribution metadata preserved.
- **Supabase Storage Integration**: Self-hosted image pipeline storing high-res media directly inside public Supabase Storage buckets (`species-media/` and `species-silhouettes/`).

### 3. 📐 1:1 Calibrated 2D Scale Comparison & Multi-Specimen Runway
- **2D Metric Projection Stage**:
  - 1:1 calibrated physical scale projection with dynamic architectural caliper dimension lines.
  - Interactive reference model switcher: **Human (1.8m)**, **Sedan Vehicle (4.5m)**, **Transit Bus (11.5m)**, and **African Bush Elephant (3.3m)**.
  - **Zero-Margin Silhouette Calibration**: All self-hosted vector silhouettes are tightly calibrated with zero transparent margin offsets (`viewBox` trimmed with zero top, bottom, left, and right gaps), guaranteeing that animal feet touch the ground baseline flush and architectural caliper bars align precisely with snout, tail, and dorsal apex.
  - Metric grid toggle, orientation flip, and smart occlusion handling.
- **Multi-Specimen Caliper Runway (`/runway`)**:
  - Grand architectural runway projecting **up to 6 prehistoric creatures simultaneously** on a unified calibrated Cartesian SVG stage.
  - Real-time length and height caliper lines with tabular numeric badges (`m` and `ft`).
  - Interactive Lineup Tray with drag/reorder controls and quick add from the 800+-species roster.
  - **Curated Matchup Presets**: *Clash of Megatheropods*, *Titans of the South*, *Azhdarchid Aerial Armada*, *Armored Bastions*.
  - **Comparative Differential Matrix**: Proportional comparison table highlighting length, height, and mass differentials.

### 4. 🗺️ Interactive Geologic Time-Map & Continental Drift Engine
- **Dual Cartographic Modes**:
  - **Modern Formations**: 31 global fossil formations on an interactive Leaflet dark-matter map with native ecosystem dioramas (`FormationEcosystemDiorama.tsx`).
  - **Deep-Time Continental Drift (`PaleoDriftViewer.tsx`)**: Reconstructed plate tectonics across deep geological epochs (Late Triassic 220 Ma, Late Jurassic 150 Ma, Late Cretaceous 70 Ma, Pleistocene 0.1 Ma).
- **Paleo-Coordinates for Fossil Beds**: Illustrates the true paleogeographic latitudes where ancient strata originated.
- **Indian Subcontinent Showcase**: Special coverage of iconic Indian species (*Rajasaurus*, *Shringasaurus*, *Vasuki*, *Barapasaurus*, *Isisaurus*, *Indosuchus*) mapped to the *Lameta Formation*, *Kota Formation*, *Denwa Formation*, and *Siwalik Hills*.

### 5. ☄️ The Extinction Gateway & Deep-Time Climate Curves (`/extinctions`)
- **The Big Five Mass Extinctions**: Dedicated exploration of Earth's greatest biocidal events:
  - Late Ordovician (445 Ma)
  - Late Devonian (372 Ma)
  - End-Permian "The Great Dying" (252 Ma)
  - End-Triassic (201 Ma)
  - Cretaceous-Paleogene (K-Pg) (66 Ma)
- **Deep-Time Climate Curves (`DeepTimeClimateGraph.tsx`)**: Multi-curve visualization of global mean surface temperature, atmospheric oxygen ($O_2$), and carbon dioxide ($CO_2$) proxies across the Phanerozoic Eon spanning more than 538 million years.
- **Casualty & Survivor Metrics**: Documented marine/terrestrial genera extinction rates, primary geochemical and bolide triggers, and surviving clades that inherited the planet.

### 6. 📖 Archival Field Notebook Pavilion (`/notebook`)
- **Personal Research Desk**: Dedicated visitor binder to manage, bookmark, and study prehistoric species.
- **Inline Field Notes & Hypotheses**: Record osteological observations per creature with local persistence.
- **Thematic Tagging Engine**: Organize specimens into custom tags (`Carnivore Apexes`, `Gondwana Fauna`).
- **One-Click Runway Transfer**: Send saved creatures directly onto the Multi-Specimen Caliper Runway.
- **Curatorial Dossier Export**: Formatted Markdown download and print-ready archival layout.

### 7. 🎯 Curator Trials & Gamification Pavilion (`/challenge`)
- **Holotype Detective**: 3 progressive diagnostic clues; identify the prehistoric genus with minimal clues.
- **Caliper Metric Guesser**: Estimate total length in meters against the 1.8m human reference with animated reveals.
- **Chronostratigraphic Sorter**: Arrange prehistoric animals from deepest time to most recent with instant chronostratigraphic checks.
- **Curator Rank Progression**: Climb through 5 museum rank tiers based on score and streak.

### 8. 🧬 The Tree of Extinct Life (`/cladogram` & `/tree`)
- **Macro-Evolutionary Systematic Stage**: Traces all 800+ cataloged museum specimens across deep-time lineage splits and defining anatomical synapomorphies.
- **6 Primary Cladistic Divisions**:
  - **Theropoda**: Basal coelophysoids, ceratosaurians, spinosaurids, allosauroids, tyrannosauroids, and maniraptorans.
  - **Sauropodomorpha**: Basal plateosaurs, whiplash diplodocoids, and massive macronarians/titanosaurs.
  - **Ornithischia**: Armored thyreophorans, neornithischians, horned ceratopsians, and duck-billed hadrosauroids.
  - **Pterosauria**: Basal non-pterodactyloids and advanced Cretaceous pterodactyloids.
  - **Marine Reptile Radiations**: Ichthyosauromorphs, long-necked sauropterygians (plesiosaurs/pliosaurs), and apex mosasauroids.
  - **Synapsida & Stem-Mammals**: Robust 3-branch systematic partition:
    1. *Pelycosauria (Sail-Backed Stem-Mammals)* (318–270 Ma): *Dimetrodon*, *Edaphosaurus*.
    2. *Therapsida & Non-Mammalian Cynodontia* (275–200 Ma): Gorgonopsians (*Inostrancevia*, *Gorgonops*), Dicynodonts (*Lystrosaurus*, *Lisowicia*, *Placerias*), and Cynodonts (*Cynognathus*, *Thrinaxodon*).
    3. *Mammaliaformes & Crown Mammals* (210–0 Ma): Mesozoic pioneer mammals (*Morganucodon*, *Juramaia*, *Repenomamus*) plus Cenozoic megafauna and marine cetaceans (*Ankylorhiza tiedemani*, *Basilosaurus*, *Uintatherium*, *Mammuthus*, *Smilodon*).

### 9. 🏛️ Stratigraphic Discontinuity & Wayfinding Pavilion (`/404`)
- **Archival Error Recovery**: Displays a museum error stage for uncataloged URLs, eroded strata, or non-deposited horizons.
- **Powered by React Bits**:
  - `DecryptedText`: Algorithmic text decryption rendering error diagnostics (`DIAGNOSTIC: ERODED STRATUM // HIATUS IN FOSSIL RECORD`).
  - `ShinyText`: Metallic gold shimmer on curatorial classification badges.
  - `Particles`: Ambient deep-time amber sediment dust rendered via WebGL/OGL.
  - `SpotlightCard`: Museum plinth wayfinding cards with spring-tilt dynamics.
  - `Magnet` & `ClickSpark`: Tactile physics and kinetic sparks on navigation triggers.

---

## 🌐 SEO, Crawlability & Google Search Console

Prehistorica is fully optimized for organic search indexation across all major search engines:

- **Robots Directives (`frontend/public/robots.txt`)**: Allows search engine crawlers across all public wings while blocking private API paths.
- **Complete XML Sitemap (`frontend/public/sitemap.xml`)**: Indexes all primary museum pavilions and individual species exhibit pages with prioritized weights and change frequencies.
- **Automated Re-Indexing Tool (`backend/scripts/generate-sitemap.cjs`)**: Automatically re-indexes the master JSON dataset and regenerates `sitemap.xml` whenever new species are curated or modified.

---

## 🚀 CI/CD & Production Deployment Architecture

Prehistorica operates on an automated **Continuous Integration & Continuous Deployment** loop:

```mermaid
flowchart LR
    GitPush[git push origin main] --> CI[GitHub Actions CI]
    CI -->|Quality Gate Passed| CD_Vercel[Vercel: Frontend CD]
    CI -->|Quality Gate Passed| CD_Render[Render: Backend CD]
    CD_Vercel --> LiveApp[Live Web Application]
    CD_Render --> LiveApp
```

1. **Continuous Integration (GitHub Actions)**:
   - Configured in [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
   - Automatically runs on every push and pull request to `main`.
   - Parallel jobs compile backend TypeScript (`tsc --noEmit`), generate Prisma models, and verify the frontend production build (`vite build`).
2. **Continuous Deployment (CD)**:
   - **Frontend**: Hosted on **Vercel** with global Edge CDN caching and SPA client-side routing (`frontend/vercel.json`).
   - **Backend**: Hosted on **Render** as a high-performance Node Web Service configured with zero-downtime rolling deploys.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, TypeScript, TailwindCSS 4.0, Framer Motion |
| **Performance & Caching** | Server In-Memory Cache Manager ($O(1)$ RAM), Client-side LRU Map Caches |
| **Motion & Tactile Components** | React Bits (`framer-motion`, `ogl`, DecryptedText, ShinyText, SpotlightCard, Particles, Magnet, ClickSpark, SlingButton) |
| **Smooth Scrolling** | Lenis (`lenis`) |
| **Mapping & Icons** | Leaflet, React-Leaflet, Lucide React Icons |
| **AI Intelligence** | Google Gemini API (`@google/genai`), Multimodal Vision, Text Embedding |
| **Vector Database** | PostgreSQL `pgvector` (Cosine distance `<=>`, HNSW index) |
| **Backend API** | Node.js, Express, TypeScript, Zod Schema Validator, Express Rate Limit |
| **Database & ORM** | PostgreSQL, Prisma ORM, Supabase Object Storage |
| **Hosting & CI/CD** | GitHub Actions (CI), Vercel (Frontend CD), Render (Backend CD) |
| **SEO & Crawlability** | `robots.txt`, `sitemap.xml` (809 indexed URLs) |

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

# 5. Seed the database with the pre-compiled species dataset
npm run prisma:seed

# 6. Initialize AI tables & embed all species in pgvector
npx tsx scripts/init-ai-tables.ts
npx tsx scripts/embed-all-species.ts

# 7. Start the Express server
npm run dev
```
The backend API will launch on `http://localhost:5000` with automatic in-memory cache pre-warming.

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
# Verify 100% database safeguard integrity (all species untouched)
npm run safeguard:check

# Run end-to-end cache benchmark and revalidation test
npx tsx scripts/verify-cache-performance.ts

# Regenerate complete SEO sitemap for all cataloged species
node scripts/generate-sitemap.cjs

# Run end-to-end verification of all 5 AI features
npx tsx scripts/verify-ai-features.ts
```

---

## 📁 Repository Structure

```text
Prehistorica/
├── .github/
│   └── workflows/
│       └── ci.yml                         # Automated GitHub Actions CI pipeline
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma                  # Database schema & RLS definitions
│   │   ├── seed.ts                        # Insert-only seed script with pre/post regression verification
│   │   ├── species_triassic.json          # Verified Triassic fauna dataset
│   │   ├── species_jurassic.json          # Verified Jurassic fauna dataset (includes Saurophaganax)
│   │   ├── species_cretaceous.json        # Verified Cretaceous fauna dataset (includes Bruhathkayosaurus, Dilong)
│   │   ├── species_others.json            # Paleozoic & Cenozoic fauna dataset (includes Mammuthus columbi, Saltopus)
│   │   └── species_full_export.json       # Complete master export of all cataloged species
│   ├── scripts/
│   │   ├── add-species.ts                 # Ingestion CLI with duplicate rejection & safeguard checks
│   │   ├── verify-no-regression.ts        # Anti-regression snapshot & verification engine
│   │   ├── verify-cache-performance.ts    # Cache benchmark & auto-revalidation suite
│   │   ├── generate-sitemap.cjs           # XML sitemap generator indexing all cataloged specimens
│   │   ├── init-ai-tables.ts              # pgvector & AI auxiliary table initialization
│   │   ├── embed-all-species.ts           # Vector projection of all species into pgvector
│   │   ├── verify-ai-features.ts          # Automated end-to-end AI feature verification
│   │   └── migrate_*.cjs                  # Audited correction migrations with pre/post snapshot verification
│   ├── src/
│   │   ├── app.ts                         # Express application setup & rate limiting
│   │   ├── server.ts                      # Server entry point with cache warm-up on boot
│   │   ├── dns-init.ts                    # Windows IPv4 DNS priority configuration
│   │   ├── controllers/
│   │   │   ├── ai.ts                      # Curator, Fossil Lens, Matchup, Semantic & Food Web endpoints
│   │   │   ├── species.ts                 # Species queries & cache delegation
│   │   │   ├── extinctions.ts              # Big Five mass extinctions & climate curves
│   │   │   └── formation.ts               # Fossil formation queries
│   │   ├── services/
│   │   │   ├── speciesCache.ts            # O(1) in-memory cache manager & automatic change detection
│   │   │   ├── gemini.ts                  # Unified Gemini client, fallback cascades & prompt engineering
│   │   │   └── vectorStore.ts             # pgvector cosine similarity search
│   │   └── routes/                        # API route endpoints
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   │   ├── robots.txt                     # Search engine crawler instructions
│   │   ├── sitemap.xml                    # Complete XML sitemap indexing all species & pavilions
│   │   ├── logo.png                       # High-DPI Museum Crest
│   │   └── favicons & badges              # Multi-size favicons & Rajy expressions
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChiefCuratorModal.tsx      # RAG docent modal with speech synthesis & exhibit links
│   │   │   ├── FossilLensModal.tsx        # Multimodal osteology fossil identifier
│   │   │   ├── RunwayMatchupModal.tsx     # Biomechanical matchup simulator modal
│   │   │   ├── FoodWebModal.tsx           # Paleo-biome food web & stressor simulation modal
│   │   │   ├── DeepTimeClimateGraph.tsx   # Phanerozoic paleoclimate curve visualization
│   │   │   ├── FormationEcosystemDiorama.tsx # Native ecosystem formation dioramas
│   │   │   ├── SearchAutocomplete.tsx     # Search bar with AI semantic mode toggle
│   │   │   ├── RunwayStage.tsx            # Calibrated Cartesian SVG runway stage
│   │   │   ├── CladogramViewer.tsx        # Systematic cladogram stage across 6 major prehistoric clades
│   │   │   ├── PaleoDriftViewer.tsx       # Deep-time continental drift viewer
│   │   │   ├── TwoDScaleViewer.tsx        # 1:1 metric projection caliper stage
│   │   │   ├── SpotlightCard.tsx          # Museum plinth card with spring-tilt elevation
│   │   │   └── reactbits/                 # React Bits: DecryptedText, ShinyText, Particles, Magnet, ClickSpark, SlingButton
│   │   ├── pages/                         # Home, Browse, SpeciesDetail, TimeMap, Extinctions, Cladogram, CaliperRunway, FieldNotebook, PaleoChallenge, NotFound
│   │   ├── services/                      # REST API client with dual-tier in-memory caching
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── package-lock.json
│   ├── vercel.json                        # Vercel SPA routing rewrites
│   └── vite.config.ts
├── README.md                              # Complete architectural documentation
└── .gitignore
```

---

## 📜 License & Citation

All software code is open under the **MIT License**.  
All paleoart, illustrations, and media entries preserve their original licenses (`CC BY`, `CC BY-SA`, `Public Domain`) and individual artist credits cited on each specimen exhibit page.
