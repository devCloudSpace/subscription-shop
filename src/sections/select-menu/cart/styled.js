import tw, { styled, css } from 'twin.macro'

export const CartProducts = styled.ul`
   ${tw`space-y-2`}
   overflow-y: auto;
   max-height: 257px;
`

export const SaveButton = styled.button(
   ({ disabled, bg }) => css`
      ${tw`
      h-10
      w-full
      rounded
      text-white
      text-center
      bg-green-500
   `}
      ${bg && `background-color: ${bg};`}
      ${disabled &&
      tw`
         h-10
         w-full
         rounded
         text-gray-600
         text-center
         bg-gray-200
         cursor-not-allowed 
      `}
   `
)
