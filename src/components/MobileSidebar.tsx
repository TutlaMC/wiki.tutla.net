"use client"

import { useState } from "react"
import { X, Menu } from "lucide-react"
import LeftSidebar from "./LeftSidebar"

export default function MobileSidebar(props: any) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="md:hidden p-2 text-white"
        onClick={() => setOpen(true)}
      >
        <Menu size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex">
          <div className="bg-[#151a21] w-64 p-4 overflow-y-auto">
            <button
              className="mb-4 p-2 text-white"
              onClick={() => setOpen(false)}
            >
              <X size={24} />
            </button>
            <LeftSidebar {...props} />
          </div>
          <div
            className="flex-1"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </>
  )
}
