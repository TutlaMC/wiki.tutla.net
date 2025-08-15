import fs from "fs"
import path from "path"

export interface DocNode {
  name: string
  path: string
  isDir: boolean
  children?: DocNode[]
}

const CONTENT_ROOT = path.join(process.cwd(), "content")

export function readDocsDir(dirPath = CONTENT_ROOT): DocNode[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  const result: DocNode[] = []

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue
    const fullPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      const children = readDocsDir(fullPath)
      result.push({ name: entry.name, path: fullPath, isDir: true, children })
    } else if (entry.name.endsWith(".md")) {
      const name = entry.name.replace(/\.md$/, "")
      result.push({ name, path: fullPath, isDir: false })
    }
  }
  return result
}

export function generateDocsUsingContents(sidebarContents: Record<string, unknown>): DocNode[] {
  const result: DocNode[] = []
  for (const [key, value] of Object.entries(sidebarContents)) {
    if (typeof value === "object" && value !== null) {
      result.push({
        name: key,
        path: key,
        isDir: true,
        children: generateDocsUsingContents(value as Record<string, unknown>)
      })
    } else if (typeof value === "string") {
      result.push({
        name: key,
        path: value,
        isDir: false
      })
    }
  }
  return result
}