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

  const patched = html
    .replace(
      '<title>Simple Plant Care — How to Grow Any Plant, Plain and Simple</title>',
      `<title>How to Grow ${plant.name} – Watering, Light & Care | Simple Plant Care</title>`
    )
    .replace(
      '<meta name="description" content="Free plant care guides in plain language. No jargon, no signup. Learn how to grow 283+ plants — watering schedules, sunlight needs, seed depth, and expert tips.">',
      `<meta name="description" content="How to grow ${plant.name} (${plant.latin}). ${plant.tagline} Watering, sunlight, soil and expert tips in plain language.">`
    )
    .replace(
      '<link rel="canonical" href="https://simpleplantcare.co/">',
      `<link rel="canonical" href="https://www.simpleplantcare.org/plants/${slug}">`
    );

  return new Response(patched, { headers: { 'content-type': 'text/html' } });
}
