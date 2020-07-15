import gql from 'graphql-tag'

export const UPDATE_CUSTOMER = gql`
   mutation updateCustomer(
      $id: Int!
      $keycloakId: String!
      $_set: crm_customer_set_input!
   ) {
      updateCustomer(
         pk_columns: { id: $id, keycloakId: $keycloakId }
         _set: $_set
      ) {
         id
      }
   }
`

export const CREATE_CUSTOMER = gql`
   mutation createCustomer($object: crm_customer_insert_input!) {
      createCustomer(object: $object) {
         id
      }
   }
`

export const UPDATE_CUSTOMERS = gql`
   mutation updateCustomers(
      $_set: crm_customer_set_input!
      $where: crm_customer_bool_exp!
   ) {
      updateCustomers(where: $where, _set: $_set) {
         returning {
            id
         }
      }
   }
`

export const UPDATE_DAILYKEY_CUSTOMER = gql`
   mutation updateCustomers(
      $keycloakId: String!
      $_set: platform_customer_set_input!
   ) {
      platform_updateCustomer(
         pk_columns: { keycloakId: $keycloakId }
         _set: $_set
      ) {
         keycloakId
      }
   }
`

export const CREATE_CUSTOMER_ADDRESS = gql`
   mutation createCustomerAddress(
      $object: platform_customerAddress_insert_input!
   ) {
      createCustomerAddress: platform_createCustomerAddress(object: $object) {
         id
      }
   }
`

export const UPSERT_OCCURENCE_CUSTOMER_CART_SKIP = gql`
   mutation upsertOccurenceCustomerCart(
      $isSkipped: Boolean!
      $keycloakId: String!
      $subscriptionOccurenceId: Int!
   ) {
      upsertOccurenceCustomerCart: insert_subscription_subscriptionOccurence_customer_one(
         object: {
            isSkipped: $isSkipped
            keycloakId: $keycloakId
            subscriptionOccurenceId: $subscriptionOccurenceId
         }
         on_conflict: {
            constraint: subscriptionOccurence_customer_pkey
            update_columns: [isSkipped]
         }
      ) {
         isSkipped
      }
   }
`

export const CREATE_CART = gql`
   mutation createCart(
      $object: crm_orderCart_insert_input!
      $on_conflict: crm_orderCart_on_conflict!
   ) {
      createCart(object: $object, on_conflict: $on_conflict) {
         id
      }
   }
`
