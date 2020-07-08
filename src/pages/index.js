import React from 'react'
import { Link } from 'gatsby'

import { SEO, Layout } from '../components'

export default () => {
   return (
      <Layout>
         <SEO title="Home" />
         <main>
            <h1>Home</h1>
            <Link to="/get-started/select-plan">Get Started</Link>
         </main>
      </Layout>
   )
}
