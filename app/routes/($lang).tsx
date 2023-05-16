import { Outlet } from '@remix-run/react'
import type { LoaderArgs } from '@shopify/remix-oxygen'

export async function loader({ params, context }: LoaderArgs) {

  /**
   * Throws a 404 if the locale isn't valid.
   */
  if (
    params.lang &&
    !context.locales.find(({ param }) => param === params.lang)
  ) {
    throw new Response(
      'Page not found',
      {
        status: 404
      }
    )
  }

  return {}
}

export default function Lang() {
  return <Outlet />
}
