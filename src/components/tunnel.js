import React from 'react'
import ReactDOM from 'react-dom'
import tw, { styled, css } from 'twin.macro'

import { isClient, useOnClickOutside } from '../utils'

const portalRoot = isClient ? document.getElementById('portal') : null

class Portal extends React.Component {
   constructor() {
      super()
      this.el = isClient ? document.createElement('div') : null
   }

   componentDidMount = () => {
      portalRoot.appendChild(this.el)
   }

   componentWillUnmount = () => {
      portalRoot.removeChild(this.el)
   }

   render() {
      const { children } = this.props

      if (this.el) {
         return ReactDOM.createPortal(children, this.el)
      } else {
         return null
      }
   }
}

export const Tunnel = ({ isOpen, toggleTunnel, size, children }) => {
   const ref = React.useRef()
   useOnClickOutside(ref, () => toggleTunnel(false))

   if (isOpen)
      return (
         <Portal>
            <Wrapper>
               <Content size={size} ref={ref}>
                  {children}
               </Content>
            </Wrapper>
         </Portal>
      )
   return null
}

const Header = ({ title, children }) => {
   return (
      <TunnelHeader>
         <h1 css={tw`truncate text-base md:text-xl text-gray-700`}>{title}</h1>
         {children}
      </TunnelHeader>
   )
}

const Body = ({ children }) => {
   return <TunnelBody>{children}</TunnelBody>
}

Tunnel.Header = Header
Tunnel.Body = Body

const Wrapper = styled.div`
   margin-top: 64px;
   ${tw`w-screen fixed inset-0`}
   background: rgba(0,0,0,0.2);
`

const Content = styled.div(
   ({ size }) => css`
      float: right;
      ${widthSelector(size)};
      ${tw`bg-white h-full`}
      @media (max-width: 980px) {
         ${size !== 'full' && tw`w-9/12`}
      }
      @media (max-width: 767px) {
         ${tw`w-screen`}
      }
   `
)

const widthSelector = size => {
   switch (size) {
      case 'sm':
         return tw`w-3/12`
      case 'md':
         return tw`w-6/12`
      case 'lg':
         return tw`w-9/12`
      case 'full':
         return tw`w-screen`
      default:
         return tw`w-6/12`
   }
}

const TunnelHeader = styled.header`
   height: 64px;
   ${tw`px-4 border-b flex items-center justify-between`}
`

const TunnelBody = styled.main`
   padding: 16px;
   overflow-y: auto;
   height: calc(100vh - 128px);
`
