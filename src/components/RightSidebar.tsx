export default function RightSidebar({ data }: { data: any }) {
  return (
    <aside className="sticky top-0 max-h-screen w-60 p-4 border-l border-gray-700">
      <h2 className="font-bold mb-2">{String(data.title)}</h2>
      <p>Coming soon...</p>
    </aside>
  )
}
