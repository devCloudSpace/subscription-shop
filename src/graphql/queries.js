import gql from 'graphql-tag'

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
