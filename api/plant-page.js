export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const slug = url.pathname.replace('/plants/', '');
  
  const files = ['plants','houseplants','vegetables','herbs','fruits','flowers-shrubs'];
  const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  
  let plant = null;
  for (const file of files) {
    try {
      const res = await fetch(`https://www.simpleplantcare.org/${file}.json`);
      const data = await res.json();
      plant = data.find(p => slugify(p.name) === slug || p.id === slug);
      if (plant) break;
    } catch {}
  }

  const html = await fetch('https://www.simpleplantcare.org/index.html').then(r => r.text());
  
  
  
  if (!plant) return new Response(html, { headers: { 'content-type': 'text/html' } });

const pageUrl = `https://www.simpleplantcare.org/plants/${slug}`;

const seoTitle = slug === 'cosmos'
  ? 'Cosmos Plant Care: How to Grow Cosmos Flowers | Simple Plant Care'
  : slug === 'bay-laurel'
    ? 'Bay Laurel Care: How to Grow Bay Laurel | Simple Plant Care'
    : `How to Grow ${plant.name} – Watering, Light & Care | Simple Plant Care`;

const seoDescription = slug === 'cosmos'
  ? 'Learn how to grow cosmos flowers from seed, including watering, sunlight, soil, spacing, germination and flowering tips.'
  : slug === 'bay-laurel'
    ? 'Learn how to grow and care for bay laurel, including watering, sunlight, soil, temperature, pruning and harvesting bay leaves.'
    : `How to grow ${plant.name} (${plant.latin}). ${plant.tagline} Watering, sunlight, soil and expert tips in plain language.`;

const patched = html
  .replace(
    '<title>Simple Plant Care — How to Grow Any Plant, Plain and Simple</title>',
    `<title>${seoTitle}</title>`
  )
  .replace(
    '<meta name="description" content="Free plant care guides in plain language. No jargon, no signup. Learn how to grow 283+ plants — watering schedules, sunlight needs, seed depth, and expert tips.">',
    `<meta name="description" content="${seoDescription}">`
  )
  .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${pageUrl}">`)
  .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${pageUrl}">`)
  .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${seoTitle}">`)
  .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${seoDescription}">`)
  .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${seoTitle}">`)
  .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${seoDescription}">`)
  .replace(/"url":\s*"https:\/\/simpleplantcare\.co"/, `"url": "https://www.simpleplantcare.org"`);
  return new Response(patched, {
    headers: { "content-type": "text/html" }
  });
}
