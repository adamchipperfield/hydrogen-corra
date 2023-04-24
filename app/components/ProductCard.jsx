import { Link } from '@remix-run/react'
import { Image } from '@shopify/hydrogen'

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.handle}`}>
      <Image
        data={product.featuredImage}
        alt={product.title}
      />

      <h3 className="text-sm mt-4">{product.title}</h3>
    </Link>
  )
}
