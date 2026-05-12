import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { getMdxSource } from "@/lib/mdx"
import { readDocsDir, generateDocsUsingContents } from "@/lib/docs"
import LeftSidebar from "@/components/LeftSidebar"
import RightSidebar from "@/components/RightSidebar"
import MdxRenderer from "@/components/MdxRenderer"
import Navbar from "@/components/Navbar"
import { Edit2 } from "lucide-react"
import type { Metadata } from "next"

const CONTENT_ROOT = path.join(process.cwd(), "content")
const SITE_URL = "https://wiki.tutla.net"
const SITE_NAME = "Tutla Wiki"

// ─── Static params (SSG) ──────────────────────────────────────────────────────
// This tells Next.js to pre-render every .md file at build time.
// Result: static HTML files served instantly, no server needed, perfect for SEO.

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  const params: { slug: string[] }[] = []

  function walk(dir: string, parts: string[] = []) {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath, [...parts, entry.name])
      } else if (entry.name.endsWith(".md")) {
        const name = entry.name.replace(/\.md$/, "")
        // index.md → serves as the directory route (e.g. /tutlamc)
        if (name === "index") {
          if (parts.length > 0) params.push({ slug: parts })
        } else {
          params.push({ slug: [...parts, name] })
        }
      }
    }
  }

  walk(CONTENT_ROOT)

  // Also include root index
  params.push({ slug: ["index"] })

  return params
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveFilePath(slugParts: string[]): string | null {
  // Try exact match: /content/a/b/c.md
  const direct = path.join(CONTENT_ROOT, ...slugParts) + ".md"
  if (fs.existsSync(direct)) return direct

  // Try index: /content/a/b/c/index.md
  const index = path.join(CONTENT_ROOT, ...slugParts, "index.md")
  if (fs.existsSync(index)) return index

  return null
}

