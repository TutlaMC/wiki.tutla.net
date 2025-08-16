import fs from "fs"
import path from "path"
import matter from "gray-matter"

const CONTENT_ROOT = path.join(process.cwd(), "content")

function getAllMarkdownFiles(dir: string): string[] {
  let results: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results = results.concat(getAllMarkdownFiles(fullPath))
    } else if (entry.name.endsWith(".md")) {
      results.push(fullPath)
    }
  }
  return results
}

export function makeSearchIndex() {
  const files = getAllMarkdownFiles(CONTENT_ROOT)
  return files.map((file) => {
    const raw = fs.readFileSync(file, "utf8")
    const { data, content } = matter(raw)
    const slug = file
      .replace(CONTENT_ROOT, "")
      .replace(/index\.md$/, "")
      .replace(/\.md$/, "")
      .replace(/\\/g, "/")

    return {
      title: data.title || slug,
      summary: data.summary || "",
      path: slug || "/",
      content,
    }
  })
}
