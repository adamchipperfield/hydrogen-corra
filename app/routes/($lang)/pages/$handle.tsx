import type { Page } from '@shopify/hydrogen/storefront-api-types'
import type { LoaderArgs } from '@shopify/remix-oxygen'
import { useLoaderData } from '@remix-run/react'

export async function loader({ params, context }: LoaderArgs) {
  const { page } = await context.storefront.query<{ page: Page }>(PAGE_QUERY, {
    variables: {
      handle: params.handle
    }
  })

  if (!page) {
    throw new Response(
      'Page not found',
      {
        status: 404
      }
    )
  }

  return {
    page
  }
}

export default function Page() {
  const { page } = useLoaderData<typeof loader>()

  return (
    <div className="container mx-auto px-6 py-6">
      <h1 className="text-h2">{page.title}</h1>

      {page.body && (
        <div
          className="mt-8 prose"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      )}
    </div>
  )
}

const PAGE_QUERY = `#graphql
  query ($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    page(handle: $handle) {
      title
      body
    }
  }
`
