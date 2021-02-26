import React, { useEffect, useState } from 'react'
import { Link } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useQuery } from '@apollo/react-hooks'
import { useConfig } from '../../lib'
import { GET_FILEID } from '../../graphql'
import { useUser } from '../../context'
import { SEO, Layout, Loader } from '../../components'
import { FaqSection, InfoSection } from '../../sections'
import { webRenderer } from '@dailykit/web-renderer'

export default () => {
   const { configOf } = useConfig()
   const { user, isAuthenticated } = useUser()
   const [file, setFile] = useState([])
   const theme = configOf('theme-color', 'Visual')
   const { loading } = useQuery(GET_FILEID, {
      variables: {
         divId: ['home-bottom-01'],
      },
      onCompleted: ({ content_subscriptionDivIds: fileData }) => {
         const fileId = [fileData[0].fileId]
         const cssPath = fileData[0].subscriptionDivFileId.linkedCssFiles.map(
            file => {
               return file?.cssFile?.path
            }
         )
         const jsPath = fileData[0].subscriptionDivFileId.linkedJsFiles.map(
            file => {
               return file?.jsFile?.path
            }
         )
         webRenderer({
            type: 'file',
            config: {
               uri: process.env.GATSBY_DATA_HUB_HTTPS,
               adminSecret: process.env.GATSBY_ADMIN_SECRET,
            },
            fileDetails: [
               {
                  elementId: 'home-bottom-01',
                  fileId,
                  cssPath: cssPath,
                  jsPath: jsPath,
               },
            ],
         })
      },

      onError: error => {
         console.error(error)
      },
   })

   // useEffect(() => {
   //    webRenderer({
   //       type: 'file',
   //       config: {
   //          uri: process.env.GATSBY_DATA_HUB_HTTPS,
   //          adminSecret: process.env.GATSBY_ADMIN_SECRET,
   //       },
   //       fileDetails:[
   //          {
   //             elementId: 'home-bottom-01',
   //             fileId: file,
   //          }
   //       ]

   //    })
   // }, [file])

   if (loading) return <Loader />

   return (
      <Layout>
         <SEO title="Home" />
         <Main>
            <Header>
               <div>
                  <Tagline>Your next great meal is at your fingertips.</Tagline>
                  {isAuthenticated && user?.isSubscriber ? (
                     <CTA theme={theme} to="/subscription/menu">
                        Select Menu
                     </CTA>
                  ) : (
                     <CTA
                        theme={theme}
                        to="/subscription/get-started/select-plan"
                     >
                        Get Started
                     </CTA>
                  )}
               </div>
            </Header>
            <div id="home-bottom-01"></div>
            <InfoSection page="home" identifier="bottom-01" />
            <FaqSection page="home" identifier="top-01" />
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

const CTA = styled(Link)(
   ({ theme }) => css`
      ${tw`
      rounded
      px-6 h-12
      shadow-xl
      text-white
      bg-green-700
      inline-flex items-center
      uppercase tracking-wider font-medium
   `}
      ${theme?.accent && `background-color: ${theme.accent}`}
   `
)
