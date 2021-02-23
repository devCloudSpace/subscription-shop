import tw, { styled, css } from 'twin.macro'

export const CartProducts = styled.ul`
   ${tw`space-y-2`}
   overflow-y: auto;
   max-height: 257px;
`

export const SummaryBar = styled.div`
   ${tw`md:hidden fixed left-0 right-0 bottom-0 z-10 bg-white flex p-3 border-2 justify-between items-center`}
`

export const CartWrapper = styled.section(
   ({ showSummaryBar }) => css`
      @media (max-width: 786px) {
         position: fixed;
         left: 0px;
         right: 0px;
         top: 30%;
         bottom: 0px;
         background-color: #ffff;
         padding: 1rem;
         z-index: 1020;
         overflow: scroll;
         ${showSummaryBar
            ? `display: none`
            : `display: block;
            top: 100%;
            animation: slide 0.5s forwards;
            @keyframes slide{
               100% { top: 30%; }
            }
         `}
      }
   `
)

export const Overlay = styled.div(
   ({ showOverlay }) => css`
      @media (max-width: 786px) {
         position: fixed;
         left: 0px;
         right: 0px;
         top: 0px;
         bottom: 0px;
         background-color: rgba(0, 0, 0, 0.6);
         z-index: 1010;
         ${showOverlay ? `display: block` : `display: none`}
      }
   `
)

export const Table = styled.table`
   tr:nth-child(even) {
      ${tw`bg-gray-100`}
   }
`

export const FulfillmentOption = styled.section`
   ${tw`py-2 pr-2 rounded cursor-pointer flex items-center border text-gray-700`}
   aside {
      ${tw`flex-shrink-0 h-10 w-10 flex items-center justify-center`}
      ${({ isActive }) =>
         isActive &&
         css`
            svg {
               ${tw`text-green-700`}
            }
         `}
   }
   ${({ isActive }) =>
      isActive &&
      css`
         ${tw`border-2 border-green-600`}
      `}
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
