import { useFetcher, useLoaderData } from '@remix-run/react'
import type { LoaderArgs } from '@shopify/remix-oxygen'
import type { Product } from '@shopify/hydrogen/storefront-api-types'
import { productFragment } from '~/helpers/fragments'
import { useState } from 'react'

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
  const [quantity, setQuantity] = useState(1)
  const [merchandise, setMerchandise] = useState(product.variants.nodes.at(0)?.id)

  return (
    <div>
      <h1>{product.title}</h1>

      <Form action="/cart" method="post">
        <input type="hidden" name="action" value="add_to_cart" readOnly />

        <select
          name="merchandise"
          onChange={({ target }) => {
            setMerchandise(target.value)
          }}
          defaultValue={merchandise}
        >
          {product.variants.nodes.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.title}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="quantity"
          value={quantity}
          onChange={({ target }) => {
            setQuantity(Number(target.value))
          }}
        />

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
