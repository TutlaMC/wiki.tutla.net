"use client"

import { useEffect, useRef, useState } from "react"

type Hit = { title: string; summary: string; path: string; snippetHtml: string }

export default function Search() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Hit[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const boxRef = useRef<HTMLDivElement>(null)
  const ctrl = useRef<AbortController | null>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setOpen(false)
      return
    }
    const id = setTimeout(async () => {
      ctrl.current?.abort()
      ctrl.current = new AbortController()
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.current.signal })
      const data: Hit[] = await res.json()
      setResults(data)
      setActive(0)
      setOpen(true)
    }, 150)
    return () => clearTimeout(id)
  }, [query])

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive(p => (p + 1) % results.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive(p => (p - 1 + results.length) % results.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      window.location.href = results[active].path
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div className="relative w-full max-w-lg" ref={boxRef}>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Search..."
        className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
        onFocus={() => query && setOpen(true)}
      />
      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 mt-1 bg-white border rounded shadow-lg max-h-72 overflow-y-auto z-50">
          {results.map((hit, i) => (
            <li
              key={hit.path}
              className={`px-3 py-2 cursor-pointer ${i === active ? "bg-blue-100" : "hover:bg-gray-100"}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => (window.location.href = hit.path)}
            >
              <div className="font-medium text-gray-900">{hit.title}</div>
              <div
                className="text-sm text-gray-600"
                dangerouslySetInnerHTML={{ __html: hit.snippetHtml || hit.summary }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
