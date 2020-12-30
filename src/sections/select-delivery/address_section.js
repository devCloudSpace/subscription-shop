import React from 'react'
import { isEmpty } from 'lodash'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'

import { useDelivery } from './state'
import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { CheckIcon } from '../../assets/icons'
import { AddressTunnel } from './address_tunnel'
import { Button, HelperBar } from '../../components'

export const AddressSection = () => {
   const { user } = useUser()
   const { configOf } = useConfig()
   const { state, dispatch } = useDelivery()

   React.useEffect(() => {
      if (
         Array.isArray(user?.platform_customer?.addresses) &&
         !isEmpty(user?.platform_customer?.addresses)
      ) {
         const [address] = user?.platform_customer?.addresses
         addressSelection(address)
      }
   }, [dispatch, user])

   const addressSelection = address => {
      dispatch({ type: 'SET_ADDRESS', payload: address })
   }

   const toggleTunnel = value => {
      dispatch({ type: 'TOGGLE_TUNNEL', payload: value })
   }
   const hasColor = configOf('theme-color', 'Visual')

   return (
      <>
         <header css={tw`mt-6 mb-3 flex items-center justify-between`}>
            <SectionTitle hasColor={hasColor}>Select Address</SectionTitle>
            {user?.platform_customer?.addresses.length > 0 && (
               <Button size="sm" onClick={() => toggleTunnel(true)}>
                  Add Address
               </Button>
            )}
         </header>
         {state.address.error && (
            <HelperBar type="error">
               <HelperBar.SubTitle>{state.address.error}</HelperBar.SubTitle>
               <HelperBar.Buttom
                  onClick={() =>
                     navigate('/subscription/get-started/select-plan')
                  }
               >
                  Change Plan
               </HelperBar.Buttom>
            </HelperBar>
         )}
         {user?.platform_customer?.addresses.length > 0 ? (
            <AddressList>
               {user?.platform_customer?.addresses.map(address => (
                  <AddressCard
                     key={address.id}
                     onClick={() => addressSelection(address)}
                  >
                     <AddressCardLeft
                        className={`${
                           state.address.selected?.id === address.id && 'active'
                        }`}
                     >
                        <CheckIcon
                           size={20}
                           tw="stroke-current text-gray-400"
                        />
                     </AddressCardLeft>
                     <label onClick={() => addressSelection(address)}>
                        <span>{address.line1}</span>
                        <span>{address.line2}</span>
                        <span>{address.city}</span>
                        <span>{address.state}</span>
                        <span>{address.country}</span>
                        <span>{address.zipcode}</span>
                     </label>
                  </AddressCard>
               ))}
            </AddressList>
         ) : (
            <HelperBar type="info">
               <HelperBar.SubTitle>
                  Let's start with adding an address
               </HelperBar.SubTitle>
               <HelperBar.Button onClick={() => toggleTunnel(true)}>
                  Add Address
               </HelperBar.Button>
            </HelperBar>
         )}
         {state.address.tunnel && <AddressTunnel />}
      </>
   )
}

const AddressList = styled.ul`
   ${tw`
      grid 
      gap-2
      sm:grid-cols-1
      md:grid-cols-2
   `}
   grid-auto-rows: minmax(130px, auto);
`

const SectionTitle = styled.h3(
   ({ hasColor }) => css`
      ${tw`text-green-600 text-xl`}
      ${hasColor?.accent && `color: ${hasColor.accent}`}
   `
)

const AddressCard = styled.li`
   ${tw`flex border text-gray-700 cursor-pointer`}
   label {
      ${tw`p-3 cursor-pointer`}
   }
   span {
      ${tw`block`}
   }
`

const AddressCardLeft = styled.aside(
   () => css`
      width: 48px;
      ${tw`border-r border-gray-300 flex items-center justify-center h-full bg-gray-200 border-r`}
      &.active {
         svg {
            ${tw`text-green-700`}
         }
      }
   `
)
