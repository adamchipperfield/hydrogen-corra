import { Link, Outlet, useLoaderData, useLocation, useRouteLoaderData } from '@remix-run/react'
import type { Customer, CustomerAccessToken, CustomerUserError } from '@shopify/hydrogen/storefront-api-types'
import { type ActionArgs, type LoaderArgs, defer, json, redirect } from '@shopify/remix-oxygen'

type CustomerResponse = {
  customer: Customer
  customerUserErrors: CustomerUserError[]
}

type AccessTokenResponse = {
  customerAccessToken: CustomerAccessToken
  customerUserErrors: CustomerUserError[]
}

export async function action({ request, context }: ActionArgs) {
  const form = await request.formData()
  const action = form.get('action')

  if (action === 'create') {
    if (
      !form.has('email') ||
      !form.has('password')
    ) {
      throw new Error('`email` and `password` are required')
    }

    const email = form.get('email')
    const password = form.get('password')
    const firstName = form.get('firstName')
    const lastName = form.get('lastName')

    /**
     * Create the account.
     */
    const { customerCreate } = await context.storefront.mutate<{ customerCreate: CustomerResponse }>(
      CUSTOMER_CREATE_MUTATION,
      {
        variables: {
          input: {
            email,
            password,
            firstName,
            lastName
          }
        }
      }
    )

    return json(
      {
        customer: customerCreate.customer,
        errors: customerCreate.customerUserErrors
      },
      { status: 200 }
    )
  }

  if (action === 'login') {
    if (
      !form.has('email') ||
      !form.has('password')
    ) {
      throw new Error('`email` and `password` are required')
    }

    const email = form.get('email')
    const password = form.get('password')

    const { customerAccessTokenCreate } = await context.storefront.mutate<{
      customerAccessTokenCreate: AccessTokenResponse
    }>(
      CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
      {
        variables: {
          input: {
            email,
            password
          }
        }
      }
    )

    return json(
      {
        accessToken: customerAccessTokenCreate.customerAccessToken,
        errors: customerAccessTokenCreate.customerUserErrors
      },
      { status: 200 }
    )
  }
}

/**
 * Combining json + Response + defer in a loader breaks the
 * types returned by useLoaderData. This is a temporary fix.
 */
type RedirectFix = ReturnType<typeof defer<{ isAuthenticated: false }>>

export async function loader({ context, request }: LoaderArgs) {
  const { pathname } = new URL(request.url)
  const customer = await context.session.get('customer')
  const isAuthenticated = !!customer
  const isAccountPage = /^\/account\/?$/.test(pathname)
  const isPublicPage = /^\/account\/(login|register)/.test(pathname)

  /**
   * Redirects to dashboard if logged in.
   */
  if (isAuthenticated && isPublicPage) {
    return redirect('/account') as unknown as RedirectFix
  }

  /**
   * Redirects to login if a protected page.
   */
  if (!isAuthenticated && isAccountPage) {
    return redirect('/account/login') as unknown as RedirectFix
  }

  return {
    isAuthenticated
  }
}

export default function Account() {
  const title = 'Account details'
  const location = useLocation()
  const { isAuthenticated } = useLoaderData<typeof loader>()

  /**
   * Returns the loader data for the current outlet.
   */
  const outlet = useRouteLoaderData('routes' + location.pathname) as {
    title: string
    [key: string]: any
  }

  if (!isAuthenticated) {
    return <Outlet />
  }

  return (
    <div className="container mx-auto px-6">
      {outlet ? (
        <>
          {outlet.title && (
            <h1 className="hidden">{outlet.title}</h1>
          )}
          <p className="text-h2">{title}</p>
        </>
      ) : <h1 className="text-h2">{title}</h1>}

      <div className="flex flex-col gap-4 md:grid md:grid-cols-[1fr_3fr]">
        <div>
          <li>
            <Link to="/account/orders">Orders</Link>
            <Link to="/account/addresses">Addresses</Link>
          </li>
        </div>

        <div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation ($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }

      customerUserErrors {
        code
        field
        message
      }
    }
  }
`

const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = `#graphql
  mutation ($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }

      customerUserErrors {
        code
        field
        message
      }
    }
  }
`
