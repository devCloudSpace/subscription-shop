import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'
import { useQuery, useMutation } from '@apollo/react-hooks'

import { SEO, Layout, StepsNavbar, Loader } from '../../components'
import {
   Menu,
   CartPanel,
   WeekPicker,
   MenuProvider,
} from '../../sections/select-menu'
import { useUser } from '../../context'
import { formatDate } from '../../utils'
import {
   CUSTOMER_OCCURENCES,
   INSERT_SUBSCRIPTION_OCCURENCE_CUSTOMERS,
} from '../../graphql'
import { CheckIcon } from '../../assets/icons'

const SelectMenu = () => {
   const [keycloak] = useKeycloak()

   React.useEffect(() => {
      if (!keycloak?.tokenParsed?.sub) {
         navigate('/get-started/select-plan')
      }
   }, [keycloak])

   return (
      <MenuProvider>
         <Layout noHeader>
            <SEO title="Select Menu" />
            <StepsNavbar />
            <MenuContent />
         </Layout>
      </MenuProvider>
   )
}

export default SelectMenu

const MenuContent = () => {
   const { user } = useUser()
   const [selected, setSelected] = React.useState({})
   const [occurences, setOccurences] = React.useState([])
   const [skipCarts] = useMutation(INSERT_SUBSCRIPTION_OCCURENCE_CUSTOMERS)
   const { loading } = useQuery(CUSTOMER_OCCURENCES, {
      variables: {
         id: user.id,
         keycloakId: user.keycloakId,
      },
      onCompleted: ({ customer: { subscription } = {} }) => {
         if (subscription?.occurences.length > 0) {
            const filtered = subscription.occurences.filter(
               occurence => occurence.isValid && occurence.isVisible
            )
            setOccurences(filtered)
         } else {
            navigate('/get-started/select-delivery')
         }
      },
   })

   const dateSelection = id => {
      const dateIndex = occurences.findIndex(occurence => occurence.id === id)
      setSelected(occurences[dateIndex])
      const skipList = occurences.slice(0, dateIndex).map(occurence => ({
         isSkipped: true,
         keycloakId: user.keycloakId,
         subscriptionOccurenceId: occurence.id,
      }))

      skipCarts({
         variables: { objects: skipList },
      })
   }

   if (loading) return <Loader />
   if (Object.keys(selected).length === 0)
      return (
         <Main>
            <header css={tw`flex flex-col border-b`}>
               <h1 css={tw`pt-3 pb-2 mb-3 text-green-600 text-2xl`}>
                  Select first delivery date
               </h1>
               <span>
                  These are the available mondays for you, choose a monday for
                  first delivery.
               </span>
            </header>
            <DeliveryDates>
               {occurences.map(occurence => (
                  <DeliveryDate
                     key={occurence.id}
                     onClick={() => dateSelection(occurence.id)}
                  >
                     <DeliveryDateLeft
                        className={`${
                           occurence.id === selected?.id && 'active'
                        }`}
                     >
                        <CheckIcon
                           size={20}
                           tw="stroke-current text-gray-400"
                        />
                     </DeliveryDateLeft>
                     <label tw="w-full">
                        {formatDate(occurence.fulfillmentDate, {
                           year: 'numeric',
                           month: 'short',
                           day: 'numeric',
                        })}
                     </label>
                  </DeliveryDate>
               ))}
            </DeliveryDates>
         </Main>
      )
   return (
      <>
         <div>
            <WeekPicker isFixed selectedDate={selected} />
            <Header>
               <h1 css={tw`text-2xl md:text-4xl text-gray-700`}>
                  Explore our Menus
               </h1>
            </Header>
         </div>
         <Content>
            <Menu />
            <CartPanel noSkip isCheckout />
         </Content>
      </>
   )
}

const Main = styled.main`
   margin: auto;
   max-width: 980px;
   width: calc(100vw - 40px);
   min-height: calc(100vh - 128px);
`

const Header = styled.header`
   height: 320px;
   ${tw`bg-gray-100 flex items-center justify-center`}
`

const Content = styled.section`
   ${tw`px-4 grid gap-8`}
   grid-template-columns: 1fr 400px;
   @media (max-width: 768px) {
      grid-template-columns: 1fr;
   }
`

const DeliveryDates = styled.ul`
   ${tw`
      mt-3
      grid 
      gap-2
      sm:grid-cols-2 
      md:grid-cols-3 
   `}
`

const DeliveryDateLeft = styled.aside(
   () => css`
      width: 48px;
      height: 48px;
      ${tw`border-r border-gray-300 h-full mr-2 flex flex-shrink-0 items-center justify-center bg-gray-200`}
      &.active {
         svg {
            ${tw`text-green-700`}
         }
      }
   `
)

const DeliveryDate = styled.li`
   height: 48px;
   ${tw`cursor-pointer flex items-center border capitalize text-gray-700`}
   &.invalid {
      opacity: 0.6;
      position: relative;
      :after {
         top: 0;
         left: 0;
         content: '';
         width: 100%;
         height: 100%;
         position: absolute;
      }
   }
`
