import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useConfig } from '../../../lib'
import { useUser } from '../../../context'
import { SEO, Layout, ProfileSidebar, Form } from '../../../components'
import { formatCurrency } from '../../../utils'

const Wallet = () => {
   const { isAuthenticated } = useUser()

   React.useEffect(() => {
      if (!isAuthenticated) {
         navigate('/subscription')
      }
   }, [isAuthenticated])

   return (
      <Layout>
         <SEO title="Wallet" />
         <Main>
            <ProfileSidebar />
            <Content />
         </Main>
      </Layout>
   )
}

export default Wallet

const Content = () => {
   const { user } = useUser()
   const { configOf } = useConfig()

   const theme = configOf('theme-color', 'Visual')
   const walletAllowed = configOf('Wallet', 'rewards')?.isAvailable

   return (
      <section tw="px-6 w-full md:w-5/12">
         <header tw="mt-6 mb-3 flex items-center justify-between">
            <Title theme={theme}>Wallet</Title>
         </header>
         {walletAllowed && !!user?.wallets?.length && (
            <>
               <Form.Label>Balance</Form.Label>
               {formatCurrency(user?.wallets[0]?.amount)}
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
