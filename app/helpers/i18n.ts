import type { Country, CountryCode, Language, LanguageCode, Localization } from '@shopify/hydrogen/storefront-api-types'

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
