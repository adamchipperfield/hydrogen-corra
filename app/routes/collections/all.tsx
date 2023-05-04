import type { Collection as CollectionType, ProductConnection } from '@shopify/hydrogen/storefront-api-types'
import type { LoaderArgs } from '@shopify/remix-oxygen'
import { productCardFragment } from '~/helpers/fragments'
import Collection, { productsPerPage } from '~/routes/collections/$handle'

export async function loader({ context, request }: LoaderArgs): Promise<{ collection: CollectionType }> {
  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor')

  const { products } = await context.storefront.query<{ products: ProductConnection }>(
    ALL_PRODUCTS_QUERY,
    {
      variables: {
        after: cursor,
        first: productsPerPage
      }
    }
  )

  if (!products) {
    throw new Response(
      'Collection not found',
      {
        status: 404
      }
    )
  }

  return {
    collection: {
      id: '1',
      handle: 'all',
      description: '',
      descriptionHtml: '',
      title: 'All products',
      metafields: [],
      products,
      seo: {},
      updatedAt: '1'
    }
  }
}

export default Collection

const ALL_PRODUCTS_QUERY = `#graphql
  query ($after: String, $first: Int = 8) {
    products(first: $first, after: $after) {
      nodes {
        ...ProductCardFragment
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }

  ${productCardFragment}
`
