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
