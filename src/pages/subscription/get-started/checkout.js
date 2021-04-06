import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useMutation, useSubscription } from '@apollo/react-hooks'

import { useConfig } from '../../../lib'
import * as QUERIES from '../../../graphql'
import * as Icon from '../../../assets/icons'
import OrderInfo from '../../../sections/OrderInfo'
import { isClient, formatCurrency } from '../../../utils'
import { SEO, Loader, Layout, StepsNavbar } from '../../../components'
import {
   usePayment,
   ProfileSection,
   PaymentProvider,
   PaymentSection,
} from '../../../sections/checkout'
import { useUser } from '../../../context'

const Checkout = () => {
   const { isAuthenticated } = useUser()

   React.useEffect(() => {
      if (!isAuthenticated) {
         navigate('/subscription/get-started/select-plan')
      }
   }, [isAuthenticated])

   return (
      <Layout noHeader>
         <SEO title="Checkout" />
         <StepsNavbar />
         <PaymentProvider>
            <PaymentContent isCheckout />
         </PaymentProvider>
      </Layout>
   )
}

const PaymentContent = ({ isCheckout }) => {
   const { user } = useUser()
   const { state } = usePayment()
   const { addToast } = useToasts()
   const authTabRef = React.useRef()
   const { brand, configOf } = useConfig()
   const [otpPageUrl, setOtpPageUrl] = React.useState('')
   const [isOverlayOpen, toggleOverlay] = React.useState(false)
   const [overlayMessage, setOverlayMessage] = React.useState('')

   const { loading, data: { cart = {} } = {} } = useSubscription(
      QUERIES.CART_SUBSCRIPTION,
      {
         skip: !isClient,
         variables: {
            id: isClient ? new URLSearchParams(location.search).get('id') : '',
         },
      }
   )

   React.useEffect(() => {
      ;(async () => {
         try {
            if (cart.paymentStatus === 'PENDING') {
               setOverlayMessage('We are processing your payment.')
            } else if (
               cart.paymentStatus === 'REQUIRES_ACTION' &&
               !cart.transactionRemark?.next_action?.type
            ) {
               toggleOverlay(true)
               setOverlayMessage(
                  'A window will open in short while for further payment authorization required by your bank!'
               )
            } else if (
               cart.paymentStatus === 'REQUIRES_ACTION' &&
               cart.transactionRemark?.next_action?.type
            ) {
               toggleOverlay(true)
               setOverlayMessage(
                  'A window will open in short while for further payment authorization required by your bank. In case the new window has not opened own yet, please click'
               )
               let TAB_URL = ''
               let remark = cart.transactionRemark
               if (remark?.next_action?.type === 'use_stripe_sdk') {
                  TAB_URL = remark?.next_action?.use_stripe_sdk?.stripe_js
               } else {
                  TAB_URL = remark?.next_action?.redirect_to_url?.url
               }
               setOtpPageUrl(TAB_URL)
               authTabRef.current = window.open(TAB_URL, 'payment_auth_page')
            } else if (
               cart.paymentStatus === 'REQUIRES_PAYMENT_METHOD' &&
               cart.transactionRemark?.last_payment_error?.code
            ) {
               toggleOverlay(false)
               setOverlayMessage('We are processing your payment.')
               addToast(cart.transactionRemark?.last_payment_error?.message, {
                  appearance: 'error',
               })
            } else if (cart.paymentStatus === 'SUCCEEDED') {
               if (authTabRef.current) {
                  authTabRef.current.close()
                  if (!authTabRef.current.closed) {
                     window.open(
                        `/subscription/get-started/checkout?id=${cart.id}`,
                        'payment_auth_page'
                     )
                  }
               }
               setOverlayMessage(
                  'Payment for your order has succeeded, you will redirected soon.'
               )
               addToast(
                  'Your order has been placed, you will be redirected soon',
                  {
                     appearance: 'success',
                  }
               )
               navigate(`/subscription/get-started/placing-order?id=${cart.id}`)
            } else if (cart.paymentStatus === 'PAYMENT_FAILED') {
               toggleOverlay(false)
               addToast('Your payment has failed, please try again.', {
                  appearance: 'error',
               })
            }
         } catch (error) {
            console.log('on succeeded -> error -> ', error)
         }
      })()
   }, [cart.paymentStatus])

   const [updateCustomerReferralRecord] = useMutation(
      QUERIES.MUTATIONS.CUSTOMER_REFERRAL.UPDATE,
      {
         refetchQueries: ['customer'],
         onError: error => {
            console.log(error)
            addToast('Referral code not applied!', { appearance: 'error' })
         },
      }
   )

   const [updateCart] = useMutation(QUERIES.UPDATE_CART, {
      onCompleted: () => {
         let referralCode = null
         if (
            Array.isArray(user?.customerReferrals) &&
            user?.customerReferrals.length > 0
         ) {
            const [referral] = user?.customerReferrals
            referralCode = referral?.referralCode
         }

         if (state.code.value && state.code.value !== referralCode) {
            updateCustomerReferralRecord({
               variables: {
                  brandId: brand.id,
                  keycloakId: user.keycloakId,
                  _set: {
                     referredByCode: state.code.value,
                  },
               },
            })
         }
      },
      onError: error => {
         addToast(error.message, { appearance: 'error' })
      },
   })

   const [updatePlatformCustomer] = useMutation(
      QUERIES.UPDATE_DAILYKEY_CUSTOMER,
      {
         refetchQueries: ['customer'],
         onCompleted: () => {
            updateCart({
               variables: {
                  id: cart.id,
                  _inc: { paymentRetryAttempt: 1 },
                  _set: {
                     amount: cart?.totalPrice,
                     paymentMethodId: state.payment.selected.id,
                     customerInfo: {
                        customerEmail: user?.platform_customer?.email,
                        customerPhone: state?.profile?.phoneNumber,
                        customerLastName: state?.profile?.lastName,
                        customerFirstName: state?.profile?.firstName,
                     },
                  },
               },
            })
         },
         onError: error => {
            console.log('updatePlatformCustomer -> error -> ', error)
            addToast('Failed to update the user profile!', {
               appearance: 'success',
            })
         },
      }
   )

   const handleSubmit = () => {
      toggleOverlay(true)
      updatePlatformCustomer({
         variables: {
            keycloakId: user.keycloakId,
            _set: { ...state.profile },
         },
      })
   }

   const isValid = () => {
      return (
         state.profile.firstName &&
         state.profile.lastName &&
         state.profile.phoneNumber &&
         state.payment.selected?.id &&
         state.code.isValid
      )
   }
   const onOverlayClose = () => {
      setOtpPageUrl('')
      setOverlayMessage('We are processing your payment.')
      toggleOverlay(false)
   }

   const theme = configOf('theme-color', 'Visual')

   if (loading) return <Loader inline />
   return (
      <Main>
         <Form>
            <header tw="my-3 pb-1 border-b flex items-center justify-between">
               <SectionTitle theme={theme}>Profile Details</SectionTitle>
            </header>
            <ProfileSection />
            <PaymentSection />
         </Form>
         {cart?.products?.length > 0 && (
            <CartDetails>
               <OrderInfo cart={cart} />
               <section>
                  <Button
                     bg={theme?.accent}
                     onClick={handleSubmit}
                     disabled={!Boolean(isValid())}
                  >
                     Confirm & Pay {formatCurrency(cart.totalPrice)}
                  </Button>
               </section>
            </CartDetails>
         )}
         {isOverlayOpen && (
            <Overlay>
               <header tw="flex pr-3 pt-3">
                  <button
                     onClick={onOverlayClose}
                     tw="ml-auto bg-white h-10 w-10 flex items-center justify-center rounded-full"
                  >
                     <Icon.CloseIcon tw="stroke-current text-gray-600" />
                  </button>
               </header>
               <main tw="flex-1 flex flex-col items-center justify-center">
                  <p tw="text-white text-xl font-light mb-3 text-center">
                     {overlayMessage}{' '}
                     {cart.paymentStatus === 'REQUIRES_ACTION' && otpPageUrl && (
                        <a
                           target="_blank"
                           href={otpPageUrl}
                           title={otpPageUrl}
                           tw="text-indigo-600"
                           rel="noreferer noopener"
                        >
                           here
                        </a>
                     )}
                  </p>
                  <Loader inline />
               </main>
            </Overlay>
         )}
      </Main>
   )
}

export default Checkout

const Overlay = styled.section`
   ${tw`fixed flex flex-col inset-0`};
   z-index: 1000;
   background: rgba(0, 0, 0, 0.3);
`

const SectionTitle = styled.h3(
   ({ theme }) => css`
      ${tw`text-green-600 text-lg`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const Main = styled.main`
   display: flex;
   padding: 0 16px;
   margin-bottom: 24px;
   min-height: calc(100vh - 160px);
   ${tw`gap-4`}
   @media (max-width: 768px) {
      flex-direction: column;
   }
`

const Form = styled.section`
   flex: 1;
`
const CartDetails = styled.section`
   width: 420px;
   @media (max-width: 768px) {
      width: 100%;
      > section {
         padding: 16px 16px 0 16px;
         position: fixed;
         bottom: 16px;
         left: 0;
         right: 0;
         > button {
         }
      }
   }
`

const Button = styled.button(
   ({ disabled, bg }) => css`
      ${tw`w-full h-10 rounded px-3 text-white bg-green-600`}
      ${bg && `background-color: ${bg};`}
      ${disabled && tw`cursor-not-allowed bg-gray-400`}
   `
)
