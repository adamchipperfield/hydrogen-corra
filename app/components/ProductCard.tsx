import { Link } from '@remix-run/react'
import { Image, Money } from '@shopify/hydrogen'
import type { Product } from '@shopify/hydrogen/storefront-api-types'
import defaultTheme from 'tailwindcss/defaultTheme'

export default function ProductCard({ product }: { product: Product }) {
  const price = product.priceRange.minVariantPrice
  const compare = product.compareAtPriceRange.minVariantPrice
  const isSale = compare.amount > price.amount

  return (
    <Link to={`/products/${product.handle}`}>
      <div className="bg-slate-200 aspect-[1]">
        {product.featuredImage && (
          <Image
            data={product.featuredImage}
            alt={product.title}
            sizes={`(min-width: ${defaultTheme.screens.sm}) 360px, 50vw`}
          />
        )}
      </div>

      <h3 className="text-sm mt-4">{product.title}</h3>

      <p className="text-sm mt-1">
        <Money
          data={price}
          withoutTrailingZeros
          as="span"
          className={isSale ? 'text-red-500' : ''}
        />

        {isSale && (
          <>
            &nbsp;
            <Money
              data={compare}
              as="s"
              className="text-black/50"
              withoutTrailingZeros
            />
          </>
        )}
      </p>
    </Link>
  )
}
