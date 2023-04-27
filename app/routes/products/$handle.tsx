import { useFetcher, useLoaderData, useMatches, useSearchParams } from '@remix-run/react'
import type { LoaderArgs } from '@shopify/remix-oxygen'
import type { DisplayableError, Product } from '@shopify/hydrogen/storefront-api-types'
import { productFragment } from '~/helpers/fragments'
import { useState } from 'react'
import { Image } from '@shopify/hydrogen'
import DetailsTab from '~/components/DetailsTab'
import type { RootMatches } from '~/root'

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
  /* @ts-ignore */
  const [root]: [RootMatches] = useMatches()
  const policies = [root.data.shop.refundPolicy, root.data.shop.shippingPolicy]

  return (
    <div className="container mx-auto px-6 flex flex-col items-start gap-6 md:grid md:grid-cols-[2fr_1fr]">
      <div>
        {product.images.nodes.map((image) => (
          <Image data={image} />
        ))}
      </div>

      <div className="sticky top-0 pt-6">
        <ProductForm product={product as Product} />

        <div className="mt-6">
          {product.descriptionHtml && (
            <DetailsTab title={'Description'}>
              <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            </DetailsTab>
          )}

          {policies.map((policy) => policy && (
            <DetailsTab title={policy.title}>
              {policy.body}
            </DetailsTab>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Handles adding a product to the cart.
 */
function ProductForm({ product }: { product: Product }) {
  const fetcher = useFetcher()
  const [quantity, setQuantity] = useState(1)
  const [merchandise, setMerchandise] = useState(getDefaultVariantId(product))
  const loading = fetcher.state === 'loading' || fetcher.state === 'submitting'
  const errors = fetcher.data?.errors as DisplayableError[] ?? []

  return (
    <fetcher.Form action="/cart" method="post">
      <input type="hidden" name="action" value="add_to_cart" readOnly />

      <h1 className="text-h2 mb-4">{product.title}</h1>
      
      {product.vendor && (
        <p className="text-sm -mt-2 mb-4 text-slate-500">{product.vendor}</p>
      )}

      {errors.length >= 1 && (
        <ul className="flex flex-col gap-1 my-4">
          {errors.map(({ message }) => (
            <li className="text-red-500">{message}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-col items-start gap-4">
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
      </div>
    </fetcher.Form>
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
