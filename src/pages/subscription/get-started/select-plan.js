import React from 'react'
import tw, { styled } from 'twin.macro'

import { Plans } from '../../../sections/select-plan'
import { InfoBlock } from '../../../sections/InfoBlock'
import { SEO, Layout, StepsNavbar } from '../../../components'

const SelectPlan = () => (
   <Layout noHeader>
      <SEO title="Plans" />
      <StepsNavbar />
      <main>
         <Header>
            <h1 css={tw`text-4xl text-gray-700`}>Plans</h1>
         </Header>
         <Plans />
         <InfoBlock
            heading="How it Works"
            subHeading="No commitment. Skipping or canceling meals is easy."
         >
            <InfoBlock.Item
               heading="You Choose"
               subHeading="Select from 20 exciting, easy to cook recipes"
               icon="https://dailykit-assets.s3.us-east-2.amazonaws.com/subs-icons/choose.png"
            />
            <InfoBlock.Item
               heading="We Deliver"
               subHeading=" We bring you the freshest, highest quality ingredients straight
            to your door"
               icon="https://dailykit-assets.s3.us-east-2.amazonaws.com/subs-icons/deliver.png"
            />
            <InfoBlock.Item
               heading="You Cook"
               subHeading="Tasty, inspiring meals you're proud to share with the people you
            love"
               icon="https://dailykit-assets.s3.us-east-2.amazonaws.com/subs-icons/cook.png"
            />
         </InfoBlock>
      </main>
   </Layout>
)

export default SelectPlan

const Header = styled.header`
   height: 360px;
   ${tw`bg-gray-100 flex items-center justify-center`}
`
