// credits to clanker chatgpt for this

import fs from "fs"
import path from "path"
import matter from "gray-matter"

const CONTENT_ROOT = path.join(process.cwd(), "content")
const BASE_URL = "https://wiki.tutla.net"

// Recursively walk the content folder
function walkDir(dir: string, basePath = ""): { url: string; title: string; description: string }[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let pages: { url: string; title: string; description: string }[] = []

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue

    const fullPath = path.join(dir, entry.name)
    const relativePath = path.join(basePath, entry.name)
    if (entry.isDirectory()) {
      pages.push(...walkDir(fullPath, relativePath))
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      let urlPath = "/" + relativePath.replace(/\\/g, "/").replace(/\.md$/, "")
      if (urlPath.endsWith("/index")) urlPath = urlPath.replace(/\/index$/, "")

      const content = fs.readFileSync(fullPath, "utf8")
      const { data } = matter(content)

      pages.push({
        url: urlPath,
        title: data.title || path.basename(urlPath),
        description: data.summary || "",
      })
      
    }
  }

  return pages
}

const pages = walkDir(CONTENT_ROOT)

// Generate sitemap.xml
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
  </url>`
  )
  .join("\n")}
</urlset>
`

fs.writeFileSync(path.join(process.cwd(), "public", "sitemap.xml"), sitemap)
console.log("✅ sitemap.xml generated with", pages.length, "pages")

// Generate SEO JSON-LD metadata
const jsonLdPath = path.join(process.cwd(), "public", "seo.json")
fs.writeFileSync(jsonLdPath, JSON.stringify(
  pages.map(page => ({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": page.title,
    "description": page.description,
    "url": `${BASE_URL}${page.url}`
  })),
  null,
  2
))
console.log("✅ SEO JSON-LD metadata generated at public/seo.json")
