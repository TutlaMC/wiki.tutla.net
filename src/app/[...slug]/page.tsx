import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { getMdxSource } from "@/lib/mdx"
import { readDocsDir, generateDocsUsingContents, DocNode } from "@/lib/docs"
import LeftSidebar from "@/components/LeftSidebar"
import RightSidebar from "@/components/RightSidebar"
import MdxRenderer from "@/components/MdxRenderer"
import Navbar from "@/components/Navbar"
import { Edit2 } from "lucide-react"

const CONTENT_ROOT = path.join(process.cwd(), "content")

export async function generateMetadata({ params }: { params: { slug?: string[] } }) {
  params = await params
  const slugParts = params.slug ?? ["index"]
  const filePath = path.join(CONTENT_ROOT, ...slugParts) + ".md"

  if (!fs.existsSync(filePath)) return {}

  const fileContent = fs.readFileSync(filePath, "utf8")
  const { data } = matter(fileContent)

  const canonicalUrl = `https://wiki.tutla.net/${slugParts.join("/")}`

  return {
    title: data.title || "Tutla Wiki",
    description: data.summary || "Tutla Wiki",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: data.title,
      description: data.summary,
      url: canonicalUrl,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.summary,
    },
  }
}

function getDocName(filePath: string) {
    const parts = filePath.split(path.sep);
    const contentIndex = parts.indexOf("content");
    if (contentIndex !== -1 && parts.length > contentIndex + 1) {
        return parts[contentIndex + 1];
    }
    return "";
}

function findDocRoot(filePath: string): string | null {
  if (filePath.endsWith(".md")){
    filePath = filePath.slice(0, -3)
  }
  const dir = path.join(CONTENT_ROOT, getDocName(filePath))
  const indexPath = path.join(dir, "index.md")
  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, "utf8")
    const { data } = matter(indexContent)
    if (data.isdoc) return dir
  }
  return null
}

export default async function WikiPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params
  let slugParts = resolvedParams.slug ?? ["index"]
  slugParts = slugParts.map((s) => s.toLowerCase())
  const filePath = path.join(CONTENT_ROOT, ...slugParts) + ".md"

  let fileContent = ""
  if (fs.existsSync(filePath)) {
    fileContent = fs.readFileSync(filePath, "utf8")
  } else {
    const indexPath = path.join(CONTENT_ROOT, slugParts[0] ?? "index", "index.md")
    if (fs.existsSync(indexPath)) {
      fileContent = fs.readFileSync(indexPath, "utf8")
    } else {
      return <div className="p-6">Page not found</div>
    }
  }

  const { content, data } = matter(fileContent)
  const isDoc = Boolean(data.isdoc)

  const { mdxSource, headings } = await getMdxSource(content)
  let realpeth = filePath
  if (filePath.startsWith(CONTENT_ROOT) && path.dirname(filePath) === CONTENT_ROOT) {
      const name = path.basename(filePath, ".md")
      realpeth = path.join("content", name, "index.md")
  }
  const docRoot = isDoc ? findDocRoot(filePath) : null
  let docsTree = null
  if (fs.existsSync(path.join(CONTENT_ROOT, slugParts[0], "sidebar.json"))){
    docsTree = generateDocsUsingContents(JSON.parse(fs.readFileSync(path.join(CONTENT_ROOT, slugParts[0], "sidebar.json"), "utf8")))
    
  } else if (docRoot) {
    docsTree = readDocsDir(docRoot)
  }

  return (
    <div>
      <Navbar title={String(data.title)}
          docsTree={docsTree}
          currentPath={filePath}
          isDoc={isDoc}
          headings={headings}></Navbar>
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
        <h1 className="mb-6 text-5xl font-bold">{data.title}</h1>
        <article className="prose prose-invert max-w-none">
          <MdxRenderer mdxSource={mdxSource} />
        </article>
        <div className="mt-6">
          <hr></hr>
          <a href={`https://github.com/TutlaMC/wiki.tutla.net/tree/main/${realpeth}`} className="mt-6 flex items-center font-extrabold space-x-2 text-blue-400 text-xl hover:underline"><Edit2 className="mr-2"></Edit2> Edit this page</a>
        </div>
      </main>

      <RightSidebar data={data} />
    </div>
    {/* idk chatgpt told me to put ts */} <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": data.title,
        "description": data.summary,
        "url": `https://wiki.tutla.net/${slugParts.join("/")}`
      }) }}
    /> 
  </div>
  )
}
