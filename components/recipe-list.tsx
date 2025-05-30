"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Edit, Trash2, Clock, Thermometer, Coffee } from "lucide-react"
import type { Recipe } from "@/types/recipe"

interface RecipeListProps {
  recipes: Recipe[]
  onViewRecipe: (recipe: Recipe) => void
  onEditRecipe: (recipe: Recipe) => void
  onDeleteRecipe: (id: string) => void
  onBrewRecipe?: (recipe: Recipe) => void
}

export function RecipeList({ recipes, onViewRecipe, onEditRecipe, onDeleteRecipe, onBrewRecipe }: RecipeListProps) {
  const formatBrewingMethod = (method: string) => {
    return method
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatTime = (seconds?: number) => {
    if (!seconds) return null
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.length === 0 && (
        <motion.div className="col-span-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="text-center py-16 bg-stone-50 border-stone-200 rounded-2xl shadow-sm">
            <CardContent>
              <div className="text-6xl mb-6">☕</div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">No recipes yet</h3>
              <p className="text-stone-600">Create your first coffee recipe to get started!</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
      {recipes.map((recipe, index) => (
        <motion.div
          key={recipe.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <Card className="bg-stone-50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border-stone-200 h-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg text-stone-800 mb-2 font-semibold">{recipe.name}</CardTitle>
                  <Badge variant="outline" className="text-xs border-stone-300 text-stone-600 rounded-lg">
                    {formatBrewingMethod(recipe.brewing_method)}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-stone-200 rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditRecipe(recipe)
                    }}
                    aria-label={`Edit ${recipe.name} recipe`}
                  >
                    <Edit className="h-4 w-4 text-stone-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteRecipe(recipe.id)
                    }}
                    aria-label={`Delete ${recipe.name} recipe`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent onClick={() => onViewRecipe(recipe)} className="pt-0">
              <div className="space-y-4">
                <div className="text-sm text-stone-700 font-medium">{recipe.bean_name}</div>

                <div className="flex items-center gap-4 text-sm text-stone-600">
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3" />
                    {recipe.water_temp_c}°C
                  </div>
                  {recipe.brew_time_seconds && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(recipe.brew_time_seconds)}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex" role="img" aria-label={`Rating: ${recipe.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= recipe.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-stone-500">
                    {recipe.bean_quantity_g}g • {recipe.grind_setting}
                  </div>
                </div>

                {recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {recipe.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-stone-200 text-stone-700 rounded-md">
                        {tag}
                      </Badge>
                    ))}
                    {recipe.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-stone-200 text-stone-700 rounded-md">
                        +{recipe.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {onBrewRecipe && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      onBrewRecipe(recipe)
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl mt-3"
                  >
                    <Coffee className="w-4 h-4 mr-2" />
                    Brew Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
