import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from '@remix-run/react'
import styles from '~/styles/app.css'
import Layout from '~/components/Layout'
import { LoaderArgs, json } from '@shopify/remix-oxygen'
import { formatLinks } from '~/helpers/format'
import { Menu, Shop } from '@shopify/hydrogen/storefront-api-types'

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

export async function loader({ context }: LoaderArgs) {
  return json({
    ...await context.storefront.query<{ shop: Shop, menu: Menu }>(SHOP_QUERY),
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
          links={formatLinks(menu.items, domain)}
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

    menu(handle: "main-menu") {
      items {
        id
        title
        url
      }
    }
  }
`
