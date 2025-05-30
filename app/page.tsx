"use client"

import { useState, useEffect } from "react"
import { Plus, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RecipeForm } from "@/components/recipe-form"
import { RecipeList } from "@/components/recipe-list"
import { RecipeDetail } from "@/components/recipe-detail"
import { RecipeSearch } from "@/components/recipe-search"
import { BrewingTimer } from "@/components/brewing-timer"
import { CoffeeBeanForm } from "@/components/coffee-bean-form"
import { CoffeeBeanList } from "@/components/coffee-bean-list"
import type { Recipe } from "@/types/recipe"
import type { CoffeeBean } from "@/types/coffee-bean"
import { RecipeStorage } from "@/lib/recipe-storage"
import { CoffeeBeanStorage } from "@/lib/coffee-bean-storage"

export default function CoffeeRecipeManager() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [coffeeBeans, setCoffeeBeans] = useState<CoffeeBean[]>([])
  const [currentView, setCurrentView] = useState<"list" | "create" | "detail" | "brewing" | "beans" | "create-bean">("list")
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [brewingRecipe, setBrewingRecipe] = useState<Recipe | null>(null)
  const [editingBean, setEditingBean] = useState<CoffeeBean | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedRecipes = await RecipeStorage.getRecipes()
        setRecipes(loadedRecipes)
        setFilteredRecipes(loadedRecipes)
      } catch (error) {
        console.error('Failed to load recipes:', error)
        setRecipes([])
        setFilteredRecipes([])
      }

      try {
        const loadedBeans = await getCoffeeBeans()
        setCoffeeBeans(loadedBeans)
      } catch (error) {
        console.error('Failed to load coffee beans:', error)
        setCoffeeBeans([])
      }
    }
    
    loadData()
  }, [])

  const handleSaveRecipe = async (recipe: Omit<Recipe, "id" | "created_at" | "updated_at">) => {
    try {
      console.log('Saving recipe:', recipe)
      let savedRecipe: Recipe
      
      if (editingRecipe) {
        savedRecipe = await RecipeStorage.updateRecipe(editingRecipe.id, recipe) || editingRecipe
      } else {
        savedRecipe = await RecipeStorage.saveRecipe(recipe)
      }
      
      console.log('Saved recipe:', savedRecipe)
      
      // Refresh the list
      const updatedRecipes = await RecipeStorage.getRecipes()
      setRecipes(updatedRecipes)
      setFilteredRecipes(updatedRecipes)
      setCurrentView("list")
      setEditingRecipe(null)
    } catch (error) {
      console.error('Failed to save recipe:', error)
      alert(`Failed to save recipe: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDeleteRecipe = async (id: string) => {
    try {
      await RecipeStorage.deleteRecipe(id)
      const updatedRecipes = await RecipeStorage.getRecipes()
      setRecipes(updatedRecipes)
      setFilteredRecipes(updatedRecipes)
      setCurrentView("list")
      setSelectedRecipe(null)
    } catch (error) {
      console.error('Failed to delete recipe:', error)
      alert(`Failed to delete recipe: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setCurrentView("create")
  }

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setCurrentView("detail")
  }

  const handleBrewRecipe = (recipe: Recipe) => {
    setBrewingRecipe(recipe)
    setCurrentView("brewing")
  }

  const handleFilteredRecipes = (filtered: Recipe[]) => {
    setFilteredRecipes(filtered)
  }

  const getCoffeeBeans = async (): Promise<CoffeeBean[]> => {
    return await CoffeeBeanStorage.getBeans()
  }

  const saveCoffeeBean = async (bean: Omit<CoffeeBean, "id" | "created_at" | "updated_at">): Promise<CoffeeBean> => {
    return await CoffeeBeanStorage.saveBean(bean)
  }

  const updateCoffeeBean = async (id: string, updates: Partial<CoffeeBean>): Promise<CoffeeBean | null> => {
    return await CoffeeBeanStorage.updateBean(id, updates)
  }

  const deleteCoffeeBean = async (id: string): Promise<boolean> => {
    return await CoffeeBeanStorage.deleteBean(id)
  }

  const handleSaveBean = async (bean: Omit<CoffeeBean, "id" | "created_at" | "updated_at">) => {
    try {
      let savedBean: CoffeeBean
      if (editingBean) {
        savedBean = await updateCoffeeBean(editingBean.id, bean) || editingBean
      } else {
        savedBean = await saveCoffeeBean(bean)
      }

      if (savedBean._error) {
        alert(`Saved locally but failed to sync with database: ${savedBean._error}`)
      }

      const updatedBeans = await getCoffeeBeans()
      setCoffeeBeans(updatedBeans)
      setCurrentView("beans")
      setEditingBean(null)
    } catch (error) {
      console.error('Failed to save coffee bean:', error)
      alert(`Failed to save coffee bean: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDeleteBean = async (id: string) => {
    try {
      await deleteCoffeeBean(id)
      const updatedBeans = await getCoffeeBeans()
      setCoffeeBeans(updatedBeans)
    } catch (error) {
      console.error('Failed to delete coffee bean:', error)
    }
  }

  const handleEditBean = (bean: CoffeeBean) => {
    setEditingBean(bean)
    setCurrentView("create-bean")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-emerald-50">
      <div className="max-w-6xl mx-auto p-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-stone-800 mb-3 font-rounded">☕ Brew Journal</h1>
          <p className="text-stone-600 text-lg">Perfect your craft, one cup at a time</p>
        </header>
        
        <>
            {currentView === "list" && (
              <div
              key="list"
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-stone-800">Your Recipes</h2>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setCurrentView("beans")}
                    variant="outline"
                    className="border-stone-300 hover:bg-stone-100 rounded-xl px-6 py-3 shadow-sm hover:shadow-md transition-all"
                  >
                    <Coffee className="w-4 h-4 mr-2" />
                    Manage Beans
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingRecipe(null)
                      setCurrentView("create")
                    }}
                    className="bg-stone-700 hover:bg-stone-800 text-white rounded-xl px-6 py-3 shadow-sm hover:shadow-md transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Recipe
                  </Button>
                </div>
              </div>
              <RecipeSearch
                recipes={recipes}
                onFilteredRecipes={handleFilteredRecipes}
                onQuickBrew={handleBrewRecipe}
              />
              <RecipeList
                recipes={filteredRecipes}
                onViewRecipe={handleViewRecipe}
                onEditRecipe={handleEditRecipe}
                onDeleteRecipe={handleDeleteRecipe}
                onBrewRecipe={handleBrewRecipe}
              />
            </div>
          )}

          {currentView === "create" && (
            <div
              key="create"
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCurrentView("list")
                    setEditingRecipe(null)
                  }}
                  className="text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl"
                >
                  ← Back to Recipes
                </Button>
                <h2 className="text-2xl font-semibold text-stone-800">
                  {editingRecipe ? "Edit Recipe" : "Create New Recipe"}
                </h2>
              </div>
              <RecipeForm
                onSave={handleSaveRecipe}
                initialRecipe={editingRecipe}
                onCancel={() => {
                  setCurrentView("list")
                  setEditingRecipe(null)
                }}
              />
            </div>
          )}

          {currentView === "detail" && selectedRecipe && (
            <div
              key="detail"
              className="space-y-6"
            >
              <Button
                variant="ghost"
                onClick={() => setCurrentView("list")}
                className="text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl"
              >
                ← Back to Recipes
              </Button>
              <RecipeDetail
                recipe={selectedRecipe}
                onEdit={() => handleEditRecipe(selectedRecipe)}
                onDelete={() => handleDeleteRecipe(selectedRecipe.id)}
                onBrew={() => handleBrewRecipe(selectedRecipe)}
              />
            </div>
          )}

          {currentView === "brewing" && brewingRecipe && (
            <div
              key="brewing"
              className="space-y-6"
            >
              <Button
                variant="ghost"
                onClick={() => setCurrentView("list")}
                className="text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl"
              >
                ← Back to Recipes
              </Button>
              <BrewingTimer
                recipe={brewingRecipe}
                onClose={() => setCurrentView("list")}
              />
            </div>
          )}

          {currentView === "beans" && (
            <div
              key="beans"
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentView("list")}
                    className="text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl"
                  >
                    ← Back to Recipes
                  </Button>
                  <h2 className="text-2xl font-semibold text-stone-800">Coffee Bean Inventory</h2>
                </div>
                <Button
                  onClick={() => {
                    setEditingBean(null)
                    setCurrentView("create-bean")
                  }}
                  className="bg-stone-700 hover:bg-stone-800 text-white rounded-xl px-6 py-3 shadow-sm hover:shadow-md transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bean
                </Button>
              </div>
              <CoffeeBeanList
                beans={coffeeBeans}
                onEdit={handleEditBean}
                onDelete={handleDeleteBean}
              />
            </div>
          )}

            {currentView === "create-bean" && (
              <div
                key="create-bean"
                className="space-y-6"
              >
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCurrentView("beans")
                      setEditingBean(null)
                    }}
                    className="text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl"
                  >
                    ← Back to Beans
                  </Button>
                  <h2 className="text-2xl font-semibold text-stone-800">
                    {editingBean ? "Edit Coffee Bean" : "Add New Coffee Bean"}
                  </h2>
                </div>
                <CoffeeBeanForm
                  onSave={handleSaveBean}
                  initialBean={editingBean}
                  onCancel={() => {
                    setCurrentView("beans")
                    setEditingBean(null)
                  }}
                />
              </div>
            )}
        </>
      </div>
    </div>
  )
}
