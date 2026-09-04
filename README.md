<div align="center">
  <img src="frontend/public/logo.png" alt="Prehistorica Museum Crest" width="160" />
  <h1>🏛️ PREHISTORICA</h1>
  <h3>The Modern Museum Pavilion Encyclopedia</h3>
  <p><strong>A premium, full-stack, architectural digital museum dedicated to cataloging and visualizing Earth's prehistoric fauna.</strong></p>
  <p><em>Spanning 540 million years of natural history across 502 verified species, 31 global fossil formations, and 10 geologic eras.</em></p>
</div>

---

## 🌟 Modern Museum Pavilion Highlights

### 🎨 Explicit Art Direction — Rejecting Generic SaaS Aesthetics
Built around **The Modern Museum Pavilion** visual language. **Prehistorica** explicitly rejects generic AI-generated dark dashboards, blurred frosted glass, and uniform grid boxes:
- **Official Museum Crest**: Distinctive hand-crafted archival seal depicting iconic prehistoric clades (Pterosauria, Tyrannosauroidea, Ceratopsia, early Synapsida) surrounding an ammonite fossil shield with laurel bone knotwork.
- **Editorial Typographic Hierarchy**: Monospaced exhibit tags, serif scientific nomenclature, and high-contrast amber headers.
- **Asymmetric Spatial Focus**: 1–2 dominant architectural elements per screen with varied scale and broken grid rhythm.
- **Dual Scale Stages (2D & 3D)**: Both 3D interactive mesh viewports and 1:1 physical metric projection stages for direct comparative anatomy.
- **Fossil Starfield Particle Stage**: Interactive 3D ambient particle system creating a deep museum atmosphere.

---

## 🦖 Key Features

### 1. 🔍 Catalog Pavilion & Architectural Search
- **502 Verified Species**: Comprehensive database covering Theropods, Sauropods, Ornithischians, Pterosaurs, Marine Reptiles, Early Synapsids, Amphibians, and Invertebrates.
- **Combinable Filters**: Search across taxonomic clade, dietary type (carnivore, herbivore, omnivore, piscivore, filter-feeder), habitat (terrestrial, semi-aquatic, freshwater, aerial, marine), geologic era, geographic region, and size scale.
- **Collapsible Mobile Drawer**: Mobile-first filter panel with slide-over drawer navigation for 375px/428px touchscreens.
- **Enriched Scientific Fact Banks**: 100% of species cataloged with 4–5 verified, peer-reviewed paleontological and anatomical facts.

### 2. 🎨 Verified Paleoart Media Hierarchy
- **Strict Tier Classification**:
  - **Tier 1**: Full-color life reconstructions and paleoart showing the living animal in naturalistic pose.
  - **Tier 2**: Monochrome / silhouette life restorations.
  - **Tier 3**: Authentic skeletal mounts, fossil photographs, and holotype diagrams (used when no life art exists).
  - **Tier 4**: Pending placeholders for rare species with zero public domain artwork on Wikimedia Commons.
- **Licensing & Attribution Compliance**: 100% CC-BY, CC-BY-SA, and Public Domain attribution metadata preserved and displayed on every specimen profile.
- **Supabase Storage Integration**: Self-hosted image pipeline storing high-res media directly inside public Supabase Storage buckets (`species-media/`).

### 3. 📐 Dual-Stage Scale Comparison System
- **2D Metric Projection Stage**:
  - 1:1 calibrated physical scale projection with dynamic architectural caliper dimension lines.
  - Interactive reference model switcher: **Human (1.8m)**, **Sedan Vehicle (4.5m)**, **Transit Bus (11.5m)**, and **African Bush Elephant (3.3m)**.
  - Metric grid toggle, orientation flip (parallel vs. facing creature), and smart occlusion handling to prevent dimension badge overlapping.
- **Low-Poly 3D Specimen Viewport**: Built with React Three Fiber / Three.js, featuring 1:1 scale rendering against a 1.8m architectural human reference figure, orbit lighting, and mesh wireframe toggle.
- **Side-by-Side Specimen Comparison Tool**: Modal allowing visitors to compare any two cataloged species simultaneously with comparative metric differential bars.

