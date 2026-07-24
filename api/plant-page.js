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
  
  console.log(html.includes('<link rel="canonical"'));
  console.log(html.includes('https://simpleplantcare.org/'));
  console.log(html.includes('https://www.simpleplantcare.org/'));
  
  if (!plant) return new Response(html, { headers: { 'content-type': 'text/html' } });

const pageUrl = `https://www.simpleplantcare.org/plants/${slug}`;
console.log("PLANT API RUNNING:", slug);

const patched = html
  // Title
  .replace(
    '<title>Simple Plant Care — How to Grow Any Plant, Plain and Simple</title>',
    `<title>How to Grow ${plant.name} – Watering, Light & Care | Simple Plant Care</title>`
  )

  // Meta description
  .replace(
    '<meta name="description" content="Free plant care guides in plain language. No jargon, no signup. Learn how to grow 283+ plants — watering schedules, sunlight needs, seed depth, and expert tips.">',
    `<meta name="description" content="How to grow ${plant.name} (${plant.latin}). ${plant.tagline} Watering, sunlight, soil and expert tips in plain language.">`
  )

  // Canonical
  .replace(
  /<link rel="canonical" href="[^"]*">/,
  `<link rel="canonical" href="${pageUrl}">`
  )

  // Open Graph URL
  .replace(
  /<meta property="og:url" content="[^"]*">/,
  `<meta property="og:url" content="${pageUrl}">`
  )

  // Open Graph title
  .replace(
  /<meta property="og:title" content="[^"]*">/,
  `<meta property="og:title" content="How to Grow ${plant.name} – Watering, Light & Care">`
  )
  // Open Graph description
  .replace(
  /<meta property="og:description" content="[^"]*">/,
  `<meta property="og:description" content="How to grow ${plant.name} (${plant.latin}). ${plant.tagline} Watering, sunlight, soil and expert tips in plain language.">`
  )
  // Twitter title
  .replace(
  /<meta name="twitter:title" content="[^"]*">/,
  `<meta name="twitter:title" content="How to Grow ${plant.name} – Watering, Light & Care">`
  )

  // Twitter description
  .replace(
  /<meta name="twitter:description" content="[^"]*">/,
  `<meta name="twitter:description" content="How to grow ${plant.name} (${plant.latin}). ${plant.tagline} Watering, sunlight, soil and expert tips in plain language.">`
  )

  // Fix remaining .co reference
  .replace(
  /"url":\s*"https:\/\/simpleplantcare\.co"/,
  `"url": "https://www.simpleplantcare.org"`
  );
  return new Response(patched, {
  headers: {
    "content-type": "text/html"
  }
});
}
