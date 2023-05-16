import { Link, useFetcher } from '@remix-run/react'
import type { CustomerUserError } from '@shopify/hydrogen/storefront-api-types'
import { redirect } from '@shopify/remix-oxygen'
import { buttonClasses } from '~/helpers/classes'

export default function Register() {
  const fetcher = useFetcher()
  const errors = fetcher.data?.errors as CustomerUserError[] ?? []

  return (
    <div className="flex justify-center my-12 px-4">
      <div className="max-w-md w-full">
        <h1 className="text-h3 mb-8">Create account</h1>

        {errors.length >= 1 && (
          <ul className="flex flex-col gap-1 my-4">
            {errors.map(({ message }, index) => (
              <li key={index} className="text-red-500">{message}</li>
            ))}
          </ul>
        )}
        
        <fetcher.Form className="flex flex-col gap-4 mb-8" action="/account" method="post">
          <input type="hidden" name="action" value="create" />

          <div className="flex flex-col gap-2">
            <label htmlFor="register-firstName">First name</label>

            <input
              id="register-firstName"
              name="firstName"
              type="text"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="register-lastName">Last name</label>

            <input
              id="register-lastName"
              name="lastName"
              type="text"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="register-email">Email address</label>

            <input
              id="register-email"
              name="email"
              type="email"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="register-password">Password</label>

            <input
              id="register-password"
              name="password"
              type="password"
              required
            />
          </div>

          <button className={buttonClasses} type="submit">
            Create account
          </button>
        </fetcher.Form>

        <Link className="text-sm underline" to="/account/login">
          Got an account?
        </Link>
      </div>
    </div>
  )
}
