import type { Recipe } from "@/types/recipe"
import { RecipeStorage } from './recipe-storage'

const STORAGE_KEY = "coffee-recipes"

// Legacy sync functions for backward compatibility
export function getRecipes(): Recipe[] {
  return RecipeStorage.getLocalRecipes()
}

export function saveRecipe(recipeData: Omit<Recipe, "id" | "created_at" | "updated_at">, existingId?: string): Recipe {
  const recipes = getRecipes()
  const now = new Date().toISOString()

  if (existingId) {
    // Update existing recipe
    const index = recipes.findIndex((r) => r.id === existingId)
    if (index !== -1) {
      const updatedRecipe: Recipe = {
        ...recipeData,
        id: existingId,
        created_at: recipes[index].created_at,
        updated_at: now,
      }
      recipes[index] = updatedRecipe
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
      
      // Also update in Supabase (fire and forget)
      RecipeStorage.updateRecipe(existingId, updatedRecipe).catch(console.error)
      
      return updatedRecipe
    }
  }

  // Create new recipe
  const newRecipe: Recipe = {
    ...recipeData,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  }

  recipes.push(newRecipe)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
  
  // Also save to Supabase (fire and forget)
  RecipeStorage.saveRecipe(recipeData).catch(console.error)
  
  return newRecipe
}

export function deleteRecipe(id: string): void {
  const recipes = getRecipes()
  const filteredRecipes = recipes.filter((r) => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecipes))
  
  // Also delete from Supabase (fire and forget)
  RecipeStorage.deleteRecipe(id).catch(console.error)
}

export function exportRecipes(): string {
  return JSON.stringify(getRecipes(), null, 2)
}

export function importRecipes(jsonData: string): void {
  try {
    const recipes = JSON.parse(jsonData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
    
    // Also sync to Supabase (fire and forget)
    RecipeStorage.migrateToSupabase().catch(console.error)
  } catch (error) {
    throw new Error("Invalid JSON format")
  }
}

// New async functions that properly use RecipeStorage
export async function getRecipesAsync(): Promise<Recipe[]> {
  return RecipeStorage.getRecipes()
}

export async function saveRecipeAsync(recipeData: Omit<Recipe, "id" | "created_at" | "updated_at">): Promise<Recipe> {
  return RecipeStorage.saveRecipe(recipeData)
}

export async function updateRecipeAsync(id: string, updates: Partial<Recipe>): Promise<Recipe | null> {
  return RecipeStorage.updateRecipe(id, updates)
}

export async function deleteRecipeAsync(id: string): Promise<boolean> {
  return RecipeStorage.deleteRecipe(id)
}

// Migration utilities
export async function migrateToSupabase(): Promise<{ success: number; errors: number }> {
  return RecipeStorage.migrateToSupabase()
}

export async function syncFromSupabase(): Promise<void> {
  return RecipeStorage.syncFromSupabase()
}
