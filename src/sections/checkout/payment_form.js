import React from 'react'
import axios from 'axios'
import { styled } from 'twin.macro'
import { loadStripe } from '@stripe/stripe-js'
import { useMutation } from '@apollo/react-hooks'
import {
   Elements,
   useStripe,
   useElements,
   CardElement,
} from '@stripe/react-stripe-js'

import { usePayment } from './state'
import { useUser } from '../../context'
import { Loader } from '../../components'
import {
   UPDATE_DAILYKEY_CUSTOMER,
   CREATE_STRIPE_PAYMENT_METHOD,
} from '../../graphql'

const stripePromise = loadStripe(process.env.GATSBY_STRIPE_KEY)

export const PaymentForm = () => {
   const { user } = useUser()
   const { dispatch } = usePayment()
   const [intent, setIntent] = React.useState(null)
   const [updateCustomer] = useMutation(UPDATE_DAILYKEY_CUSTOMER, {
      refetchQueries: ['paymentMethods', 'platform_customer'],
   })
   const [createPaymentMethod] = useMutation(CREATE_STRIPE_PAYMENT_METHOD, {
      refetchQueries: ['paymentMethods', 'platform_customer'],
   })

   React.useEffect(() => {
      if (user.stripeCustomerId) {
         ;(async () => {
            const intent = await createSetupIntent(user.stripeCustomerId)
            setIntent(intent)
         })()
      }
   }, [user])

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
               if (!user.defaultSubscriptionPaymentMethodId) {
                  await updateCustomer({
                     variables: {
                        keycloakId: user.keycloakId,
                        _set: {
                           defaultSubscriptionPaymentMethodId: data.id,
                        },
                     },
                  })
               }

               dispatch({
                  type: 'TOGGLE_TUNNEL',
                  payload: {
                     isVisible: false,
                  },
               })
            } else {
               // TODO: delete stripe payment method on failure
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
