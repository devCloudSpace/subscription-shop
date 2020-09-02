import React from 'react'
import { navigate } from 'gatsby'
import { styled } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'

import { useUser } from '../../../context'
import { SEO, Layout, ProfileSidebar, Form } from '../../../components'

const Profile = () => {
   const [keycloak] = useKeycloak()

   React.useEffect(() => {
      if (!keycloak?.authenticated) {
         navigate('/subscription')
      }
   }, [keycloak])

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
            <Form.DisabledText>
               {user?.platform_customer?.email}
            </Form.DisabledText>
         </Form.Field>
         <div tw="flex">
            <Form.Field tw="mr-3">
               <Form.Label>First Name</Form.Label>
               <Form.Text
                  type="text"
                  name="firstName"
                  placeholder="Enter your first name"
                  defaultValue={user?.platform_customer?.firstName}
               />
            </Form.Field>
            <Form.Field>
               <Form.Label>Last Name</Form.Label>
               <Form.Text
                  type="text"
                  name="lastName"
                  placeholder="Enter your last name"
                  defaultValue={user?.platform_customer?.lastName}
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
