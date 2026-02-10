// Dynamic Sitemap Generator
export function generateSitemap() {
  const baseUrl = 'https://stoneriverjunk.com';
  const currentDate = new Date().toISOString();

  const pages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/booking', priority: '0.9', changefreq: 'weekly' },
    { url: '/services', priority: '0.8', changefreq: 'monthly' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/reviews', priority: '0.6', changefreq: 'weekly' },
    { url: '/faq', priority: '0.6', changefreq: 'monthly' },
    { url: '/gallery', priority: '0.5', changefreq: 'weekly' },
    { url: '/blog', priority: '0.5', changefreq: 'weekly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${pages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return xml;
}

export default generateSitemap;
