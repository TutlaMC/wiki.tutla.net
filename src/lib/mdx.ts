import { serialize } from "next-mdx-remote/serialize"
import remarkGfm from "remark-gfm"
import remarkDeflist from "remark-deflist"
import rehypePrettyCode from "rehype-pretty-code"
import { visit } from "unist-util-visit"
import type { Root,  Heading, Text } from "mdast"

export async function getMdxSource(content: string) {
  const headings: { text: string; level: number }[] = []

  const remarkCollectHeadings = () => (tree: Root) => {
    visit(tree, "heading", (node: Heading) => {
      const text = node.children
        .filter((child): child is Text => child.type === "text")
        .map((child) => child.value)
        .join("")
      headings.push({ text, level: node.depth })
    })
  }

  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm, remarkDeflist, remarkCollectHeadings],
      rehypePlugins: [[rehypePrettyCode, { theme: "github-dark" }]],
    },
  })

  return { mdxSource, headings }
}
