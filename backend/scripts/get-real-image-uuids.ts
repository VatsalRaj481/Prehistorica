import './../src/dns-init.js';

async function findRealImage(name: string) {
  const nodeRes = await fetch(`https://api.phylopic.org/nodes?build=552&filter_name=${encodeURIComponent(name.toLowerCase())}&page=0&embed_items=true`);
  const nodeData = await nodeRes.json();
  const nodes = nodeData._embedded?.items || [];
  for (const n of nodes) {
    const nodeHref = n._links?.self?.href;
    const nodeUuid = nodeHref?.match(/\/nodes\/([a-f0-9-]+)/)?.[1];
    if (!nodeUuid) continue;
    const imgRes = await fetch(`https://api.phylopic.org/images?build=552&filter_clade=${nodeUuid}&page=0&embed_items=true`);
    const imgData = await imgRes.json();
    const imgs = imgData._embedded?.items || [];
    for (const img of imgs) {
      const imgHref = img._links?.self?.href;
      const imgUuid = imgHref?.match(/\/images\/([a-f0-9-]+)/)?.[1];
      const lic = img._links?.license?.href;
      if (imgUuid && (lic?.includes('publicdomain/zero') || lic?.includes('by/') || lic?.includes('by-sa/'))) {
        console.log(`Clade: "${name}" -> Image UUID: "${imgUuid}" | Title: "${img._links?.self?.title}" | License: "${lic}" | Contributor: "${img._links?.contributor?.title}"`);
        return { name, imgUuid, title: img._links?.self?.title, license: lic, contributor: img._links?.contributor?.title };
      }
    }
  }
  console.log(`No image found for ${name}`);
  return null;
}

async function run() {
  await findRealImage('Allosaurus fragilis'); // Theropod
  await findRealImage('Camarasaurus supremus'); // Sauropod
  await findRealImage('Laquintasaura venezuelae'); // Ornithischian
  await findRealImage('Pterodactylus antiquus'); // Pterosaur
  await findRealImage('Rhomaleosaurus cramptoni'); // Marine Reptile
  await findRealImage('Stagonolepis robertsoni'); // Aetosaur
  await findRealImage('Diandongosuchus fuyuanensis'); // Phytosaur
  await findRealImage('Postosuchus kirkpatricki'); // Rauisuchian
  await findRealImage('Effigia okeeffeae'); // Poposauroid
  await findRealImage('Archaeovenator hamiltonensis'); // Synapsid
  await findRealImage('Ichthyostega stensioei'); // Amphibian
}

run().then(() => process.exit(0)).catch(console.error);
