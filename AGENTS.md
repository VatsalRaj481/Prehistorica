# Prehistorica Developer & AI Agent Guidelines

Welcome to **Prehistorica: The Modern Museum Pavilion Encyclopedia**. This document establishes the non-negotiable architectural and curatorial invariants that all developers and AI agents must follow when modifying or extending this codebase.

---

## 1. 🛡️ Permanent Safeguard & Anti-Regression Invariant
- **Insert-Only Policy for New Additions**: When adding new species, never modify, overwrite, or upsert existing database rows.
- **Reviewed Operations Only for Corrections**: If an existing species record requires factual or visual correction (e.g. updated paleoart, revised size measurements, or replaced silhouettes), that operation must be a distinct, manually audited migration script with pre- and post-operation snapshot verification.
- **Automated Verification**: Before committing or finalizing any database operation, verify that 100% of non-target species records remain untouched and uncorrupted.

---

## 2. 🎨 Curatorial Paleoart Media Hierarchy & Priorities
When selecting or upgrading artwork for species profiles:
1. **Priority 1 (Highest Priority)**: **Coloured, full-size PNG species-specific life restorations** featuring the complete living animal in naturalistic posture (transparent or clean isolated backdrops strongly preferred).
2. **Priority 2**: Full-scene colored restorations and landscape paleoart depicting the animal in its native habitat.
3. **Priority 3**: Monochrome / detailed life sketches.
4. **Priority 4**: Authentic skeletal mounts, fossil photographs, and holotype diagrams (strictly used only when no life restorations exist).
5. **Priority 5**: Pending placeholders for rare species with zero public domain artwork on Wikimedia Commons.

> **Crucial Rule**: Never use photographs of fossil museum displays or skeletal mounts if a reputable, peer-reviewed life restoration is available.

---

## 3. 📐 2D Scale Comparison Silhouette Calibration Invariant
Prehistorica features a 1:1 calibrated metric projection stage that compares cataloged species directly against an architectural human (1.8m), sedan car (4.5m), transit bus (11.5m), and African bush elephant (3.3m).
- **Full Horizontal Lateral Profile**: Comparison silhouettes must depict the **complete body** (head, torso, limbs, and tail) in horizontal walking, standing, or flying posture.
- **Strictly Prohibited**:
  - **Head / Neck / Crest Busts**: Partial silhouettes cause scale comparison stages to scale the bust to the entire length of the animal (e.g. turning an 8m hadrosaur head into an 8.4m giant monster).
  - **Diagonally Rearing Poses**: Silhouettes angled upward distort horizontal metric dimension lines and caliper tags.
- **Licensing**: Silhouettes sourced from PhyloPic must be verified for commercial/open reuse (CC0, CC BY, or CC BY-SA). Non-commercial (NC) or No-Derivatives (ND) licenses are prohibited.
- **Storage**: Silhouettes should be mirrored as vector SVGs in Supabase Storage (`species-silhouettes/`) with full contributor attribution and source links.

---

## 4. 🗄️ Static JSON Archives Synchronization
Whenever database updates or additions are completed, keep the static JSON archives synchronized:
- `backend/prisma/species_jurassic.json`
- `backend/prisma/species_cretaceous.json`
- `backend/prisma/species_triassic.json`
- `backend/prisma/species_others.json`
- `backend/prisma/species_full_export.json`
