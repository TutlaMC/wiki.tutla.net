import { serialize } from "next-mdx-remote/serialize"
import remarkGfm from "remark-gfm"
import remarkDeflist from "remark-deflist"
import rehypePrettyCode from "rehype-pretty-code"
import { visit } from "unist-util-visit"
import type { Root, Heading, Text } from "mdast"

export async function getMdxSource(content: string) {
  const headings: { text: string; level: number }[] = []
  
  const remarkCollectHeadings = () => (tree: Root) => {
    visit(tree, "heading", (node: Heading) => {
      try {
        const text = node.children
          .filter((child): child is Text => child.type === "text")
          .map((child) => child.value)
          .join("")
        
        if (text.trim()) {
          headings.push({ text, level: node.depth })
        }
      } catch (error) {
        console.error("Error processing heading:", error)
      }
    })
  }
  
  const remarkNotifSyntax = () => (tree: Root) => {
    visit(tree, "paragraph", (node, index, parent) => {
      try {
        if (!node.children || node.children.length !== 1) return
        
        const child = node.children[0]
        if (child.type !== "text") return
        
        const match = /^!\(\((.*?)\)\[(.*?)\]\)$/.exec(child.value)
        if (!match) return
        
        const [, title, content] = match
        
        if (parent && typeof index === "number") {
          parent.children[index] = {
            type: "mdxJsxFlowElement",
            name: "Notif",
            attributes: [{ type: "mdxJsxAttribute", name: "title", value: title }],
            children: [
              {
                type: "paragraph",
                children: [{ type: "text", value: content }],
              },
            ],
          } as any
        }
      } catch (error) {
        console.error("Error processing notif syntax:", error)
      }
    })
  }
  
  try {
    const mdxSource = await serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkDeflist, remarkCollectHeadings, remarkNotifSyntax],
        rehypePlugins: [[rehypePrettyCode, { theme: "github-dark" }]],
      },
    })
    
    return { mdxSource, headings }
  } catch (error) {
    console.error("Error serializing MDX:", error)
    throw error
  }
}