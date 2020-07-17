import React from 'react'
import { styled } from 'twin.macro'
import { navigate } from 'gatsby'
import { useKeycloak } from '@react-keycloak/web'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { isClient } from '../../utils'
import { SEO, Layout, StepsNavbar } from '../../components'
import { CUSTOMERS, UPDATE_CUSTOMER, CREATE_CUSTOMER } from '../../graphql'

export default () => {
   const [keycloak] = useKeycloak()

   const [create] = useMutation(CREATE_CUSTOMER)
   const [update] = useMutation(UPDATE_CUSTOMER)

   const [customers] = useLazyQuery(CUSTOMERS, {
      onCompleted: ({ customers }) => {
         if (customers.length > 0) {
            const [customer] = customers
            update({
               variables: {
                  id: customer.id,
                  keycloakId: customer.keycloakId,
                  _set: { isSubscriber: true },
               },
            })
            if (customer.subscriptionId) {
               navigate('/')
            }
         }
         if (customers.length === 0) {
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
         navigate('/get-started/select-delivery')
      },
   })

   React.useEffect(() => {
      if (keycloak?.authenticated) {
         if ('tokenParsed' in keycloak) {
            customers({
               variables: {
                  where: { keycloakId: { _eq: keycloak?.tokenParsed?.sub } },
               },
            })
         }
      }
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
   }, [keycloak, customers])

   return (
      <Layout noHeader>
         <SEO title="Register" />
         <StepsNavbar />
         <Main tw="pt-8">
            {!keycloak?.authenticated && (
               <iframe
                  frameBorder="0"
                  title="Register"
                  tw="mx-auto w-full md:w-4/12 h-full"
                  src={keycloak?.createRegisterUrl({
                     redirectUri: isClient
                        ? `${window.location.origin}${
                             process.env.NODE_ENV === 'production'
                                ? '/subscription'
                                : ''
                          }/login-success.xhtml`
                        : '',
                  })}
               ></iframe>
            )}
         </Main>
      </Layout>
   )
}

const Main = styled.main`
   margin: auto;
   overflow-y: auto;
   max-width: 1180px;
   width: calc(100vw - 40px);
   height: calc(100vh - 64px);
`
