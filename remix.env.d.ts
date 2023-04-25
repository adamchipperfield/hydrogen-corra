/// <reference types="@remix-run/dev" />
/// <reference types="@shopify/remix-oxygen" />
/// <reference types="@shopify/oxygen-workers-types" />

/**
 * Declare local additions to `AppLoadContext` to include the session utilities we injected in `server.ts`.
 */
import type { Storefront } from '@shopify/hydrogen'
import type { HydrogenSession } from './server'

declare module '@shopify/remix-oxygen' {
  export interface AppLoadContext {
    session: HydrogenSession
    storefront: Storefront
    env: Env
  }
}
