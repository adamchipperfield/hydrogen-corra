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
import { createCart } from './routes/cart'
import { cartFragment } from './helpers/fragments'

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

    cart = (async (): Promise<RootMatches['data']['cart']> => {
      if (!cartId) {
        const { cartCreate } = await createCart(context.storefront)

        if (cartCreate) {
          return cartCreate.cart
        }
      }

      const { cart } = await context.storefront.query<CartResponse>(
        CART_QUERY,
        {
          variables: {
            cartId
          },
          cache: context.storefront.CacheNone()
        }
      )

      if (!cart) {
        const { cartCreate } = await createCart(context.storefront)

        if (cartCreate) {
          return cartCreate.cart
        }
      }

      return cart
    })()

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
  query ($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }

  ${cartFragment}
`
