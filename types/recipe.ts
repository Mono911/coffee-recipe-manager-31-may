export type BrewingMethod = "pour_over" | "espresso" | "french_press" | "aeropress" | "v60" | "chemex" | "cold_brew" | "moka_pot"

export interface Recipe {
  id: string
  name: string
  brewing_method: BrewingMethod
  coffee_bean_id?: string
  bean_name: string
  bean_quantity_g: number
  water_temp_c: number
  grind_setting: string
  water_ratio?: string
  brew_time_seconds?: number

  // Espresso specific
  pressure_bar?: number
  shot_time_seconds?: number
  tamping_pressure?: string

  // French Press specific
  steeping_time_seconds?: number
  plunge_technique?: string

  // Pour-over/V60 specific
  pour_pattern?: string
  bloom_time_seconds?: number

  rating?: number
  tags: string[]
  notes: string
  roast_level?: "light" | "medium" | "dark"
  created_at: string
  updated_at: string
}

// Legacy interface for backward compatibility with existing localStorage data
export interface LegacyRecipe {
  id: string
  name: string
  beanName: string
  brewingMethod: BrewingMethod
  beanQuantityG: number
  waterTempC: number
  grindSetting: string
  rating?: number
  brewTimeSeconds?: number
  waterRatio?: string
  roastLevel?: 'light' | 'medium' | 'dark'
  notes?: string
  tags?: string[]
  
  // Method-specific fields
  pressureBar?: number
  shotTimeSeconds?: number
  tampingPressure?: string
  steepingTimeSeconds?: number
  plungeTechnique?: string
  pourPattern?: string
  bloomTimeSeconds?: number
}

export interface BrewingSession {
  id: string
  recipe_id: string
  started_at: string
  completed_at?: string
  notes?: string
  rating?: number
  created_at: string
}
