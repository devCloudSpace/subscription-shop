import React from 'react'
import { isEmpty } from 'lodash'
import { navigate } from 'gatsby'
import jwtDecode from 'jwt-decode'
import tw, { styled } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { useUser } from '../../../context'
import { useConfig, auth } from '../../../lib'
import { isClient, processUser } from '../../../utils'
import { SEO, Layout, StepsNavbar } from '../../../components'
import { BRAND, CREATE_CUSTOMER, CUSTOMER } from '../../../graphql'

export default () => {
   const { brand } = useConfig()
   const { addToast } = useToasts()
   const { user, dispatch } = useUser()
   const [current, setCurrent] = React.useState('REGISTER')

   const [create_brand_customer] = useMutation(BRAND.CUSTOMER.CREATE, {
      refetchQueries: ['customer'],
      onCompleted: () => {
         if (isClient) {
            window.location.href =
               window.location.origin +
               '/subscription/get-started/select-delivery'
         }
      },
      onError: error => {
         console.log(error)
      },
   })
   const [create, { loading: creatingCustomer }] = useMutation(
      CREATE_CUSTOMER,
      {
         refetchQueries: ['customer'],
         onCompleted: async ({ createCustomer }) => {
            if (!isEmpty(createCustomer)) {
               const user = await processUser(createCustomer)
               dispatch({ type: 'SET_USER', payload: user })
            }
            if (isClient) {
               window.location.href =
                  window.location.origin +
                  '/subscription/get-started/select-delivery'
            }
         },
         onError: () =>
            addToast('Something went wrong!', {
               appearance: 'error',
            }),
      }
   )
   const [customer, { loading: loadingCustomerDetails }] = useLazyQuery(
      CUSTOMER.DETAILS,
      {
         onCompleted: async ({ customer = {} }) => {
            const { email = '', sub: keycloakId = '' } = jwtDecode(
               localStorage.getItem('token')
            )
            if (isEmpty(customer)) {
               console.log('CUSTOMER DOESNT EXISTS')
               create({
                  variables: {
                     object: {
                        email,
                        keycloakId,
                        source: 'subscription',
                        sourceBrandId: brand.id,
                        clientId: process.env.GATSBY_CLIENTID,
                        brandCustomers: { data: { brandId: brand.id } },
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
                        keycloakId,
                        brandId: brand.id,
                     },
                  },
               })
            } else if (
               customer.isSubscriber &&
               brandCustomers[0].isSubscriber
            ) {
               console.log('BRAND_CUSTOMER EXISTS & CUSTOMER IS SUBSCRIBED')
               navigate('/subscription/menu')
               isClient && localStorage.removeItem('plan')
            } else {
               console.log('CUSTOMER ISNT SUBSCRIBED')
               if (isClient) {
                  window.location.href =
                     window.location.origin +
                     '/subscription/get-started/select-delivery'
               }
            }
         },
      }
   )

   React.useEffect(() => {
      if (user?.keycloakId) {
         if (user?.isSubscriber) navigate('/subscription/menu')
         else if (isClient) {
            window.location.href =
               window.location.origin +
               '/subscription/get-started/select-delivery'
         }
      }
   }, [user])

   return (
      <Layout noHeader>
         <SEO title="Register" />
         <StepsNavbar />
         <Main tw="pt-8">
            <TabList>
               <Tab
                  className={current === 'LOGIN' ? 'active' : ''}
                  onClick={() => setCurrent('LOGIN')}
               >
                  Login
               </Tab>
               <Tab
                  className={current === 'REGISTER' ? 'active' : ''}
                  onClick={() => setCurrent('REGISTER')}
               >
                  Register
               </Tab>
            </TabList>
            {current === 'LOGIN' && (
               <LoginPanel
                  customer={customer}
                  loading={loadingCustomerDetails || creatingCustomer}
               />
            )}
            {current === 'REGISTER' && (
               <RegisterPanel
                  customer={customer}
                  setCurrent={setCurrent}
                  loading={loadingCustomerDetails || creatingCustomer}
               />
            )}
         </Main>
      </Layout>
   )
}

const LoginPanel = ({ loading, customer }) => {
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
            className={!isValid || loading ? 'disabled' : ''}
            onClick={() => isValid && submit()}
         >
            {loading ? 'Logging in...' : 'Login'}
         </Submit>
         {error && <span tw="self-start block text-red-500 mt-2">{error}</span>}
      </Panel>
   )
}

const RegisterPanel = ({ loading, customer, setCurrent }) => {
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
         const result = await auth.register({
            email: form.email,
            password: form.password,
         })
         if (result?.success) {
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
            }
         }
      } catch (error) {
         if (error.includes('exists')) {
            return setError('Email is already in use!')
         }
         setError('Failed to register, please try again!')
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
            className={!isValid || loading ? 'disabled' : ''}
            onClick={() => isValid && submit()}
         >
            {loading ? 'Registering' : 'Register'}
         </Submit>
         <button
            tw="self-start mt-2 text-blue-500"
            onClick={() => setCurrent('LOGIN')}
         >
            Login instead?
         </button>
         {error && <span tw="self-start block text-red-500 mt-2">{error}</span>}
      </Panel>
   )
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
