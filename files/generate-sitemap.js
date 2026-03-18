// Run this locally: node generate-sitemap.js
// It reads all your plant JSON files and writes a full sitemap.xml
// Run it every time you add new plants, then commit the updated sitemap.xml

const fs = require('fs');
const path = require('path');

const SITE = 'https://simpleplantcare.co';
const FILES = ['plants.json','houseplants.json','vegetables.json','herbs.json','fruits.json','flowers-shrubs.json'];

const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

let allPlants = [];
FILES.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      allPlants = allPlants.concat(data);
      console.log(`Loaded ${data.length} plants from ${file}`);
    } catch(e) {
      console.log(`Skipping ${file}: ${e.message}`);
    }
  }
});

const today = new Date().toISOString().split('T')[0];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <lastmod>${today}</lastmod>
  </url>
`;

allPlants.forEach(p => {
  const slug = slugify(p.name);
  xml += `  <url>
    <loc>${SITE}/#/plants/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <lastmod>${today}</lastmod>
  </url>
`;
});

xml += `</urlset>`;

fs.writeFileSync('sitemap.xml', xml);
console.log(`\nSitemap generated with ${allPlants.length + 1} URLs`);
console.log('File saved: sitemap.xml');
