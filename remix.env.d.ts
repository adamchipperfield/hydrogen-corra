/// <reference types="@remix-run/dev" />
/// <reference types="@shopify/remix-oxygen" />
/// <reference types="@shopify/oxygen-workers-types" />

/**
 * Declare local additions to `AppLoadContext` to include the session utilities we injected in `server.ts`.
 */
import type { Storefront } from '@shopify/hydrogen'
import type { HydrogenSession } from './server'
import type { Country, Language, Localization } from '@shopify/hydrogen/storefront-api-types'

declare module '@shopify/remix-oxygen' {
  export interface AppLoadContext {
    session: HydrogenSession
    storefront: Storefront
    env: Env
    locales: Array<{
      param: string
      country: Country
      language: Language
    }>
    localization: Localization
  }
}
