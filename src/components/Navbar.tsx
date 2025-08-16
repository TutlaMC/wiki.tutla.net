"use client"

import Link from "next/link"
import Search from "./Search"
import MobileSidebar from "./MobileSidebar"

export default function Navbar(props: any) {
  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <MobileSidebar {...props} />
        <div className="font-bold text-xl">Tutla Wiki</div>
      </div>
      <div className="space-x-4">
        <Search></Search>
      </div>
    </nav>
  )
}
