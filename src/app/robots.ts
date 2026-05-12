// app/robots.ts
// Next.js serves this as /robots.txt automatically

import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://wiki.tutla.net/sitemap.xml",
    host: "https://wiki.tutla.net",
  }
}