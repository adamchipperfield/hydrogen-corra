import { Await, useMatches } from '@remix-run/react'
import { Money } from '@shopify/hydrogen'
import type { Cart, CartLineInput, CountryCode, DisplayableError } from '@shopify/hydrogen/storefront-api-types'
import { type ActionArgs, json } from '@shopify/remix-oxygen'
import { Suspense } from 'react'
import LineItem from '~/components/LineItem'
import LoadingScreen from '~/components/LoadingScreen'
import { buttonClasses } from '~/helpers/classes'
import { cartFragment, displayableErrorFragment } from '~/helpers/fragments'
import type { RootMatch } from '~/root'

export type CartResponse = {
  cart: Cart
  userErrors: DisplayableError[]
}

/**
 * Creates a new cart.
 */
export async function createCart({
  context: { storefront },
  lines = [],
  country
}: {
  context: ActionArgs['context']
  lines?: CartLineInput[]
  country?: CountryCode
}): Promise<{ cartCreate: CartResponse }> {
  return await storefront.mutate<{ cartCreate: CartResponse }>(
    CART_CREATE_MUTATION,
    {
      variables: {
        input: {
          lines,
          buyerIdentity: {
            countryCode: country
          }
        }
      }
    }
  )
}

export async function action({ request, context }: ActionArgs) {
  const { session } = context
  const form = await request.formData()
  const action = form.get('action')
  const country = form.get('country') as CountryCode
  const cart = session.get('cart')
  const headers = new Headers()
  const defaultStatus = 200

  /**
   * Saves the cart to the session and commits it to the headers.
   */
  async function commitCart({ cart, userErrors }: CartResponse, status = defaultStatus) {
    if (cart) {
      session.set('cart', cart.id)
      headers.set('Set-Cookie', await session.commit())
    }

    return json(
      {
        cart,
        errors: userErrors
      },
      {
        headers,
        status
      }
    )
  }

  /**
   * Add to cart.
   * @see https://shopify.dev/docs/api/storefront/2023-04/mutations/cartCreate
   * @see https://shopify.dev/docs/api/storefront/2023-04/mutations/cartLinesAdd
   */
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
    ] as CartLineInput[]

    if (!cart) {

      /**
       * If no cart exists in the session, create one with the lines.
       */
      return await createCart({ context, lines, country })
        .then(({ cartCreate }) => commitCart(cartCreate))
    }

    try {
      const { cartLinesAdd } = await context.storefront.mutate<{ cartLinesAdd: CartResponse }>(
        CART_LINES_ADD_MUTATION,
        {
          variables: {
            cartId: cart,
            lines
          }
        }
      )

      return await commitCart(cartLinesAdd)
    } catch (error) {

      /**
       * Handles when the cart line add mutation fails with a generic message.
       * - This usually means the `cartId` variable is invalid.
       */
      return json({
        errors: [{ message: 'Something went wrong, please try again.' }]
      })
    }
  }

  /**
   * Remove from cart.
   * @see https://shopify.dev/docs/api/storefront/2023-04/mutations/cartLinesRemove
   */
  if (action === 'remove_from_cart') {
    if (!form.has('line')) {
      throw new Error(`\`line\` is required`)
    }

    const { cartLinesRemove } = await context.storefront.mutate<{ cartLinesRemove: CartResponse }>(
      CART_LINES_REMOVE_MUTATION,
      {
        variables: {
          cartId: cart,
          lineIds: [form.get('line')]
        }
      }
    )

    return commitCart(cartLinesRemove)
  }

  /**
   * Update buyer identity.
   * @see https://shopify.dev/docs/api/storefront/2023-04/mutations/cartBuyerIdentityUpdate
   */
  if (action === 'update_buyer_identity') {
    const { cartBuyerIdentityUpdate } = await context.storefront.mutate<{ cartBuyerIdentityUpdate: CartResponse }>(
      CART_BUYER_IDENTITY_UPDATE_MUTATION,
      {
        variables: {
          cartId: cart,
          buyerIdentity: JSON.parse(form.get('buyer_identity') as string)
        }
      }
    )

    if (form.has('redirect_to')) {
      headers.set('Location', form.get('redirect_to') as string)
    }

    return commitCart(
      cartBuyerIdentityUpdate,
      form.has('redirect_to') ? 303 : defaultStatus
    )
  }

  throw new Error(`Cart action \`${action}\` does not exist`)
}

export default function Cart() {
  /* @ts-ignore */
  const [root]: [RootMatch] = useMatches()

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Await resolve={root.data.cart}>
        {(cart) => (
          <div className="container mx-auto px-6 mb-20">
            <h1 className="text-h2 mb-12">Cart</h1>

            <div className="flex flex-col md:grid md:grid-cols-[2fr_1fr] gap-20">
              <div className="flex flex-col gap-8">
                {cart.lines.nodes.map((line) =>
                  <LineItem key={line.id} item={line} />
                )}
              </div>

              <div className="flex flex-col gap-4 max-w-sm ml-auto w-full">
                <h2 className="text-h4 mb-4">Total</h2>

                <div className="flex gap-4 justify-between">
                  <p className="text-sm font-semibold">Subtotal</p>

                  <p className="text-sm text-right">
                    <Money data={cart.cost.subtotalAmount} />
                  </p>
                </div>

                <div className="flex gap-4 justify-between">
                  <p className="text-sm font-semibold">Total</p>

                  <p className="text-sm text-right">
                    <Money data={cart.cost.totalAmount} />
                  </p>
                </div>

                <a className={`${buttonClasses} mt-8`} href={cart.checkoutUrl}>
                  Go to checkout
                </a>
              </div>
            </div>
          </div>
        )}
      </Await>
    </Suspense>
  )
}

const CART_CREATE_MUTATION = `#graphql
  mutation (
    $input: CartInput!
    $country: CountryCode
    $language: LanguageCode
  )
    @inContext(country: $country, language: $language) {
    cartCreate(input: $input) {
      cart {
        ...CartFragment
      }

      userErrors {
        ...DisplayableErrorFragment
      }
    }
  }

  ${displayableErrorFragment}
  ${cartFragment}
`

const CART_LINES_ADD_MUTATION = `#graphql
  mutation (
    $cartId: ID!
    $lines: [CartLineInput!]!
    $country: CountryCode
    $language: LanguageCode
  )
    @inContext(country: $country, language: $language) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }

      userErrors {
        ...DisplayableErrorFragment
      }
    }
  }

  ${displayableErrorFragment}
  ${cartFragment}
`

const CART_LINES_REMOVE_MUTATION = `#graphql
  mutation (
    $cartId: ID!
    $lineIds: [ID!]!
    $country: CountryCode
    $language: LanguageCode
  )
    @inContext(country: $country, language: $language) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFragment
      }

      userErrors {
        ...DisplayableErrorFragment
      }
    }
  }

  ${displayableErrorFragment}
  ${cartFragment}
`

const CART_BUYER_IDENTITY_UPDATE_MUTATION = `#graphql
  mutation (
    $buyerIdentity: CartBuyerIdentityInput!
    $cartId: ID!
    $country: CountryCode
    $language: LanguageCode
  )
    @inContext(country: $country, language: $language) {
    cartBuyerIdentityUpdate(buyerIdentity: $buyerIdentity, cartId: $cartId) {
      cart {
        ...CartFragment
      }

      userErrors {
        ...DisplayableErrorFragment
      }
    }
  }

  ${displayableErrorFragment}
  ${cartFragment}
`
