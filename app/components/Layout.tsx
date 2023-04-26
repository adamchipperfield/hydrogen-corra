import { Await, Link, useMatches } from '@remix-run/react'
import { MenuItem } from '@shopify/hydrogen/storefront-api-types'
import { ReactNode, Suspense } from 'react'
import Loader from '~/components/Loader'

export default function Layout({
  children,
  title,
  links
}: {
  children: ReactNode
  title: string
  links: Array<MenuItem>
}) {
  const [root] = useMatches()

  return (
    <div className="grid grid-cols-[100%] grid-rows-[auto_1fr_auto] min-h-screen">
      <header>
        <div className="container mx-auto px-6 py-6">
          <a className="font-bold" href="/">{title}</a>

          <ul className="flex gap-4">
            {links.map(({ title, url, id }) => (
              <li key={id}>
                {url ? <a href={url}>{title}</a> : title}
              </li>
            ))}
          </ul>

          <Suspense fallback={<Loader width={16} />}>
            <Await resolve={root.data.cart}>
              {(cart) => (
                <Link to="/cart">
                  Cart ({cart.totalQuantity})
                </Link>
              )}
            </Await>
          </Suspense>
        </div>
      </header>

      <main>
        {children}
      </main>
    </div>
  )
}
