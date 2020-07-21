import React from 'react'

import { Layout, SEO, HelperBar } from '../components'

const Menu = () => {
   return (
      <Layout>
         <SEO title="Menu" />
         <main tw="mx-auto w-8/12">
            <HelperBar type="info">
               <HelperBar.Title>Add an address</HelperBar.Title>
               <HelperBar.SubTitle>
                  Let's start with adding an address
               </HelperBar.SubTitle>
               <HelperBar.Button>Add Address</HelperBar.Button>
            </HelperBar>
            <HelperBar type="success">
               <HelperBar.Title>
                  Let's start with adding an address
               </HelperBar.Title>
               <HelperBar.Button>Add Address</HelperBar.Button>
            </HelperBar>
            <HelperBar type="danger">
               <HelperBar.SubTitle>
                  Let's start with adding an address
               </HelperBar.SubTitle>
            </HelperBar>
            <HelperBar type="warning">
               <HelperBar.Title>
                  Let's start with adding an address
               </HelperBar.Title>
               <HelperBar.Button>Add Address</HelperBar.Button>
            </HelperBar>
         </main>
      </Layout>
   )
}

export default Menu
