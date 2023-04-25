import { Link } from '@remix-run/react'
import { Image } from '@shopify/hydrogen'

export default function CollectionCard({ collection }) {
  return (
    <Link to={`/collections/${collection.handle}`}>
      <div className="bg-slate-200 aspect-[1]">
        {collection.image && (
          <Image
            data={collection.image}
            alt={collection.title}
            aspectRatio="1"
            className="object-cover"
          />
        )}
      </div>

      <h3 className="text-sm mt-4">{collection.title}</h3>
    </Link>
  )
}
