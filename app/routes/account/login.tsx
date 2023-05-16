import { Link, useFetcher } from '@remix-run/react'
import type { CustomerUserError } from '@shopify/hydrogen/storefront-api-types'
import { buttonClasses } from '~/helpers/classes'

export default function Login() {
  const fetcher = useFetcher()
  const errors = fetcher.data?.errors as CustomerUserError[] ?? []

  return (
    <div className="flex justify-center my-12 px-4">
      <div className="max-w-md w-full">
        <h1 className="text-h3 mb-8">Returning customers</h1>

        {errors.length >= 1 && (
          <ul className="flex flex-col gap-1 my-4">
            {errors.map(({ message }, index) => (
              <li key={index} className="text-red-500">{message}</li>
            ))}
          </ul>
        )}
        
        <fetcher.Form className="flex flex-col gap-4 mb-8" action="/account" method="post">
          <input type="hidden" name="action" value="login" />

          <div className="flex flex-col gap-2">
            <label htmlFor="login-email">Email address</label>

            <input
              id="login-email"
              name="email"
              type="email"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="login-password">Password</label>

            <input
              id="login-password"
              name="password"
              type="password"
              required
            />
          </div>

          <button className={buttonClasses} type="submit">
            Login
          </button>
        </fetcher.Form>

        <Link className="text-sm underline" to="/account/register">
          Create an account
        </Link>
      </div>
    </div>
  )
}