function getFirstImage(markdown: string): string | null {
  const match = markdown.match(/!\[.*?\]\((.*?)\)/)
  if (!match) return null
  const url = match[1]
  if (url.startsWith("http")) return url
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`
}

function getDocName(filePath: string): string {
  const parts = filePath.split(path.sep)
  const idx = parts.indexOf("content")
  return idx !== -1 && parts.length > idx + 1 ? parts[idx + 1] : ""
}

function findDocRoot(filePath: string): string | null {
  const clean = filePath.endsWith(".md") ? filePath.slice(0, -3) : filePath
  const dir = path.join(CONTENT_ROOT, getDocName(clean))
  const indexPath = path.join(dir, "index.md")
  if (fs.existsSync(indexPath)) {
    const { data } = matter(fs.readFileSync(indexPath, "utf8"))
    if (data.isdoc) return dir
  }
  return null
}

function getEditPath(filePath: string, slugParts: string[]): string {
  // If the file lives at /content/foo.md but is really content/foo/index.md, fix it
  if (
    filePath.startsWith(CONTENT_ROOT) &&
    path.dirname(filePath) === CONTENT_ROOT
  ) {
    const name = path.basename(filePath, ".md")
    return `content/${name}/index.md`
  }
  return filePath.replace(process.cwd() + path.sep, "").replace(/\\/g, "/")
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const slugParts = (resolvedParams.slug ?? ["index"]).map((s) => s.toLowerCase())

  const filePath = resolveFilePath(slugParts)
  if (!filePath) return { title: SITE_NAME }

  const fileContent = fs.readFileSync(filePath, "utf8")
  const { content, data } = matter(fileContent)

  const canonicalUrl = `${SITE_URL}/${slugParts.filter((s) => s !== "index").join("/")}`
  const firstImage = getFirstImage(content)
  const title = data.title ? `${data.title} — ${SITE_NAME}` : SITE_NAME
  const description = data.summary || `${data.title} on ${SITE_NAME}`

  return {
    title,
    description,
    keywords: data.tags ?? [],
    authors: data.author ? [{ name: data.author }] : undefined,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      title: data.title ?? SITE_NAME,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "article",
      publishedTime: data.created,
      modifiedTime: data.updated,
      images: firstImage
        ? [{ url: firstImage, width: 1200, height: 630, alt: data.title }]
        : undefined,
    },

    twitter: {
      card: firstImage ? "summary_large_image" : "summary",
      title: data.title ?? SITE_NAME,
      description,
      images: firstImage ? [firstImage] : undefined,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function WikiPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  try {
    const resolvedParams = await params
    const slugParts = (resolvedParams.slug ?? ["index"]).map((s) => s.toLowerCase())

    const filePath = resolveFilePath(slugParts)
    if (!filePath) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#151a21] text-[#c9d1d9]">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-[#8b949e]">Page not found</p>
          </div>
        </div>
      )
    }

    const fileContent = fs.readFileSync(filePath, "utf8")
    const { content, data } = matter(fileContent)
    const isDoc = Boolean(data.isdoc)

    const { mdxSource, headings } = await getMdxSource(content)
    const editPath = getEditPath(filePath, slugParts)
    const docRoot = isDoc ? findDocRoot(filePath) : null

    // Sidebar
    let docsTree = null
    if (slugParts[0]) {
      const sidebarPath = path.join(CONTENT_ROOT, slugParts[0], "sidebar.json")
      if (fs.existsSync(sidebarPath)) {
        try {
          docsTree = generateDocsUsingContents(
            JSON.parse(fs.readFileSync(sidebarPath, "utf8"))
          )
        } catch (e) {
          console.error(`Error parsing sidebar.json for ${slugParts[0]}:`, e)
        }
      } else if (docRoot) {
        docsTree = readDocsDir(docRoot)
      }
    }

    const firstImage = getFirstImage(content)
    const canonicalUrl = `${SITE_URL}/${slugParts.filter((s) => s !== "index").join("/")}`

    // JSON-LD structured data
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: data.title,
      description: data.summary,
      url: canonicalUrl,
      ...(data.created && { datePublished: data.created }),
      ...(data.updated && { dateModified: data.updated }),
      ...(data.author && { author: { "@type": "Person", name: data.author } }),
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
      ...(firstImage && { image: firstImage }),
    }

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div>
          <Navbar
            title={String(data.title)}
            docsTree={docsTree}
            currentPath={filePath}
            isDoc={isDoc}
            headings={headings}
          />

          <div className="flex min-h-screen bg-[#151a21] text-[#c9d1d9]">
            <div className="hidden md:block">
              <LeftSidebar
                title={String(data.title)}
                docsTree={docsTree}
                currentPath={filePath}
                isDoc={isDoc}
                headings={headings}
              />
            </div>

            <main className="flex-1 max-w-4xl mx-auto p-6">
              {/* Semantic heading with visible title */}
              <h1 className="mb-2 text-5xl font-bold">{data.title}</h1>

              {/* Show dates if present — good for freshness signals */}
              {(data.created || data.updated) && (
                <p className="text-sm text-[#8b949e] mb-6 flex gap-4">
                  {data.created && (
                    <time dateTime={data.created}>
                      Created{" "}
                      {new Date(data.created).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  )}
                  {data.updated && data.updated !== data.created && (
                    <time dateTime={data.updated}>
                      Updated{" "}
                      {new Date(data.updated).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  )}
                </p>
              )}

              <article className="prose prose-invert max-w-none">
                <MdxRenderer mdxSource={mdxSource} />
              </article>

              <div className="mt-6">
                <hr className="border-[#30363d]" />
                <a
                  href={`https://github.com/TutlaMC/wiki.tutla.net/tree/main/${editPath}`}
                  className="mt-6 flex items-center font-extrabold space-x-2 text-blue-400 text-xl hover:underline"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Edit2 className="mr-2" /> Edit this page
                </a>
              </div>
            </main>

            <RightSidebar image={firstImage} data={data} />
          </div>
        </div>
      </>
    )
  } catch (error) {
    console.error("Error in WikiPage:", error)
    return (
      <div className="p-6 bg-red-900/20 text-red-300">
        <h1 className="text-2xl font-bold mb-4">Error Loading Page</h1>
        <p>There was an error loading this page.</p>
      </div>
    )
  }
}