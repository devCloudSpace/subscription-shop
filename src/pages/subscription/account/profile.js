import React from 'react'
import { styled } from 'twin.macro'

import { SEO, Layout, ProfileSidebar, Form } from '../../../components'
import { useUser } from '../../../context'

const Profile = () => {
   return (
      <Layout>
         <SEO title="Profile" />
         <Main>
            <ProfileSidebar />
            <ProfileForm />
         </Main>
      </Layout>
   )
}

export default Profile

const ProfileForm = () => {
   const { user } = useUser()

   return (
      <section tw="p-6 w-full md:w-5/12">
         <Form.Field tw="mr-3">
            <Form.Label>Email</Form.Label>
            <Form.DisabledText>{user.email}</Form.DisabledText>
         </Form.Field>
         <div tw="flex">
            <Form.Field tw="mr-3">
               <Form.Label>First Name</Form.Label>
               <Form.Text
                  type="text"
                  name="firstName"
                  defaultValue={user.firstName}
                  placeholder="Enter your first name"
               />
            </Form.Field>
            <Form.Field>
               <Form.Label>Last Name</Form.Label>
               <Form.Text
                  type="text"
                  name="lastName"
                  defaultValue={user.lastName}
                  placeholder="Enter your last name"
               />
            </Form.Field>
         </div>
      </section>
   )
}

const Main = styled.main`
   display: grid;
   grid-template-rows: 1fr;
   height: calc(100vh - 64px);
   grid-template-columns: 240px 1fr;
`
