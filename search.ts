// Typowanie dla odpowiedzi z GraphQL
interface ProductPrice {
  centAmount: number;
  currencyCode: string;
  fractionDigits: number;
  type: string;
}

interface DiscountValue {
  type: string;
  permyriad: number;
}

interface ProductDiscount {
  id: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  name: string;
  description: string;
  value: DiscountValue;
}

interface DiscountedProductPrice {
  discount: ProductDiscount;
  value: ProductPrice;
}

interface Money {
  centAmount: number;
  currencyCode: string;
  fractionDigits: number;
  type: string;
}

interface ProductPrice {
  multibuy: any; // Assuming this can be null or any other type
  discounted: DiscountedProductPrice | null;
  value: Money;
}

interface ProductAttributes {
  bi_alcohol_percent?: string | null;
  bi_allergens_contain?: string | null;
  bi_allergens_may_contain?: string | null;
  bi_carbohydrate_content?: string | null;
  bi_carbohydrate_content_sugars?: string | null;
  bi_country_of_origin?: string | null;
  bi_fat_content_saturated_fatty_acids?: string | null;
  bi_fat_content_total?: string | null;
  bi_ingredients?: string | null;
  bi_protein_content?: string | null;
  bi_salt_content?: string | null;
  bi_storage_method?: string | null;
  bi_supplier_name?: string | null;
  contain_unit?: string | null;
  contains_alcohol?: boolean | null;
  discountable?: boolean | null;
  energy_value_kcal?: number | null;
  energy_value_kj?: number | null;
  long_description?: string | null;
  net_contain?: number | null;
  short_shelf_life?: boolean | null;
  tags?: string[] | null;
}

interface Product {
  sku: string;
  id: string;
  key: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  description: string;
  slug: string;
  price: ProductPrice;
  availableQuantity: number;
  attributes: ProductAttributes;
  imagesUrls: string[];
  categoriesIds: string[];
  isPublished: boolean;
  isFavourite: boolean;
  __typename: string;
}

interface ProductSearchResponse {
  attributionToken: string;
  total: number;
  results: Product[];
}

interface GraphQLResponse {
  data: {
    productSearch: ProductSearchResponse;
  };
}

const searchProduct = async (
  query: string,
  limit: number,
  offset: number,
): Promise<GraphQLResponse> => {
  const response = await fetch("https://api.prod.delio.com.pl/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.7",
      "content-type": "application/json",
      priority: "u=1, i",
      "sec-ch-ua": '"Brave";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "sec-gpc": "1",
      "x-api-version": "4.0",
      "x-csrf-protected": "",
      Referer: "https://delio.com.pl/",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: JSON.stringify({
      operationName: "ProductSearch",
      variables: {
        query,
        limit,
        offset,
      },
      query: `
        query ProductSearch($query: String!, $limit: Int!, $offset: Int!, $coordinates: CoordinatesInput) {
          productSearch(
            query: $query
            limit: $limit
            offset: $offset
            coordinates: $coordinates
          ) {
            attributionToken
            total
            results {
              sku
              id
              key
              name
              metaTitle
              metaDescription
              description
              slug
              price {
                multibuy {
                  value {
                    centAmount
                    currencyCode
                    fractionDigits
                    type
                  }
                  description
                  triggerQuantity
                  maxQuantity
                }
                discounted {
                  discount {
                    id
                    validFrom
                    validUntil
                    isActive
                    name
                    description
                    value {
                      type
                      ... on AbsoluteDiscountValue {
                        money {
                          centAmount
                          currencyCode
                          fractionDigits
                          type
                        }
                        type
                      }
                      ... on RelativeDiscountValue {
                        permyriad
                      }
                    }
                  }
                  value {
                    centAmount
                    currencyCode
                    fractionDigits
                    type
                  }
                }
                value {
                  centAmount
                  currencyCode
                  fractionDigits
                  type
                }
              }
              availableQuantity
              attributes {
                bi_alcohol_percent
                bi_allergens_contain
                bi_allergens_may_contain
                bi_carbohydrate_content
                bi_carbohydrate_content_sugars
                bi_country_of_origin
                bi_fat_content_saturated_fatty_acids
                bi_fat_content_total
                bi_ingredients
                bi_protein_content
                bi_salt_content
                bi_storage_method
                bi_supplier_name
                contain_unit
                contains_alcohol
                discountable
                energy_value_kcal
                energy_value_kj
                long_description
                net_contain
                short_shelf_life
                tags {
                  key
                  label
                }
              }
              imagesUrls
              categoriesIds
              isPublished
              isFavourite
              __typename
            }
            __typename
          }
        }
      `,
    }),
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data: GraphQLResponse = await response.json();
  return data;
};

export {
  searchProduct,
  ProductPrice,
  DiscountValue,
  ProductDiscount,
  DiscountedProductPrice,
  Money,
  ProductAttributes,
  Product,
  ProductSearchResponse,
  GraphQLResponse,
};
