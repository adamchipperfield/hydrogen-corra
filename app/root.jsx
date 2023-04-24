import {
  Links,
  Outlet,
  Scripts,
  ScrollRestoration
} from '@remix-run/react'
import tailwind from './styles/tailwind-build.css'
import Layout from './components/Layout'

export const links = () => [
  {
    rel: 'stylesheet',
    href: tailwind
  }
]

export default function App() {
  return (
    <html>
      <head>
        <Links />
      </head>

      <body>
        <Layout title={'Shop name'}>
          <Outlet />
        </Layout>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
