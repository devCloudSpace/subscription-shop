import React from 'react'
import tw, { styled } from 'twin.macro'
import { navigate } from '@reach/router'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { useAuth } from '../../lib'
import { SEO, Layout, StepsNavbar } from '../../components'
import { CUSTOMERS, UPDATE_CUSTOMER, CREATE_CUSTOMER } from '../../graphql'

export default () => {
   const { user, keycloak, isAuthenticated } = useAuth()
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
                     email: user.email,
                     isSubscriber: true,
                     keycloakId: user.sub,
                     source: 'subscription',
                     clientId: process.env.GATSBY_CLIENTID,
                  },
               },
            })
         }
         navigate('/get-started/select-delivery')
      },
   })

   React.useEffect(() => {
      if (isAuthenticated) {
         if (window.location !== window.parent.location) {
            window.parent.location.reload()
         }
         if ('sub' in user) {
            console.log(user)
            customers({
               variables: {
                  where: { keycloakId: { _eq: user.sub } },
               },
            })
         }
      }
   }, [isAuthenticated, customers])

   return (
      <Layout noHeader>
         <SEO title="Register" />
         <StepsNavbar />
         <Main>
            <iframe
               frameBorder="0"
               title="Register"
               css={tw`w-full h-full`}
               src={keycloak.createRegisterUrl()}
            ></iframe>
         </Main>
      </Layout>
   )
}
const Main = styled.main`
   margin: auto;
   overflow-y: auto;
   max-width: 980px;
   width: calc(100vw - 40px);
   height: calc(100vh - 64px);
`