### 4. 🗺️ Interactive Geologic Time-Map & Global Formations
- **10 Geologic Eras**: Cambrian, Devonian, Carboniferous, Permian, Triassic, Jurassic, Cretaceous, Eocene, Neogene, and Pleistocene.
- **31 Global Fossil Formations**: Interactive Leaflet dark-matter map pins mapping native fossil formations (Hell Creek, Solnhofen, Dinosaur Park, Yixian, Djadochta, Kem Kem Beds, Karoo Basin, and more).
- **Indian Subcontinent Showcase**: Special coverage of iconic Indian species (*Rajasaurus narmadensis*, *Shringasaurus indicus*, *Vasuki indicus*, *Barapasaurus*, *Isisaurus*, *Indosuchus*) mapped to the *Lameta Formation*, *Kota Formation*, *Denwa Formation*, and *Siwalik Hills*.

### 5. 🔒 Database Security & Row-Level Security (RLS)
- **RLS Enabled**: Fully protected PostgreSQL schema tables (`Species` and `SpeciesRelation`).
- **Public Read Access**: Granted `SELECT` policy for `anon` and `authenticated` roles (`Allow public read access`).
- **Blocked Public Writes**: Unauthenticated `INSERT`/`UPDATE`/`DELETE` API requests are rejected by RLS.
- **Bypassed Service Writes**: Backend Express server, CLI ingestion tools, and Prisma ORM connect via direct PostgreSQL credentials, bypassing RLS cleanly.

### 6. 🛡️ Permanent Safeguard & Anti-Regression Invariant
> **This project's core rule: scripts that add species must NEVER modify existing rows. If you need to fix/update an existing species' data, that is a separate, manual, reviewed operation — never part of routine seeding or adding new species.**
- **Insert-Only Guarantee**: `backend/prisma/seed.ts` and `backend/scripts/add-species.ts` strictly execute `create()` for genuinely new rows, and reject or skip existing records by normalized name, scientific name, or genus match.
- **Automated Pre/Post Regression Check**: `backend/scripts/verify-no-regression.ts` captures an immutable SHA-256 snapshot of all 24 protected fields (`media`, `taxonomy`, `interestingFacts`, `sources`, `sizeEstimate`, `diet`, `habitat`, `clade`, etc.) before any operation, and verifies all pre-existing records remain 100% untouched post-operation.
- **Hard Failure on Regression**: If any existing record's fields are altered or deleted, the script fails loudly with exit code `1` and aborts.

### 7. 📱 Multi-Device Responsive Architecture
- Verified 100% pixel-perfect responsive behavior across:
  - **Mobile**: 375px (iPhone SE)
  - **Mobile Large**: 428px (iPhone Pro Max)
  - **Tablet**: 768px (iPad / Android Tablet)
  - **Desktop**: 1440px (High-DPI Desktop Monitors)

### 8. 🏛️ Fluid Motion Architecture & Ergonomic Standards
- **Critically Damped Spring Physics**: Driven by Framer Motion springs (`stiffness: 350, damping: 28–30`), eliminating rigid linear easings in favor of interruptible, velocity-aware motion.
- **Translucent Glass Architecture**: Museum exhibition panels feature `backdrop-filter: blur(20px) saturate(180%)` with top-rim specular highlights (`box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.12)`), preventing background desaturation when artwork scrolls beneath.
- **Ergonomic Touch Target Compliance**: All mobile interactive elements meet or exceed the **44×44pt** minimum tap target standard with instant pointer-down press feedback (`whileTap={{ scale: 0.92–0.96 }}`).
- **Scroll Boundary Containment**: Enforces `overscroll-behavior: contain` on slide-over drawers to eliminate background page scroll-chaining.
- **Optical Typography & Tabular Numerics**: Headings use negative optical tracking (`-0.025em`) while small labels apply wide tracking (`0.08–0.1em`). Metric dimension calipers use `font-variant-numeric: tabular-nums` to eliminate horizontal number shifting.
- **Comprehensive Motion Accessibility**: Full support for `prefers-reduced-motion` (disabling non-vestibular physical translations), `prefers-reduced-transparency` (rendering solid surfaces), and `prefers-contrast` (sharpening borders).

