"use client"

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote"
interface MdxRendererProps {
  mdxSource: MDXRemoteSerializeResult
}

export default function MdxRenderer({ mdxSource }: MdxRendererProps) {
  return <MDXRemote {...mdxSource}  />
}
