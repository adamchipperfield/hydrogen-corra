import { useFetcher, useLoaderData, useMatches, useSearchParams } from '@remix-run/react'
import type { LoaderArgs } from '@shopify/remix-oxygen'
import type { DisplayableError, Product } from '@shopify/hydrogen/storefront-api-types'
import { productFragment } from '~/helpers/fragments'
import { useEffect, useState } from 'react'
import { Image, Money } from '@shopify/hydrogen'
import DetailsTab from '~/components/DetailsTab'
import type { RootMatch } from '~/root'
import { buttonClasses } from '~/helpers/classes'
import ProductPrice from '~/components/ProductPrice'
import IconMisc from '~/components/IconMisc'

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

/**
 * Returns the variant object of a product by its identifier.
 */
function getVariantById(product: Product, variant?: String) {
  return product.variants.nodes.find(({ id }) => id === variant)
}

export default function ProductPage() {
  const { product } = useLoaderData<typeof loader>()
  /* @ts-ignore */
  const [root]: [RootMatch] = useMatches()
  const policies = [root.data.shop.refundPolicy, root.data.shop.shippingPolicy]

  return (
    <div className="container mx-auto px-6 flex flex-col items-start gap-6 md:grid md:grid-cols-[2fr_1fr]">
      <div>
        {product.images.nodes.map((image) => (
          <div key={image.id}>
            <Image data={image} width={976} />
          </div>
        ))}
      </div>

      <div className="w-full md:sticky md:top-0 pt-10 md:pl-6">
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
  const [selectedVariant, setSelectedVariant] = useState(getVariantById(product, merchandise))
  const loading = fetcher.state === 'loading' || fetcher.state === 'submitting'
  const errors = fetcher.data?.errors as DisplayableError[] ?? []
  const hasOnlyDefaultVariant = product.options.length === 1 && product.options[0].values.length <= 1

  useEffect(() => {
    if (merchandise === selectedVariant?.id) {
      return
    }

    setSelectedVariant(
      getVariantById(product, merchandise)
    )
  }, [merchandise])

  return (
    <fetcher.Form action="/cart" method="post">
      <input type="hidden" name="action" value="add_to_cart" readOnly />

      <h1 className="text-h2 mb-4">{product.title}</h1>
      
      {product.vendor && (
        <p className="text-sm -mt-2 mb-4 text-slate-500">{product.vendor}</p>
      )}

      {!product.isGiftCard && selectedVariant && (
        <div className="mb-4">
          <ProductPrice
            price={selectedVariant.price}
            compareAtPrice={selectedVariant.compareAtPrice}
          />
        </div>
      )}

      {errors.length >= 1 && (
        <ul className="flex flex-col gap-1 my-4">
          {errors.map(({ message }) => (
            <li className="text-red-500">{message}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-col items-start gap-4">
        <div className={`flex flex-col gap-2 ${hasOnlyDefaultVariant ? 'hidden' : ''}`}>
          <label className="text-sm" htmlFor={`product-variant-${product.id}`}>
            Select variant
          </label>

          <select
            id={`product-variant-${product.id}`}
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
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm" htmlFor={`product-quantity-${product.id}`}>
            Quantity
          </label>

          <input
            id={`product-quantity-${product.id}`}
            type="number"
            name="quantity"
            value={quantity}
            onChange={({ target }) => {
              setQuantity(Number(target.value))
            }}
          />
        </div>

        <button
          className={`${buttonClasses} ${!product.availableForSale ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!product.availableForSale || loading}
        >
          {loading
            ? <IconMisc className="animate-spin mx-auto" icon="loading" />
            : product.availableForSale ? 'Add to cart' : 'Out of stock'}
        </button>
      </div>
    </fetcher.Form>
  )
}

const PRODUCT_QUERY = `#graphql
  query ($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductFragment
    }
  }

  ${productFragment}
`
