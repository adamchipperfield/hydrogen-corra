import Link from '~/components/Link'
import { Image } from '@shopify/hydrogen'
import type { Product } from '@shopify/hydrogen/storefront-api-types'
import defaultTheme from 'tailwindcss/defaultTheme'
import ProductPrice from '~/components/ProductPrice'

export default function ProductCard({ product }: { product: Product }) {
  const variant = product.variants.nodes[0]

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
        <ProductPrice
          price={variant.price}
          compareAtPrice={variant.compareAtPrice}
        />
      </p>
    </Link>
  )
}
