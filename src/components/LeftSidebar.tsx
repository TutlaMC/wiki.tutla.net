"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { DocNode } from "@/lib/docs"
import { ArrowDownWideNarrow, ArrowUpFromDot, HomeIcon, LucideIcon } from "lucide-react"

export interface LeftSidebarProps {
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

function DocTreeNode({ 
  node, 
  currentPath, 
  className = "", 
  Icon = null 
}: { 
  node: DocNode; 
  currentPath: string; 
  className?: string; 
  Icon?: LucideIcon | null 
}) {
  const isActive = node.path === currentPath
  const isParent = currentPath.startsWith(node.path)
  const [origin, setOrigin] = useState("https://wiki.tutla.net")
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.protocol + "//" + window.location.host)
    }
  }, [])
  
  const [open, setOpen] = useState(isParent)
  
  useEffect(() => {
    setOpen(isParent)
  }, [isParent])
  
  if (node.isDir && node.children) {
    return (
      <div>
        <span 
          className={`flex items-center space-x-2 px-2 py-1 hover:bg-gray-800 rounded font-bold cursor-pointer ${className}`} 
          onClick={() => setOpen(!open)}
        >
          {Icon && <Icon size={16} />}
          <span className="flex justify-between items-center w-full">
            <span>{node.name}</span>
            {open ? <ArrowUpFromDot size={16} /> : <ArrowDownWideNarrow size={16} />}
          </span>
        </span>
        <div
          className={`ml-4 pl-2 overflow-hidden transition-all duration-300 ${
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {node.children.map((child) => (
            <DocTreeNode key={child.path} node={child} currentPath={currentPath} />
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className={`px-2 py-1 hover:bg-gray-800 rounded ${isActive ? "text-blue-500 font-semibold" : ""}`}>
      <Link href={origin + toSlug(node.path)}>{node.name}</Link>
    </div>
  )
}

export default function LeftSidebar({ docsTree, currentPath, isDoc, headings, title }: LeftSidebarProps) {
  if (isDoc) {
    return (
      <nav className="sticky top-0 h-screen max-h-screen overflow-y-auto p-4 border-r border-gray-700 w-60">
        <DocTreeNode 
          className="" 
          Icon={HomeIcon} 
          node={{ 
            name: title, 
            path: "", 
            isDir: true, 
            children: docsTree || undefined 
          }} 
          currentPath={currentPath} 
        />
      </nav>
    )
  }
  
  if (headings && headings.length > 0) {
    return (
      <nav className="sticky top-0 h-screen max-h-screen overflow-y-auto p-4 border-r border-gray-700 w-60">
        <h2 className="font-bold mb-2">Contents</h2>
        <ul>
          {headings.map((h, i) => {
            const marginClass = h.level === 1 ? "" : 
                               h.level === 2 ? "ml-4" :
                               h.level === 3 ? "ml-8" :
                               h.level === 4 ? "ml-12" :
                               h.level === 5 ? "ml-16" : "ml-20"
            
            return (
              <li key={i} className={marginClass}>
                <a 
                  href={`#${slugify(h.text)}`}
                  className="hover:text-blue-400 block py-1"
                >
                  {h.text}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }
  
  return null
}