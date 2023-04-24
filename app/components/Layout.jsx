export default function Layout({ children, title }) {
  return (
    <div className="grid grid-cols-[100%] grid-rows-[auto_1fr_auto] min-h-screen">
      <header>
        <div className="container mx-auto py-6">
          <a className="font-bold" href="/">{title}</a>
        </div>
      </header>

      <main>
        {children}
      </main>
    </div>
  )
}
