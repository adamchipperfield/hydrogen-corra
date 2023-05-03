import { useFetcher, useLoaderData } from '@remix-run/react'
import ProductCard from '~/components/ProductCard'
import type { LoaderArgs } from '@shopify/remix-oxygen'
import type { Collection, Product } from '@shopify/hydrogen/storefront-api-types'
import { productCardFragment } from '~/helpers/fragments'
import { useEffect, useState } from 'react'
import { buttonClasses } from '~/helpers/classes'

export async function loader({ params, context, request }: LoaderArgs) {
  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor')

  const { collection } = await context.storefront.query<{ collection: Collection }>(
    COLLECTION_QUERY,
    {
      variables: {
        handle: params.handle,
        after: cursor
      }
    }
  )

  if (!collection) {
    throw new Response(
      'Collection not found',
      {
        status: 404
      }
    )
  }

  return {
    collection
  }
}

export default function Collection() {
  const { collection } = useLoaderData<typeof loader>()
  const [pageInfo, setPageInfo] = useState(collection.products.pageInfo)
  const [products, setProducts] = useState(collection.products.nodes)

  /**
   * The fetcher handles client side queries, specifically for "load more".
   */
  const fetcher = useFetcher()

  useEffect(() => {

    /**
     * When the fetcher data changes, handle it.
     * - If the products haven't changed, do nothing (confirmed with `endCursor`).
     */
    if (
      !fetcher.data ||
      fetcher.data && (fetcher.data.collection.products.pageInfo.endCursor ===
        collection.products.pageInfo.endCursor)
    ) {
      return
    }

    /**
     * Push new products.
     */
    setProducts([
      ...products,
      ...fetcher.data.collection.products.nodes
    ])

    /**
     * Update the `pageInfo` object.
     */
    setPageInfo(fetcher.data.collection.products.pageInfo)
  }, [fetcher.data])

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="max-w-xl mb-8">
        <h1 className="text-h2">{collection.title}</h1>
        
        {collection.description && (
          <p className="mt-2 text-sm">{collection.description}</p>
        )}
      </div>

      <div className="grid gap-4 gap-y-8 grid-cols-2 md:grid-cols-4 my-12">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product as Product}
          />
        ))}
      </div>

      {pageInfo.hasNextPage && (
        <div className="flex justify-center my-12 md:my-20">
          <button
            className={`${buttonClasses} !w-auto`}
            onClick={() => {
              fetcher.load(`${window.location.pathname}?cursor=${pageInfo.endCursor}`)
            }}
          >
            {fetcher.state === 'loading' ? 'Loading' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}

const COLLECTION_QUERY = `#graphql
  query ($handle: String!, $after: String) {
    collection(handle: $handle) {
      title
      description
      products(first: 4, after: $after) {
        nodes {
          ...ProductCardFragment
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }

  ${productCardFragment}
`
