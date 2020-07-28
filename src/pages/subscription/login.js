import React from 'react'
import { navigate } from 'gatsby'
import { styled } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { isClient } from '../../utils'
import { Layout, SEO } from '../../components'
import { CUSTOMERS, CREATE_CUSTOMER, UPDATE_CUSTOMER } from '../../graphql'

const Login = () => {
   const [keycloak] = useKeycloak()

   const [create] = useMutation(CREATE_CUSTOMER, {
      onCompleted: () => {
         navigate('/subscription/get-started/select-plan')
      },
   })
   const [update] = useMutation(UPDATE_CUSTOMER, {
      onCompleted: () => {
         navigate('/subscription/get-started/select-plan')
      },
   })

   const [customers] = useLazyQuery(CUSTOMERS, {
      onCompleted: ({ customers }) => {
         if (customers.length > 0) {
            const [customer] = customers
            if (customer.subscriptionId) {
               navigate('/subscription/menu')
            } else {
               update({
                  variables: {
                     id: customer.id,
                     keycloakId: customer.keycloakId,
                     _set: { isSubscriber: true },
                  },
               })
            }
         } else if (customers.length === 0) {
            create({
               variables: {
                  object: {
                     isSubscriber: true,
                     source: 'subscription',
                     email: keycloak?.tokenParsed?.email,
                     clientId: process.env.GATSBY_CLIENTID,
                     keycloakId: keycloak?.tokenParsed?.sub,
                  },
               },
            })
         }
      },
   })

   React.useEffect(() => {
      if ('tokenParsed' in keycloak) {
         customers({
            variables: {
               where: { keycloakId: { _eq: keycloak.tokenParsed.sub } },
            },
         })
      }
   }, [keycloak, customers])

   React.useEffect(() => {
      if (isClient) {
         let eventMethod = window.addEventListener
            ? 'addEventListener'
            : 'attachEvent'
         let eventer = window[eventMethod]
         let messageEvent =
            eventMethod === 'attachEvent' ? 'onmessage' : 'message'

         eventer(messageEvent, e => {
            if (e.origin !== window.origin) return
            try {
               if (JSON.parse(e.data).success) {
                  window.location.reload()
               }
            } catch (error) {}
         })
      }
   }, [])

   return (
      <Layout>
         <SEO title="Login" />
         <Main>
            {!keycloak?.authenticated && (
               <iframe
                  frameBorder="0"
                  title="Register"
                  tw="mx-auto w-full md:w-4/12 h-full"
                  src={keycloak?.createLoginUrl({
                     redirectUri: isClient
                        ? `${window.location.origin}/subscription/login-success.xhtml`
                        : '',
                  })}
               ></iframe>
            )}
         </Main>
      </Layout>
   )
}

export default Login

const Main = styled.main`
   margin: auto;
   overflow-y: auto;
   max-width: 1180px;
   width: calc(100vw - 40px);
   height: calc(100vh - 128px);
`