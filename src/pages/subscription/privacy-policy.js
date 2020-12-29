import React from 'react'
import tw from 'twin.macro'
import { Layout, Para, SubHeading, List } from '../../components'

const PrivacyPolicy = () => {
   return (
      <Layout>
         <div tw="min-h-full text-gray-600 md:mx-64 mx-10 mb-4">
            <h1 tw="my-10  text-5xl text-gray-800 text-center py-2 border-gray-200 border-b-2">
               Privacy Policy
            </h1>
            <div tw="text-lg">
               <SubHeading>Mock sub heading</SubHeading>
               <Para>
                  Mock Paragraph Unless otherwise stated, Cook It Yourself
                  and/or its licensors own the intellectual property rights for
                  all material on . All intellectual property rights are
                  reserved. You may access this from for your own personal use
                  subjected to restrictions set in these terms and conditions.
               </Para>
               <Para>
                  You must not:
                  <List>
                     <li>Mock list</li>
                     <li>Sell, rent or sub-license material from </li>
                     <li>Reproduce, duplicate or copy material from </li>
                     <li>Redistribute content from </li>
                  </List>
               </Para>
            </div>
         </div>
      </Layout>
   )
}

export default PrivacyPolicy
