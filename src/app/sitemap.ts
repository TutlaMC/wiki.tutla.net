// app/sitemap.ts
// Next.js will serve this as /sitemap.xml automatically

import fs from "fs"
import path from "path"
import matter from "gray-matter"
import type { MetadataRoute } from "next"

const CONTENT_ROOT = path.join(process.cwd(), "content")
const SITE_URL = "https://wiki.tutla.net"

interface SitemapEntry {
  url: string
  lastModified?: Date
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority?: number
}

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

      // Read frontmatter for dates
      let lastModified: Date | undefined
      try {
        const { data } = matter(fs.readFileSync(fullPath, "utf8"))
        if (data.updated) lastModified = new Date(data.updated)
        else if (data.created) lastModified = new Date(data.created)
      } catch {}

      entries.push({
        url: `${SITE_URL}/${slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: slugParts.length === 0 ? 1.0 : slugParts.length === 1 ? 0.8 : 0.6,
      })
    }
  }

  return entries
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries = walkContent(CONTENT_ROOT)

  // Add homepage
  entries.unshift({
    url: SITE_URL,
    changeFrequency: "daily",
    priority: 1.0,
  })

  return entries
}