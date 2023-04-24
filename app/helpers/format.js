/**
 * Formats Shopify links.
 *
 * @param {Array} links - The links to format.
 * @param {String} domain - The store domain (to strip from the links).
 * @returns The formatted links.
 */
export function formatLinks(links, domain) {
  return links.map(({ url, ...rest }) => ({
    url: url.replace(domain, ''),
    ...rest
  }))
}
