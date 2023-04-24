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
  return await context.storefront.query(SHOP_QUERY)
}

export default function App() {
  const { shop, menu } = useLoaderData()

  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>

      <body>
        <Layout
          title={shop.name}
          links={menu.items}
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
