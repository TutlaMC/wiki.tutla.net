"use client";
import { isMobile } from "react-device-detect";

interface RightSidebarProps {
  data: {
    title?: string;
    summary?: string;
  };
}

export default function RightSidebar({ data }: RightSidebarProps) {
  if (isMobile) return null;

  return (
    <aside className="sticky top-0 max-h-screen w-60 p-4 border-l border-gray-700">
      <h2 className="font-bold mb-2">{data.title ?? ""}</h2>
      <p>{data.summary}</p>
    </aside>
  );
}
