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
