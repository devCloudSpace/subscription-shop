import React from 'react'
import { Link } from 'gatsby'
import tw, { styled } from 'twin.macro'

import { Faq } from '../../sections/Faq'
import { InfoBlock } from '../../sections/InfoBlock'
import { SEO, Layout } from '../../components'

export default () => {
   return (
      <Layout>
         <SEO title="Home" />
         <Main>
            <Header>
               <div>
                  <Tagline>Your next great meal is at your fingertips.</Tagline>
                  <CTA to="/subscription/get-started/select-plan">
                     Get Started
                  </CTA>
               </div>
            </Header>
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
            <Faq heading="Frequently Asked Questions" tw="mt-16">
               <Faq.Item
                  question="Can I choose any recipe, or only specific ones?"
                  answer="You can choose any recipe you want within the box you've selected.
                  With any plan, you can select any recipe available each week."
               />
               <Faq.Item
                  question="Do I always need to choose my recipes?"
                  answer="It’s always best to choose the recipes you like. We do know however that life gets busy. If you don't get around to choosing your recipes on a future order, we'll use your preferred way of cooking as a guide so you always receive recipes that you like"
               />
               <Faq.Item
                  question="What if I need to skip a week?"
                  answer="No problem. Just visit the Choose Recipes page in your menu and skip any week you want."
               />
            </Faq>
         </Main>
      </Layout>
   )
}

const Main = styled.main`
   min-height: calc(100vh - 128px);
`

const Tagline = styled.h1`
   width: 100%;
   max-width: 480px;
   font-family: 'DM Serif Display', serif;
   ${tw`mb-4 text-teal-900 text-4xl md:text-5xl font-bold`}
`

const Header = styled.header`
   height: 560px;
   background-size: cover;
   background-position: bottom;
   background-repeat: no-repeat;
   background-image: url('https://dailykit-assets.s3.us-east-2.amazonaws.com/subs-icons/banner.png');
   ${tw`relative bg-gray-200 overflow-hidden flex flex-col justify-center`}
   div {
      margin: auto;
      max-width: 980px;
      width: calc(100vw - 40px);
   }
   :after {
      background: linear-gradient(-45deg, #ffffff 16px, transparent 0),
         linear-gradient(45deg, #ffffff 16px, transparent 0);
      background-position: left-bottom;
      background-repeat: repeat-x;
      background-size: 24px 24px;
      content: ' ';
      display: block;
      position: absolute;
      bottom: 0px;
      left: 0px;
      width: 100%;
      height: 24px;
   }
`

const CTA = styled(Link)`
   ${tw`
      rounded 
      px-6 h-12 
      shadow-xl
      bg-orange-400 
      inline-flex items-center 
      uppercase tracking-wider font-medium 
   `}
`
