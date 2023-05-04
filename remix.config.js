/**
 * Configuration for Remix.
 *
 * @see https://remix.run/docs/en/main
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ['**/.*'],
  watchPaths: ['./public'],
  server: './server.js',

  /**
   * The following settings are required to deploy to Oxygen.
   */
  assetsBuildDirectory: 'dist/client/build',
  publicPath: (process.env.HYDROGEN_ASSET_BASE_URL ?? '/') + 'build/',
  serverBuildPath: 'dist/worker/index.js',
  serverMainFields: ['browser', 'module', 'main'],
  serverConditions: ['worker', process.env.NODE_ENV],
  serverDependenciesToBundle: 'all',
  serverModuleFormat: 'esm',
  serverPlatform: 'neutral',
  serverMinify: process.env.NODE_ENV === 'production',

  future: {
    unstable_tailwind: true
  }
}
