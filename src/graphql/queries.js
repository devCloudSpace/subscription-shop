import gql from 'graphql-tag'

export const ITEM_COUNT = gql`
   query itemCount($id: Int!, $zipcode: String) {
      itemCount: subscription_subscriptionItemCount_by_pk(id: $id) {
         id
         valid: subscriptions(
            where: { availableZipcodes: { zipcode: { _eq: $zipcode } } }
         ) {
            id
            rrule
            leadTime
         }
         invalid: subscriptions(
            where: { availableZipcodes: { zipcode: { _neq: $zipcode } } }
         ) {
            id
            rrule
            leadTime
         }
      }
   }
`

export const CUSTOMERS = gql`
   query customers($where: crm_customer_bool_exp) {
      customers(where: $where) {
         id
         keycloakId
         isSubscriber
         subscriptionId
      }
   }
`

export const PLANS = gql`
   subscription plans {
      plans: subscription_subscriptionTitle {
         id
         title
         defaultServingId: defaultSubscriptionServingId
         defaultServing: defaultSubscriptionServing {
            id
            size: servingSize
            defaultItemCount: defaultSubscriptionItemCount {
               id
               count
               price
            }
            itemCounts: subscriptionItemCounts {
               id
               count
               price
            }
         }
         servings: subscriptionServings(order_by: { servingSize: asc }) {
            id
            size: servingSize
            defaultItemCountId: defaultSubscriptionItemCountId
            defaultItemCount: defaultSubscriptionItemCount {
               id
               count
               price
            }
            itemCounts: subscriptionItemCounts(
               order_by: { count: asc, price: asc }
            ) {
               id
               count
               price
            }
         }
      }
   }
`

export const CUSTOMER_DETAILS = gql`
   query customer($keycloakId: String!) {
      customer(keycloakId: $keycloakId) {
         id
         keycloakId
         isSubscriber
         subscriptionId
         subscriptionAddressId
         subscriptionPaymentMethodId
         subscription {
            recipes: subscriptionItemCount {
               count
               price
               servingId: subscriptionServingId
               serving: subscriptionServing {
                  size: servingSize
               }
            }
         }
         platform_customer {
            email
            firstName
            lastName
            keycloakId
            phoneNumber
            stripeCustomerId
            addresses: customerAddresses {
               id
               lat
               lng
               line1
               line2
               city
               state
               country
               zipcode
               label
               notes
            }
            paymentMethods: stripePaymentMethods {
               brand
               last4
               country
               expMonth
               expYear
               funding
               keycloakId
               cardHolderName
               stripePaymentMethodId
            }
         }
      }
   }
`

export const OCCURENCES_BY_SUBSCRIPTION = gql`
   query subscription(
      $id: Int!
      $where: subscription_subscriptionOccurence_bool_exp
   ) {
      subscription: subscription_subscription_by_pk(id: $id) {
         id
         occurences: subscriptionOccurences(where: $where) {
            id
            isValid
            isVisible
            fulfillmentDate
         }
      }
   }
`

export const OCCURENCE_PRODUCTS_BY_CATEGORIES = gql`
   query categories(
      $occurenceId: Int_comparison_exp
      $subscriptionId: Int_comparison_exp
   ) {
      categories: productCategories {
         name
         productsAggregate: subscriptionOccurenceProducts_aggregate(
            where: {
               isVisible: { _eq: true }
               isAvailable: { _eq: true }
               _or: {
                  subscriptionId: $subscriptionId
                  subscriptionOccurenceId: $occurenceId
               }
            }
         ) {
            aggregate {
               count
            }
            nodes {
               cartItem
               addonLabel
               addonPrice
               isSingleSelect
               productOption: simpleRecipeProductOption {
                  id
                  simpleRecipeYieldId
                  product: simpleRecipeProduct {
                     id
                     name
                     assets
                     recipe: simpleRecipe {
                        id
                        name
                        image
                     }
                  }
               }
            }
         }
      }
   }
`

export const RECIPE_DETAILS = gql`
   query product($id: Int!, $yieldId: Int!) {
      product: simpleRecipeProduct(id: $id) {
         id
         recipe: simpleRecipe {
            id
            name
            author
            cookingTime
            cuisine
            description
            procedures
            image
            assets
            yields: simpleRecipeYields(where: { id: { _eq: $yieldId } }) {
               id
               yield
               sachets: ingredientSachets {
                  isVisible
                  slipName
                  ingredient: ingredientSachet {
                     id
                  }
               }
            }
         }
      }
   }
`

export const CART_BY_WEEK = gql`
   query cart($keycloakId: String!, $weekId: Int!) {
      cart: subscription_subscriptionOccurence_customer_by_pk(
         keycloakId: $keycloakId
         subscriptionOccurenceId: $weekId
      ) {
         isAuto
         isSkipped
         orderCartId
         orderCart {
            status
            cartInfo
         }
      }
   }
`

export const ZIPCODE = gql`
   query zipcode($subscriptionId: Int!, $zipcode: String!) {
      zipcode: subscription_subscription_zipcode_by_pk(
         subscriptionId: $subscriptionId
         zipcode: $zipcode
      ) {
         price: deliveryPrice
      }
   }
`

export const CART = gql`
   query cart($id: Int!) {
      cart: cartByPK(id: $id) {
         id
         amount
         address
         cartInfo
         fulfillmentInfo
      }
   }
`

export const CART_STATUS = gql`
   subscription cart($id: Int!) {
      cart: cartByPK(id: $id) {
         status
         orderId
         cartInfo
         address
         paymentStatus
         fulfillmentInfo
      }
   }
`

export const ORDER_HISTORY = gql`
   subscription orders($keycloakId: String_comparison_exp!) {
      orders: subscription_subscriptionOccurence_customer_aggregate(
         where: { keycloakId: $keycloakId }
         order_by: { subscriptionOccurence: { fulfillmentDate: desc } }
      ) {
         aggregate {
            count
         }
         nodes {
            occurrenceId: subscriptionOccurenceId
            occurrence: subscriptionOccurence {
               date: fulfillmentDate
            }
         }
      }
   }
`

export const ORDER = gql`
   subscription order($keycloakId: String!, $subscriptionOccurenceId: Int!) {
      order: subscription_subscriptionOccurence_customer_by_pk(
         keycloakId: $keycloakId
         subscriptionOccurenceId: $subscriptionOccurenceId
      ) {
         isSkipped
         occurrence: subscriptionOccurence {
            subscription {
               item: subscriptionItemCount {
                  price
               }
            }
         }
         cart: orderCart {
            amount
            address
            cartInfo
            deliveryPrice
            paymentMethodId
            order {
               status: orderStatus
            }
         }
      }
   }
`

export const ZIPCODE_AVAILABILITY = gql`
   query subscription_zipcode(
      $subscriptionId: Int_comparison_exp!
      $zipcode: String_comparison_exp!
   ) {
      subscription_zipcode: subscription_subscription_zipcode(
         where: { subscriptionId: $subscriptionId, zipcode: $zipcode }
      ) {
         zipcode
         subscriptionId
      }
   }
`
