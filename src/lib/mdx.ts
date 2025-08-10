import { serialize } from "next-mdx-remote/serialize"
import remarkGfm from "remark-gfm"
import remarkDeflist from "remark-deflist"
import rehypePrettyCode from "rehype-pretty-code"
import { visit } from "unist-util-visit"

export async function getMdxSource(content: string) {
  const headings: { text: string; level: number }[] = []

  const remarkCollectHeadings = () => (tree: any) => {
    visit(tree, "heading", (node) => {
      const text = node.children
        .filter((child: any) => child.type === "text")
        .map((child: any) => child.value)
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
