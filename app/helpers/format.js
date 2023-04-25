/**
 * Formats Shopify menu items.
 *
 * @param {Array} items - The items to format.
 * @param {String} domain - The store domain (to strip from the items).
 * @returns The formatted items.
 */
export function formatMenuItems(items, domain) {
  return items.map(({ url, ...rest }) => ({
    url: url.replace(domain, ''),
    ...rest
  }))
}
