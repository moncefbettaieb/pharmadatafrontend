import fs from "fs";
import fetch from "node-fetch";

const BASE_URL = "https://pharmadataapi.fr";

// URLs statiques à inclure dans le sitemap
const staticUrls = [
  { loc: "/", changefreq: "weekly", priority: 0.7 },
  { loc: "/api-documentation", changefreq: "weekly", priority: 0.7 },
  { loc: "/api-plans", changefreq: "weekly", priority: 0.7 },
  { loc: "/faq", changefreq: "weekly", priority: 0.7 },
  { loc: "/glossaire", changefreq: "weekly", priority: 0.7 },
  { loc: "/guidelines", changefreq: "weekly", priority: 0.7 },
  { loc: "/products", changefreq: "weekly", priority: 0.7 },
  { loc: "/blog/definition-code-cip", changefreq: "weekly", priority: 0.7 },
  { loc: "/blog/definition-code-ean", changefreq: "weekly", priority: 0.7 },
  { loc: "/blog/difference-code-cip-ean", changefreq: "weekly", priority: 0.7 },
  {
    loc: "/blog/importance-api-donnees-pharma",
    changefreq: "weekly",
    priority: 0.7,
  },
];

async function main() {
  // Génère les URLs statiques
  const staticXml = staticUrls
    .map(
      (u) => `
  <url>
    <loc>${BASE_URL}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("");

  // Génère les URLs dynamiques des produits
  const res = await fetch(`${BASE_URL}/api/v1/slugs/`);
  const products = await res.json();

  const dynamicXml = products
    .map(
      (p) => `
  <url>
    <loc>${BASE_URL}/products/${p.id}</loc>
    <lastmod>${p.last_update}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("");

  // Assemble le sitemap complet
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticXml}
  ${dynamicXml}
</urlset>`;

  fs.mkdirSync("./public", { recursive: true });
  fs.writeFileSync("./public/sitemap.xml", xml);
  console.log("Sitemap generated!");
}

main();
