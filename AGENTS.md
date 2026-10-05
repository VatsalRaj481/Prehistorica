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

---

## 5. 🧬 Taxonomy & Extant Relatives Verification Skill

---
name: taxonomy-relatives-verification
description: Use whenever adding, editing, or reviewing any specimen's taxonomy (domain to species), "Closest Extant Relatives", ancestry/descendant wording, or lineage claims. Ensures phylogenetic claims are sourced, current, and never inferred from resemblance.
---

# Taxonomy & Extant Relatives Verification

## When to run
Any change touching: taxonomic ranks, extant relatives, "ancestor/descendant" language,
lineage text, or the docent's phylogenetic statements about a specimen.

## Checklist (all must pass)
1. **Class sanity check.** Relatives must belong to the same major lineage as the
   specimen's accepted placement (mammals → mammal lineages, squamates → squamates, etc.).
   Never default to "birds and crocodilians" for a non-archosaur.
2. **Ranks are current.** Verify Order/Family/Genus/Species against a current authoritative
   source. Replace obsolete groupings. Each value must sit in the correct rank field.
3. **Relatives ≠ descendants ≠ analogues.** Store and display closest extant lineage,
   ecological analogue, morphological analogue, and direct descendant separately.
4. **No resemblance-based claims.** Convergent shape or ecology is not kinship.
5. **No false precision.** Unresolved cases use "Uncertain" or "Nearest living relatives:
   [group], though the precise relationship remains debated."
6. **Sources required.** Each corrected fact records a source (peer-reviewed paper >
   museum/institution > university > established taxonomic database > reputable
   publication). No blogs, SEO sites, unsourced Wikipedia-derived data, or AI-generated text.
7. **Conflicts.** If reputable sources disagree, note why, prefer the more recent
   interpretation when justified, and preserve the uncertainty in the record.
8. **Unverified means flagged.** If no adequate source is found, set `verified: false`
   and use the uncertain wording. Never guess.

## Output
Report per changed record: old value, new value, source(s), confidence status.
Do not batch-apply changes without listing them for human review.

---

## 6. 📱 Responsive & Cross-Device Layout Invariant (Mobile to Desktop Flexibility)
Whenever creating, modifying, or refactoring any frontend component or page, it must be engineered for fluid responsiveness across all device form factors (mobile phones, small screens, tablets, laptops, and ultra-wide desktops):
- **Fluid Layouts Over Fixed Dimensions**:
  - Never use rigid, fixed pixel widths (`w-[1200px]`, `min-w-[900px]`) that cause horizontal viewport overflow.
  - Use responsive container widths (`w-full`, `max-w-7xl`, `mx-auto`), responsive flex layouts (`flex-col md:flex-row`), and adaptive CSS grids (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).
- **Interactive Stages & Visualizations**:
  - Metric canvases, comparison stages (e.g. `RunwayStage`, `TwoDScaleViewer`), timeline maps, and charts must either scale proportionally with container width (`w-full aspect-[...]`, SVG viewBoxes) or provide smooth, touch-friendly horizontal scroll containers (`overflow-x-auto` with clean scrollbars and touch indicators).
- **Modals, Drawers & Overlays**:
  - Dialogue overlays and filter panels must adapt cleanly to small screens (e.g., bottom-sheet drawers or full-screen scrollable views on mobile `< 768px`, centered dialog cards on desktop `>= 768px`).
  - Use dynamic viewport units (`100dvh`, `max-h-[90vh]`) to prevent mobile browser URL bar clipping.
- **Touch & Mobile Ergonomics**:
  - Touch targets for interactive buttons, tabs, and toggles must meet mobile accessibility standards (minimum 44×44px hit area or ample padding).
  - Ensure typography scales comfortably across devices (e.g. `text-sm sm:text-base md:text-lg`).
- **Zero Horizontal Body Overflow**:
  - Top-level layout containers must prevent unwanted horizontal viewport scrolling (`overflow-x-clip` or `overflow-x-hidden` on page wrappers where applicable).
- **Mandatory Multi-Viewport Verification**:
  - Every UI modification must be validated against standard breakpoint tiers (`360px–420px` mobile, `768px` tablet, `1024px` desktop, `1440px+` wide screen) and compile error-free (`npm run build`).


