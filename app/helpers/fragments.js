/**
 * Product summary.
 * @see https://shopify.dev/docs/api/storefront/2023-04/objects/Product
 */
export const productCardFragment = `
  fragment ProductCardFragment on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      width
      height
      url
      altText
    }
  }
`

/**
 * Product details.
 * @see https://shopify.dev/docs/api/storefront/2023-04/objects/Product
 */
export const productFragment = `
  fragment ProductFragment on Product {
    title
    variants(first: 100) {
      nodes {
        id
        title
      }
    }
  }
`
