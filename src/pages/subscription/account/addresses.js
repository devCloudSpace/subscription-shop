import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'
import { useToasts } from 'react-toast-notifications'
import { useMutation, useLazyQuery } from '@apollo/react-hooks'

import { useUser } from '../../../context'
import { CloseIcon } from '../../../assets/icons'
import { useScript, isClient } from '../../../utils'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import {
   CREATE_CUSTOMER_ADDRESS,
   UPDATE_CUSTOMER,
   ZIPCODE_AVAILABILITY,
} from '../../../graphql'
import {
   SEO,
   Form,
   Layout,
   Button,
   Spacer,
   Tunnel,
   HelperBar,
   ProfileSidebar,
} from '../../../components'

const Addresses = () => {
   const [keycloak] = useKeycloak()

   React.useEffect(() => {
      if (!keycloak?.tokenParsed?.sub) {
         navigate('/subscription')
      }
   }, [keycloak])

   return (
      <Layout>
         <SEO title="Addresses" />
         <Main>
            <ProfileSidebar />
            <Content />
         </Main>
      </Layout>
   )
}

export default Addresses

const Content = () => {
   const { user } = useUser()
   const [keycloak] = useKeycloak()
   const { addToast } = useToasts()
   const [selected, setSelected] = React.useState(null)
   const [tunnel, toggleTunnel] = React.useState(false)
   const [updateCustomer] = useMutation(UPDATE_CUSTOMER, {
      refetchQueries: ['customer'],
      onCompleted: () => {
         setSelected(null)
         addToast('Successfully changed default address.', {
            appearance: 'success',
         })
      },
   })

   const [validate] = useLazyQuery(ZIPCODE_AVAILABILITY, {
      onCompleted: ({ subscription_zipcode }) => {
         if (subscription_zipcode.length === 0) {
            addToast('Sorry, this address is not deliverable on your plan.', {
               appearance: 'warning',
            })
         } else {
            updateCustomer({
               variables: {
                  keycloakId: keycloak?.tokenParsed?.sub,
                  _set: {
                     subscriptionAddressId: selected,
                  },
               },
            })
         }
      },
   })

   const makeDefault = address => {
      setSelected(address.id)
      validate({
         variables: {
            subscriptionId: {
               _eq: user?.subscriptionId,
            },
            zipcode: {
               _eq: address.zipcode,
            },
         },
      })
   }

   return (
      <div tw="px-3">
         <header tw="mt-6 mb-3 flex items-center justify-between">
            <h2 tw="text-gray-600 text-xl">Addresses</h2>
            {user?.platform_customer?.addresses.length > 0 && (
               <Button size="sm" onClick={() => toggleTunnel(true)}>
                  Add Address
               </Button>
            )}
         </header>
         {user?.platform_customer?.addresses.length > 0 ? (
            <AddressList>
               {user?.platform_customer?.addresses.map(address => (
                  <li
                     key={address.id}
                     tw="p-2 flex flex-col items-start border text-gray-700"
                  >
                     {address.id === user?.subscriptionAddressId ? (
                        <span tw="mb-2 rounded border bg-teal-200 border-teal-300 px-2 text-teal-700">
                           Default
                        </span>
                     ) : (
                        <span
                           tw="mb-2 rounded border border-orange-300 px-2 text-teal-700 cursor-pointer hover:(bg-orange-300 text-orange-900)"
                           onClick={() => makeDefault(address)}
                        >
                           Make Default
                        </span>
                     )}
                     <span>{address?.line1}</span>
                     <span>{address?.line2}</span>
                     <span>{address?.city}</span>
                     <span>{address?.state}</span>
                     <span>{address?.country}</span>
                     <span>{address?.zipcode}</span>
                  </li>
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
         {tunnel && (
            <AddressTunnel tunnel={tunnel} toggleTunnel={toggleTunnel} />
         )}
      </div>
   )
}

export const AddressTunnel = ({ tunnel, toggleTunnel }) => {
   const [keycloak] = useKeycloak()
   const { addToast } = useToasts()
   const [formStatus, setFormStatus] = React.useState('PENDING')
   const [address, setAddress] = React.useState(null)
   const [createAddress] = useMutation(CREATE_CUSTOMER_ADDRESS, {
      refetchQueries: () => ['customer'],
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
            object: { ...address, keycloakId: keycloak?.tokenParsed?.sub },
         },
      })
   }

   return (
      <Tunnel
         size="sm"
         isOpen={tunnel}
         toggleTunnel={() => toggleTunnel(false)}
      >
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
   display: grid;
   grid-template-rows: 1fr;
   height: calc(100vh - 64px);
   grid-template-columns: 240px 1fr;
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

const FormPlaceholder = styled.span`
   ${tw`py-2 px-3 border bg-gray-100`}
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