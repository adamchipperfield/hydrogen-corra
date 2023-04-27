import {
  Links,
  Meta,
  Outlet,
  RouteMatch,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from '@remix-run/react'
import styles from '~/styles/app.css'
import Layout from '~/components/Layout'
import { LoaderArgs, defer } from '@shopify/remix-oxygen'
import { formatMenuItems } from '~/helpers/format'
import { Cart, Menu, Shop } from '@shopify/hydrogen/storefront-api-types'

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

type CartResponse = {
  cart: Cart
}

export interface RootMatches extends RouteMatch {
  data: {
    shop: Shop
    menu: Menu
    cart: CartResponse['cart']
    domain: string
  }
}

export async function loader({ context }: LoaderArgs) {
  const { shop, menu } = await context.storefront.query<{
    shop: RootMatches['data']['shop']
    menu: RootMatches['data']['menu']
  }>(SHOP_QUERY)

  const cartId = await context.session.get('cart')
  let cart: Promise<RootMatches['data']['cart']> | undefined = undefined

  if (cartId) {
    cart = (async (): Promise<RootMatches['data']['cart']> => {
      const { cart } = await context.storefront.query<CartResponse>(
        CART_QUERY,
        {
          variables: {
            cartId
          },
          cache: context.storefront.CacheNone()
        }
      )

      return cart
    })()
  }

  return defer({
    shop,
    menu,
    cart,
    domain: context.storefront.getShopifyDomain()
  })
}

export default function App() {
  const { shop, menu, domain } = useLoaderData<typeof loader>()

  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>

      <body>
        <Layout
          title={shop.name}
          links={formatMenuItems(menu.items, domain)}
        >
          <Outlet />
        </Layout>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const SHOP_QUERY = `#graphql
  query {
    shop {
      name
      primaryDomain {
        url
      }
    }

    menu(handle: "hydrogen-menu") {
      items {
        id
        title
        url
      }
    }
  }
`

const CART_QUERY = `#graphql
  query ($cartId: ID!) {
    cart(id: $cartId) {
      id
      totalQuantity
      lines(first: 100) {
        nodes {
          id
          cost {
            subtotalAmount {
              amount
              currencyCode
            }
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              image {
                url
                height
                width
                altText
              }
              product {
                title
                handle
              }
            }
          }
        }
      }
    }
  }
`
