import React from 'react'
import { useSubscription } from '@apollo/react-hooks'

import { Loader } from '../../components'
import { InfoBlock } from '../InfoBlock'
import { INFORMATION_GRID } from '../../graphql'

export const InfoSection = ({ page, identifier }) => {
   const { loading, data: { infoGrid = [] } = {} } = useSubscription(
      INFORMATION_GRID,
      {
         variables: { page: { _eq: page }, identifier: { _eq: identifier } },
      }
   )
   if (loading) return <Loader inline />
   return (
      <InfoBlock
         heading={infoGrid[0].heading}
         subHeading={infoGrid[0].subHeading}
      >
         {infoGrid[0].blocks.map(block => (
            <InfoBlock.Item
               key={block.id}
               heading={block.title}
               icon={block.thumbnail}
               subHeading={block.description}
            />
         ))}
      </InfoBlock>
   )
}
