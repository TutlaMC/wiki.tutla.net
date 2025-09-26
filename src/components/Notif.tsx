"use client"

export default function Notif({ title, children }: { title: string; children: React.ReactNode }) {
  const ntitle = title.split(" ")[0]

  let styles = "border-gray-800/20 bg-gray-800"
  if (ntitle.includes("warning")){
    styles = "border-yellow-500 bg-yellow-500/20"
  } else if (ntitle.includes("important")) {
    styles = "border-red-500 bg-red-500/20"
  }

  title = title.replace("warning", "").replace("important", "")

  return (
    <div className={`border-l-4 p-1 pl-4 rounded w-full ${styles}`}>
      <h3 className="font-bold mb-0">{title}</h3>
      <span>{children}</span>
    </div>
  )
}
