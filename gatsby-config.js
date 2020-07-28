module.exports = {
   assetPrefix: `/subscription`,
   siteMetadata: {
      title: `Subsription Shop`,
      description: `A subscription based shop for restaurants`,
   },
   plugins: [
      `gatsby-plugin-emotion`,
      `gatsby-plugin-postcss`,
      `gatsby-plugin-react-helmet`,
      {
         resolve: `gatsby-plugin-portal`,
         options: {
            key: 'portal',
            id: 'portal',
         },
      },
      {
         resolve: `gatsby-plugin-asset-path`,
         options: {
            fileTypes: ['js', 'map', 'css', 'xhtml'],
         },
      },
   ],
}
