"use client"
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote"
import Notif from "./Notif"
import { useEffect, useState } from "react"

interface MdxRendererProps {
  mdxSource: MDXRemoteSerializeResult
}

export default function MdxRenderer({ mdxSource }: MdxRendererProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div>Loading content...</div>
  }

  return <MDXRemote {...mdxSource} components={{ Notif }} />
}