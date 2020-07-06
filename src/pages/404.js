import tw from 'twin.macro'
import React from 'react'
import { SEO } from '../components'

const Wrapper = tw.div`
  flex items-center justify-center flex-col h-screen
`

const Heading = tw.h1`
  text-2xl text-gray-500 uppercase
`

const Text = tw.p`
  text-xl text-gray-700
`

export default () => (
   <Wrapper>
      <SEO title="Page Not Found" />

      <Heading>Oops!</Heading>
      <Text>We can't find the page that you are looking for..</Text>
   </Wrapper>
)
