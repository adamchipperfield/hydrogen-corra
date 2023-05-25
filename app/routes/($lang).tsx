import { Outlet } from '@remix-run/react'
import { ActionArgs, LoaderArgs, redirect } from '@shopify/remix-oxygen'
import { getLocales } from '~/helpers/i18n'

export async function action({ request }: ActionArgs) {
  const form = await request.formData()
  const action = form.get('action')
  
  /**
   * Redirect action.
   * @see https://remix.run/utils/redirect
   */
  if (action === 'redirect') {
    if (!form.has('redirect_to')) {
      throw new Error(`\`redirect\` is required`)
    }

    return redirect(
      form.get('redirect_to') as string
    )
  }
}

export async function loader({ params, context }: LoaderArgs) {

  /**
   * Throws a 404 if the locale isn't valid.
   */
  if (
    params.lang &&
    !getLocales(context.localization.availableCountries)
      .find(({ param }) => param === params.lang)
  ) {
    throw new Response(
      'Page not found',
      {
        status: 404
      }
    )
  }

  return {}
}

export default function Lang() {
  return <Outlet />
}
