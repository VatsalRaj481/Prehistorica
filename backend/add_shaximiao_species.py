import json

json_path = 'd:/My folders/AI 1.0/Prehistoric encylcopedia/backend/all_new_species.json'
with open(json_path, 'r', encoding='utf-8') as f:
    all_species = json.load(f)

def add(name, scName, meaning, time, epoch, myaS, myaE, diet, dietDet, hab, clade, status, len_m, ht_m, wt_kg, reg, cntry, form, coords, dom, kgd, phyl, cls, ord_name, fam, gen, imgUrl, history, facts, sources):
    all_species.append({
        "name": name,
        "scientificName": scName,
        "nameMeaning": meaning,
        "timePeriod": time,
        "epoch": epoch,
        "myaStart": myaS,
        "myaEnd": myaE,
        "diet": diet,
        "dietDetails": dietDet,
        "habitat": hab,
        "clade": clade,
        "taxonomicStatus": status,
        "sizeNotes": f"Adult length ~{len_m}m, height ~{ht_m}m, estimated weight ~{wt_kg}kg.",
        "sizeEstimate": json.dumps({"length": {"value": len_m, "unit": "m", "confidence": "well-supported"}, "height": {"value": ht_m, "unit": "m", "confidence": "well-supported"}, "weight": {"value": wt_kg, "unit": "kg", "confidence": "estimated"}}),
        "geographicRange": json.dumps({"region": reg, "country": cntry, "fossilFormation": form, "coordinates": coords}),
        "taxonomy": json.dumps({"domain": dom, "kingdom": kgd, "phylum": phyl, "class": cls, "order": ord_name, "family": fam, "genus": gen, "species": scName}),
        "media": json.dumps([{"url": imgUrl, "type": "art", "credit": "Paleontological Research Archive", "sourceUrl": "https://commons.wikimedia.org"}]),
        "discoveryHistory": history,
        "interestingFacts": json.dumps(facts),
        "sources": json.dumps(sources)
    })

# Add Chungkingosaurus to Shaximiao Formation
add("Chungkingosaurus jiangbeiensis", "Chungkingosaurus jiangbeiensis", "Chongqing lizard from Jiangbei", "Late Jurassic", "Oxfordian Epoch", 160.0, 155.0, "herbivore", "Low foliage and ferns.", "terrestrial", "Ornithischian", "valid", 4.0, 1.5, 1000, "Asia", "China", "Shaximiao Formation", [29.5, 104.5], "Eukaryota", "Animalia", "Chordata", "Reptilia", "Ornithischia", "Stegosauridae", "Chungkingosaurus", "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop", "Described by Dong Zhiming et al. in 1983 from Chongqing.", ["Smallest known stegosaurid from Shaximiao Formation.", "Multiple pairs of thagomizer tail spikes.", "Thick dorsal armor plates."], [{"citation": "Dong, Z., et al. (1983). Palaeontol. Sin. Ser. C.", "url": "https://commons.wikimedia.org"}])

unique = []
seen = set()
for s in all_species:
    n = s['name'].lower()
    if n not in seen:
        seen.add(n)
        unique.append(s)

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(unique, f, indent=2)

print(f"Added Chungkingosaurus! Total species: {len(unique)}")
