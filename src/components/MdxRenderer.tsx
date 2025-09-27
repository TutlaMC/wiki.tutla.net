"use client"
import dynamic from 'next/dynamic'
import { MDXRemoteSerializeResult } from "next-mdx-remote"

const MDXRemote = dynamic(() => import('next-mdx-remote').then(mod => ({ default: mod.MDXRemote })), {
  ssr: false,
  loading: () => <div>Loading content...</div>
})

interface MdxRendererProps {
  mdxSource: MDXRemoteSerializeResult
}

export default function MdxRenderer({ mdxSource }: MdxRendererProps) {
  return <MDXRemote {...mdxSource} components={{ Notif: () => <div>Notif component</div> }} />
}