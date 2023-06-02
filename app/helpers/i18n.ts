import { useRouteLoaderData } from '@remix-run/react'
import type { Country, CountryCode, Language, LanguageCode, Localization } from '@shopify/hydrogen/storefront-api-types'
import type { LoaderData } from '~/root'

/**
 * Returns all possible locale codes.
 */
export function getLocales(countries: Localization['availableCountries']) {
  const locales = [] as {
    param: string
    country: Country
    language: Language
  }[]
 
  countries.forEach((country) => {
    country.availableLanguages.forEach((language) => {
      const param = getLocaleParam(language.isoCode, country.isoCode)

      locales.push({
        param,
        country,
        language
      })
    })
  })

  return locales
}

/**
 * Maps the country and language into a locale parameter.
 */
export function getLocaleParam(language: LanguageCode, country: CountryCode) {
  return `${language}-${country}`.toLowerCase()
}

/**
 * Returns the property of an object by a dot-notation path.
 */
function getProperty(path: string, object: any) {
  return path.split('.').reduce((a, b) => a[b], object)
}

/**
 * Returns helpers for rendering translatable content.
 * @todo move translations into JSON files
 */
export function usei18n(language?: string) {
  const { i18n } = useRouteLoaderData('root') as LoaderData

  const translations = {
    en: {
      header: {
        menu: 'Menu'
      },

      cart: {
        title: 'Cart',
        total: 'Total',
        subtotal: 'Subtotal',
        checkout: 'Go to checkout'
      }
    },

    fr: {
      header: {
        menu: 'La carte'
      },

      cart: {
        title: 'Panier',
        total: 'Totale',
        subtotal: 'Total',
        checkout: 'Aller à la caisse'
      }
    }
  } as any

  return {
    t: (path: string, values?: { [key: string]: string | number }) => {
      const fallback = getProperty(path, translations['en'])

      let translation = getProperty(
        path,
        translations[language ?? i18n.language.toLowerCase()]
      ) ?? fallback

      if (!translation) {
        return path
      }

      /**
       * Provide values that replace their `{key}` reference in the translation.
       */
      if (values) {
        Object.keys(values).forEach((key) => {
          const tag = `{${key}}`

          if (translation.includes(tag)) {
            translation = translation.replace(tag, values[key])
          }
        })
      }

      return translation
    }
  }
}
