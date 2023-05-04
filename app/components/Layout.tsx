import { Await, Link, useMatches } from '@remix-run/react'
import type { MenuItem } from '@shopify/hydrogen/storefront-api-types'
import { type ReactNode, Suspense } from 'react'
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
        <div className="container mx-auto px-6 py-6 md:py-10 grid grid-cols-12 md:flex">
          <div className="md:hidden col-span-3">
            <button>Menu</button>
          </div>

          <div className="col-span-6 text-center">
            <a className="font-bold" href="/">{title}</a>
          </div>

          <div className="hidden md:block grow ml-10">
            <ul className="flex gap-6">
              {links.map(({ title, url, id }) => (
                <li key={id}>
                  {url ? <a href={url}>{title}</a> : title}
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-3 text-right">
            <Suspense fallback={<Loader height={19} width={64} />}>
              <Await resolve={root.data.cart}>
                {(cart) => (
                  <Link to="/cart">
                    Cart ({cart.totalQuantity})
                  </Link>
                )}
              </Await>
            </Suspense>
          </div>
        </div>
      </header>

      <main>
        {children}
      </main>
    </div>
  )
}
