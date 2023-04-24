import { Link } from '@remix-run/react'
import { Image } from '@shopify/hydrogen'

export default function CollectionCard({ collection }) {
  return (
    <Link to={`/collections/${collection.handle}`}>
      <Image
        data={collection.image}
        alt={collection.title}
      />

      <h3 className="text-sm mt-4">{collection.title}</h3>
    </Link>
  )
}
