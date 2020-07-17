import React from 'react'
import { rrulestr } from 'rrule'
import { navigate } from 'gatsby'
import tw, { styled } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'
import { useToasts } from 'react-toast-notifications'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'

import {
   useQuery,
   useLazyQuery,
   useSubscription,
   useMutation,
} from '@apollo/react-hooks'

import { isClient, useScript } from '../../utils'
import {
   ADDRESSES,
   ITEM_COUNT,
   UPDATE_CUSTOMERS,
   CREATE_CUSTOMER_ADDRESS,
   UPDATE_DAILYKEY_CUSTOMER,
   PLANS_AVAILABILITY_BY_ZIPCODE,
} from '../../graphql'
import {
   SEO,
   Form,
   Layout,
   Button,
   Tunnel,
   Spacer,
   Loader,
   StepsNavbar,
} from '../../components'
import { CloseIcon } from '../../assets/icons'

const SelectDelivery = () => {
   const [keycloak] = useKeycloak()
   const { addToast } = useToasts()
   const [addressError, setAddressError] = React.useState('')
   const [selectedDay, setSelectedDay] = React.useState(null)
   const [selectedAddress, setSelectedAddress] = React.useState(null)
   const [updateDailykeyCustomer] = useMutation(UPDATE_DAILYKEY_CUSTOMER, {})
   const [updateCustomers] = useMutation(UPDATE_CUSTOMERS, {
      onCompleted: () => {
         addToast('Successfully saved delivery preferences.', {
            appearance: 'success',
         })
         updateDailykeyCustomer({
            variables: {
               keycloakId: keycloak?.tokenParsed?.sub,
               _set: {
                  defaultSubscriptionAddressId: selectedAddress,
               },
            },
         })
         navigate('/get-started/select-menu')
         isClient && window.localStorage.removeItem('plan')
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })

   React.useEffect(() => {
      if (!keycloak?.tokenParsed?.sub) {
         navigate('/get-started/select-plan')
      }
   }, [keycloak])

   const nextStep = () => {
      updateCustomers({
         variables: {
            where: {
               keycloakId: {
                  _eq: keycloak.tokenParsed.sub,
               },
            },
            _set: {
               subscriptionId: selectedDay,
               subscriptionAddressId: selectedAddress,
            },
         },
      })
   }

   const isValid = () => {
      if (!selectedDay) return false
      if (!selectedAddress) return false
      if (addressError) return false
      return true
   }

   return (
      <Layout noHeader>
         <SEO title="Delivery" />
         <StepsNavbar />
         <Main>
            <div>
               <header css={tw`flex items-center justify-between border-b`}>
                  <h1 css={tw`pt-3 pb-2 mb-3 text-green-600 text-3xl`}>
                     Delivery
                  </h1>
                  {isValid() && (
                     <Button onClick={() => nextStep()}>Next</Button>
                  )}
               </header>
               <SelectDeliveryDay setDay={setSelectedDay} />
               <SelectAddresses
                  addressError={addressError}
                  setAddress={setSelectedAddress}
                  setAddressError={setAddressError}
               />
            </div>
         </Main>
      </Layout>
   )
}

export default SelectDelivery

const SelectDeliveryDay = ({ setDay }) => {
   const { addToast } = useToasts()
   const { loading, data: { itemCount = {} } = {} } = useSubscription(
      ITEM_COUNT,
      {
         variables: {
            id: isClient && window.localStorage.getItem('plan'),
         },
         onError: error => {
            addToast(error.message, {
               appearance: 'error',
            })
         },
      }
   )

   if (loading)
      return (
         <div>
            <h2 css={tw`mb-3 text-gray-600 text-xl`}>Select Delivery Day</h2>
            <Loader inline />
         </div>
      )
   return (
      <>
         <h2 css={tw`my-3 text-gray-600 text-xl`}>Select Delivery Day</h2>
         <DeliveryDays
            onChange={e => setDay(Number(e.target.getAttribute('data-id')))}
         >
            {itemCount?.days?.length > 0 ? (
               itemCount.days.map((day, index) => (
                  <DeliveryDay key={day.id}>
                     <span>
                        <input
                           type="radio"
                           data-id={day.id}
                           name="delivery-day"
                           id={`day-${index + 1}`}
                           css={tw`w-full h-full cursor-pointer`}
                        />
                     </span>
                     <label
                        htmlFor={`day-${index + 1}`}
                        css={tw`w-full cursor-pointer`}
                     >
                        {rrulestr(day.rrule).toText()}
                     </label>
                  </DeliveryDay>
               ))
            ) : (
               <div>No delivery dates available</div>
            )}
         </DeliveryDays>
      </>
   )
}

const SelectAddresses = ({ setAddress, addressError, setAddressError }) => {
   const { addToast } = useToasts()
   const [keycloak] = useKeycloak()
   const [isOpen, toggleTunnel] = React.useState(false)

   const [checkAvailability] = useLazyQuery(PLANS_AVAILABILITY_BY_ZIPCODE, {
      onCompleted: ({ plans }) => {
         if (plans.length === 0) {
            return setAddressError(
               'No plans available for your address, select a different address or a different plan!'
            )
         }
         return setAddressError('')
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })
   const { loading, data: { addresses = [] } = {} } = useQuery(ADDRESSES, {
      variables: {
         where: {
            keycloakId: {
               _eq: keycloak?.tokenParsed?.sub,
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
      setAddress(id)
      const { zipcode = '' } = addresses.find(address => address.id === id)
      checkAvailability({ variables: { zipcode } })
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
         {addressError && (
            <AddressError>
               <span>{addressError}</span>
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
         {isOpen && (
            <AddressTunnel isOpen={isOpen} toggleTunnel={toggleTunnel} />
         )}
      </>
   )
}

const AddressTunnel = ({ isOpen, toggleTunnel }) => {
   const [keycloak] = useKeycloak()
   const { addToast } = useToasts()
   const [formStatus, setFormStatus] = React.useState('PENDING')
   const [address, setAddress] = React.useState(null)
   const [createAddress] = useMutation(CREATE_CUSTOMER_ADDRESS, {
      refetchQueries: ['addresses'],
      onCompleted: () => {
         toggleTunnel(false)
         setFormStatus('SAVED')
         addToast('Address has been saved.', {
            appearance: 'success',
         })
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })
   const [loaded, error] = useScript(
      `https://maps.googleapis.com/maps/api/js?key=${process.env.GATSBY_GOOGLE_API_KEY}&libraries=places`
   )

   const formatAddress = async address => {
      if (!isClient) return 'Runs only on client side.'

      const response = await fetch(
         `https://maps.googleapis.com/maps/api/geocode/json?key=${
            process.env.GATSBY_GOOGLE_API_KEY
         }&address=${encodeURIComponent(address.description)}`
      )
      const data = await response.json()
      if (data.status === 'OK' && data.results.length > 0) {
         const [result] = data.results

         const address = {
            line2: '',
            lat: result.geometry.location.lat.toString(),
            lng: result.geometry.location.lng.toString(),
         }

         result.address_components.forEach(node => {
            if (node.types.includes('street_number')) {
               address.line1 = `${node.long_name} `
            }
            if (node.types.includes('route')) {
               address.line1 += node.long_name
            }
            if (node.types.includes('locality')) {
               address.city = node.long_name
            }
            if (node.types.includes('administrative_area_level_1')) {
               address.state = node.long_name
            }
            if (node.types.includes('country')) {
               address.country = node.long_name
            }
            if (node.types.includes('postal_code')) {
               address.zipcode = node.long_name
            }
         })
         setAddress(address)
         setFormStatus('IN_PROGRESS')
      }
   }

   const handleSubmit = () => {
      setFormStatus('SAVING')
      createAddress({
         variables: {
            object: { ...address, keycloakId: keycloak.tokenParsed.sub },
         },
      })
   }

   return (
      <Tunnel isOpen={isOpen} toggleTunnel={toggleTunnel} size="sm">
         <Tunnel.Header title="Add Address">
            <Button size="sm" onClick={() => toggleTunnel(false)}>
               <CloseIcon size={20} tw="stroke-current" />
            </Button>
         </Tunnel.Header>
         <Tunnel.Body>
            <AddressSearch>
               <Form.Label>Search Address</Form.Label>
               {loaded && !error && (
                  <GooglePlacesAutocomplete
                     onSelect={data => formatAddress(data)}
                  />
               )}
            </AddressSearch>
            {address && (
               <>
                  <Form.Field>
                     <Form.Label>Line 1</Form.Label>
                     <FormPlaceholder>{address.line1}</FormPlaceholder>
                  </Form.Field>
                  <Form.Field>
                     <Form.Label>Line 2</Form.Label>
                     <Form.Text
                        type="text"
                        placeholder="Enter line 2"
                        value={address.line2 || ''}
                        onChange={e =>
                           setAddress({ ...address, line2: e.target.value })
                        }
                     />
                  </Form.Field>
                  <div css={tw`flex`}>
                     <Form.Field mr="16px">
                        <Form.Label>City</Form.Label>
                        <FormPlaceholder>{address.city}</FormPlaceholder>
                     </Form.Field>
                     <Form.Field>
                        <Form.Label>State</Form.Label>
                        <FormPlaceholder>{address.state}</FormPlaceholder>
                     </Form.Field>
                  </div>
                  <div css={tw`flex`}>
                     <Form.Field mr="16px">
                        <Form.Label>Country</Form.Label>
                        <FormPlaceholder>{address.country}</FormPlaceholder>
                     </Form.Field>
                     <Form.Field>
                        <Form.Label>Zipcode</Form.Label>
                        <FormPlaceholder>{address.zipcode}</FormPlaceholder>
                     </Form.Field>
                  </div>
                  <Form.Field>
                     <Form.Label>Label</Form.Label>
                     <Form.Text
                        type="text"
                        value={address.label || ''}
                        placeholder="Enter label for this address"
                        onChange={e =>
                           setAddress({ ...address, label: e.target.value })
                        }
                     />
                  </Form.Field>
                  <Form.Field>
                     <Form.Label>Dropoff Instructions</Form.Label>
                     <Form.TextArea
                        type="text"
                        value={address.notes || ''}
                        placeholder="Enter dropoff instructions"
                        onChange={e =>
                           setAddress({ ...address, notes: e.target.value })
                        }
                     />
                  </Form.Field>
                  <Button
                     size="sm"
                     onClick={() => handleSubmit()}
                     disabled={formStatus === 'SAVING'}
                  >
                     {formStatus === 'SAVING' ? 'Saving...' : 'Save Address'}
                  </Button>
                  <Spacer />
               </>
            )}
         </Tunnel.Body>
      </Tunnel>
   )
}

const Main = styled.main`
   overflow-y: auto;
   height: calc(100vh - 64px);
   > div {
      margin: auto;
      max-width: 980px;
      width: calc(100vw - 40px);
   }
`

const DeliveryDays = styled.ul`
   ${tw`
      grid 
      gap-2
      sm:grid-cols-2 
      md:grid-cols-3 
   `}
`

const DeliveryDay = styled.li`
   height: 48px;
   ${tw`flex items-center border capitalize text-gray-700`}
   span {
      width: 48px;
      height: 48px;
      ${tw`border-r border-gray-300 h-full mr-2 flex flex-shrink-0 items-center justify-center bg-gray-200`}
   }
`

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

const FormPlaceholder = styled.span`
   ${tw`py-2 px-3 border bg-gray-100`}
`

const AddressSearch = styled.section`
   margin-bottom: 16px;
   .google-places-autocomplete {
      width: 100%;
      position: relative;
   }
   .google-places-autocomplete__input {
      ${tw`border-b h-8 w-full focus:outline-none focus:border-gray-700`}
   }
   .google-places-autocomplete__input:active,
   .google-places-autocomplete__input:focus,
   .google-places-autocomplete__input:hover {
      outline: 0;
      border: none;
   }
   .google-places-autocomplete__suggestions-container {
      background: #fff;
      border-radius: 0 0 5px 5px;
      color: #000;
      position: absolute;
      width: 100%;
      z-index: 2;
      box-shadow: 0 1px 16px 0 rgba(0, 0, 0, 0.09);
   }
   .google-places-autocomplete__suggestion {
      font-size: 1rem;
      text-align: left;
      padding: 10px;
      cursor: pointer;
   }
   .google-places-autocomplete__suggestion:hover {
      background: rgba(0, 0, 0, 0.1);
   }
   .google-places-autocomplete__suggestion--active {
      background: #e0e3e7;
   }
`
