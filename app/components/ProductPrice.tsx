import { Money } from '@shopify/hydrogen'
import type { Maybe, MoneyV2 } from '@shopify/hydrogen/storefront-api-types'

export default function ProductPrice({
  price,
  compareAtPrice
}: {
  price: MoneyV2
  compareAtPrice?: Maybe<MoneyV2>
}) {
  const isSale = compareAtPrice && compareAtPrice.amount > price.amount

  return (
    <>
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
            data={compareAtPrice}
            as="s"
            className="text-black/50"
            withoutTrailingZeros
          />
        </>
      )}
    </>
  )
}
