import { Cart } from '@shopify/hydrogen/storefront-api-types'
import { ActionArgs, json } from '@shopify/remix-oxygen'

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
    if (!payload) {
      throw new Error('A cart payload is required to persist the cart')
    }

    session.set('cart', payload.id)
    headers.set('Set-Cookie', await session.commit())

    return json(
      { cart: payload },
      { headers }
    )
  }

  switch (action) {
    case 'add_to_cart':
      if (!form.has('merchandise')) {
        throw new Error(`\`merchandise\` is required`)
      }

      const merchandise = form.get('merchandise')
      const quantity = JSON.parse(form.get('quantity') as string) ?? 1

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

        await commitCart(cartCreate.cart)
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

      await commitCart(cartLinesAdd.cart)

    default:
      throw new Error(`Cart action \`${action}\` does not exist`)
  }
}

const CART_CREATE_MUTATION = `#graphql
  mutation ($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        totalQuantity
      }
    }
  }
`

const CART_LINES_ADD_MUTATION = `#graphql
  mutation ($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        totalQuantity
      }
    }
  }
`
