import type { Country, Language, Localization } from '@shopify/hydrogen/storefront-api-types'

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
      const param = `${language.isoCode}-${country.isoCode}`.toLowerCase()
      const reg = new RegExp('^\/' + param + '($|\/)')

      locales.push({
        param: `${language.isoCode}-${country.isoCode}`.toLowerCase(),
        country,
        language
      })
    })
  })

  return locales
}
