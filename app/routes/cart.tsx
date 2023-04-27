import { Await, useMatches } from '@remix-run/react'
import { Cart } from '@shopify/hydrogen/storefront-api-types'
import { ActionArgs, json } from '@shopify/remix-oxygen'
import { Suspense } from 'react'
import LineItem from '~/components/LineItem'
import LoadingScreen from '~/components/LoadingScreen'
import type { RootMatches } from '~/root'

export async function action({ request, context }: ActionArgs) {
  const { session } = context
  const form = await request.formData()
  const action = form.get('action')
  const cart = session.get('cart')
  const headers = new Headers()

  /**
   * Saves the cart to the session and commits it to the headers.
   */
  async function commitCart(payload: Cart) {
    session.set('cart', payload.id)
    headers.set('Set-Cookie', await session.commit())

    return json(
      { cart: payload },
      {
        headers,
        status: 200
      }
    )
  }

  if (action === 'add_to_cart') {
    if (!form.has('merchandise')) {
      throw new Error(`\`merchandise\` is required`)
    }

    const merchandise = form.get('merchandise')
    const quantity = Number(form.get('quantity')) ?? 1

    const lines = [
      {
        merchandiseId: merchandise,
        quantity
      }
    ]

    if (!cart) {
      const { cartCreate } = await context.storefront.mutate<{ cartCreate: { cart: Cart } }>(
        CART_CREATE_MUTATION,
        {
          variables: {
            input: {
              lines
            }
          }
        }
      )

      return await commitCart(cartCreate.cart)
    }

    const { cartLinesAdd } = await context.storefront.mutate<{ cartLinesAdd: { cart: Cart } }>(
      CART_LINES_ADD_MUTATION,
      {
        variables: {
          cartId: cart,
          lines
        }
      }
    )

    return await commitCart(cartLinesAdd.cart)
  }

  if (action === 'remove_from_cart') {
    if (!form.has('line')) {
      throw new Error(`\`line\` is required`)
    }

    const { cartLinesRemove } = await context.storefront.mutate<{ cartLinesRemove: { cart: Cart }}>(
      CART_LINES_REMOVE_MUTATION,
      {
        variables: {
          cartId: cart,
          lineIds: [form.get('line')]
        }
      }
    )

    return await commitCart(cartLinesRemove.cart)
  }

  throw new Error(`Cart action \`${action}\` does not exist`)
}

export default function Cart() {
  /* @ts-ignore */
  const [root]: [RootMatches] = useMatches()


  return (
    <Suspense fallback={<LoadingScreen />}>
      <Await resolve={root.data.cart}>
        {(cart) => (
          <div className="container mx-auto px-6">
            <h1 className="text-h2 mb-6">Cart</h1>

            <div className="md:grid md:grid-cols-2">
              <div className="flex flex-col gap-6">
                {cart.lines.nodes.map((line) =>
                  <LineItem key={line.id} item={line} />
                )}
              </div>
            </div>
          </div>
        )}
      </Await>
    </Suspense>
  )
}

const CART_CREATE_MUTATION = `#graphql
  mutation ($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
      }
    }
  }
`

const CART_LINES_ADD_MUTATION = `#graphql
  mutation ($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
      }
    }
  }
`

const CART_LINES_REMOVE_MUTATION = `#graphql
  mutation ($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
      }
    }
  }
`
