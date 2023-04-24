export default function Layout({ children, title, links }) {
  return (
    <div className="grid grid-cols-[100%] grid-rows-[auto_1fr_auto] min-h-screen">
      <header>
        <div className="container mx-auto px-6 py-6">
          <a className="font-bold" href="/">{title}</a>

          <ul className="flex gap-4">
            {links.map(({ title, url, id }) => (
              <li key={id}>
                <a href={url}>{title}</a>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <main>
        {children}
      </main>
    </div>
  )
}
