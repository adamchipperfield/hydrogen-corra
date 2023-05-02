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
    vendor
    descriptionHtml
    images(first: 100) {
      nodes {
        width
        height
        url
        altText
      }
    }
    variants(first: 100) {
      nodes {
        id
        title
      }
    }
  }
`

/**
 * Represents an error in the input of a mutation.
 * @see https://shopify.dev/docs/api/storefront/2023-04/interfaces/DisplayableError
 */
export const displayableErrorFragment = `
  fragment DisplayableErrorFragment on DisplayableError {
    message
    field
  }
`

/**
 * Cart object.
 * @see https://shopify.dev/docs/api/storefront/2023-04/objects/Cart
 */
export const cartFragment = `
  fragment CartFragment on Cart {
    id
    totalQuantity
    lines(first: 100) {
      nodes {
        id
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            image {
              url
              height
              width
              altText
            }
            product {
              title
              handle
            }
          }
        }
      }
    }
  }
`
