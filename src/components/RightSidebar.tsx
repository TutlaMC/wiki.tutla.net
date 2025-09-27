"use client";
import { isMobile } from "react-device-detect";
import Image from "next/image"

interface RightSidebarProps {
  image: string | null;
  data: {
    title?: string;
    summary?: string;
  };
}
export default function RightSidebar({ image, data }: RightSidebarProps) {
  if (isMobile) return null;

  return (
    <aside className="sticky top-0 max-h-screen w-60 p-4 border-l border-gray-700">
      <h2 className="font-bold mb-2">{data.title ?? ""}</h2>
      {image && (
        <Image 
          src={image} 
          alt={data.title || "Article image"} 
          width={200} 
          height={150}
          className="mb-2"
        />
      )}
      <p>{data.summary}</p>
    </aside>
  );
}