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
      ${
         disabled &&
         tw`
            text-gray-700 
            border-gray-300 
            cursor-not-allowed 
            hover:bg-transparent hover:text-gray-700 
         `
      }
   `
)
