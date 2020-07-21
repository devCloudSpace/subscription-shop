import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { useDelivery } from './state'
import { useUser } from '../../context'
import { ADDRESSES } from '../../graphql'
import { CheckIcon } from '../../assets/icons'
import { AddressTunnel } from './address_tunnel'
import { Loader, Button, HelperBar } from '../../components'

export const AddressSection = () => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const { state, dispatch } = useDelivery()
   const { loading, data: { addresses = [] } = {} } = useQuery(ADDRESSES, {
      variables: {
         where: {
            keycloakId: {
               _eq: user.keycloakId,
            },
         },
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })

   const addressSelection = id => {
      const address = addresses.find(address => address.id === id)
      dispatch({ type: 'SET_ADDRESS', payload: address })
   }

   const toggleTunnel = value => {
      dispatch({ type: 'TOGGLE_TUNNEL', payload: value })
   }

   if (loading)
      return (
         <div>
            <h2 css={tw`mt-6 mb-3 text-gray-600 text-xl`}>Select Address</h2>
            <Loader inline />
         </div>
      )
   return (
      <>
         <header css={tw`mt-6 mb-3 flex items-center justify-between`}>
            <h2 css={tw`text-gray-600 text-xl`}>Select Address</h2>
            {addresses.length > 0 && (
               <Button size="sm" onClick={() => toggleTunnel(true)}>
                  Add Address
               </Button>
            )}
         </header>
         {state.address.error && (
            <HelperBar type="error">
               <HelperBar.Subtitle>{state.address.error}</HelperBar.Subtitle>
               <HelperBar.Buttom
                  onClick={() => navigate('/get-started/select-plan')}
               >
                  Change Plan
               </HelperBar.Buttom>
            </HelperBar>
         )}
         {addresses.length > 0 ? (
            <AddressList>
               {addresses.map(address => (
                  <AddressCard
                     key={address.id}
                     onClick={() => addressSelection(address.id)}
                  >
                     <AddressCardLeft
                        className={`${
                           address.id === state.address.selected?.id && 'active'
                        }`}
                     >
                        <CheckIcon
                           size={20}
                           tw="stroke-current text-gray-400"
                        />
                     </AddressCardLeft>
                     <label>
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
               <HelperBar.Subtitle>
                  Let's start with adding an address
               </HelperBar.Subtitle>
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

const AddressCard = styled.li`
   ${tw`flex border text-gray-700 cursor-pointer`}
   label {
      ${tw`p-3`}
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
