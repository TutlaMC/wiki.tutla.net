import { NextRequest, NextResponse } from "next/server"
import Fuse, { FuseResultMatch } from "fuse.js"
import { makeSearchIndex } from "@/lib/search"

type Doc = { title: string; summary: string; path: string; content: string }

let fuse: Fuse<Doc> | null = null
let docs: Doc[] = []

function stripMd(s: string) {
  return s
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/[#>*_~\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function ensureFuse() {
  if (!fuse) {
    docs = makeSearchIndex().map(d => ({ ...d, content: stripMd(d.content) }))
    fuse = new Fuse(docs, {
      keys: ["title", "summary", "content"],
      threshold: 0.3,
      includeMatches: true,
      ignoreLocation: true,
      findAllMatches: true,
      minMatchCharLength: 2,
    })
  }
}

function snippetHtmlFromMatch(m: FuseResultMatch) {
  const val = m.value ?? ""
  const ranges = m.indices as [number, number][]

  if (!val || ranges.length === 0) return ""

  const [start, end] = ranges[0]
  const contextBefore = Math.max(0, start - 30)
  const contextAfter = Math.min(val.length, end + 30)

  let result = ""
  result += contextBefore > 0 ? "…" : ""
  result += val.slice(contextBefore, start)
  result += `<mark>${val.slice(start, end + 1)}</mark>`
  result += val.slice(end + 1, contextAfter)
  result += contextAfter < val.length ? "…" : ""

  return result
}


export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  ensureFuse()
  const q = req.nextUrl.searchParams.get("q")?.trim() || ""
  if (!q) return NextResponse.json([])

  const res = (fuse as Fuse<Doc>).search(q, { limit: 10 })
  const payload = res.map(r => {
    const m =
      r.matches?.find(mm => mm.key === "content") ||
      r.matches?.find(mm => mm.key === "summary") ||
      r.matches?.find(mm => mm.key === "title")
    return {
      title: r.item.title,
      summary: r.item.summary,
      path: r.item.path,
      snippetHtml: m ? snippetHtmlFromMatch(m) : "",
    }
  })
  return NextResponse.json(payload)
}
