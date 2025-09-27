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
  try {
    if (!fs.existsSync(dirPath)) {
      console.warn(`Directory does not exist: ${dirPath}`)
      return []
    }
    
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    const result: DocNode[] = []
    
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue
      
      const fullPath = path.join(dirPath, entry.name)
      
      try {
        if (entry.isDirectory()) {
          const children = readDocsDir(fullPath)
          result.push({ name: entry.name, path: fullPath, isDir: true, children })
        } else if (entry.name.endsWith(".md")) {
          const name = entry.name.replace(/\.md$/, "")
          result.push({ name, path: fullPath, isDir: false })
        }
      } catch (entryError) {
        console.error(`Error processing entry ${fullPath}:`, entryError)
      }
    }
    
    return result
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
    return []
  }
}

export function generateDocsUsingContents(sidebarContents: Record<string, unknown>): DocNode[] {
  const result: DocNode[] = []
  
  try {
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
  } catch (error) {
    console.error("Error generating docs using contents:", error)
  }
  
  return result
}