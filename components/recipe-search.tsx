"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, Star, X, Coffee, Clock } from "lucide-react"
import type { Recipe, BrewingMethod } from "@/types/recipe"
import type { CoffeeBean } from "@/types/coffee-bean"
import { CoffeeBeanStorage } from "@/lib/coffee-bean-storage"

interface RecipeSearchProps {
  recipes: Recipe[]
  onFilteredRecipes: (filtered: Recipe[]) => void
  onQuickBrew: (recipe: Recipe) => void
}

export function RecipeSearch({ recipes, onFilteredRecipes, onQuickBrew }: RecipeSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [methodFilter, setMethodFilter] = useState<BrewingMethod | "all">("all")
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all")
  const [roastFilter, setRoastFilter] = useState<"light" | "medium" | "dark" | "all">("all")
  const [beanFilter, setBeanFilter] = useState<string | "all">("all")
  const [showFilters, setShowFilters] = useState(false)
  const [recentlyBrewed, setRecentlyBrewed] = useState<string[]>([])
  const [isClientMounted, setIsClientMounted] = useState(false)
  const [coffeeBeans, setCoffeeBeans] = useState<CoffeeBean[]>([])

  useEffect(() => {
    setIsClientMounted(true)
    // Load coffee beans
    const loadBeans = async () => {
      try {
        const beans = await CoffeeBeanStorage.getBeans()
        setCoffeeBeans(beans)
      } catch (error) {
        console.error('Failed to load coffee beans:', error)
      }
    }
    loadBeans()
  }, [])

  // Get recently brewed recipes from localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const recent = localStorage.getItem('recently-brewed')
      if (recent) {
        setRecentlyBrewed(JSON.parse(recent))
      }
    }
  }, [])

  // Filter recipes based on search and filters
  React.useEffect(() => {
    let filtered = recipes

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(recipe => 
        recipe.name.toLowerCase().includes(query) ||
        recipe.bean_name.toLowerCase().includes(query) ||
        recipe.notes.toLowerCase().includes(query) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Method filter
    if (methodFilter !== "all") {
      filtered = filtered.filter(recipe => recipe.brewing_method === methodFilter)
    }

    // Rating filter
    if (ratingFilter !== "all") {
      filtered = filtered.filter(recipe => recipe.rating !== undefined && recipe.rating >= ratingFilter)
    }

    // Roast filter
    if (roastFilter !== "all") {
      filtered = filtered.filter(recipe => recipe.roast_level === roastFilter)
    }

    // Bean filter
    if (beanFilter !== "all") {
      filtered = filtered.filter(recipe => recipe.bean_name === beanFilter)
    }

    onFilteredRecipes(filtered)
  }, [searchQuery, methodFilter, ratingFilter, roastFilter, beanFilter, recipes])

  const clearFilters = () => {
    setSearchQuery("")
    setMethodFilter("all")
    setRatingFilter("all")
    setRoastFilter("all")
    setBeanFilter("all")
    setShowFilters(false)
  }

  const hasActiveFilters = searchQuery || methodFilter !== "all" || ratingFilter !== "all" || roastFilter !== "all" || beanFilter !== "all"

  // Get favorite recipes (4-5 star ratings)
  const favoriteRecipes = recipes.filter(recipe => recipe.rating && recipe.rating >= 4).slice(0, 3)

  // Get recently brewed recipes
  const recentRecipes = recipes
    .filter(recipe => recentlyBrewed.includes(recipe.id))
    .slice(0, 3)

  const handleQuickBrew = (recipe: Recipe) => {
    // Add to recently brewed
    const updated = [recipe.id, ...recentlyBrewed.filter(id => id !== recipe.id)].slice(0, 10)
    setRecentlyBrewed(updated)
    localStorage.setItem('recently-brewed', JSON.stringify(updated))
    
    onQuickBrew(recipe)
  }

  const formatBrewingMethod = (method: string) => {
    return method
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="bg-stone-50 border-stone-200 rounded-2xl shadow-sm">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
              <Input
                placeholder="Search recipes, beans, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-stone-300 focus:border-stone-500"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded-xl border-stone-300 ${showFilters ? 'bg-stone-100' : ''}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="rounded-xl text-stone-600 hover:text-stone-800"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div>
                <label className="text-sm font-medium text-stone-700 mb-2 block">
                  Brewing Method
                </label>
                <Select value={methodFilter} onValueChange={(value) => setMethodFilter(value as any)}>
                  <SelectTrigger className="rounded-xl border-stone-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="pour_over">Pour Over</SelectItem>
                    <SelectItem value="espresso">Espresso</SelectItem>
                    <SelectItem value="french_press">French Press</SelectItem>
                    <SelectItem value="aeropress">AeroPress</SelectItem>
                    <SelectItem value="v60">V60</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-stone-700 mb-2 block">
                  Minimum Rating
                </label>
                <Select value={ratingFilter.toString()} onValueChange={(value) => setRatingFilter(value === "all" ? "all" : Number(value))}>
                  <SelectTrigger className="rounded-xl border-stone-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Rating</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="2">2+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-stone-700 mb-2 block">
                  Roast Level
                </label>
                <Select value={roastFilter} onValueChange={(value) => setRoastFilter(value as any)}>
                  <SelectTrigger className="rounded-xl border-stone-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roasts</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-stone-700 mb-2 block">
                  Coffee Bean
                </label>
                <Select value={beanFilter} onValueChange={(value) => setBeanFilter(value)}>
                  <SelectTrigger className="rounded-xl border-stone-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Beans</SelectItem>
                    {coffeeBeans.map((bean) => (
                      <SelectItem key={bean.id} value={bean.name}>
                        {bean.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Quick Access Sections */}
      {!hasActiveFilters && (favoriteRecipes.length > 0 || recentRecipes.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Favorites */}
          {favoriteRecipes.length > 0 && (
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 rounded-2xl shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-amber-600" />
                  <h3 className="font-semibold text-stone-800">Your Favorites</h3>
                </div>
                <div className="space-y-2">
                  {favoriteRecipes.map((recipe) => (
                    <motion.div
                      key={recipe.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-3 bg-white bg-opacity-60 rounded-xl border border-amber-200"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-stone-800">{recipe.name}</div>
                        <div className="text-sm text-stone-600">
                          {formatBrewingMethod(recipe.brewing_method)} • {recipe.bean_name}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleQuickBrew(recipe)}
                        className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                      >
                        <Coffee className="w-3 h-3 mr-1" />
                        Brew
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recently Brewed */}
          {recentRecipes.length > 0 && (
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 rounded-2xl shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-green-600" />
                  <h3 className="font-semibold text-stone-800">Recently Brewed</h3>
                </div>
                <div className="space-y-2">
                  {recentRecipes.map((recipe) => (
                    <motion.div
                      key={recipe.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-3 bg-white bg-opacity-60 rounded-xl border border-green-200"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-stone-800">{recipe.name}</div>
                        <div className="text-sm text-stone-600">
                          {formatBrewingMethod(recipe.brewing_method)} • {recipe.bean_name}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleQuickBrew(recipe)}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                      >
                        <Coffee className="w-3 h-3 mr-1" />
                        Brew
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="bg-stone-200 text-stone-700 rounded-lg">
              Search: "{searchQuery}"
            </Badge>
          )}
          {methodFilter !== "all" && (
            <Badge variant="secondary" className="bg-stone-200 text-stone-700 rounded-lg">
              Method: {formatBrewingMethod(methodFilter)}
            </Badge>
          )}
          {ratingFilter !== "all" && (
            <Badge variant="secondary" className="bg-stone-200 text-stone-700 rounded-lg">
              Rating: {ratingFilter}+ stars
            </Badge>
          )}
          {roastFilter !== "all" && (
            <Badge variant="secondary" className="bg-stone-200 text-stone-700 rounded-lg">
              Roast: {roastFilter}
            </Badge>
          )}
          {beanFilter !== "all" && (
            <Badge variant="secondary" className="bg-stone-200 text-stone-700 rounded-lg">
              Bean: {beanFilter}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
