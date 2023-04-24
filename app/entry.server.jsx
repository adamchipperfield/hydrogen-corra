/**
 * The default export of this module is a function that lets you create the response,
 * including HTTP status, headers, and HTML, giving you full control over the way the markup
 * is generated and sent to the client.
 * 
 * - Note: Hydrogen requires this file to exist, despite not being required in base Remix.
 *
 * @see https://remix.run/docs/en/main/file-conventions/entry.server
 */
import { RemixServer } from '@remix-run/react'
import isbot from 'isbot'
import { renderToReadableStream } from 'react-dom/server'

export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  const body = await renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} />,
    {
      signal: request.signal,

      /**
       * Handles the server error.
       * @param {unknown} error - The error response.
       */
      onError(error) {
        if (error) {
          console.error(error)
        }

        responseStatusCode = 500
      }
    }
  )

  if (isbot(request.headers.get('user-agent'))) {

    /**
     * If the request is coming from a bot, wait for any Suspense boundaries.
     */
    await body.allReady
  }

  responseHeaders.set('Content-Type', 'text/html')

  return new Response(
    body,
    {
      headers: responseHeaders,
      status: responseStatusCode
    }
  )
}
