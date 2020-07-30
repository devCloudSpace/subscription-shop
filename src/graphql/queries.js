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

export const CUSTOMER_OCCURENCES = gql`
   query customer(
      $keycloakId: String!
      $where: subscription_subscriptionOccurence_bool_exp!
   ) {
      customer(keycloakId: $keycloakId) {
         id
         subscription {
            id
            occurences: subscriptionOccurences(where: $where) {
               id
               isValid
               isVisible
               fulfillmentDate
               cutoffTimeStamp
            }
         }
      }
   }
`

export const OCCURENCES_BY_SUBSCRIPTION = gql`
   query subscription($id: Int!) {
      subscription: subscription_subscription_by_pk(id: $id) {
         id
         occurences: subscriptionOccurences {
            id
            isValid
            isVisible
            fulfillmentDate
         }
      }
   }
`

export const OCCURENCE_PRODUCTS_BY_CATEGORIES = gql`
   query categories($occurenceId: Int_comparison_exp!) {
      categories: productCategories {
         name
         productsAggregate: subscriptionOccurenceProducts_aggregate(
            where: {
               subscriptionOccurenceId: $occurenceId
               isVisible: { _eq: true }
               isAvailable: { _eq: true }
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
