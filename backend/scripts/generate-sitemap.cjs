const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://prehistorica.vercel.app';
const exportPath = path.join(__dirname, '..', 'prisma', 'species_full_export.json');
const outputPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'sitemap.xml');

const species = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
const today = new Date().toISOString().split('T')[0];

const staticRoutes = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: '/browse', priority: '0.9', changefreq: 'daily' },
  { path: '/timemap', priority: '0.9', changefreq: 'weekly' },
  { path: '/extinctions', priority: '0.9', changefreq: 'monthly' },
  { path: '/cladogram', priority: '0.8', changefreq: 'monthly' },
  { path: '/runway', priority: '0.8', changefreq: 'monthly' },
  { path: '/challenge', priority: '0.7', changefreq: 'weekly' },
  { path: '/notebook', priority: '0.6', changefreq: 'monthly' }
];

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

// 1. Add static pavilion routes
for (const r of staticRoutes) {
  xml += '  <url>\n';
  xml += `    <loc>${DOMAIN}${r.path}</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>${r.changefreq}</changefreq>\n`;
  xml += `    <priority>${r.priority}</priority>\n`;
  xml += '  </url>\n';
}

// 2. Add all cataloged species exhibit routes
for (const s of species) {
  const modDate = s.updatedAt ? new Date(s.updatedAt).toISOString().split('T')[0] : today;
  xml += '  <url>\n';
  xml += `    <loc>${DOMAIN}/species/${s.id}</loc>\n`;
  xml += `    <lastmod>${modDate}</lastmod>\n`;
  xml += '    <changefreq>monthly</changefreq>\n';
  xml += '    <priority>0.8</priority>\n';
  xml += '  </url>\n';
}

xml += '</urlset>\n';

fs.writeFileSync(outputPath, xml, 'utf8');
console.log(`✓ Successfully generated sitemap.xml with ${staticRoutes.length + species.length} URLs at ${outputPath}`);
