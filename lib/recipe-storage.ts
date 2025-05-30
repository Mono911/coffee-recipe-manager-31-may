import { supabase } from './supabase'
import { Recipe, LegacyRecipe, BrewingSession } from '@/types/recipe'

export class RecipeStorage {
  private static readonly STORAGE_KEY = 'coffee-recipes'

  // Convert legacy localStorage format to new Supabase format
  private static convertLegacyRecipe(legacy: LegacyRecipe): Omit<Recipe, 'id' | 'created_at' | 'updated_at'> {
    return {
      name: legacy.name,
      bean_name: legacy.beanName,
      brewing_method: legacy.brewingMethod,
      bean_quantity_g: legacy.beanQuantityG,
      water_temp_c: legacy.waterTempC,
      grind_setting: legacy.grindSetting,
      rating: legacy.rating,
      brew_time_seconds: legacy.brewTimeSeconds,
      water_ratio: legacy.waterRatio,
      roast_level: legacy.roastLevel,
      notes: legacy.notes || '',
      tags: legacy.tags || [],
      pressure_bar: legacy.pressureBar,
      shot_time_seconds: legacy.shotTimeSeconds,
      tamping_pressure: legacy.tampingPressure,
      steeping_time_seconds: legacy.steepingTimeSeconds,
      plunge_technique: legacy.plungeTechnique,
      pour_pattern: legacy.pourPattern,
      bloom_time_seconds: legacy.bloomTimeSeconds,
    }
  }

  // Get all recipes (try Supabase first, fallback to localStorage)
  static async getRecipes(): Promise<Recipe[]> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Failed to fetch from Supabase, falling back to localStorage:', error)
      return this.getLocalRecipes()
    }
  }

  // Get recipes from localStorage
  static getLocalRecipes(): Recipe[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []
      
      const parsed = JSON.parse(stored)
      
      // Check if it's legacy format and convert
      if (parsed.length > 0 && 'beanName' in parsed[0]) {
        return parsed.map((legacy: LegacyRecipe) => ({
          id: legacy.id,
          ...this.convertLegacyRecipe(legacy),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      }
      
      return parsed
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return []
    }
  }

  // Save recipe (optimistic update to localStorage, then sync to Supabase)
  static async saveRecipe(recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>): Promise<Recipe> {
    console.log('🔄 RecipeStorage.saveRecipe called with:', JSON.stringify(recipe, null, 2))
    if (Object.keys(recipe).length === 0) {
      console.error('❌ Empty recipe data received!')
      console.trace('Stack trace for empty recipe')
    }
    
    // Validate required fields
    if (!recipe.name || !recipe.bean_name || !recipe.brewing_method || !recipe.bean_quantity_g || !recipe.water_temp_c || !recipe.grind_setting) {
      throw new Error('Missing required fields for recipe')
    }
    
    // Generate temporary ID for optimistic update
    const tempId = crypto.randomUUID()
    const now = new Date().toISOString()
    const tempRecipe: Recipe = {
      ...recipe,
      id: tempId,
      created_at: now,
      updated_at: now,
    }

    // Optimistic update to localStorage
    const localRecipes = this.getLocalRecipes()
    localRecipes.unshift(tempRecipe)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(localRecipes))
    console.log('💾 Saved to localStorage, attempting Supabase save...')

    try {
      // Clean the recipe data for Supabase and ensure required fields
      const cleanRecipe = {
        ...Object.fromEntries(
          Object.entries(recipe).filter(([_, value]) => value !== undefined)
        ),
        // Ensure rating has a default value of 0 if null/undefined
        rating: recipe.rating ?? 0
      }
      
      console.log('📤 Sending to Supabase (cleaned):', cleanRecipe)
      
      const { data, error } = await supabase
        .from('recipes')
        .insert([cleanRecipe])
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        })
        throw error
      }

      console.log('✅ Supabase save successful:', data)
      
      // Update localStorage with real ID
      const updatedLocalRecipes = localRecipes.map(r => 
        r.id === tempId ? data : r
      )
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedLocalRecipes))

      return data
    } catch (error: any) {
      console.error('❌ Failed to save to Supabase:')
      console.error('Error message:', error?.message)
      console.error('Error details:', error?.details)
      console.error('Error hint:', error?.hint)
      console.error('Error code:', error?.code)
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
      console.error('Sent data:', recipe)
      console.warn('⚠️ Falling back to localStorage only')
      return tempRecipe
    }
  }

  // Update recipe
  static async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe | null> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update localStorage
      const localRecipes = this.getLocalRecipes()
      const updatedRecipes = localRecipes.map(r => 
        r.id === id ? { ...r, ...data } : r
      )
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedRecipes))

      return data
    } catch (error) {
      console.error('Failed to update recipe:', error)
      
      // Fallback to localStorage only
      const localRecipes = this.getLocalRecipes()
      const updatedRecipes = localRecipes.map(r => 
        r.id === id ? { ...r, ...updates, updated_at: new Date().toISOString() } : r
      )
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedRecipes))
      
      return updatedRecipes.find(r => r.id === id) || null
    }
  }

  // Delete recipe
  static async deleteRecipe(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Update localStorage
      const localRecipes = this.getLocalRecipes()
      const filteredRecipes = localRecipes.filter(r => r.id !== id)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredRecipes))

      return true
    } catch (error) {
      console.error('Failed to delete from Supabase:', error)
      
      // Fallback to localStorage only
      const localRecipes = this.getLocalRecipes()
      const filteredRecipes = localRecipes.filter(r => r.id !== id)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredRecipes))
      
      return true
    }
  }

  // Migrate localStorage data to Supabase
  static async migrateToSupabase(): Promise<{ success: number; errors: number }> {
    const localRecipes = this.getLocalRecipes()
    let success = 0
    let errors = 0

    for (const recipe of localRecipes) {
      try {
        const { error } = await supabase
          .from('recipes')
          .upsert([recipe])

        if (error) throw error
        success++
      } catch (error) {
        console.error('Failed to migrate recipe:', recipe.name, error)
        errors++
      }
    }

    return { success, errors }
  }

  // Sync localStorage with Supabase (download all data)
  static async syncFromSupabase(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data || []))
    } catch (error) {
      console.error('Failed to sync from Supabase:', error)
    }
  }

  // Clear all data (both localStorage and Supabase)
  static async clearAllData(): Promise<void> {
    // Clear localStorage
    localStorage.removeItem(this.STORAGE_KEY)

    // Clear Supabase
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (error) throw error
    } catch (error) {
      console.error('Failed to clear Supabase data:', error)
    }
  }
}
