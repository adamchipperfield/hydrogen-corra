import { useFetcher, useLoaderData, useSearchParams } from '@remix-run/react'
import type { LoaderArgs } from '@shopify/remix-oxygen'
import type { DisplayableError, Product } from '@shopify/hydrogen/storefront-api-types'
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

/**
 * Returns the default variant for the product.
 * - If a query parameter exists, use that.
 */
function getDefaultVariantId(product: Product) {
  const [params] = useSearchParams()
  const fallback = product.variants.nodes.at(0)?.id
  const variant = params.get('variant')

  if (!variant) {
    return fallback
  }

  return product.variants.nodes
    .find(({ id }) => id.includes(variant))?.id ?? fallback
}

export default function ProductPage() {
  const { product } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  const [quantity, setQuantity] = useState(1)
  const [merchandise, setMerchandise] = useState(getDefaultVariantId(product))
  const loading = fetcher.state === 'loading' || fetcher.state === 'submitting'
  const errors = fetcher.data?.errors as DisplayableError[] ?? []

  return (
    <div>
      <h1 className="mb-4">{product.title}</h1>

      {errors.length >= 1 && (
        <ul className="flex flex-col gap-1 my-4">
          {errors.map(({ message }) => (
            <li className="text-red-500">{message}</li>
          ))}
        </ul>
      )}

      <fetcher.Form action="/cart" method="post">
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

        <button disabled={loading}>Add to cart</button>
      </fetcher.Form>
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
