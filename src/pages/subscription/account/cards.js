import React from 'react'
import axios from 'axios'
import { loadStripe } from '@stripe/stripe-js'
import { useMutation } from '@apollo/react-hooks'
import {
   Elements,
   useStripe,
   useElements,
   CardElement,
} from '@stripe/react-stripe-js'
import { navigate } from 'gatsby'
import tw, { styled } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'

import {
   SEO,
   Layout,
   Button,
   Tunnel,
   Loader,
   HelperBar,
   ProfileSidebar,
} from '../../../components'
import { useUser } from '../../../context'
import { CloseIcon } from '../../../assets/icons'
import { UPDATE_CUSTOMER, CREATE_STRIPE_PAYMENT_METHOD } from '../../../graphql'
import { useToasts } from 'react-toast-notifications'

const ManageCards = () => {
   const [keycloak] = useKeycloak()

   React.useEffect(() => {
      if (!keycloak?.authenticated) {
         navigate('/subscription')
      }
   }, [keycloak])

   return (
      <Layout>
         <SEO title="Manage Cards" />
         <Main>
            <ProfileSidebar />
            <Content />
         </Main>
      </Layout>
   )
}

export default ManageCards

const Content = () => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const [keycloak] = useKeycloak()
   const [tunnel, toggleTunnel] = React.useState(false)
   const [updateCustomer] = useMutation(UPDATE_CUSTOMER, {
      refetchQueries: ['customer'],
      onCompleted: () => {
         addToast('Successfully changed default address.', {
            appearance: 'success',
         })
      },
   })

   const makeDefault = method => {
      updateCustomer({
         variables: {
            keycloakId: keycloak?.tokenParsed?.sub,
            _set: {
               subscriptionPaymentMethodId: method.stripePaymentMethodId,
            },
         },
      })
   }

   return (
      <div tw="px-3">
         <header tw="mt-6 mb-3 flex items-center justify-between">
            <h2 tw="text-gray-600 text-xl">Cards</h2>
            {user?.platform_customer?.paymentMethods.length > 0 && (
               <Button size="sm" onClick={() => toggleTunnel(true)}>
                  Add Card
               </Button>
            )}
         </header>
         {user?.platform_customer?.paymentMethods.length > 0 ? (
            <PaymentMethods>
               {user?.platform_customer?.paymentMethods.map(method => (
                  <li
                     key={method.stripePaymentMethodId}
                     tw="flex border text-gray-700"
                  >
                     <section tw="p-2 w-full">
                        {user.subscriptionPaymentMethodId ===
                        method.stripePaymentMethodId ? (
                           <span tw="rounded border bg-teal-200 border-teal-300 px-2 text-teal-700">
                              Default
                           </span>
                        ) : (
                           <button
                              tw="mb-2 rounded border border-orange-300 px-2 text-teal-700 cursor-pointer hover:(bg-orange-300 text-orange-900)"
                              onClick={() => makeDefault(method)}
                           >
                              Make Default
                           </button>
                        )}
                        <div tw="flex items-center justify-between">
                           <span tw="text-xl my-2">
                              {method.cardHolderName}
                           </span>
                           <div tw="flex items-center">
                              <span tw="font-medium">{method.expMonth}</span>
                              &nbsp;/&nbsp;
                              <span tw="font-medium">{method.expYear}</span>
                           </div>
                        </div>
                        <span>
                           <span tw="text-gray-500">Last 4:</span>{' '}
                           {method.last4}
                        </span>
                     </section>
                  </li>
               ))}
            </PaymentMethods>
         ) : (
            <HelperBar type="info">
               <HelperBar.SubTitle>
                  Let's start with adding a card
               </HelperBar.SubTitle>
               <HelperBar.Button onClick={() => toggleTunnel(true)}>
                  Add Card
               </HelperBar.Button>
            </HelperBar>
         )}
         {tunnel && (
            <PaymentTunnel tunnel={tunnel} toggleTunnel={toggleTunnel} />
         )}
      </div>
   )
}

export const PaymentTunnel = ({ tunnel, toggleTunnel }) => {
   const { user } = useUser()
   const [intent, setIntent] = React.useState(null)

   React.useEffect(() => {
      if (user?.platform_customer?.stripeCustomerId) {
         ;(async () => {
            const intent = await createSetupIntent(
               user?.platform_customer?.stripeCustomerId
            )
            setIntent(intent)
         })()
      }
   }, [user])

   return (
      <Tunnel size="sm" isOpen={tunnel} toggleTunnel={toggleTunnel}>
         <Tunnel.Header title="Add Payment Method">
            <button
               onClick={() => toggleTunnel(false)}
               css={tw`border w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100`}
            >
               <CloseIcon size={20} tw="stroke-current text-green-800" />
            </button>
         </Tunnel.Header>
         <Tunnel.Body>
            <PaymentForm intent={intent} toggleTunnel={toggleTunnel} />
         </Tunnel.Body>
      </Tunnel>
   )
}

const stripePromise = loadStripe(process.env.GATSBY_STRIPE_KEY)

