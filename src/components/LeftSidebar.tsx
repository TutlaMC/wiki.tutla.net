"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { DocNode } from "@/lib/docs"

interface LeftSidebarProps {
  title: string
  docsTree?: DocNode[] | null
  currentPath: string
  isDoc: boolean
  headings?: { text: string; level: number }[]
}

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-")
}

function toSlug(fullPath: string) {
  return "/" + fullPath.replace(/\\/g, "/").replace(/.*content/, "").replace(/\.md$/, "")
}

function DocTreeNode({ node, currentPath }: { node: DocNode; currentPath: string }) {
  const isActive = node.path === currentPath
  const isParent = currentPath.startsWith(node.path)

  const [origin, setOrigin] = useState("https://wiki.tutla.net") // default

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.protocol + "//" + window.location.host)
    }
  }, [])

  const [open, setOpen] = useState(isParent)
  useEffect(() => setOpen(isParent), [isParent])

  if (node.isDir && node.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`font-bold ${open ? "text-blue-400" : ""}`}
        >
          {node.name}
        </button>
        {open && (
          <div className="ml-4 border-l border-gray-700 pl-2">
            {node.children.map((child) => (
              <DocTreeNode key={child.path} node={child} currentPath={currentPath} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={isActive ? "text-blue-500 font-semibold" : ""}>
      <Link href={origin + toSlug(node.path)}>{node.name}</Link>
    </div>
  )
}

export default function LeftSidebar({ docsTree, currentPath, isDoc, headings, title }: LeftSidebarProps) {
  if (isDoc) {
    return (
      <nav className="sticky top-0 max-h-screen overflow-y-auto p-4 border-r border-gray-700 w-60">
        <DocTreeNode node={{ name: title, path: "", isDir: true, children: docsTree || undefined }} currentPath={currentPath} />
      </nav>
    )
  }

  if (headings) {
    return (
      <nav className="sticky top-0 max-h-screen overflow-y-auto p-4 border-r border-gray-700 w-60">
        <h2 className="font-bold mb-2">Contents</h2>
        <ul>
          {headings.map((h, i) => (
            <li key={i} className={`ml-${(h.level - 1) * 4}`}>
              <a href={`#${slugify(h.text)}`}>{h.text}</a>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  return null
}
