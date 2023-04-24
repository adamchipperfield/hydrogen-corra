import { useLoaderData } from '@remix-run/react'

export async function loader({ params, context }) {
  const { product } = await context.storefront.query(
    PRODUCT_QUERY,
    {
      variables: {
        handle: params.handle
      }
    }
  )

  if (!product) {
    throw new Response(
      'Product not found',
      {
        status: 404
      }
    )
  }

  return {
    product
  }
}

export default function Product() {
  const { product } = useLoaderData()

  return (
    <div>
      <h1>{product.title}</h1>
    </div>
  )
}

const PRODUCT_QUERY = `#graphql
  query ($handle: String!) {
    product(handle: $handle) {
      title
    }
  }
`
