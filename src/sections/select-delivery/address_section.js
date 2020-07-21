import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled } from 'twin.macro'
import { useQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { Loader, Button } from '../../components'
import { ADDRESSES } from '../../graphql'

import { useDelivery } from './state'
import { useUser } from '../../context'
import { AddressTunnel } from './address_tunnel'

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
            <AddressError>
               <span>{state.address.error}</span>
               <button onClick={() => navigate('/get-started/select-plan')}>
                  Change Plan
               </button>
            </AddressError>
         )}
         {addresses.length > 0 ? (
            <AddressList
               onChange={e =>
                  addressSelection(e.target.getAttribute('data-id'))
               }
            >
               {addresses.map(address => (
                  <AddressCard key={address.id}>
                     <aside htmlFor="address">
                        <input
                           type="radio"
                           name="address"
                           data-id={address.id}
                           css={tw`w-full cursor-pointer`}
                           id={`address-${address.id.slice(0, 8)}`}
                        />
                     </aside>
                     <label htmlFor="address">
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
            <NoAddressInfo>
               <span>Let's start with adding an address</span>
               <button onClick={() => toggleTunnel(true)}>Add Address</button>
            </NoAddressInfo>
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
   ${tw`flex border text-gray-700`}
   aside {
      width: 48px;
      ${tw`border-r border-gray-300 flex justify-center h-full bg-gray-200 border-r`}
   }
   label {
      ${tw`p-3`}
   }
   span {
      ${tw`block`}
   }
`

const AddressError = styled.div`
   height: 48px;
   ${tw`w-full flex justify-between items-center px-3 rounded bg-orange-200 text-orange-800 mb-3`}
   button {
      ${tw`border border-orange-800 py-1 px-2 rounded text-sm hover:bg-orange-300`}
   }
`

const NoAddressInfo = styled.div`
   height: 48px;
   ${tw`w-full flex justify-between items-center px-3 rounded bg-indigo-200 text-indigo-800 mb-3`}
   button {
      ${tw`border border-indigo-800 py-1 px-2 rounded text-sm hover:bg-indigo-300`}
   }
`
