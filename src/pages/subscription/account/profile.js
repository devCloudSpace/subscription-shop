import { useMutation, useQuery } from '@apollo/react-hooks'
import { navigate } from 'gatsby'
import React from 'react'
import { useToasts } from 'react-toast-notifications'
import tw, { css, styled } from 'twin.macro'
import {
   Button,
   Form,
   Layout,
   Loader,
   ProfileSidebar,
   SEO,
} from '../../../components'
import { useUser } from '../../../context'
import { BRAND, SUBSCRIPTION_PLAN } from '../../../graphql'
import { useConfig } from '../../../lib'
import { isClient } from '../../../utils'
import * as moment from 'moment'

const Profile = () => {
   const { isAuthenticated } = useUser()

   React.useEffect(() => {
      if (!isAuthenticated) {
         navigate('/subscription')
      }
   }, [isAuthenticated])

   return (
      <Layout>
         <SEO title="Profile" />
         <Main>
            <ProfileSidebar />
            <div>
               <ProfileForm />
               <CurrentPlan />
            </div>
         </Main>
      </Layout>
   )
}

export default Profile

const ProfileForm = () => {
   const { user } = useUser()
   const { configOf } = useConfig()

   const theme = configOf('theme-color', 'Visual')

   return (
      <section tw="px-6 w-full md:w-5/12">
         <header tw="mt-6 mb-3 flex items-center justify-between">
            <Title theme={theme}>Profile</Title>
         </header>
         <Form.Field tw="mr-3">
            <Form.Label>Email</Form.Label>
            <Form.DisabledText>
               {user?.platform_customer?.email}
            </Form.DisabledText>
         </Form.Field>
         <div tw="flex flex-wrap md:flex-nowrap">
            <Form.Field tw="mr-3">
               <Form.Label>First Name</Form.Label>
               <Form.Text
                  type="text"
                  name="firstName"
                  placeholder="Enter your first name"
                  defaultValue={user?.platform_customer?.firstName}
               />
            </Form.Field>
            <Form.Field>
               <Form.Label>Last Name</Form.Label>
               <Form.Text
                  type="text"
                  name="lastName"
                  placeholder="Enter your last name"
                  defaultValue={user?.platform_customer?.lastName}
               />
            </Form.Field>
         </div>
      </section>
   )
}

