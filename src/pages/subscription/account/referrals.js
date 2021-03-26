import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useConfig } from '../../../lib'
import { useUser } from '../../../context'
import { SEO, Layout, ProfileSidebar, Form, Button } from '../../../components'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useToasts } from 'react-toast-notifications'

const Referrals = () => {
   const { isAuthenticated } = useUser()

   React.useEffect(() => {
      if (!isAuthenticated) {
         navigate('/subscription')
      }
   }, [isAuthenticated])

   return (
      <Layout>
         <SEO title="Referrals" />
         <Main>
            <ProfileSidebar />
            <Content />
         </Main>
      </Layout>
   )
}

export default Referrals

const Content = () => {
   const { addToast } = useToasts()
   const { user } = useUser()
   const { configOf } = useConfig()

   const theme = configOf('theme-color', 'Visual')
   const referralsAllowed = configOf('Referral', 'rewards')?.isAvailable

   return (
      <section tw="px-6 w-full md:w-5/12">
         <header tw="mt-6 mb-3 flex items-center justify-between">
            <Title theme={theme}>Referrals</Title>
         </header>
         {referralsAllowed && !!user?.customerReferrals?.length && (
            <>
               <Form.Label>Referral Code</Form.Label>
               <Flex>
                  {user?.customerReferrals[0]?.referralCode}
                  <CopyToClipboard
                     text={`${window.location.origin}/subscription?invite-code=${user?.customerReferrals[0]?.referralCode}`}
                     onCopy={() =>
                        addToast('Invite like copied!', {
                           appearance: 'success',
                        })
                     }
                  >
                     <Button size="sm"> Copy invite link </Button>
                  </CopyToClipboard>
               </Flex>
            </>
         )}
      </section>
   )
}

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

const Flex = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
`
