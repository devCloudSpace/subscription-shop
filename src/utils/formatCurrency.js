export const formatCurrency = (input = 0) => {
   return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: process.env.GATSBY_CURRENCY,
   }).format(input)
}
