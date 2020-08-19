import React from 'react'
import { useSubscription } from '@apollo/react-hooks'

import { Faq } from '../Faq'
import { FAQ } from '../../graphql'
import { Loader } from '../../components'

export const FaqSection = ({ page, identifier }) => {
   const { loading, data: { faq = [] } = {} } = useSubscription(FAQ, {
      variables: {
         page: { _eq: page },
         identifier: {
            _eq: identifier,
         },
      },
   })
   if (loading) return <Loader inline />
   return (
      <Faq heading={faq[0].heading} tw="mt-16">
         {faq[0].blocks.map(block => (
            <Faq.Item
               key={block.id}
               question={block.title}
               answer={block.description}
            />
         ))}
      </Faq>
   )
}
