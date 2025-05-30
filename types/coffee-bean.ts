export interface CoffeeBean {
  id: string
  name: string
  origin: string
  roast: 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark'
  processing_method?: string
  farm?: string
  altitude_m?: number
  variety?: string
  flavor_notes?: string[]
  purchase_date?: string
  roast_date?: string
  quantity_g?: number
  quantity_unit?: string
  price_per_kg?: number
  currency?: string
  notes?: string
  acidity?: 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high'
  type?: 'single-origin' | 'blend'
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
