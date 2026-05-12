// app/sitemap.ts
// Served automatically at /sitemap.xml by Next.js

import fs from "fs"
import path from "path"
import matter from "gray-matter"
import type { MetadataRoute } from "next"

const CONTENT_ROOT = path.join(process.cwd(), "content")
const SITE_URL = "https://wiki.tutla.net"

type SitemapEntry = MetadataRoute.Sitemap[number]

function walkContent(dir: string, parts: string[] = []): SitemapEntry[] {
  if (!fs.existsSync(dir)) return []
  const entries: SitemapEntry[] = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      entries.push(...walkContent(fullPath, [...parts, entry.name]))
    } else if (entry.name.endsWith(".md")) {
      const name = entry.name.replace(/\.md$/, "")
      const slugParts = name === "index" ? parts : [...parts, name]
      const slug = slugParts.join("/")

      let lastModified: Date | undefined
      let images: SitemapEntry["images"] = undefined

      try {
        const raw = fs.readFileSync(fullPath, "utf8")
        const { data, content } = matter(raw)
        
        const parsedDate = new Date(data.updated || data.created)
        if (!isNaN(parsedDate.getTime())) {
        lastModified = parsedDate
        }
        if (data.updated) lastModified = new Date(data.updated)
        else if (data.created) lastModified = new Date(data.created)

        // Collect ALL images from markdown body for Google Image Search indexing
        const imgRegex = /!\[(.*?)\]\((.*?)\)/g
        const foundImages: NonNullable<SitemapEntry["images"]> = []
        let imgMatch
        while ((imgMatch = imgRegex.exec(content)) !== null) {
          const alt = imgMatch[1]
          const src = imgMatch[2]
          const url = src.startsWith("http")
            ? src
            : `${SITE_URL}${src.startsWith("/") ? "" : "/"}${src}`
          foundImages.push(url)
        }
        if (foundImages.length > 0) images = foundImages
      } catch {}

      entries.push({
        url: `${SITE_URL}/${slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: slugParts.length === 0 ? 1.0 : slugParts.length === 1 ? 0.8 : 0.6,
        ...(images && { images }),
      })
    }
  }

  return entries
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries = walkContent(CONTENT_ROOT)
  entries.unshift({ url: SITE_URL, changeFrequency: "daily", priority: 1.0 })
  return entries
}

export const revalidate = 3600