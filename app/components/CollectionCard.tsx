import { Link } from '@remix-run/react'
import { Image } from '@shopify/hydrogen'
import { Collection } from '@shopify/hydrogen/storefront-api-types'
import defaultTheme from 'tailwindcss/defaultTheme'

export default function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link to={`/collections/${collection.handle}`}>
      <div className="bg-slate-200 aspect-[1]">
        {collection.image && (
          <Image
            data={collection.image}
            alt={collection.title}
            aspectRatio="1 / 1"
            className="object-cover"
            sizes={`(min-width: ${defaultTheme.screens.sm}) 490px, 100vw`}
          />
        )}
      </div>

      <h3 className="text-sm mt-4">{collection.title}</h3>
    </Link>
  )
}
