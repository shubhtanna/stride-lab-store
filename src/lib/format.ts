const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

export const formatPrice = (n: number) => inr.format(n)

export const FREE_SHIPPING_FROM = 1999
export const SHIPPING_FEE = 99
