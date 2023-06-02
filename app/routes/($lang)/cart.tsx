import { Await, useFetcher, useRouteLoaderData } from '@remix-run/react'
import { Money } from '@shopify/hydrogen'
import type { Cart, CartBuyerIdentity, CartLineInput, CountryCode, DisplayableError } from '@shopify/hydrogen/storefront-api-types'
import { type ActionArgs, json, redirect } from '@shopify/remix-oxygen'
import { ButtonHTMLAttributes, Suspense } from 'react'
import LineItem from '~/components/LineItem'
import LoadingScreen from '~/components/LoadingScreen'
import { cartFragment, displayableErrorFragment } from '~/helpers/fragments'
import type { LoaderData } from '~/root'
import type { HydrogenSession } from '@/server'
import { buttonClasses } from '~/helpers/classes'
import { usei18n } from '~/helpers/i18n'

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

/**
 * Saves the cart to the session and commits it to the headers.
 */
export async function commitCart({
  response,
  status = 200,
  headers = new Headers(),
  session
}: {
  response: CartResponse
  status?: number
  headers?: Headers
  session: HydrogenSession
}) {
  session.set('cart', response.cart.id)
  headers.set('Set-Cookie', await session.commit())

  return json(
    {
      cart: response.cart,
      errors: response.userErrors
    },
    {
      headers,
      status
    }
  )
}

/**
 * Formats the `commitCart` Promise response.
 */
export async function formatCommitCart(response: Awaited<ReturnType<typeof commitCart>>) {
  return {
    cart: (await response.json()).cart,
    headers: response.headers
  }
}

/**
 * Updates the cart's buyer indentity.
 */
export async function updateCartBuyerIdentity(
  context: ActionArgs['context'],
  cartId: Cart['id'],
  buyerIdentity: Partial<CartBuyerIdentity>
) {
  return context.storefront.mutate<{ cartBuyerIdentityUpdate: CartResponse }>(
    CART_BUYER_IDENTITY_UPDATE_MUTATION,
    {
      variables: {
        cartId,
        buyerIdentity
      }
    }
  )
}

export async function action({ request, context }: ActionArgs) {
  const { session } = context
  const form = await request.formData()
  const action = form.get('action')
  const country = form.get('country') as CountryCode | undefined
  const cart = session.get('cart')
  const headers = new Headers()

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
        .then(({ cartCreate }) => commitCart({
          response: cartCreate,
          headers,
          session
        }))
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

      return await commitCart({
        response: cartLinesAdd,
        headers,
        session
      })
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

    return commitCart({
      response: cartLinesRemove,
      headers,
      session
    })
  }

  /**
   * Redirects to the checkout.
   * - Ensures the cart is consistent with the provided country.
   */
  if (action === 'go_to_checkout') {
    const cartQuery = await context.storefront.query<CartResponse>(
      CART_QUERY,
      {
        variables: {
          cartId: cart
        },
        cache: context.storefront.CacheNone()
      }
    )

    if (cartQuery.cart.buyerIdentity.countryCode !== country) {
      const { cartBuyerIdentityUpdate } = await updateCartBuyerIdentity(
        context,
        cart,
        {
          countryCode: country
        }
      )

      return redirect(cartBuyerIdentityUpdate.cart.checkoutUrl)
    }

    return redirect(cartQuery.cart.checkoutUrl)
  }

  throw new Error(`Cart action \`${action}\` does not exist`)
}

export default function Cart() {
  const { cart } = useRouteLoaderData('root') as LoaderData
  const { t } = usei18n()

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Await resolve={cart}>
        {(cart) => (
          <div className="container mx-auto px-6 mb-20">
            <h1 className="text-h2 mb-12">{t('cart.title')}</h1>

            <div className="flex flex-col md:grid md:grid-cols-[2fr_1fr] gap-20">
              <div className="flex flex-col gap-8">
                {cart.lines.nodes.map((line) =>
                  <LineItem key={line.id} item={line} />
                )}
              </div>

              <div className="flex flex-col gap-4 max-w-sm ml-auto w-full">
                <h2 className="text-h4 mb-4">{t('cart.total')}</h2>

                <div className="flex gap-4 justify-between">
                  <p className="text-sm font-semibold">{t('cart.subtotal')}</p>

                  <p className="text-sm text-right">
                    <Money data={cart.cost.subtotalAmount} />
                  </p>
                </div>

                <div className="flex gap-4 justify-between">
                  <p className="text-sm font-semibold">{t('cart.total')}</p>

                  <p className="text-sm text-right">
                    <Money data={cart.cost.totalAmount} />
                  </p>
                </div>

                <CheckoutButton className={`${buttonClasses} mt-8`} />
              </div>
            </div>
          </div>
        )}
      </Await>
    </Suspense>
  )
}

/**
 * Redirects the customer to the checkout.
 * - Used to keep the cart consistent with the active country.
 */
export function CheckoutButton(params: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { i18n } = useRouteLoaderData('root') as LoaderData
  const fetcher = useFetcher()
  const { t } = usei18n()

  return (
    <fetcher.Form action="/cart" method="post">
      <input type="hidden" name="action" value="go_to_checkout" readOnly />
      <input type="hidden" name="country" value={i18n.country} readOnly />

      <button {...params}>{t('cart.checkout')}</button>
    </fetcher.Form>
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

export const CART_QUERY = `#graphql
  query ($cartId: ID!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }

  ${cartFragment}
`
