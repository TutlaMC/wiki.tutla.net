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
  const remarkNotifSyntax = () => (tree: Root) => {
      visit(tree, "paragraph", (node, index, parent) => {
        if (!node.children || node.children.length !== 1) return
        const child = node.children[0]
        if (child.type !== "text") return

        const match = /^!\(\((.*?)\)\[(.*?)\]\)$/.exec(child.value)
        if (!match) return

        const [, title, content] = match

        parent!.children[index!] = {
          type: "mdxJsxFlowElement",
          name: "Notif",
          attributes: [{ type: "mdxJsxAttribute", name: "title", value: title }],
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: content }],
            },
          ],
        }
      })
    }



  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm, remarkDeflist, remarkCollectHeadings, remarkNotifSyntax],
      rehypePlugins: [[rehypePrettyCode, { theme: "github-dark" }]],
    },
  })

  return { mdxSource, headings }
}
