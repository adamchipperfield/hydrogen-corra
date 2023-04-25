import { useLoaderData } from '@remix-run/react'
import ProductCard from '~/components/ProductCard'
import type { LoaderArgs } from '@shopify/remix-oxygen'
import type { Collection, Product } from '@shopify/hydrogen/storefront-api-types'
import { productCardFragment } from '~/helpers/fragments'

export async function loader({ params, context }: LoaderArgs) {
  const { collection } = await context.storefront.query<{ collection: Collection }>(
    COLLECTION_QUERY,
    {
      variables: {
        handle: params.handle
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

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="max-w-xl mb-8">
        <h1 className="text-h2">{collection.title}</h1>
        
        {collection.description && (
          <p className="mt-2 text-sm">{collection.description}</p>
        )}
      </div>

      <div className="grid gap-4 gap-y-8 grid-cols-2 md:grid-cols-4">
        {collection.products.nodes.map((product) => (
          <ProductCard
            key={product.id}
            product={product as Product}
          />
        ))}
      </div>
    </div>
  )
}

const COLLECTION_QUERY = `#graphql
  query ($handle: String!) {
    collection(handle: $handle) {
      title
      description
      products(first: 12) {
        nodes {
          ...ProductCardFragment
        }
      }
    }
  }

  ${productCardFragment}
`
