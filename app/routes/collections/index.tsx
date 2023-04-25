import { useLoaderData } from '@remix-run/react'
import CollectionCard from '~/components/CollectionCard'
import { LoaderArgs } from '@shopify/remix-oxygen'
import type { Collection } from '@shopify/hydrogen/storefront-api-types'

export async function loader({ context }: LoaderArgs) {
  return await context.storefront.query<{ collections: { nodes: Array<Collection> }}>(COLLECTIONS_QUERY)
}

export default function Collections() {
  const { collections } = useLoaderData<typeof loader>()

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="max-w-xl mb-8">
        <h1 className="text-h2">Collections</h1>
      </div>

      <div className="grid gap-4 gap-y-8 grid-cols-1 md:grid-cols-3">
        {collections.nodes.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection as Collection}
          />
        ))}
      </div>
    </div>
  )
}

const COLLECTIONS_QUERY = `#graphql
  query {
    collections(first: 12) {
      nodes {
        id
        title
        handle
        image {
          height
          width
          url
          altText
        }
      }
    }
  }
`
