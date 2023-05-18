import * as build from '@remix-run/dev/server-build'
import { createStorefrontClient, storefrontRedirect } from '@shopify/hydrogen'
import {
  createRequestHandler,
  getStorefrontHeaders,
  createCookieSessionStorage
} from '@shopify/remix-oxygen'

/**
 * Export an Oxygen worker entry.
 */
export default {
  async fetch(request, env, executionContext) {
    const waitUntil = (payload) => executionContext.waitUntil(payload)
    const url = new URL(request.url)
    const locales = []

    try {
      const clientConfig = {
        publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
        privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
        storeDomain: `https://${env.PUBLIC_STORE_DOMAIN}`,
        storefrontApiVersion: env.PUBLIC_STOREFRONT_API_VERSION || '2023-04',
        storefrontId: env.PUBLIC_STOREFRONT_ID,
        storefrontHeaders: getStorefrontHeaders(request)
      }

      /**
       * Sets the client `i18n` property based on the request path.
       * - If the locale is invalid, no `i18n` is set.
       */
      const { localization } = await createStorefrontClient(clientConfig).storefront
        .query(`#graphql
          query {
            localization {
              availableCountries {
                name
                isoCode

                currency {
                  isoCode
                  symbol
                }
        
                availableLanguages {
                  name
                  isoCode
                }
              }
            }
          }
        `)

      localization.availableCountries.forEach((country) => {
        country.availableLanguages.forEach((language) => {
          const param = `${language.isoCode}-${country.isoCode}`.toLowerCase()
          const reg = new RegExp('^\/' + param + '($|\/)')

          /**
           * Push to the app context.
           */
          locales.push({
            param: `${language.isoCode}-${country.isoCode}`.toLowerCase(),
            country,
            language
          })

          /**
           * Set the storefront client `i18n` configuration.
           */
          if (reg.test(url.pathname)) {
            clientConfig.i18n = {
              country: country.isoCode,
              language: language.isoCode
            }
          }
        })
      })

      /**
       * Open a cache instance in the worker and a custom session instance.
       */
      if (!env?.SESSION_SECRET) {
        throw new Error('SESSION_SECRET environment variable is not set')
      }

      const [cache, session] = await Promise.all([
        caches.open('hydrogen'),
        HydrogenSession.init(request, [env.SESSION_SECRET])
      ])

      /**
       * Create Hydrogen's storefront client.
       */
      const { storefront } = createStorefrontClient({
        cache,
        waitUntil,
        ...clientConfig
      })

      /**
       * Create a Remix request handler.
       * - Pass Hydrogen's storefront client to the loader context.
       */
      const handleRequest = createRequestHandler({
        build,
        mode: process.env.NODE_ENV,
        getLoadContext: () => ({
          session,
          storefront,
          env,
          locales,
          availableCountries: localization.availableCountries
        })
      })

      const response = await handleRequest(request);

      if (response.status === 404) {

        /**
         * Check for redirects only when there's a 404 from the app.
         * If the redirect doesn't exist, then `storefrontRedirect`
         * will pass through the 404 response.
         */
        return storefrontRedirect({ request, response, storefront })
      }

      return response

    } catch (error) {
      return new Response('An unexpected error occurred', { status: 500 })
    }
  }
}

/**
 * This is a custom session implementation for your Hydrogen shop.
 * Feel free to customize it to your needs, add helper methods, or
 * swap out the cookie-based implementation with something else!
 */
class HydrogenSession {
  sessionStorage;
  session;
  constructor(sessionStorage, session) {
    this.sessionStorage = sessionStorage;
    this.session = session;
  }

  static async init(request, secrets) {
    const storage = createCookieSessionStorage({
      cookie: {
        name: 'session',
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secrets,
      },
    });

    const session = await storage.getSession(request.headers.get('Cookie'));

    return new this(storage, session);
  }

  get(key) {
    return this.session.get(key);
  }

  destroy() {
    return this.sessionStorage.destroySession(this.session);
  }

  flash(key, value) {
    this.session.flash(key, value);
  }

  unset(key) {
    this.session.unset(key);
  }

  set(key, value) {
    this.session.set(key, value);
  }

  commit() {
    return this.sessionStorage.commitSession(this.session);
  }
}
