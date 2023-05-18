import { useFetcher, useLocation, useParams, useRouteLoaderData } from '@remix-run/react'
import { useState } from 'react'
import { buttonClasses } from '~/helpers/classes'
import type { LoaderData } from '~/root'
import IconMisc from '~/components/IconMisc'

export default function LocaleSelector() {
  const fetcher = useFetcher()
  const { availableCountries, i18n, locales } = useRouteLoaderData('root') as LoaderData
  const params = useParams()
  const location = useLocation()
  const loading = fetcher.state === 'loading' || fetcher.state === 'submitting'

  /**
   * The selected country.
   */
  const [country, setCountry] = useState(
    availableCountries.find(({ isoCode }) => isoCode === i18n.country)
  )

  /**
   * The selected language.
   */
  const [language, setLanguage] = useState(
    country && country.availableLanguages.find(({ isoCode }) => isoCode === i18n.language)
  )

  /**
   * The selected locale.
   * - Finds a locale with the selected country and language.
   */
  const locale = locales.find((locale) =>
    locale.country.isoCode === (country && country.isoCode) &&
      locale.language.isoCode === (language && language.isoCode)
  )

  /**
   * Builds the redirect path.
   */
  const path = params.lang ? location.pathname.replace(`/${params.lang}`, '') : location.pathname
  const redirectPath = `/${locale && locale.param}${path}`

  return (
    <fetcher.Form action="/cart" method="post">
      <input type="hidden" name="action" value="update_buyer_identity" />
      <input type="hidden" name="redirect_to" value={redirectPath} />
      
      {country && (
        <input
          type="hidden"
          name="buyer_identity"
          value={JSON.stringify({ countryCode: country.isoCode })}
        />
      )}

      <select
        name="country"
        defaultValue={country && country.isoCode}
        onChange={({ target }) => setCountry(
          availableCountries.find(({ isoCode }) => isoCode === target.value)
        )}
      >
        {availableCountries.map(({ isoCode, name }) => (
          <option key={isoCode} value={isoCode}>{name}</option>
        ))}
      </select>

      {country && (
        <select
          name="language"
          defaultValue={language && language.isoCode}
          onChange={({ target }) => setLanguage(
            country.availableLanguages.find(({ isoCode }) => isoCode === target.value)
          )}
        >
          {country.availableLanguages.map(({ isoCode, name }) => (
            <option key={isoCode} value={isoCode}>{name}</option>
          ))}
        </select>
      )}

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
    </fetcher.Form>
  )
}
