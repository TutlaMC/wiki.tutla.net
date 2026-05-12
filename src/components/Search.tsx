"use client"
import { useEffect, useRef, useState } from "react"
import { Search as SearchIcon, ArrowRight, FileText } from "lucide-react"

type Hit = { title: string; summary: string; path: string; snippetHtml: string }

export default function Search() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Hit[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const ctrl = useRef<AbortController | null>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        if (query) setOpen(true)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [query])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setOpen(false)
      setLoading(false)
      return
    }
    setLoading(true)
    const id = setTimeout(async () => {
      ctrl.current?.abort()
      ctrl.current = new AbortController()
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: ctrl.current.signal,
        })
        const data: Hit[] = await res.json()
        setResults(data)
        setActive(0)
        setOpen(true)
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") console.error(err)
      } finally {
        setLoading(false)
      }
    }, 150)
    return () => clearTimeout(id)
  }, [query])

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((p) => (p + 1) % results.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((p) => (p - 1 + results.length) % results.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      window.location.href = results[active].path
    } else if (e.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div className="relative w-full max-w-lg" ref={boxRef}>
      {/* Input */}
      <div className="relative flex items-center">
        <SearchIcon
          className="absolute left-3 text-[#8b949e] pointer-events-none"
          size={15}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search wiki…"
          onFocus={() => query && setOpen(true)}
          className={`
            w-full bg-[#0d1117] border text-[#c9d1d9] placeholder-[#484f58]
            pl-9 pr-16 py-2 text-sm rounded-lg
            transition-all duration-150 outline-none
            ${open && results.length > 0
              ? "border-[#388bfd] ring-1 ring-[#388bfd]/30 rounded-b-none"
              : "border-[#30363d] hover:border-[#484f58] focus:border-[#388bfd] focus:ring-1 focus:ring-[#388bfd]/30"
            }
          `}
        />
        {/* Kbd hint */}
        <span className="absolute right-3 flex items-center gap-0.5 pointer-events-none">
          {loading ? (
            <span className="w-3 h-3 border border-[#484f58] border-t-[#388bfd] rounded-full animate-spin" />
          ) : (
            <>
              <kbd className="text-[10px] text-[#484f58] bg-[#161b22] border border-[#30363d] rounded px-1 py-0.5 font-mono leading-none">
                ⌘K
              </kbd>
            </>
          )}
        </span>
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 bg-[#161b22] border border-[#388bfd]/40 border-t-0 rounded-b-lg shadow-2xl shadow-black/60 max-h-80 overflow-y-auto z-50 divide-y divide-[#21262d]">
          {results.map((hit, i) => (
            <a
              key={hit.path}
              href={hit.path}
              onMouseEnter={() => setActive(i)}
              className={`
                flex items-start gap-3 px-4 py-3 cursor-pointer no-underline
                transition-colors duration-75 group
                ${i === active ? "bg-[#388bfd]/10" : "hover:bg-[#21262d]"}
              `}
            >
              {/* Icon */}
              <span className={`mt-0.5 flex-shrink-0 ${i === active ? "text-[#388bfd]" : "text-[#484f58] group-hover:text-[#8b949e]"} transition-colors`}>
                <FileText size={14} />
              </span>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold truncate ${i === active ? "text-[#79c0ff]" : "text-[#c9d1d9]"}`}>
                  {hit.title}
                </div>
                <div
                  className="text-xs text-[#8b949e] mt-0.5 line-clamp-2 leading-relaxed
                    [&_mark]:bg-[#f0883e]/20 [&_mark]:text-[#f0883e] [&_mark]:rounded-sm [&_mark]:px-0.5"
                  dangerouslySetInnerHTML={{ __html: hit.snippetHtml || hit.summary }}
                />
              </div>

              {/* Arrow */}
              <span className={`mt-0.5 flex-shrink-0 transition-all duration-150 ${i === active ? "text-[#388bfd] translate-x-0.5" : "text-transparent"}`}>
                <ArrowRight size={13} />
              </span>
            </a>
          ))}

          {/* Footer hint */}
          <div className="px-4 py-2 flex items-center gap-3 text-[10px] text-[#484f58] bg-[#0d1117]/60">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> open</span>
            <span><kbd className="font-mono">esc</kbd> close</span>
          </div>
        </div>
      )}

      {/* No results */}
      {open && query && !loading && results.length === 0 && (
        <div className="absolute left-0 right-0 bg-[#161b22] border border-[#388bfd]/40 border-t-0 rounded-b-lg shadow-2xl shadow-black/60 z-50 px-4 py-6 text-center">
          <p className="text-sm text-[#484f58]">No results for <span className="text-[#8b949e]">"{query}"</span></p>
        </div>
      )}
    </div>
  )
}