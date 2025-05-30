"use client"

import { motion } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, Edit, Trash2, Clock, Thermometer, Coffee, Droplets } from "lucide-react"
import type { Recipe } from "@/types/recipe"

interface RecipeDetailProps {
  recipe: Recipe
  onEdit: () => void
  onDelete: () => void
  onBrew?: () => void
}

export function RecipeDetail({ recipe, onEdit, onDelete, onBrew }: RecipeDetailProps) {
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

  const renderMethodSpecificDetails = () => {
    switch (recipe.brewing_method) {
      case "espresso":
        return (
          <div className="grid grid-cols-2 gap-4">
            {recipe.pressure_bar && (
              <div>
                <div className="text-sm font-medium text-stone-800">Pressure</div>
                <div className="text-stone-600">{recipe.pressure_bar} bar</div>
              </div>
            )}
            {recipe.shot_time_seconds && (
              <div>
                <div className="text-sm font-medium text-stone-800">Shot Time</div>
                <div className="text-stone-600">{formatTime(recipe.shot_time_seconds)}</div>
              </div>
            )}
            {recipe.tamping_pressure && (
              <div className="col-span-2">
                <div className="text-sm font-medium text-stone-800">Tamping</div>
                <div className="text-stone-600">{recipe.tamping_pressure}</div>
              </div>
            )}
          </div>
        )
      case "french_press":
        return (
          <div className="grid grid-cols-2 gap-4">
            {recipe.steeping_time_seconds && (
              <div>
                <div className="text-sm font-medium text-stone-800">Steeping Time</div>
                <div className="text-stone-600">{formatTime(recipe.steeping_time_seconds)}</div>
              </div>
            )}
            {recipe.plunge_technique && (
              <div>
                <div className="text-sm font-medium text-stone-800">Plunge Technique</div>
                <div className="text-stone-600">{recipe.plunge_technique}</div>
              </div>
            )}
          </div>
        )
      case "pour_over":
      case "v60":
        return (
          <div className="grid grid-cols-2 gap-4">
            {recipe.pour_pattern && (
              <div>
                <div className="text-sm font-medium text-stone-800">Pour Pattern</div>
                <div className="text-stone-600">{recipe.pour_pattern}</div>
              </div>
            )}
            {recipe.bloom_time_seconds && (
              <div>
                <div className="text-sm font-medium text-stone-800">Bloom Time</div>
                <div className="text-stone-600">{formatTime(recipe.bloom_time_seconds)}</div>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <Card className="bg-stone-50 border-stone-200 rounded-2xl shadow-sm">
        <CardHeader>
          <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-start'}`}>
            <div>
              <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} text-stone-800 mb-2`}>{recipe.name}</CardTitle>
              <Badge variant="outline" className="text-sm border-stone-300 text-stone-600 rounded-lg">
                {formatBrewingMethod(recipe.brewing_method)}
              </Badge>
            </div>
            <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'gap-2'}`}>
              {onBrew && (
                <Button
                  onClick={onBrew}
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
                  aria-label={`Start brewing ${recipe.name}`}
                >
                  <Coffee className="w-4 h-4 mr-2" />
                  {isMobile ? 'Brew' : 'Brew Now'}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onEdit}
                className="rounded-xl border-stone-300 hover:bg-stone-100"
                aria-label={`Edit ${recipe.name} recipe`}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={onDelete}
                className="rounded-xl"
                aria-label={`Delete ${recipe.name} recipe`}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex" role="img" aria-label={recipe.rating !== undefined ? `Rating: ${recipe.rating} out of 5 stars` : "Not rated"}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = recipe.rating !== undefined && star <= recipe.rating;
                return (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${isFilled ? "fill-amber-400 text-amber-400" : "text-stone-300"}`}
                  />
                );
              })}
            </div>
            <span className="text-sm text-stone-600">
              {recipe.rating !== undefined ? `(${recipe.rating}/5)` : "(Not rated)"}
            </span>
          </div>

          <Separator className="bg-stone-200" />

          {/* Bean Information */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="text-lg font-semibold text-stone-800 mb-3 flex items-center gap-2">
              <Coffee className="w-5 h-5" />
              Bean Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-stone-800">Bean Name</div>
                <div className="text-stone-600">{recipe.bean_name}</div>
              </div>
              {recipe.roast_level && (
                <div>
                  <div className="text-sm font-medium text-stone-800">Roast Level</div>
                  <div className="text-stone-600 capitalize">{recipe.roast_level}</div>
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-stone-800">Quantity</div>
                <div className="text-stone-600">{recipe.bean_quantity_g}g</div>
              </div>
              <div>
                <div className="text-sm font-medium text-stone-800">Grind Setting</div>
                <div className="text-stone-600">{recipe.grind_setting}</div>
              </div>
            </div>
          </motion.div>

          <Separator className="bg-stone-200" />

          {/* Brewing Parameters */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="text-lg font-semibold text-stone-800 mb-3 flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              Brewing Parameters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-stone-800">Water Temperature</div>
                <div className="text-stone-600 flex items-center gap-1">
                  <Thermometer className="w-4 h-4" />
                  {recipe.water_temp_c}°C
                </div>
              </div>
              {recipe.water_ratio && (
                <div>
                  <div className="text-sm font-medium text-stone-800">Water Ratio</div>
                  <div className="text-stone-600">{recipe.water_ratio}</div>
                </div>
              )}
              {recipe.brew_time_seconds && (
                <div>
                  <div className="text-sm font-medium text-stone-800">Total Brew Time</div>
                  <div className="text-stone-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(recipe.brew_time_seconds)}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Method-Specific Details */}
          {renderMethodSpecificDetails() && (
            <>
              <Separator className="bg-stone-200" />
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <h3 className="text-lg font-semibold text-stone-800 mb-3">
                  {formatBrewingMethod(recipe.brewing_method)} Specifics
                </h3>
                {renderMethodSpecificDetails()}
              </motion.div>
            </>
          )}

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <>
              <Separator className="bg-stone-200" />
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <h3 className="text-lg font-semibold text-stone-800 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-stone-200 text-stone-700 rounded-lg">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            </>
          )}

          {/* Notes */}
          {recipe.notes && (
            <>
              <Separator className="bg-stone-200" />
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <h3 className="text-lg font-semibold text-stone-800 mb-3">Notes</h3>
                <div className="text-stone-600 whitespace-pre-wrap bg-stone-100 p-4 rounded-xl border border-stone-200">
                  {recipe.notes}
                </div>
              </motion.div>
            </>
          )}

          {/* Metadata */}
          <Separator className="bg-stone-200" />
          <div className="text-xs text-stone-500">
            Created: {new Date(recipe.created_at).toLocaleDateString()}
            {recipe.updated_at !== recipe.created_at && (
              <> • Updated: {new Date(recipe.updated_at).toLocaleDateString()}</>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
