export interface CoffeeBean {
  id: string
  name: string
  processing: 'natural' | 'washed' | 'honey' | 'anaerobic' | 'other'
  origin: string
  roast: 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark'
  type: 'single-origin' | 'blend'
  flavor_notes: string[]
  acidity: 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high'
  notes?: string
  roast_date?: string
  quantity?: number
  quantity_unit?: 'g' | 'kg' | 'lbs' | 'oz'
  price?: number
  currency?: string
  supplier?: string
  created_at: string
  updated_at: string
  _error?: string
}

export type CreateCoffeeBeanData = Omit<CoffeeBean, 'id' | 'created_at' | 'updated_at'>

export interface CoffeeBeanFilters {
  search?: string
  processing?: string[]
  origin?: string[]
  roast?: string[]
  type?: string[]
  acidity?: string[]
}
