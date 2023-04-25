import { Link } from '@remix-run/react'
import { Image, Money } from '@shopify/hydrogen'

export default function ProductCard({ product }) {
  const price = product.priceRange.minVariantPrice
  const compare = product.compareAtPriceRange.minVariantPrice
  const isSale = compare.amount > price.amount

  return (
    <Link to={`/products/${product.handle}`}>
      <Image
        data={product.featuredImage}
        alt={product.title}
      />

      <h3 className="text-sm mt-4">{product.title}</h3>

      <p className="text-sm mt-1">
        <Money
          data={price}
          withoutTrailingZeros
          as="span"
          className={isSale && 'text-red-500'}
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
