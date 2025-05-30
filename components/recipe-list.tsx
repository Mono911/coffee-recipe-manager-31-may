"use client"

import { motion } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Edit, Trash2, Clock, Thermometer, Coffee, Copy } from "lucide-react"
import type { Recipe } from "@/types/recipe"

interface RecipeListProps {
  recipes: Recipe[]
  onViewRecipe: (recipe: Recipe) => void
  onEditRecipe: (recipe: Recipe) => void
  onDeleteRecipe: (id: string) => void
  onDuplicateRecipe: (recipe: Recipe) => void
  onBrewRecipe?: (recipe: Recipe) => void
}

export function RecipeList({ recipes, onViewRecipe, onEditRecipe, onDeleteRecipe, onDuplicateRecipe, onBrewRecipe }: RecipeListProps) {
  const isMobile = useIsMobile()
  
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
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} ${isMobile ? 'gap-4' : 'gap-6'}`}>
      {recipes.length === 0 && (
        <motion.div className="col-span-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`text-center bg-stone-50 border-stone-200 rounded-2xl shadow-sm ${isMobile ? 'py-12' : 'py-16'}`}>
            <CardContent>
              <div className={`mb-6 ${isMobile ? 'text-4xl' : 'text-6xl'}`}>☕</div>
              <h3 className={`font-semibold text-stone-800 mb-3 ${isMobile ? 'text-lg' : 'text-xl'}`}>No recipes yet</h3>
              <p className={`text-stone-600 ${isMobile ? 'text-sm' : ''}`}>Create your first coffee recipe to get started!</p>
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
            <CardHeader className={isMobile ? 'pb-2 px-4 pt-4' : 'pb-3'}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className={`text-stone-800 mb-2 font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>{recipe.name}</CardTitle>
                  <Badge variant="outline" className={`border-stone-300 text-stone-600 rounded-lg ${isMobile ? 'text-[10px] px-2 py-0.5' : 'text-xs'}`}>
                    {formatBrewingMethod(recipe.brewing_method)}
                  </Badge>
                </div>
                <div className={`flex ${isMobile ? 'gap-0.5' : 'gap-1'}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`hover:bg-stone-200 rounded-lg ${isMobile ? 'h-7 w-7' : 'h-8 w-8'}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditRecipe(recipe)
                    }}
                    aria-label={`Edit ${recipe.name} recipe`}
                  >
                    <Edit className={`text-stone-600 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`hover:bg-stone-200 rounded-lg ${isMobile ? 'h-7 w-7' : 'h-8 w-8'}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicateRecipe(recipe)
                    }}
                    aria-label={`Duplicate ${recipe.name} recipe`}
                  >
                    <Copy className={`text-stone-600 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg ${isMobile ? 'h-7 w-7' : 'h-8 w-8'}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteRecipe(recipe.id)
                    }}
                    aria-label={`Delete ${recipe.name} recipe`}
                  >
                    <Trash2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent onClick={() => onViewRecipe(recipe)} className={isMobile ? 'pt-0 px-4 pb-4' : 'pt-0'}>
              <div className={isMobile ? 'space-y-3' : 'space-y-4'}>
                <div className={`text-stone-700 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>{recipe.bean_name}</div>

                <div className={`flex items-center text-stone-600 ${isMobile ? 'gap-3 text-xs' : 'gap-4 text-sm'}`}>
                  <div className="flex items-center gap-1">
                    <Thermometer className={isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
                    {recipe.water_temp_c}°C
                  </div>
                  {recipe.brew_time_seconds && (
                    <div className="flex items-center gap-1">
                      <Clock className={isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
                      {formatTime(recipe.brew_time_seconds)}
                    </div>
                  )}
                </div>

                <div className={`flex items-center ${isMobile ? 'flex-col gap-2 items-start' : 'justify-between'}`}>
                  <div className="flex" role="img" aria-label={recipe.rating !== undefined ? `Rating: ${recipe.rating} out of 5 stars` : "Not rated"}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = recipe.rating !== undefined && star <= recipe.rating;
                      const isZeroRating = recipe.rating === 0;
                      
                      return (
                        <Star
                          key={star}
                          className={`${
                            isFilled ? "fill-amber-400 text-amber-400" : 
                            isZeroRating ? "text-stone-300" : "text-stone-300"
                          } ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`}
                        />
                      );
                    })}
                  </div>
                  <div className={`text-stone-500 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                    {recipe.bean_quantity_g}g • {isMobile ? recipe.grind_setting.length > 15 ? recipe.grind_setting.substring(0, 15) + '...' : recipe.grind_setting : recipe.grind_setting}
                  </div>
                </div>

                {recipe.tags.length > 0 && (
                  <div className={`flex flex-wrap ${isMobile ? 'gap-0.5' : 'gap-1'}`}>
                    {recipe.tags.slice(0, isMobile ? 2 : 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className={`bg-stone-200 text-stone-700 rounded-md ${isMobile ? 'text-[10px] px-1.5 py-0.5' : 'text-xs'}`}>
                        {isMobile && tag.length > 8 ? tag.substring(0, 8) + '...' : tag}
                      </Badge>
                    ))}
                    {recipe.tags.length > (isMobile ? 2 : 3) && (
                      <Badge variant="secondary" className={`bg-stone-200 text-stone-700 rounded-md ${isMobile ? 'text-[10px] px-1.5 py-0.5' : 'text-xs'}`}>
                        +{recipe.tags.length - (isMobile ? 2 : 3)}
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
                    className={`w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl mt-3 ${isMobile ? 'h-8 text-xs' : ''}`}
                  >
                    <Coffee className={`mr-2 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
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
