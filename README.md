# 🏛️ PREHISTORICA — The Modern Museum Pavilion Encyclopedia

> **A premium, full-stack, architectural digital museum dedicated to cataloging and visualizing Earth's prehistoric fauna.**
> *Spanning 540 million years of natural history across 462 verified species, 31 global fossil formations, and 10 geologic eras.*

---

## 🌟 Modern Museum Pavilion Highlights

### 🎨 Explicit Art Direction — Rejecting Generic SaaS Aesthetics
Built around **The Modern Museum Pavilion** visual language. **Prehistorica** explicitly rejects generic AI-generated dark dashboards, blurred frosted glass, and uniform grid boxes:
- **Editorial Typographic Hierarchy**: Monospaced exhibit tags, serif scientific nomenclature, and high-contrast amber headers.
- **Asymmetric Spatial Focus**: 1–2 dominant architectural elements per screen with varied scale and broken grid rhythm.
- **Low-Poly 3D Specimen Viewport**: Built with React Three Fiber / Three.js, featuring 1:1 scale rendering against a 1.8m architectural human reference figure, orbit lighting, and mesh wireframe toggle.
- **Fossil Starfield Particle Stage**: Interactive 3D ambient particle system creating a deep museum atmosphere.

---

## 🦖 Key Features

### 1. 🔍 Catalog Pavilion & Architectural Search
- **462 Verified Species**: Comprehensive database covering Theropods, Sauropods, Pterosaurs, Marine Reptiles, Early Synapsids, Amphibians, and Megafauna.
- **Combinable Filters**: Search across taxonomic clade, dietary type (carnivore, herbivore, omnivore, piscivore, filter-feeder), habitat (terrestrial, semi-aquatic, freshwater, aerial, marine), geologic era, geographic region, and size scale.
- **Collapsible Mobile Drawer**: Mobile-first filter panel with slide-over drawer navigation for 375px/428px touchscreens.

### 2. 🎨 Verified Paleoart Media Hierarchy (441 Tier 1 Reconstructions)
- **Strict Tier Classification**:
  - **Tier 1 (95.5% | 441 Species)**: Full-color life reconstructions and paleoart showing the living animal in naturalistic pose.
  - **Tier 2 (0.9% | 4 Species)**: Monochrome / silhouette life restorations.
  - **Tier 3 (2.2% | 10 Species)**: Authentic skeletal mounts, fossil photographs, and holotype diagrams (used only when no life art exists).
  - **Tier 4 (1.5% | 7 Species)**: Pending placeholders for rare species with zero public domain artwork on Wikimedia Commons.
- **Licensing & Attribution Compliance**: 100% CC-BY, CC-BY-SA, and Public Domain attribution metadata preserved and displayed on every specimen profile.
- **Supabase Storage Integration**: Self-hosted image pipeline storing high-res media directly inside public Supabase Storage buckets (`species-media/`).

### 3. 🗺️ Interactive Geologic Time-Map & Global Formations
- **10 Geologic Eras**: Cambrian, Devonian, Carboniferous, Permian, Triassic, Jurassic, Cretaceous, Eocene, Neogene, and Pleistocene.
- **31 Global Fossil Formations**: Interactive Leaflet dark-matter map pins mapping native fossil formations (Hell Creek, Solnhofen, Dinosaur Park, Yixian, Djadochta, Kem Kem Beds, Karoo Basin, and more).
- **Indian Subcontinent Showcase**: Special coverage of iconic Indian species (*Rajasaurus narmadensis*, *Shringasaurus indicus*, *Vasuki indicus*, *Barapasaurus*, *Isisaurus*, *Indosuchus*) mapped to the *Lameta Formation*, *Kota Formation*, *Denwa Formation*, and *Siwalik Hills*.

### 4. ⚖️ Side-by-Side Specimen Comparison Tool
- Interactive comparison modal allowing visitors to select any 2 species to analyze length, standing height, estimated mass, clade, geologic era, and fossil formation side-by-side.

### 5. 🔒 Database Security & Row-Level Security (RLS)
- **RLS Enabled**: Fully protected PostgreSQL schema tables (`Species` and `SpeciesRelation`).
- **Public Read Access**: Granted `SELECT` policy for `anon` and `authenticated` roles (`Allow public read access`).
- **Blocked Public Writes**: Unauthenticated `INSERT`/`UPDATE`/`DELETE` API requests are rejected by RLS.
- **Bypassed Service Writes**: Backend Express server, CLI ingestion tools, and Prisma ORM connect via direct PostgreSQL credentials, bypassing RLS cleanly.

### 6. 📱 Multi-Device Responsive Architecture
- Verified 100% pixel-perfect responsive behavior across:
  - **Mobile**: 375px (iPhone SE)
  - **Mobile Large**: 428px (iPhone Pro Max)
  - **Tablet**: 768px (iPad / Android Tablet)
  - **Desktop**: 1440px (High-DPI Desktop Monitors)

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

# 5. Seed the database with pre-compiled 462-species dataset
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

### 3. Official Species Ingestion CLI Tool

Add new species to the encyclopedia with strict Zod validation:

```bash
# Run CLI tool dry-run check
npm run add-species -- ./path/to/new_species.json --dry-run

# Commit new species to PostgreSQL
npm run add-species -- ./path/to/new_species.json
```
Reference `backend/scripts/species-template.json` for required schema standards.

---

## 📁 Repository Structure

```text
Prehistorica/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema & RLS definitions
│   │   ├── seed.ts             # Seeding script for 462 species
│   │   ├── species_triassic.json
│   │   ├── species_jurassic.json
│   │   ├── species_cretaceous.json
│   │   └── species_others.json
│   ├── scripts/
│   │   ├── add-species.ts      # Official CLI ingestion tool
│   │   ├── species-template.json
│   │   ├── ingest_species_batch.js
│   │   └── run_all_remaining_batches.js
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── controllers/
│   │   └── routes/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/                 # SVG assets and icons
│   ├── src/
│   │   ├── components/         # Navbar, 3D Viewport, Media Gallery, Compare Modal, Starfield
│   │   ├── pages/              # Home, Browse, SpeciesDetail, TimeMap
│   │   ├── services/           # REST API client & TypeScript interfaces
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
