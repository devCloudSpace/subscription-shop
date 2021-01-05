import React from 'react'
import { isEmpty } from 'lodash'
import { navigate } from 'gatsby'
import jwtDecode from 'jwt-decode'
import tw, { styled } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'
import { useToasts } from 'react-toast-notifications'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { useUser } from '../../context'
import { useConfig, auth } from '../../lib'
import { SEO, Layout } from '../../components'
import { isClient, isKeycloakSupported } from '../../utils'
import { BRAND, CREATE_CUSTOMER, CUSTOMER } from '../../graphql'

const Login = () => {
   const { brand } = useConfig()
   const [keycloak] = useKeycloak()
   const { addToast } = useToasts()
   const { user, dispatch } = useUser()
   const [current, setCurrent] = React.useState('LOGIN')

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
         dispatch({ type: 'SET_USER', payload: {} })
         navigate('/subscription/get-started/select-delivery')
      },
      onError: () =>
         addToast('Something went wrong!', {
            appearance: 'error',
         }),
   })
   const [customer] = useLazyQuery(CUSTOMER.DETAILS, {
      onCompleted: async ({ customer = {} }) => {
         if (isEmpty(customer)) {
            console.log('CUSTOMER DOESNT EXISTS')
            create({
               variables: {
                  object: {
                     source: 'subscription',
                     sourceBrandId: brand.id,
                     email: isKeycloakSupported()
                        ? keycloak?.tokenParsed?.email
                        : jwtDecode(localStorage.getItem('token')).email,
                     clientId: process.env.GATSBY_CLIENTID,
                     keycloakId: isKeycloakSupported()
                        ? keycloak?.tokenParsed?.sub
                        : jwtDecode(localStorage.getItem('token')).sub,
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

         const user = await processUser(customer)
         dispatch({ type: 'SET_USER', payload: user })

         const { brandCustomers = {} } = customer
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
            isClient && localStorage.removeItem('plan')
         } else {
            console.log('CUSTOMER ISNT SUBSCRIBED')
            navigate('/subscription/get-started/select-delivery')
         }
      },
   })

   React.useEffect(() => {
      if (user?.keycloakId && !user?.isSubscriber) {
         navigate('/subscription/get-started/select-delivery')
      } else if (user?.keycloakId && user?.isSubscriber) {
         navigate('/subscription/menu')
      }
   }, [user])

   React.useEffect(() => {
      if (isKeycloakSupported() && keycloak?.authenticated) {
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
      if (isClient && isKeycloakSupported()) {
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
         <Main tw="pt-8">
            {isKeycloakSupported() ? (
               <>
                  {!keycloak?.authenticated && (
                     <iframe
                        frameBorder="0"
                        title="Register"
                        tw="mx-auto w-full md:w-4/12 h-full"
                        style={{ height: '780px' }}
                        src={keycloak?.createRegisterUrl({
                           redirectUri: isClient
                              ? `${window.location.origin}/subscription/login-success.xhtml`
                              : '',
                        })}
                     ></iframe>
                  )}
               </>
            ) : (
               <>
                  <TabList>
                     <Tab
                        className={current === 'LOGIN' ? 'active' : ''}
                        onClick={() => setCurrent('LOGIN')}
                     >
                        Login
                     </Tab>
                  </TabList>
                  {current === 'LOGIN' && <LoginPanel customer={customer} />}
               </>
            )}
         </Main>
      </Layout>
   )
}

export default Login

const LoginPanel = ({ customer }) => {
   const { brand } = useConfig()
   const [error, setError] = React.useState('')
   const [form, setForm] = React.useState({
      email: '',
      password: '',
   })

   const isValid = form.email && form.password

   const onChange = e => {
      const { name, value } = e.target
      setForm(form => ({
         ...form,
         [name]: value,
      }))
   }

   const submit = async () => {
      try {
         setError('')
         const token = await auth.login({
            email: form.email,
            password: form.password,
         })
         if (token?.sub) {
            customer({
               variables: {
                  keycloakId: token?.sub,
                  brandId: brand.id,
               },
            })
         } else {
            setError('Failed to login, please try again!')
         }
      } catch (error) {
         if (error?.code === 401) {
            setError('Email or password is incorrect!')
         }
      }
   }

   return (
      <Panel>
         <FieldSet>
            <Label htmlFor="email">Email</Label>
            <Input
               type="email"
               name="email"
               value={form.email}
               onChange={onChange}
               placeholder="Enter your email"
            />
         </FieldSet>
         <FieldSet>
            <Label htmlFor="password">Password</Label>
            <Input
               name="password"
               type="password"
               onChange={onChange}
               value={form.password}
               placeholder="Enter your password"
            />
         </FieldSet>
         <Submit
            className={!isValid ? 'disabled' : ''}
            onClick={() => isValid && submit()}
         >
            Login
         </Submit>
         {error && <span tw="self-start block text-red-500 mt-2">{error}</span>}
      </Panel>
   )
}

const processUser = customer => {
   const sub = {}
   const { brandCustomers = [], ...rest } = customer

   if (!isEmpty(brandCustomers)) {
      const [brand_customer] = brandCustomers

      const {
         subscription = null,
         subscriptionId = null,
         subscriptionAddressId = null,
         subscriptionPaymentMethodId = null,
      } = brand_customer

      rest.subscription = subscription
      rest.subscriptionId = subscriptionId
      rest.subscriptionAddressId = subscriptionAddressId
      rest.subscriptionPaymentMethodId = subscriptionPaymentMethodId

      sub.defaultAddress = rest?.platform_customer?.addresses.find(
         address => address.id === subscriptionAddressId
      )

      sub.defaultPaymentMethod = rest?.platform_customer?.paymentMethods.find(
         method => method.stripePaymentMethodId === subscriptionPaymentMethodId
      )
   }
   return { ...rest, ...sub }
}

const Main = styled.main`
   margin: auto;
   overflow-y: auto;
   max-width: 1180px;
   width: calc(100vw - 40px);
   min-height: calc(100vh - 128px);
   > section {
      width: 100%;
      max-width: 360px;
   }
`

const Panel = styled.section`
   ${tw`flex mx-auto justify-center items-center flex-col py-4`}
`

const TabList = styled.ul`
   ${tw`border-b flex justify-center space-x-3`}
`

const Tab = styled.button`
   ${tw`h-8 px-3`}
   &.active {
      ${tw`border-b border-green-500 border-b-2`}
   }
`

const FieldSet = styled.fieldset`
   ${tw`w-full flex flex-col mb-4`}
`

const Label = styled.label`
   ${tw`text-gray-600 mb-1`}
`

const Input = styled.input`
   ${tw`w-full block border h-10 rounded px-2 outline-none focus:border-2 focus:border-blue-400`}
`

const Submit = styled.button`
   ${tw`bg-green-500 rounded w-full h-10 text-white uppercase tracking-wider`}
   &.disabled {
      ${tw`cursor-not-allowed bg-gray-300 text-gray-700`}
   }
`
