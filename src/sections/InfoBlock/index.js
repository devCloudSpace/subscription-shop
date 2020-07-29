import React from 'react'
import tw, { styled } from 'twin.macro'

const InfoBlock = ({ heading, subHeading, children }) => {
   return (
      <BlockWrapper>
         {heading && <Heading>{heading}</Heading>}
         {subHeading && <SubHeading>{subHeading}</SubHeading>}
         <Container>{children}</Container>
      </BlockWrapper>
   )
}

const Heading = ({ children }) => {
   return <h1 tw="mb-1 text-center text-green-600 text-4xl">{children}</h1>
}
const SubHeading = ({ children }) => {
   return <h4 tw="mb-4 text-center text-gray-600 text-lg">{children}</h4>
}

const Item = ({ icon, heading, subHeading }) => {
   return (
      <li tw="flex flex-col items-center text-center">
         {icon && (
            <img
               src={icon}
               alt={heading}
               title={heading}
               tw="w-20 h-20 rounded-full"
            />
         )}
         {heading && <h3 tw="text-2xl text-green-700 mt-3">{heading}</h3>}
         {subHeading && <p tw="text-gray-700">{subHeading}</p>}
      </li>
   )
}

InfoBlock.Item = Item

export { InfoBlock }

const BlockWrapper = styled.div`
   margin: 24px auto;
   max-width: 980px;
   width: calc(100% - 40px);
`

const Container = styled.ul`
   ${tw`grid gap-6`}
   grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`
