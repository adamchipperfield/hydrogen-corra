import {
  Outlet,
  Scripts,
  ScrollRestoration
} from '@remix-run/react'

export default function App() {
  return (
    <html>
      <body>
        <Outlet />

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