const CurrentPlan = () => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const { brand, configOf } = useConfig()

   const theme = configOf('theme-color', 'Visual')

   const [plan, setPlan] = React.useState(null)
   const [isCancelFormVisible, setIsCancelFormVisible] = React.useState(false)
   const [reason, setReason] = React.useState('')
   const [isPauseFormVisible, setIsPauseFormVisible] = React.useState(false)
   const [startDate, setStartDate] = React.useState('')
   const [endDate, setEndDate] = React.useState('')
   const [isPlanPaused, setIsPlanPaused] = React.useState(false)

   React.useEffect(() => {
      if (user?.pausePeriod && Object.keys(user.pausePeriod).length) {
         const today = Date.now()
         const start = Date(user.pausePeriod.startDate)
         const end = Date(user.pausePeriod.endDate)
         if (today >= start && today <= end) {
            setIsPlanPaused(true)
         }
      }
   }, [user?.pausePeriod])

   const { loading } = useQuery(SUBSCRIPTION_PLAN, {
      skip: !(user.subscriptionId && user.brandCustomerId),
      variables: {
         subscriptionId: user.subscriptionId,
         brandCustomerId: user.brandCustomerId,
      },
      onCompleted: data => {
         if (data?.subscription_subscription?.length) {
            const [fetchedPlan] = data.subscription_subscription
            setPlan({
               name:
                  fetchedPlan.subscriptionItemCount.subscriptionServing
                     .subscriptionTitle.title,
               itemCount: fetchedPlan.subscriptionItemCount.count,
               servings:
                  fetchedPlan.subscriptionItemCount.subscriptionServing
                     .servingSize,
            })
         }
      },
      onError: error => {
         console.log(error)
         addToast('Failed to fetch current plan!', { appearance: 'error' })
      },
   })

   const [updateBrandCustomer] = useMutation(BRAND.CUSTOMER.UPDATE, {
      refetchQueries: ['customer'],
      onCompleted: () => {
         addToast('Successfully updated subscription status.', {
            appearance: 'success',
         })
         setIsCancelFormVisible(false)
         setIsPauseFormVisible(false)
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })

   const handleCancellation = e => {
      e.preventDefault()
      updateBrandCustomer({
         variables: {
            where: {
               keycloakId: { _eq: user?.keycloakId },
               brandId: { _eq: brand.id },
            },
            _set: {
               isSubscriptionCancelled: true,
               ...(reason && { subscriptionCancellationReason: reason }),
            },
         },
      })
   }

   const handleReactivation = () => {
      const isConfirmed =
         isClient &&
         window.confirm('Are you sure you want to reactivate subscription?')
      if (isConfirmed) {
         updateBrandCustomer({
            variables: {
               where: {
                  keycloakId: { _eq: user?.keycloakId },
                  brandId: { _eq: brand.id },
               },
               _set: {
                  isSubscriptionCancelled: false,
                  subscriptionCancellationReason: '',
               },
            },
         })
      }
   }

   const handlePausePlan = e => {
      e.preventDefault()
      console.log({ startDate, endDate })
      if (startDate && endDate) {
         const start = new Date(startDate)
         const end = new Date(endDate)
         if (start >= Date.now() && end > Date.now() && end > start) {
            updateBrandCustomer({
               variables: {
                  where: {
                     keycloakId: { _eq: user?.keycloakId },
                     brandId: { _eq: brand.id },
                  },
                  _set: {
                     pausePeriod: {
                        startDate,
                        endDate,
                     },
                  },
               },
            })
         } else {
            addToast('Invalid date selection!', { appearance: 'error' })
         }
      }
   }

   const clearPausePeriod = () => {
      updateBrandCustomer({
         variables: {
            where: {
               keycloakId: { _eq: user?.keycloakId },
               brandId: { _eq: brand.id },
            },
            _set: {
               pausePeriod: {},
            },
         },
      })
   }

   if (loading) return <Loader inline />
   if (user?.isSubscriptionCancelled)
      return (
         <CurrentPlanWrapper>
            <Button size="sm" onClick={handleReactivation}>
               Reactivate Subscription
            </Button>
         </CurrentPlanWrapper>
      )
   return (
      <CurrentPlanWrapper>
         <CurrentPlanHeading theme={theme}>
            Your current plan {isPlanPaused && `(PAUSED)`}
         </CurrentPlanHeading>
         <CurrentPlanCard>
            <CurrentPlanStat>
               <CurrentPlanStatKey>Name</CurrentPlanStatKey>
               <CurrentPlanStatValue>{plan?.name}</CurrentPlanStatValue>
            </CurrentPlanStat>
            <CurrentPlanStat>
               <CurrentPlanStatKey>Item Count</CurrentPlanStatKey>
               <CurrentPlanStatValue>{plan?.itemCount}</CurrentPlanStatValue>
            </CurrentPlanStat>
            <CurrentPlanStat>
               <CurrentPlanStatKey>Servings</CurrentPlanStatKey>
               <CurrentPlanStatValue>{plan?.servings}</CurrentPlanStatValue>
            </CurrentPlanStat>
         </CurrentPlanCard>
         <Button
            size="sm"
            theme={theme}
            onClick={() => navigate(`/subscription/change-plan`)}
         >
            Change Plan
         </Button>
         <div tw="h-8" />
         {isPauseFormVisible ? (
            <PauseForm onSubmit={handlePausePlan}>
               <Flex>
                  <Form.Field>
                     <Form.Label>Start Date*</Form.Label>
                     <Form.Text
                        type="date"
                        name="start-date"
                        onChange={e => setStartDate(e.target.value)}
                        value={startDate}
                        required
                     />
                  </Form.Field>
                  <span tw="w-4 inline-block" />
                  <Form.Field>
                     <Form.Label>End Date*</Form.Label>
                     <Form.Text
                        type="date"
                        name="end-date"
                        onChange={e => setEndDate(e.target.value)}
                        value={endDate}
                        required
                     />
                  </Form.Field>
               </Flex>
               <Button size="sm" type="submit">
                  Yes! Pause my plan.
               </Button>
               <span tw="w-2 inline-block" />
               <Button
                  size="sm"
                  type="reset"
                  onClick={() => setIsPauseFormVisible(false)}
               >
                  No! I changed my mind.
               </Button>
            </PauseForm>
         ) : (
            <>
               {!!user?.pausePeriod && Object.keys(user.pausePeriod).length ? (
                  <div>
                     <p tw="mb-2 text-gray-500">
                        Plan pause interval starts from{' '}
                        <span tw="text-gray-800">
                           {moment(user.pausePeriod.startDate).format(
                              'MMM Do YYYY'
                           )}
                        </span>{' '}
                        and ends on{' '}
                        <span tw="text-gray-800">
                           {moment(user.pausePeriod.endDate).format(
                              'MMM Do YYYY'
                           )}
                        </span>
                        .{' '}
                     </p>
                     <Button size="sm" theme={theme} onClick={clearPausePeriod}>
                        Clear Pause Interval
                     </Button>
                  </div>
               ) : (
                  <Button
                     size="sm"
                     theme={theme}
                     onClick={() => setIsPauseFormVisible(true)}
                  >
                     Pause Plan
                  </Button>
               )}
            </>
         )}
         <div tw="h-3" />
         {isCancelFormVisible ? (
            <CancellationForm onSubmit={handleCancellation}>
               <Form.Field>
                  <Form.Label>Reason(Optional)</Form.Label>
                  <Form.Text
                     type="text"
                     name="reason"
                     placeholder="Enter your reason"
                     onChange={e => setReason(e.target.value)}
                     value={reason}
                  />
               </Form.Field>
               <Button size="sm" type="submit">
                  Yes! Cancel my subscription.
               </Button>
               <span tw="w-2 inline-block" />
               <Button
                  size="sm"
                  type="reset"
                  onClick={() => setIsCancelFormVisible(false)}
               >
                  No! I changed my mind.
               </Button>
            </CancellationForm>
         ) : (
            <Button
               size="sm"
               theme={theme}
               onClick={() => setIsCancelFormVisible(true)}
            >
               Cancel Subscription
            </Button>
         )}
      </CurrentPlanWrapper>
   )
}

