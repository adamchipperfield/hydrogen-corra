import { useLoaderData } from '@remix-run/react'
import CollectionCard from '../../components/CollectionCard'

export async function loader({ context }) {
  return await context.storefront.query(COLLECTIONS_QUERY)
}

export default function Collections() {
  const { collections } = useLoaderData()

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="max-w-xl mb-8">
        <h1 className="text-h2">Collections</h1>
      </div>

      <div class="grid gap-4 gap-y-8 grid-cols-1 md:grid-cols-3">
        {collections.nodes.map(({ id, ...rest }) => (
          <CollectionCard
            key={id}
            collection={{ id, ...rest }}
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
