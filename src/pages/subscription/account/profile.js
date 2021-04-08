import { useQuery } from '@apollo/react-hooks'
import { navigate } from 'gatsby'
import React from 'react'
import { useToasts } from 'react-toast-notifications'
import tw, { css, styled } from 'twin.macro'
import { Form, Layout, Loader, ProfileSidebar, SEO } from '../../../components'
import { useUser } from '../../../context'
import { SUBSCRIPTION_PLAN } from '../../../graphql'
import { useConfig } from '../../../lib'

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
   const { configOf } = useConfig()

   console.log(user)

   const [plan, setPlan] = React.useState(null)

   const { loading } = useQuery(SUBSCRIPTION_PLAN, {
      variables: {
         subscriptionId: user.subscriptionId,
         brandCustomerId: user.brandCustomerId,
      },
      onCompleted: data => {
         if (data?.subscription_subscription?.length) {
            const [fetchedPlan] = data.subscription_subscription
            console.log(
               '🚀 ~ file: profile.js ~ line 90 ~ CurrentPlan ~ fetchedPlan',
               fetchedPlan
            )
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

   const theme = configOf('theme-color', 'Visual')

   if (loading) return <Loader inline />
   return (
      <CurrentPlanWrapper>
         <CurrentPlanHeading theme={theme}>
            Your current plan
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
      </CurrentPlanWrapper>
   )
}

const CurrentPlanWrapper = styled.div`
   padding: 1.5rem;
`

const CurrentPlanHeading = styled.div(
   ({ theme }) => css`
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
`

const CurrentPlanStat = styled.div``

const CurrentPlanStatKey = styled.small`
   ${tw`block mb-1 text-gray-700 text-sm tracking-wide`}
`

const CurrentPlanStatValue = styled.p`
   font-weight: 500;
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
