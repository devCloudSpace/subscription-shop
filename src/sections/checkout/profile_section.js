import React from 'react'
import tw, { styled, css } from 'twin.macro'
import { useMutation } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { Form } from '../../components'
import { useUser } from '../../context'
import { UPDATE_DAILYKEY_CUSTOMER } from '../../graphql'

export const ProfileSection = () => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const [updateCustomer] = useMutation(UPDATE_DAILYKEY_CUSTOMER, {
      refetchQueries: ['platform_customer'],
      onCompleted: () => {
         addToast('Saved profile changes.', { appearance: 'success' })
      },
      onError: error => {
         addToast(error.message, { appearance: 'success' })
      },
   })

   const handleProfileSubmit = e => {
      e.preventDefault()
      const raw = new FormData(e.target)
      const parsed = Object.fromEntries(raw)

      const phoneRegex = new RegExp(
         /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/
      )
      if (!phoneRegex.test(parsed.phoneNumber)) {
         return addToast('Invalid phone number', { appearance: 'error' })
      }

      updateCustomer({
         variables: {
            keycloakId: user.keycloakId,
            _set: {
               ...parsed,
            },
         },
      })
   }
   return (
      <>
         <header tw="mt-5 mb-3 flex items-center justify-between">
            <h2 tw="text-gray-600 text-xl">Profile Details</h2>
         </header>
         <form onSubmit={handleProfileSubmit}>
            <section tw="flex flex-col md:flex-row items-center">
               <Form.Field tw="w-full md:w-5/12 md:mr-4">
                  <Form.Label>First Name*</Form.Label>
                  <Form.Text
                     required
                     type="text"
                     name="firstName"
                     defaultValue={user.firstName || ''}
                     placeholder="Enter your first name"
                  />
               </Form.Field>
               <Form.Field tw="w-full md:w-5/12">
                  <Form.Label>Last Name*</Form.Label>
                  <Form.Text
                     required
                     type="text"
                     name="lastName"
                     defaultValue={user.lastName || ''}
                     placeholder="Enter your last name"
                  />
               </Form.Field>
            </section>
            <Form.Field tw="w-full md:w-5/12">
               <Form.Label>Phone No.*</Form.Label>
               <Form.Text
                  required
                  type="text"
                  name="phoneNumber"
                  defaultValue={user.phoneNumber || ''}
                  placeholder="Enter your phone no. eg. 987 987 9876"
               />
            </Form.Field>
            <Button>Save Profile</Button>
         </form>
      </>
   )
}

const Button = styled.button(
   () => css`
      ${tw`bg-green-600 rounded text-white px-4 h-10 hover:bg-green-700`}
   `
)