const CurrentPlanWrapper = styled.div`
   padding: 1.5rem;
`

const CurrentPlanHeading = styled.div(
   ({ theme }) => css`
      margin-bottom: 4px;
      ${tw`text-green-600`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const CurrentPlanCard = styled.div`
   padding: 1rem;
   border: 1px solid #cacaca;
   border-radius: 4px;
   display: flex;
   max-width: 420px;
   justify-content: space-between;
   margin-bottom: 24px;
`

const CurrentPlanStat = styled.div``

const CurrentPlanStatKey = styled.small`
   ${tw`block mb-1 text-gray-700 text-sm tracking-wide`}
`

const CurrentPlanStatValue = styled.p`
   font-weight: 500;
`

const CancellationForm = styled.form`
   border: 1px solid #cacaca;
   padding: 1rem;
   border-radius: 4px;
   max-width: 680px;
`

const PauseForm = styled.form`
   border: 1px solid #cacaca;
   padding: 1rem;
   border-radius: 4px;
   max-width: 680px;
`

const Flex = styled.div`
   display: flex;
`

const Title = styled.h2(
   ({ theme }) => css`
      ${tw`text-green-600 text-2xl`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const Main = styled.main`
   display: grid;
   grid-template-rows: 1fr;
   min-height: calc(100vh - 64px);
   grid-template-columns: 240px 1fr;
   position: relative;
   @media (max-width: 768px) {
      display: block;
   }
`
