export type Product = {
  id: number
  name: string
  brand: string
  price: number | string
  description: string
  category_id: number
}

export type Category = {
  id: number
  name: string
}

export type SalesSummary = {
  month: number
  quantity: number
  total_price: number
  profit_variation: number
}
