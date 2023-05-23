import { Outlet } from '@remix-run/react'
import type { LoaderArgs } from '@shopify/remix-oxygen'
import { getLocales } from '~/helpers/i18n'

export async function loader({ params, context }: LoaderArgs) {

  /**
   * Throws a 404 if the locale isn't valid.
   */
  if (
    params.lang &&
    !getLocales(context.localization.availableCountries)
      .find(({ param }) => param === params.lang)
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
