import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { getMdxSource } from "@/lib/mdx"
import { readDocsDir } from "@/lib/docs"
import LeftSidebar from "@/components/LeftSidebar"
import RightSidebar from "@/components/RightSidebar"
import MdxRenderer from "@/components/MdxRenderer"

const CONTENT_ROOT = path.join(process.cwd(), "content")

function findDocRoot(filePath: string): string | null {
  const ext = path.extname(filePath)
  const base = path.basename(filePath, ext)
  if (ext === ".md" && base !== "index") {
    return path.join(path.dirname(filePath), base)
  }
  let dir =  path.dirname(filePath)
  while (dir.startsWith(CONTENT_ROOT)) {
    const indexPath = path.join(dir, "index.md")
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, "utf8")
      const { data } = matter(indexContent)
      if (data.isdoc) return dir
    }
    const parentDir = path.dirname(dir)
    if (parentDir === dir) break
    dir = parentDir
    console.log()
  }
  return null
}


export default async function WikiPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params
  const slugParts = resolvedParams.slug ?? ["index"]
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

  const docRoot = isDoc ? findDocRoot(filePath) : null
  let docsTree = null
  if (docRoot) {
    docsTree = readDocsDir(docRoot)
  }

  return (
    <div className="flex min-h-screen bg-[#151a21] text-[#c9d1d9]">
      <LeftSidebar
        title={String(data.title)}
        docsTree={docsTree}
        currentPath={filePath}
        isDoc={isDoc}
        headings={headings}
      />
      <main className="flex-1 max-w-4xl mx-auto p-6">
        <h1 className="mb-6 text-3xl font-bold">{data.title}</h1>
        <article className="prose prose-invert max-w-none">
          <MdxRenderer mdxSource={mdxSource} />
        </article>
      </main>
      <RightSidebar />
    </div>
  )
}
