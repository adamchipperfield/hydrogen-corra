import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteLoaderData
} from '@remix-run/react'
import styles from '~/styles/app.css'
import Layout from '~/components/Layout'
import { type LoaderArgs, defer } from '@shopify/remix-oxygen'
import { formatMenuItems } from '~/helpers/format'
import type { Menu, Shop } from '@shopify/hydrogen/storefront-api-types'
import { commitCart, createCart, formatCommitCart } from '~/routes/($lang)/cart'
import { cartFragment } from '~/helpers/fragments'
import type { ReactNode } from 'react'
import { buttonClasses } from '~/helpers/classes'
import type { CartResponse } from '~/routes/($lang)/cart'
import Link from '~/components/Link'

export const links = () => [
  {
    rel: 'stylesheet',
    href: styles
  }
]

export const meta = () => ({
  charset: 'utf-8',
  viewport: 'width=device-width,initial-scale=1'
})

/**
 * Returns the cart and response headers.
 * - Fetches or creates the cart, then commits to the headers.
 * - Returned headers should be returned by a `loader`.
 */
async function getCart(context: LoaderArgs['context']) {
  const cartId = await context.session.get('cart')

  const payload = {
    session: context.session
  }

  if (!cartId) {
    const { cartCreate } = await createCart({
      context,
      country: context.storefront.i18n.country
    })

    return await formatCommitCart(
      await commitCart({
        response: cartCreate,
        ...payload
      })
    )
  }

  const cartQuery = await context.storefront.query<CartResponse>(
    CART_QUERY,
    {
      variables: {
        cartId
      },
      cache: context.storefront.CacheNone()
    }
  )

  if (!cartQuery) {
    const { cartCreate } = await createCart({
      context,
      country: context.storefront.i18n.country
    })

    return await formatCommitCart(
      await commitCart({
        response: cartCreate,
        ...payload
      })
    )
  }

  return await formatCommitCart(
    await commitCart({
      response: cartQuery,
      ...payload
    })
  )
}

export async function loader({ context }: LoaderArgs) {
  const { cart, headers } = await getCart(context)
  const { shop, menu } = await context.storefront.query<{
    shop: Shop
    menu: Menu
  }>(GLOBAL_QUERY)

  return defer(
    {
      shop,
      menu,
      cart,
      domain: context.storefront.getShopifyDomain(),
      i18n: context.storefront.i18n,
      localization: context.localization
    },
    {
      headers
    }
  )
}

/**
 * The root wrapper, for consistent rendering.
 */
function Wrapper({
  shop,
  menu,
  domain,
  children
}: {
  shop: Shop
  menu: Menu
  domain: string
  children: ReactNode
}) {
  return (
    <html lang="EN">
      <head>
        <Meta />
        <Links />
      </head>

      <body>
        <Layout
          title={shop.name}
          links={formatMenuItems(menu.items, domain)}
        >
          {children}
        </Layout>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

/**
 * The root app layout.
 */
export default function App() {
  return (
    <Wrapper {...useLoaderData<typeof loader>()}>
      <Outlet />
    </Wrapper>
  )
}

/**
 * The error layout.
 */
export function CatchBoundary() {
  return (
    <Wrapper {...useRouteLoaderData('root') as LoaderData}>
      <div className="container px-6 mx-auto">
        <div className="flex flex-col items-start gap-6 max-w-lg mt-16">
          <h1 className="text-h3">Page not found</h1>

          <p>
            We couldn't find the page you're looking for. Try checking the path or heading back to the home page.
          </p>
          
          <Link
            className={`${buttonClasses} !w-auto mt-4`}
            to="/"
          >
            Go to the home page
          </Link>
        </div>
      </div>
    </Wrapper>
  )
}

const GLOBAL_QUERY = `#graphql
  query ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      name
      primaryDomain {
        url
      }
      refundPolicy {
        body
        title
        url
      }
      shippingPolicy {
        body
        title
        url
      }
    }

    menu(handle: "main-menu") {
      items {
        id
        title
        url
      }
    }
  }
`

const CART_QUERY = `#graphql
  query ($cartId: ID!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }

  ${cartFragment}
`

/**
 * Typing for the loader data.
 */
export type LoaderData = Awaited<ReturnType<typeof loader>>['data']
