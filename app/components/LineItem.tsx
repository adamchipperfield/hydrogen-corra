import { useFetcher, useMatches } from '@remix-run/react'
import { Image, Money } from '@shopify/hydrogen'
import type { CartLine } from '@shopify/hydrogen/storefront-api-types'
import Link from '~/components/Link'
import type { RootMatch } from '~/root'

export default function LineItem({ item }: { item: CartLine }) {
  const { Form } = useFetcher()
  const isSale = item.cost.subtotalAmount.amount > item.cost.totalAmount.amount
  const variantParameter = item.merchandise.id.split('/').at(-1)
  const url = `/products/${item.merchandise.product.handle}?variant=${variantParameter}`
  /* @ts-ignore */
  const [root]: [RootMatch] = useMatches()

  return (
    <div className="grid grid-cols-[100px_auto] gap-4">
      <Link
        className="bg-slate-200 w-[100px] h-[100px]"
        to={url}
      >
        {item.merchandise.image && (
          <Image
            data={item.merchandise.image}
            alt={item.merchandise.title}
            width={100}
            height={100}
          />
        )}
      </Link>

      <div className="flex flex-col py-1">
        <div className="flex gap-3">
          <div>
            <Link to={url} className="text-sm">{item.merchandise.product.title}</Link>
            <p className="text-sm">{item.merchandise.title}</p>
          </div>

          <p className="text-sm ml-auto text-right">
            <Money
              data={item.cost.totalAmount}
              withoutTrailingZeros
            />

            {isSale && (
              <>
                &nbsp;
                <Money
                  data={item.cost.subtotalAmount}
                  as="s"
                  className="text-black/50"
                  withoutTrailingZeros
                />
              </>
            )}
          </p>
        </div>

        <Form
          className="mt-auto"
          action="/cart"
          method="post"
        >
          <input type="hidden" name="action" value="remove_from_cart" readOnly />
          <input type="hidden" name="line" value={item.id} readOnly />
          <input type="hidden" name="country" value={root.data.i18n.country} readOnly />

          <button className="text-sm">Remove</button>
        </Form>
      </div>
    </div>
  )
}
