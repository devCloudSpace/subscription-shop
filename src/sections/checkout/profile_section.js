import React from 'react'
import tw from 'twin.macro'

import { usePayment } from './state'
import { Form } from '../../components'
import { useUser } from '../../context'

export const ProfileSection = () => {
   const { user } = useUser()
   const { state, dispatch } = usePayment()

   React.useEffect(() => {
      dispatch({
         type: 'SET_PROFILE',
         payload: {
            lastName: user?.platform_customer?.lastName,
            firstName: user?.platform_customer?.firstName,
            phoneNumber: user?.platform_customer?.phoneNumber,
         },
      })
   }, [user, dispatch])

   const handleChange = e => {
      const { name, value } = e.target

      dispatch({
         type: 'SET_PROFILE',
         payload: {
            [name]: value,
         },
      })
   }
   return (
      <>
         <header tw="my-3 pb-1 border-b flex items-center justify-between">
            <h4 css={tw`text-lg text-gray-700`}>Profile Details</h4>
         </header>
         <main>
            <section tw="flex flex-col md:flex-row items-center">
               <Form.Field tw="w-full md:w-5/12 md:mr-4">
                  <Form.Label>First Name*</Form.Label>
                  <Form.Text
                     required
                     type="text"
                     name="firstName"
                     onChange={e => handleChange(e)}
                     value={state.profile.firstName}
                     placeholder="Enter your first name"
                  />
               </Form.Field>
               <Form.Field tw="w-full md:w-5/12">
                  <Form.Label>Last Name*</Form.Label>
                  <Form.Text
                     required
                     type="text"
                     name="lastName"
                     onChange={e => handleChange(e)}
                     value={state.profile.lastName}
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
                  onChange={e => handleChange(e)}
                  value={state.profile.phoneNumber}
                  placeholder="Enter your phone no. eg. 987 987 9876"
               />
            </Form.Field>
         </main>
      </>
   )
}
