import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from '@remix-run/react'
import tailwind from './styles/tailwind-build.css'
import Layout from './components/Layout'
import { json } from '@shopify/remix-oxygen'
import { formatLinks } from './helpers/format'

export const links = () => [
  {
    rel: 'stylesheet',
    href: tailwind
  }
]

export const meta = () => ({
  charset: 'utf-8',
  viewport: 'width=device-width,initial-scale=1'
})

export async function loader({ context }) {
  return json({
    ...await context.storefront.query(SHOP_QUERY),
    domain: context.storefront.getShopifyDomain()
  })
}

export default function App() {
  const { shop, menu, domain } = useLoaderData()

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
