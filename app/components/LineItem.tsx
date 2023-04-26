import { useFetcher } from '@remix-run/react'
import { Image, Money } from '@shopify/hydrogen'
import type { CartLine } from '@shopify/hydrogen/storefront-api-types'

export default function LineItem({ item }: { item: CartLine }) {
  const { Form } = useFetcher()
  const isSale = item.cost.subtotalAmount.amount > item.cost.totalAmount.amount

  return (
    <div className="grid grid-cols-[100px_auto] gap-4">
      <div className="bg-slate-200 w-[100px] h-[100px]">
        {item.merchandise.image && (
          <Image
            data={item.merchandise.image}
            alt={item.merchandise.title}
            width={100}
            height={100}
          />
        )}
      </div>

      <div className="flex flex-col py-3">
        <div className="flex gap-3">
          <div>
            <p className="text-sm">{item.merchandise.product.title}</p>
            <p className="text-sm">{item.merchandise.title}</p>
          </div>

          <p className="text-sm ml-auto">
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
          <input type="hidden" name="line" value={item.id}  readOnly />

          <button className="text-sm">Remove</button>
        </Form>
      </div>
    </div>
  )
}
