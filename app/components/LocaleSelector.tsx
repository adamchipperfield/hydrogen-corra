import { useFetcher, useLocation, useParams, useRouteLoaderData } from '@remix-run/react'
import { useState } from 'react'
import { buttonClasses } from '~/helpers/classes'
import { loader } from '~/root'
import IconMisc from '~/components/IconMisc'

/**
 * Removes the promise wrappers from the given type.
 */
type Awaited<T> = T extends PromiseLike<infer U> ? U : T

/**
 * Updates the cart's `buyerIdentity.countryCode` value.
 */
export default function LocaleSelector() {
  const { locales, i18n } = useRouteLoaderData('root') as Awaited<ReturnType<typeof loader>>['data']
  const defaultLocale = locales.find((locale) =>
    locale.country.isoCode === i18n.country && locale.language.isoCode === i18n.language
  )
  const [selectedLocale, setSelectedLocale] = useState(defaultLocale)
  const fetcher = useFetcher()
  const params = useParams()
  const location = useLocation()
  const path = params.lang ? location.pathname.replace(`/${params.lang}`, '') : location.pathname
  const loading = fetcher.state === 'loading' || fetcher.state === 'submitting'

  return (
    <fetcher.Form action="/cart" method="post">
      <input type="hidden" name="action" value="update_buyer_identity" />
      <input type="hidden" name="redirect_to" value={`/${selectedLocale?.param}${path}`} />

      <input
        type="hidden"
        name="buyer_identity"
        value={JSON.stringify({ countryCode: selectedLocale?.country.isoCode })}
      />

      <div className="flex gap-2">
        <select
          defaultValue={selectedLocale?.param}
          onChange={({ target }) => {
            const locale = locales.find(({ param }) => param === target.value)

            if (locale) {
              setSelectedLocale(locale)
            }
          }}
        >
          {locales.map((locale, index) => {
            return (
              <option key={index} value={locale.param}>
                {locale.country.name} ({locale.country.currency.isoCode} {locale.country.currency.symbol})
              </option>
            )
          })}
        </select>

        <button className={`${buttonClasses} !w-auto relative`}>
          {loading
            ? (
              <>
                <span className="text-transparent">Submit</span>
                
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <IconMisc
                    className="animate-spin mx-auto"
                    icon="loading"
                  />
                </span>
              </>
            )
            : 'Submit'}
        </button>
      </div>
    </fetcher.Form>
  )
}
