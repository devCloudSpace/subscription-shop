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
      plans: subscription_subscriptionTitle(
         where: { isActive: { _eq: true } }
      ) {
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
         servings: subscriptionServings(
            order_by: { servingSize: asc }
            where: { isActive: { _eq: true } }
         ) {
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
               where: { isActive: { _eq: true } }
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
      $subscriptionId: Int_comparison_exp
      $occurenceId: Int_comparison_exp
   ) {
      categories: productCategories(
         where: {
            subscriptionOccurenceProducts: {
               _or: [
                  { subscriptionId: $subscriptionId }
                  { subscriptionOccurenceId: $occurenceId }
               ]
               isAvailable: { _eq: true }
               isVisible: { _eq: true }
            }
         }
      ) {
         name
         productsAggregate: subscriptionOccurenceProducts_aggregate(
            distinct_on: simpleRecipeProductOptionId
         ) {
            aggregate {
               count
            }
            nodes {
               id
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

export const CONVENTIONS = gql`
   subscription conventions($identifier: String_comparison_exp!) {
      conventions: subscription_subscriptionStoreSetting(
         where: { identifier: $identifier }
      ) {
         id
         value
      }
   }
`

export const STEPS_LABELS = gql`
   subscription steps($identifier: String_comparison_exp!) {
      steps: subscription_subscriptionStoreSetting(
         where: { identifier: $identifier }
      ) {
         id
         value
      }
   }
`

export const CONFIG = gql`
   subscription subscription_subscriptionStoreSetting(
      $identifier: String_comparison_exp!
   ) {
      subscription_subscriptionStoreSetting(
         where: { identifier: $identifier }
      ) {
         id
         value
      }
   }
`

export const INFORMATION_GRID = gql`
   subscription infoGrid(
      $page: String_comparison_exp!
      $identifier: String_comparison_exp!
   ) {
      infoGrid: content_informationGrid(
         where: {
            page: $page
            isVisible: { _eq: true }
            identifier: $identifier
         }
      ) {
         id
         heading
         subHeading
         identifier
         columnsCount
         blockOrientation
         blocks: informationBlocks {
            id
            title
            thumbnail
            description
         }
      }
   }
`

export const FAQ = gql`
   subscription faq(
      $page: String_comparison_exp!
      $identifier: String_comparison_exp!
   ) {
      faq: content_faqs(
         where: {
            page: $page
            isVisible: { _eq: true }
            identifier: $identifier
         }
      ) {
         id
         heading
         subHeading
         identifier
         blocks: informationBlocks {
            id
            title
            description
         }
      }
   }
`

export const OUR_MENU = {
   TITLES: gql`
      query titles {
         titles: subscription_subscriptionTitle(
            where: { isActive: { _eq: true } }
         ) {
            id
            title
         }
      }
   `,
   TITLE: gql`
      query title($id: Int!) {
         title: subscription_subscriptionTitle_by_pk(id: $id) {
            id
            servings: subscriptionServings(where: { isActive: { _eq: true } }) {
               id
               size: servingSize
            }
         }
      }
   `,
   SERVING: gql`
      query serving($id: Int!) {
         serving: subscription_subscriptionServing_by_pk(id: $id) {
            id
            size: servingSize
            counts: subscriptionItemCounts(where: { isActive: { _eq: true } }) {
               id
               count
            }
         }
      }
   `,
   ITEM_COUNT: gql`
      query itemCount($id: Int!) {
         itemCount: subscription_subscriptionItemCount_by_pk(id: $id) {
            id
            count
            subscriptions {
               id
               rrule
            }
         }
      }
   `,
   SUBSCRIPTION: gql`
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
   `,
}
