# Prehistorica: The Prehistoric Fauna Encyclopedia

Prehistorica is a premium full-stack interactive web application that catalogizes and visualizes prehistoric life across Earth's history. Spanning from the Cambrian explosion to the Pleistocene ice age, Prehistorica provides detailed taxonomic, geographic, and historical information for over 340+ prehistoric creatures.

---

## 🌟 Key Features

* **Interactive Geologic Time Map**: Slide through different geologic epochs (Cambrian to Pleistocene) and click on verified global fossil formations (e.g., Hell Creek, Solnhofen, Lameta Formation) to discover species found there.
* **345 Richly Populated Species**: Fully detailed entries featuring size parameters, weight, diet details, taxonomic lineages, reconstruction image links, and geographic ranges.
* **Structured Paleontological Data**: Each species includes a formatted 3–5 bullet point discovery history (detailing holotype discoveries, name meanings, and description history) alongside key, non-redundant scientific facts.
* **Indian Prehistoric Fauna Showcase**: 10 iconic species from the Indian subcontinent (e.g., the massive Cretaceous theropod *Rajasaurus*, the gigantic Eocene snake *Vasuki*, and the Siwalik Hills ruminant *Sivatherium*) mapped to their native formations (*Lameta Formation*, *Kota Formation*, and *Siwalik Hills*).
* **Multi-Criteria Search & Filter**: Browse the catalog by era, diet, country of origin, and creature type (e.g., Theropods, Sauropods, Pterosaurs, Marine Reptiles, Early Mammals).

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
* **Language Support**: TSX compiler execution

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
   The backend API will run on [http://localhost:5000](http://localhost:5000).

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
   The interactive frontend web app will open at [http://localhost:5173](http://localhost:5173).

---

## 📁 Repository Structure

```
Prehistorica/
├── backend/
│   ├── prisma/             # Schema definitions, seeds, and JSON datasets
│   ├── src/                # Express controllers, routes, and server logic
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/             # Vector assets, svg icons, and illustrations
│   ├── src/
│   │   ├── components/     # Layout, navbar, and footer components
│   │   ├── pages/          # Browse catalog, Home, Map, and Species details
│   │   ├── services/       # Frontend API connection layer
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
└── .gitignore              # Workspace-wide git ignore rules
```

---

## 🎨 Image Sourcing & Media Standards

When contributing new species entries or updating existing records:
* **Primary Artwork Entry (`type: "art"`)**: Must be clean digital life-reconstruction artwork — a full-body illustration on a plain, transparent, or natural background.
* **Prohibited as Primary Art**: Skeletal diagrams, academic figure scans from paper journals, anatomical line drawings, or images with baked-in text, labels, numbers, scale bars, or citation watermarks are **NOT** acceptable as the primary `type: "art"` media entry.
* **Diagrams & Photos**: Skeletal diagrams, muscle reconstructions, and technical paper scans must be categorized under `type: "diagram"` or `type: "scale_diagram"`. Fossil specimen photos belong under `type: "photo"`.
* **Licensing**: Never hotlink or scrape images without confirming open licenses (CC-BY, CC-BY-SA, Public Domain) or obtaining explicit attribution rights.
* **Reference Template**: A standard JSON template for contributing species is located at [`backend/scripts/species-template.json`](file:///d:/My%20folders/AI%201.0/Prehistoric%20encylcopedia/backend/scripts/species-template.json).

---

## 📝 License
This project is open-source. All paleontological data and reconstructions belong to their respective discoverers and illustrators cited within.

