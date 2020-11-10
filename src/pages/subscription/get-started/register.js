import React from 'react'
import { isEmpty } from 'lodash'
import { navigate } from 'gatsby'
import { styled } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'
import { useToasts } from 'react-toast-notifications'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { isClient } from '../../../utils'
import { useConfig } from '../../../lib'
import { SEO, Layout, StepsNavbar } from '../../../components'
import { BRAND, CREATE_CUSTOMER, CUSTOMER } from '../../../graphql'

export default () => {
   const { brand } = useConfig()
   const [keycloak] = useKeycloak()
   const { addToast } = useToasts()

   const [create_brand_customer] = useMutation(BRAND.CUSTOMER.CREATE, {
      refetchQueries: ['customer'],
      onCompleted: () => {
         navigate('/subscription/get-started/select-delivery')
      },
      onError: error => {
         console.log(error)
      },
   })
   const [create] = useMutation(CREATE_CUSTOMER, {
      refetchQueries: ['customer'],
      onCompleted: () => {
         navigate('/subscription/get-started/select-delivery')
      },
      onError: () =>
         addToast('Something went wrong!', {
            appearance: 'error',
         }),
   })
   const [customer] = useLazyQuery(CUSTOMER.DETAILS, {
      onCompleted: ({ customer = {} }) => {
         if (isEmpty(customer)) {
            console.log('CUSTOMER DOESNT EXISTS')
            create({
               variables: {
                  object: {
                     source: 'subscription',
                     sourceBrandId: brand.id,
                     email: keycloak?.tokenParsed?.email,
                     clientId: process.env.GATSBY_CLIENTID,
                     keycloakId: keycloak?.tokenParsed?.sub,
                     brandCustomers: {
                        data: {
                           brandId: brand.id,
                        },
                     },
                  },
               },
            })
            return
         }
         console.log('CUSTOMER EXISTS')
         const { brandCustomers = {} } = customer
         console.log('brandCustomers', brandCustomers)
         if (isEmpty(brandCustomers)) {
            console.log('BRAND_CUSTOMER DOESNT EXISTS')
            create_brand_customer({
               variables: {
                  object: {
                     brandId: brand.id,
                     keycloakId: keycloak?.tokenParsed?.sub,
                  },
               },
            })
         } else if (customer.isSubscriber && brandCustomers[0].isSubscriber) {
            console.log('BRAND_CUSTOMER EXISTS & CUSTOMER IS SUBSCRIBED')
            navigate('/subscription/menu')
         } else {
            console.log('CUSTOMER ISNT SUBSCRIBED')
            navigate('/subscription/get-started/select-delivery')
         }
      },
   })

   React.useEffect(() => {
      if (keycloak?.authenticated) {
         if ('tokenParsed' in keycloak && 'id' in brand) {
            customer({
               variables: {
                  keycloakId: keycloak.tokenParsed?.sub,
                  brandId: brand.id,
               },
            })
         }
      }
   }, [keycloak, customer, brand])

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
                        ? `${window.location.origin}/subscription/login-success.xhtml`
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