export const PaymentForm = ({ intent, toggleTunnel }) => {
   const { user } = useUser()
   const [updateCustomer] = useMutation(UPDATE_CUSTOMER, {
      refetchQueries: ['customer'],
   })
   const [createPaymentMethod] = useMutation(CREATE_STRIPE_PAYMENT_METHOD, {
      refetchQueries: ['customer'],
   })

   const handleResult = async ({ setupIntent }) => {
      try {
         if (setupIntent.status === 'succeeded') {
            const { data: { success, data = {} } = {} } = await axios.get(
               `${process.env.GATSBY_DAILYKEY_URL}/api/payment-method/${setupIntent.payment_method}`
            )
            if (success) {
               await createPaymentMethod({
                  variables: {
                     object: {
                        last4: data.card.last4,
                        brand: data.card.brand,
                        country: data.card.country,
                        funding: data.card.funding,
                        keycloakId: user.keycloakId,
                        expYear: data.card.exp_year,
                        cvcCheck: data.card.cvc_check,
                        expMonth: data.card.exp_month,
                        stripePaymentMethodId: data.id,
                        cardHolderName: data.billing_details.name,
                     },
                  },
               })
               if (!user.subscriptionPaymentMethodId) {
                  await updateCustomer({
                     variables: {
                        keycloakId: user.keycloakId,
                        _set: {
                           subscriptionPaymentMethodId: data.id,
                        },
                     },
                  })
               }

               toggleTunnel(false)
            } else {
               throw Error("Couldn't complete card setup, please try again")
            }
         } else {
            throw Error("Couldn't complete card setup, please try again")
         }
      } catch (error) {}
   }

   if (!intent) return <Loader inline />
   return (
      <div>
         <Elements stripe={stripePromise}>
            <CardSetupForm intent={intent} handleResult={handleResult} />
         </Elements>
      </div>
   )
}

const CardSetupForm = ({ intent, handleResult }) => {
   const stripe = useStripe()
   const elements = useElements()
   const inputRef = React.useRef(null)
   const [name, setName] = React.useState('')
   const [submitting, setSubmitting] = React.useState(false)

   React.useEffect(() => {
      inputRef.current.focus()
   }, [])

   const handleSubmit = async event => {
      setSubmitting(true)
      event.preventDefault()

      if (!stripe || !elements) {
         return
      }

      const result = await stripe.confirmCardSetup(intent.client_secret, {
         payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
               name,
            },
         },
      })

      if (result.error) {
         // Display result.error.message in your UI.
      } else {
         handleResult(result)
      }
   }

   return (
      <form onSubmit={handleSubmit}>
         <div tw="bg-gray-900 p-3 rounded-lg">
            <section className="mb-3">
               <label htmlFor="name" tw="block text-sm text-gray-500">
                  Card Holder Name
               </label>
               <input
                  type="text"
                  name="name"
                  value={name}
                  ref={inputRef}
                  placeholder="Enter card holder's name"
                  onChange={e => setName(e.target.value)}
                  tw="w-full bg-transparent border-b border-gray-800 h-10 text-white focus:outline-none"
               />
            </section>
            <CardSection />
         </div>
         <button
            disabled={!stripe}
            tw="mt-3 w-full h-10 bg-blue-600 text-sm py-1 text-white uppercase font-medium tracking-wider rounded"
         >
            {submitting ? 'Saving...' : 'Save'}
         </button>
      </form>
   )
}

const CARD_ELEMENT_OPTIONS = {
   style: {
      base: {
         color: '#fff',
         fontSize: '16px',
         '::placeholder': {
            color: '#aab7c4',
         },
      },
      invalid: {
         color: '#fa755a',
         iconColor: '#fa755a',
      },
   },
}

const CardSection = () => {
   const [error, setError] = React.useState('')
   return (
      <CardSectionWrapper>
         <span tw="block text-sm text-gray-500">Card Details</span>
         <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={({ error }) => setError(error?.message || '')}
         />
         {error && <span tw="block mt-1 text-red-400">{error}</span>}
      </CardSectionWrapper>
   )
}

const createSetupIntent = async customer => {
   try {
      const {
         data,
      } = await axios.post(
         `${process.env.GATSBY_DAILYKEY_URL}/api/setup-intent`,
         { customer, confirm: true }
      )
      return data.data
   } catch (error) {
      return error
   }
}

const Main = styled.main`
   display: grid;
   grid-template-rows: 1fr;
   height: calc(100vh - 64px);
   grid-template-columns: 240px 1fr;
`

const PaymentMethods = styled.ul`
   ${tw`
   grid 
   gap-2
   sm:grid-cols-1
   md:grid-cols-2
`}
   grid-auto-rows: minmax(120px, auto);
`

const CardSectionWrapper = styled.div`
   .StripeElement {
      height: 40px;
      width: 100%;
      color: #fff;
      padding: 10px 0;
      background-color: #1a202c;
      border-bottom: 1px solid #2d3748;
   }

   .StripeElement--invalid {
      border-color: #fa755a;
   }

   .StripeElement--webkit-autofill {
      background-color: #fefde5 !important;
   }
`
