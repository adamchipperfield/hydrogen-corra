import { useFetcher, useLoaderData } from '@remix-run/react'
import type { LoaderArgs } from '@shopify/remix-oxygen'
import type { Product } from '@shopify/hydrogen/storefront-api-types'
import { productFragment } from '~/helpers/fragments'

export async function loader({ params, context }: LoaderArgs) {
  const { product } = await context.storefront.query<{ product: Product }>(
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
  const { product } = useLoaderData<typeof loader>()
  const { Form } = useFetcher()

  return (
    <div>
      <h1>{product.title}</h1>

      <Form action="/cart" method="post">
        <input type="hidden" name="action" value="add_to_cart" readOnly />
        <input type="hidden" name="merchandise" value={product.variants.nodes.at(0)?.id} readOnly />
        <input type="number" name="quantity" value={JSON.stringify(2)} readOnly />

        <button>Add to cart</button>
      </Form>
    </div>
  )
}

const PRODUCT_QUERY = `#graphql
  query ($handle: String!) {
    product(handle: $handle) {
      ...ProductFragment
    }
  }

  ${productFragment}
`
