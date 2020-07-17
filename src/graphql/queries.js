import gql from 'graphql-tag'

export const PLANS_AVAILABILITY_BY_ZIPCODE = gql`
   query plans($zipcode: String) {
      plans: subscription_subscriptionTitle(
         where: {
            subscriptionServings: {
               subscriptionItemCounts: {
                  subscriptions: {
                     availableZipcodes: { zipcode: { _eq: $zipcode } }
                  }
               }
            }
         }
      ) {
         id
      }
   }
`

export const ITEM_COUNT = gql`
   subscription itemCount($id: Int!) {
      itemCount: subscription_subscriptionItemCount_by_pk(id: $id) {
         id
         days: subscriptions {
            id
            rrule
            leadTime
         }
      }
   }
`

export const ADDRESSES = gql`
   query addresses($where: platform_customerAddress_bool_exp!) {
      addresses: platform_customerAddresses(where: $where) {
         id
         lat
         lng
         line1
         line2
         notes
         state
         label
         country
         zipcode
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
   subscription plans($zipcode: String) {
      plans: subscription_subscriptionTitle(
         where: {
            subscriptionServings: {
               subscriptionItemCounts: {
                  subscriptions: {
                     availableZipcodes: { zipcode: { _eq: $zipcode } }
                  }
               }
            }
         }
      ) {
         id
         title
         defaultServingId: defaultSubscriptionServingId
         defaultServing: defaultSubscriptionServing {
            id
            servingSize
            defaultItemCount: defaultSubscriptionItemCount {
               id
               count
               subscriptions {
                  id
                  rrule
               }
            }
            itemCounts: subscriptionItemCounts {
               id
               count
               subscriptions {
                  id
                  rrule
               }
            }
         }
         servings: subscriptionServings(order_by: { servingSize: asc }) {
            id
            servingSize
            defaultItemCountId: defaultSubscriptionItemCountId
            defaultItemCount: defaultSubscriptionItemCount {
               id
               count
               subscriptions {
                  id
                  rrule
               }
            }
            itemCounts: subscriptionItemCounts(order_by: { count: asc }) {
               id
               count
               subscriptions {
                  id
                  rrule
               }
            }
         }
      }
   }
`

export const CRM_CUSTOMER_DETAILS = gql`
   subscription customers($keycloakId: String!) {
      customers(where: { keycloakId: { _eq: $keycloakId } }) {
         id
         isSubscriber
         subscriptionId
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
      }
   }
`
export const CUSTOMER_DETAILS = gql`
   query platform_customer($keycloakId: String!) {
      platform_customer(keycloakId: $keycloakId) {
         email
         firstName
         lastName
         keycloakId
         phoneNumber
         stripeCustomerId
         defaultPaymentMethodId
         defaultCustomerAddressId
         defaultSubscriptionAddressId
         defaultSubscriptionAddress {
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
         defaultCustomerAddress {
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
         customerAddresses {
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
         defaultStripePaymentMethod {
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
         stripePaymentMethods {
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
`

export const CUSTOMER_OCCURENCES = gql`
   query customer($keycloakId: String!, $id: Int!) {
      customer(id: $id, keycloakId: $keycloakId) {
         subscription {
            occurences: subscriptionOccurences {
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
