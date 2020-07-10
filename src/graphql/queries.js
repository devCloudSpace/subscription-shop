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
   query customers($keycloakId: String!) {
      customers(where: { keycloakId: { _eq: $keycloakId } }) {
         id
         isSubscriber
         subscriptionId
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
