import { Outlet } from '@remix-run/react'
import type { Localization } from '@shopify/hydrogen/storefront-api-types'
import type { LoaderArgs } from '@shopify/remix-oxygen'

export async function loader({ params, context }: LoaderArgs) {

  /**
   * Queries Shopify for all locales.
   * - Maps all possible `[language]-[country]` codes.
   * - If `params.lang` doesn't exist, throw a 404.
   */
  const { localization } = await context.storefront.query<{ localization: Localization }>(LOCALIZATION_QUERY)
  const locales = [] as string[]

  localization.availableCountries.forEach((country) => {
    country.availableLanguages.forEach((language) => {
      locales.push(
        `${language.isoCode}-${country.isoCode}`.toLowerCase()
      )
    })
  })

  if (params.lang && !locales.includes(params.lang)) {
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

const LOCALIZATION_QUERY = `#graphql
  query {
    localization {
      availableCountries {
        isoCode

        availableLanguages {
          isoCode
        }
      }
    }
  }
`
