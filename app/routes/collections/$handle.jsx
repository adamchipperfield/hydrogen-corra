import { useLoaderData } from '@remix-run/react'
import ProductCard from '../../components/ProductCard'

export async function loader({ params, context }) {
  const { collection } = await context.storefront.query(
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
  const { collection } = useLoaderData()

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="max-w-xl mb-8">
        <h1 className="text-h2">{collection.title}</h1>
        
        {collection.description && (
          <p className="mt-2 text-sm">{collection.description}</p>
        )}
      </div>

      <div class="grid gap-4 gap-y-8 grid-cols-2 md:grid-cols-4">
        {collection.products.nodes.map(({ id, ...rest }) => (
          <ProductCard
            key={id}
            product={{ id, ...rest }}
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
          id
          title
          handle
          featuredImage {
            width
            height
            url
            altText
          }
        }
      }
    }
  }
`
