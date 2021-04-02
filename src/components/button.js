import tw, { styled, css } from 'twin.macro'

const sizeSelector = size => {
   switch (size) {
      case 'sm':
         return tw`h-8 px-2 text-sm`
      default:
         return tw`h-10 px-4 font-medium tracking-wider`
   }
}

export const Button = styled.button(
   ({ size, disabled }) => css`
      ${tw`
         rounded
         uppercase
         text-teal-500 
         border border-teal-500 
         hover:bg-teal-500 hover:text-white
      `}
      ${sizeSelector(size)}
      ${disabled &&
      tw`
            bg-gray-100 
            text-gray-700 
            border-white
            cursor-not-allowed 
            hover:bg-gray-100 hover:text-gray-700 
         `}
   `
)
