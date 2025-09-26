"use client"

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote"
import Notif from "./Notif"
interface MdxRendererProps {
  mdxSource: MDXRemoteSerializeResult
}

export default function MdxRenderer({ mdxSource }: MdxRendererProps) {
  return <MDXRemote {...mdxSource} components={{Notif}} />
}
