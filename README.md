# Prehistorica: The Prehistoric Fauna Encyclopedia

Prehistorica is a premium full-stack interactive web application that catalogizes and visualizes prehistoric life across Earth's history. Spanning from the Cambrian explosion to the Pleistocene ice age, Prehistorica provides detailed taxonomic, geographic, and historical information for **361 unique prehistoric species**.

---

## 🌟 Key Features

* **Interactive Geologic Time Map**: Slide through different geologic epochs (Cambrian to Pleistocene) and click on verified global fossil formations (e.g., Hell Creek, Solnhofen, Lameta Formation) to discover species found there.
* **361 Richly Populated Species**: Fully detailed entries featuring size parameters, weight, diet details, 8-level taxonomic lineages, reconstruction image links, and geographic ranges.
* **Self-Hosted Supabase Storage Media**: Over **313+ open-licensed life reconstructions** downloaded, verified, and self-hosted in public Supabase Storage (`species-media/`) with full CC-BY / CC-BY-SA attribution compliance.
* **Pending Reconstruction UI**: Elegant dark-theme fallback state for species awaiting open-licensed artwork, with zero fake images.
* **Unified Global Autocomplete Search**: Global live search bar synchronized dynamically with URL query parameters (`?search=...`).
* **Side-by-Side Species Comparison**: Interactive modal comparing length, height, weight, diet, and geologic era between any two creatures.
* **Indian Prehistoric Fauna Showcase**: 11 iconic species from the Indian subcontinent (e.g., *Shringasaurus*, *Rajasaurus*, *Vasuki*, *Sivatherium*, *Stegodon*) mapped to their native formations (*Denwa Formation*, *Lameta Formation*, *Siwalik Hills*).
* **CLI Species Ingestion Tool**: CLI workflow (`npm run add-species`) with Zod schema validation, dry-run testing, and database sanity checks.

---

## 🛠️ Technology Stack

### Frontend
* **Core**: React 18, Vite (TypeScript)
* **Styling**: TailwindCSS 4.0
* **Mapping**: Leaflet & React-Leaflet
* **Icons**: Lucide React

### Backend
* **Core**: Node.js, Express (TypeScript)
* **ORM**: Prisma ORM
* **Database**: PostgreSQL (via Supabase)
* **Storage**: Supabase Object Storage (`species-media`)
* **Validation**: Zod schema validator

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* PostgreSQL Database URL (e.g., Supabase connection string)

### 1. Database & Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory and configure your database URL:
   ```env
   DATABASE_URL="postgresql://username:password@hostname:port/dbname?schema=public"
   PORT=5000
   ```
4. Run migrations to initialize the database schema:
   ```bash
   npx prisma migrate dev
   ```
5. Seed the database with the pre-compiled, structured datasets:
   ```bash
   npm run prisma:seed
   ```
6. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5000`.

---

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The interactive frontend web app will open at `http://localhost:5173`.

---

### 3. CLI Tools

* **Add New Species**:
  ```bash
  npm run add-species -- <json-file-path> [--dry-run]
  ```
* **Template Guidelines**: Reference `backend/scripts/species-template.json` for required schema fields and sourcing standards.

---

## 📁 Repository Structure

```text
Prehistorica/
├── backend/
│   ├── prisma/             # Schema definitions, seeds, and JSON datasets
│   ├── reports/            # Image sourcing research reports
│   ├── scripts/            # CLI tools, storage setup, and batch ingestion scripts
│   │   ├── add-species.ts  # CLI species ingestion tool
│   │   └── species-template.json
│   ├── src/                # Express controllers, routes, and server logic
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/             # Vector assets, SVG icons, and illustrations
│   ├── src/
│   │   ├── components/     # Layout, navbar, search autocomplete, and media gallery
│   │   ├── pages/          # Home, Browse catalog, SpeciesDetail, and TimeMap
│   │   └── services/       # API client & TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
└── PROJECT_OVERVIEW.md
```
