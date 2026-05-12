import { BookOpen, Boxes, Terminal, Puzzle, Github, ArrowUpRight } from "lucide-react";
import Search from "@/components/Search";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#21262d] bg-[#0d1117]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 no-underline">
            <span className="text-[#c9d1d9] font-semibold tracking-tight">Tutla Wiki</span>
          </a>
          <nav className="flex items-center gap-5 text-sm text-[#8b949e]">
            <a href="https://tutla.net" className="hover:text-[#c9d1d9] transition-colors no-underline flex items-center gap-1">
              tutla.net <ArrowUpRight size={12} />
            </a>
            <a href="https://github.com/tutlamc" className="hover:text-[#c9d1d9] transition-colors no-underline">
              <Github size={16} />
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
        {/* Backdrop glow */}
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#388bfd]/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#c9d1d9 1px, transparent 1px), linear-gradient(90deg, #c9d1d9 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative z-10 w-full flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#30363d] bg-[#161b22] text-xs text-[#8b949e] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
            Docs for every Tutla project
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#f0f6fc] mb-4">
            Tutla Wiki
          </h1>
          <p className="text-[#8b949e] max-w-xl mb-10 text-base sm:text-lg">
            Search documentation for any Tutla plugin, mod, app, dev tool or library
          </p>

          <Search size="lg" autoFocus />

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-6 text-xs text-[#484f58]">
            <span>Try:</span>
            {["tusan", "tums", "manhunt", "tutla assistant"].map((q) => (
              <span key={q} className="font-mono text-[#8b949e] bg-[#161b22] border border-[#30363d] rounded px-1.5 py-0.5">
                {q}
              </span>
            ))}
          </div>
        </div>

        
      </main>

      {/* Footer */}
      <footer className="border-t border-[#21262d] mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#484f58]">
          <span>© {new Date().getFullYear()} Tutla</span>
          <div className="flex items-center gap-4">
            <a href="https://tutla.net" className="hover:text-[#8b949e] transition-colors no-underline">tutla.net</a>
            <a href="https://github.com/tutlamc" className="hover:text-[#8b949e] transition-colors no-underline">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