### 9. 🌊 Fluid Scroll Animations & Interactive Motion
- **Back-to-Top Floating Quick Action (`ScrollToTop.tsx`)**: Glassmorphic action pill that springs into view after 380px of scroll, featuring tactile compression and interruptible smooth scrolling.
- **Viewport-Triggered Reveals (`whileInView`)**:
  - **Landing Pavilion**: Gentle hero scroll depth parallax & dissolve falloff, with spring reveals on the *Specimen of the Day* and *Museum Access Portals*.
  - **Catalog Index**: Species cards smoothly elevate and fade into position as the user scrolls through the 12-item grid.
  - **Exhibit Profiles**: Staggered scroll entrance across the 2D Scale Comparison Stage, Architectural Metric Tiles, Visual Archive, Provenance Notes, and Coexisting Species Ribbon.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, TypeScript, TailwindCSS 4.0, Framer Motion |
| **3D & Graphics** | Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`) |
| **Mapping & Icons** | Leaflet, React-Leaflet, Lucide React Icons |
| **Backend API** | Node.js, Express, TypeScript, Zod Schema Validator |
| **Database & ORM** | PostgreSQL, Prisma ORM, Supabase Object Storage |
| **Security & RLS** | PostgreSQL Row-Level Security (RLS), Service Role Bypass |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Database**: PostgreSQL (via Supabase or local PostgreSQL instance)

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

# 4. Generate Prisma Client
npm run prisma:generate

# 5. Seed the database with the pre-compiled 502-species dataset
npm run prisma:seed

# 6. Start the Express server
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

### 3. Official Species Ingestion CLI Tool & Automated Safeguards

Add new species to the encyclopedia with strict Zod validation and automated anti-regression protection:

```bash
# Run CLI tool dry-run check
npm run add-species -- ./path/to/new_species.json --dry-run

# Commit new species to PostgreSQL (with automated duplicate rejection & snapshot integrity verification)
npm run add-species -- ./path/to/new_species.json

# Run standalone integrity check against current database (502 records)
npm run safeguard:check
```
Reference `backend/scripts/species-template.json` for required schema standards.

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
│   │   └── species_full_export.json       # Complete 502-species master export
│   ├── scripts/
│   │   ├── add-species.ts                 # Ingestion CLI with duplicate rejection & safeguard checks
│   │   ├── verify-no-regression.ts        # Anti-regression snapshot & verification engine
│   │   └── species-template.json          # Reference JSON schema template
│   ├── src/
│   │   ├── app.ts                         # Express application setup
│   │   ├── server.ts                      # Server entry point
│   │   ├── controllers/                   # Species & formation query controllers
│   │   └── routes/                        # API route endpoints
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/                            # High-DPI Logo, Multi-size Favicons & SVGs
│   │   ├── logo.png                       # Master transparent museum crest
│   │   ├── favicon.ico                    # Multi-resolution tab icon
│   │   ├── favicon.svg                    # Vector tab icon
│   │   └── apple-touch-icon.png           # iOS / macOS web clip icon
│   ├── src/
│   │   ├── components/                    # TwoDScaleViewer, ThreeDScaleViewer, ScrollToTop, Navbar, MediaGallery, CompareModal
│   │   ├── pages/                         # Home, Browse, SpeciesDetail, TimeMap
│   │   ├── services/                      # REST API client & TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

---

## 📜 License & Citation

All software code is open under the **MIT License**.  
All paleoart, illustrations, and media entries preserve their original licenses (`CC BY`, `CC BY-SA`, `Public Domain`) and individual artist credits cited on each specimen exhibit page.
