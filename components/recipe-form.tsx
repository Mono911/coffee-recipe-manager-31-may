"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { CoffeeBeanStorage } from "@/lib/coffee-bean-storage"
import type { CoffeeBean } from "@/types/coffee-bean"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Star, X } from "lucide-react"
import type { Recipe, BrewingMethod } from "@/types/recipe"

interface RecipeFormProps {
  onSave: (recipe: Omit<Recipe, "id" | "created_at" | "updated_at">) => Promise<void>
  onCancel: () => void
  initialRecipe?: Recipe | null
}

export function RecipeForm({ onSave, onCancel, initialRecipe }: RecipeFormProps) {
  const isMobile = useIsMobile()
  const [formData, setFormData] = useState({
    name: "",
    brewing_method: "pour_over" as BrewingMethod,
    coffee_bean_id: "",
    bean_name: "",
    bean_quantity_g: "",
    water_temp_c: "",
    grind_setting: "",
    water_ratio: "",
    brew_time_seconds: "",
    pressure_bar: "",
    shot_time_seconds: "",
    tamping_pressure: "",
    steeping_time_seconds: "",
    plunge_technique: "",
    pour_pattern: "",
    bloom_time_seconds: "",
    rating: null as number | null,
    tags: [] as string[],
    notes: "",
    roast_level: "" as "light" | "medium" | "dark" | "",
  })

  const [newTag, setNewTag] = useState("")
  const [coffeeBeans, setCoffeeBeans] = useState<CoffeeBean[]>([])
  const [loadingBeans, setLoadingBeans] = useState(false)

  useEffect(() => {
    if (initialRecipe) {
      setFormData({
        name: initialRecipe.name,
        brewing_method: initialRecipe.brewing_method,
        coffee_bean_id: initialRecipe.coffee_bean_id || "",
        bean_name: initialRecipe.bean_name,
        bean_quantity_g: initialRecipe.bean_quantity_g.toString(),
        water_temp_c: initialRecipe.water_temp_c.toString(),
        grind_setting: initialRecipe.grind_setting,
        water_ratio: initialRecipe.water_ratio || "",
        brew_time_seconds: initialRecipe.brew_time_seconds?.toString() || "",
        pressure_bar: initialRecipe.pressure_bar?.toString() || "",
        shot_time_seconds: initialRecipe.shot_time_seconds?.toString() || "",
        tamping_pressure: initialRecipe.tamping_pressure || "",
        steeping_time_seconds: initialRecipe.steeping_time_seconds?.toString() || "",
        plunge_technique: initialRecipe.plunge_technique || "",
        pour_pattern: initialRecipe.pour_pattern || "",
        bloom_time_seconds: initialRecipe.bloom_time_seconds?.toString() || "",
                  rating: initialRecipe.rating ?? null,
        tags: initialRecipe.tags,
        notes: initialRecipe.notes,
        roast_level: initialRecipe.roast_level || "",
      })
    }
  }, [initialRecipe])

  // Load coffee beans
  useEffect(() => {
    const loadCoffeeBeans = async () => {
      setLoadingBeans(true)
      try {
        const beans = await CoffeeBeanStorage.getBeans()
        setCoffeeBeans(beans)
      } catch (error) {
        console.error('Failed to load coffee beans:', error)
      } finally {
        setLoadingBeans(false)
      }
    }
    loadCoffeeBeans()
  }, [])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    // Validate required fields
    const requiredFields = {
      name: formData.name.trim(),
      bean_name: formData.bean_name.trim(),
      brewing_method: formData.brewing_method,
      bean_quantity_g: formData.bean_quantity_g.trim(),
      water_temp_c: formData.water_temp_c.trim(),
      grind_setting: formData.grind_setting.trim()
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value === '')
      .map(([key]) => key)

    if (missingFields.length > 0) {
      const fieldNames = {
        name: 'Recipe Name',
        bean_name: 'Bean Name',
        brewing_method: 'Brewing Method',
        bean_quantity_g: 'Bean Quantity',
        water_temp_c: 'Water Temperature',
        grind_setting: 'Grind Setting'
      }
      const missingFieldNames = missingFields.map(field => fieldNames[field as keyof typeof fieldNames])
      setSubmitError(`Please fill in the required fields: ${missingFieldNames.join(', ')}`)
      setIsSubmitting(false)
      return
    }

    const recipe = {
      name: formData.name,
      brewing_method: formData.brewing_method,
      coffee_bean_id: formData.coffee_bean_id || undefined,
      bean_name: formData.bean_name,
      bean_quantity_g: Number.parseFloat(formData.bean_quantity_g),
      water_temp_c: Number.parseFloat(formData.water_temp_c),
      grind_setting: formData.grind_setting,
      water_ratio: formData.water_ratio || undefined,
      brew_time_seconds: formData.brew_time_seconds ? Number.parseInt(formData.brew_time_seconds) : undefined,
      pressure_bar: formData.pressure_bar ? Number.parseFloat(formData.pressure_bar) : undefined,
      shot_time_seconds: formData.shot_time_seconds ? Number.parseInt(formData.shot_time_seconds) : undefined,
      tamping_pressure: formData.tamping_pressure || undefined,
      steeping_time_seconds: formData.steeping_time_seconds
        ? Number.parseInt(formData.steeping_time_seconds)
        : undefined,
      plunge_technique: formData.plunge_technique || undefined,
      pour_pattern: formData.pour_pattern || undefined,
      bloom_time_seconds: formData.bloom_time_seconds ? Number.parseInt(formData.bloom_time_seconds) : undefined,
      rating: formData.rating ?? undefined,
      tags: formData.tags,
      notes: formData.notes,
      roast_level: formData.roast_level || undefined,
    }

    try {
      await onSave(recipe)
    } catch (error) {
      console.error('Failed to save recipe:', error)
      setSubmitError('Failed to save recipe. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const renderMethodSpecificFields = () => {
    const fields = (() => {
      switch (formData.brewing_method) {
        case "espresso":
          return (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pressure_bar" className="text-stone-700">
                    Pressure (bar)
                  </Label>
                  <Input
                    id="pressure_bar"
                    type="number"
                    step="0.1"
                    value={formData.pressure_bar}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pressure_bar: e.target.value }))}
                    placeholder="9.0"
                    className="rounded-xl border-stone-300 focus:border-stone-500"
                  />
                </div>
                <div>
                  <Label htmlFor="shot_time_seconds" className="text-stone-700">
                    Shot Time (seconds)
                  </Label>
                  <Input
                    id="shot_time_seconds"
                    type="number"
                    value={formData.shot_time_seconds}
                    onChange={(e) => setFormData((prev) => ({ ...prev, shot_time_seconds: e.target.value }))}
                    placeholder="25"
                    className="rounded-xl border-stone-300 focus:border-stone-500"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="tamping_pressure" className="text-stone-700">
                  Tamping Technique
                </Label>
                <Input
                  id="tamping_pressure"
                  value={formData.tamping_pressure}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tamping_pressure: e.target.value }))}
                  placeholder="30lbs, level tamp"
                  className="rounded-xl border-stone-300 focus:border-stone-500"
                />
              </div>
            </>
          )
        case "french_press":
          return (
            <>
              <div>
                <Label htmlFor="steeping_time_seconds" className="text-stone-700">
                  Steeping Time (seconds)
                </Label>
                <Input
                  id="steeping_time_seconds"
                  type="number"
                  value={formData.steeping_time_seconds}
                  onChange={(e) => setFormData((prev) => ({ ...prev, steeping_time_seconds: e.target.value }))}
                  placeholder="240"
                  className="rounded-xl border-stone-300 focus:border-stone-500"
                />
              </div>
              <div>
                <Label htmlFor="plunge_technique" className="text-stone-700">
                  Plunge Technique
                </Label>
                <Input
                  id="plunge_technique"
                  value={formData.plunge_technique}
                  onChange={(e) => setFormData((prev) => ({ ...prev, plunge_technique: e.target.value }))}
                  placeholder="Slow, steady pressure"
                  className="rounded-xl border-stone-300 focus:border-stone-500"
                />
              </div>
            </>
          )
        case "pour_over":
        case "v60":
          return (
            <>
              <div>
                <Label htmlFor="pour_pattern" className="text-stone-700">
                  Pour Pattern
                </Label>
                <Input
                  id="pour_pattern"
                  value={formData.pour_pattern}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pour_pattern: e.target.value }))}
                  placeholder="Center spiral, 3 pours"
                  className="rounded-xl border-stone-300 focus:border-stone-500"
                />
              </div>
              <div>
                <Label htmlFor="bloom_time_seconds" className="text-stone-700">
                  Bloom Time (seconds)
                </Label>
                <Input
                  id="bloom_time_seconds"
                  type="number"
                  value={formData.bloom_time_seconds}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bloom_time_seconds: e.target.value }))}
                  placeholder="30"
                  className="rounded-xl border-stone-300 focus:border-stone-500"
                />
              </div>
            </>
          )
        default:
          return null
      }
    })()

    return (
      <motion.div
        key={formData.brewing_method}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {fields}
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <Card className="bg-stone-50 border-stone-200 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-stone-800">
            Recipe Details
            {initialRecipe && initialRecipe.name.includes('(Copy)') && (
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 rounded-lg">
                Duplicating Recipe
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Recipe Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-stone-700">
                  Recipe Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Morning Blend V60"
                  required
                  className="rounded-xl border-stone-300 focus:border-stone-500 focus-visible:ring-stone-500"
                />
              </div>

              {/* Brewing Method Tabs */}
              <div>
                <Label className="text-stone-700">Brewing Method *</Label>
                <Tabs
                  value={formData.brewing_method}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, brewing_method: value as BrewingMethod }))
                  }
                  className="mt-2"
                >
                  {isMobile ? (
                    <div className="space-y-2">
                      <TabsList className="grid w-full grid-cols-3 gap-1 h-auto p-1 bg-stone-200 rounded-xl">
                        <TabsTrigger
                          value="pour_over"
                          className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-stone-800 text-xs py-3 px-2"
                          aria-controls="method-fields"
                        >
                          Pour Over
                        </TabsTrigger>
                        <TabsTrigger
                          value="espresso"
                          className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-stone-800 text-xs py-3 px-2"
                          aria-controls="method-fields"
                        >
                          Espresso
                        </TabsTrigger>
                        <TabsTrigger
                          value="v60"
                          className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-stone-800 text-xs py-3 px-2"
                          aria-controls="method-fields"
                        >
                          V60
                        </TabsTrigger>
                      </TabsList>
                      <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1 bg-stone-200 rounded-xl">
                        <TabsTrigger
                          value="french_press"
                          className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-stone-800 text-xs py-3 px-2"
                          aria-controls="method-fields"
                        >
                          French Press
                        </TabsTrigger>
                        <TabsTrigger
                          value="aeropress"
                          className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-stone-800 text-xs py-3 px-2"
                          aria-controls="method-fields"
                        >
                          AeroPress
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  ) : (
                    <TabsList className="grid w-full grid-cols-5 bg-stone-200 rounded-xl">
                      <TabsTrigger
                        value="pour_over"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-stone-800"
                        aria-controls="method-fields"
                      >
                        Pour Over
                      </TabsTrigger>
                      <TabsTrigger
                        value="espresso"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-stone-800"
                        aria-controls="method-fields"
                      >
                        Espresso
                      </TabsTrigger>
                      <TabsTrigger
                        value="french_press"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-stone-800"
                        aria-controls="method-fields"
                      >
                        French Press
                      </TabsTrigger>
                      <TabsTrigger
                        value="aeropress"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-stone-800"
                        aria-controls="method-fields"
                      >
                        AeroPress
                      </TabsTrigger>
                      <TabsTrigger
                        value="v60"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-stone-800"
                        aria-controls="method-fields"
                      >
                        V60
                      </TabsTrigger>
                    </TabsList>
                  )}
                </Tabs>
              </div>

              {/* Coffee Bean Selection */}
              <div>
                <Label className="text-stone-700">Coffee Bean</Label>
                <div className="mt-2">
                  <Select
                    value={formData.coffee_bean_id}
                    onValueChange={(value) => {
                      const selectedBean = coffeeBeans.find(bean => bean.id === value)
                      const mapRoastLevel = (roast: string) => {
                        if (roast === 'medium-light' || roast === 'medium-dark') return 'medium'
                        if (['light', 'medium', 'dark'].includes(roast)) return roast as 'light' | 'medium' | 'dark'
                        return ''
                      }
                      setFormData((prev) => ({
                        ...prev,
                        coffee_bean_id: value,
                        bean_name: selectedBean ? selectedBean.name : prev.bean_name,
                        roast_level: selectedBean ? mapRoastLevel(selectedBean.roast) : prev.roast_level
                      }))
                    }}
                  >
                    <SelectTrigger className="rounded-xl border-stone-300 focus:border-stone-500">
                      <SelectValue placeholder={loadingBeans ? "Loading beans..." : "Select a coffee bean or enter manually"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {coffeeBeans.map((bean) => (
                        <SelectItem key={bean.id} value={bean.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{bean.name}</span>
                            <span className="text-xs text-stone-500">{bean.origin} • {bean.roast} roast</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Universal Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bean_name" className="text-stone-700">
                    Bean Name * {formData.coffee_bean_id && <span className="text-xs text-stone-500">(or enter manually)</span>}
                  </Label>
                  <Input
                    id="bean_name"
                    value={formData.bean_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bean_name: e.target.value }))}
                    placeholder="Ethiopian Yirgacheffe"
                    required
                    className="rounded-xl border-stone-300 focus:border-stone-500"
                  />
                </div>
                <div>
                  <Label htmlFor="roast_level" className="text-stone-700">
                    Roast Level
                  </Label>
                  <Select
                    value={formData.roast_level}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, roast_level: value as any }))}
                  >
                    <SelectTrigger className="rounded-xl border-stone-300 focus:border-stone-500">
                      <SelectValue placeholder="Select roast" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bean_quantity_g" className="text-stone-700">
                    Bean Quantity (g) *
                  </Label>
                  <Input
                    id="bean_quantity_g"
                    type="number"
                    step="0.1"
                    value={formData.bean_quantity_g}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bean_quantity_g: e.target.value }))}
                    placeholder="22.0"
                    required
                    className="rounded-xl border-stone-300 focus:border-stone-500"
                  />
                </div>
                <div>
                  <Label htmlFor="water_temp_c" className="text-stone-700">
                    Water Temperature (°C) *
                  </Label>
                  <Input
                    id="water_temp_c"
                    type="number"
                    value={formData.water_temp_c}
                    onChange={(e) => setFormData((prev) => ({ ...prev, water_temp_c: e.target.value }))}
                    placeholder="93"
                    required
                    className="rounded-xl border-stone-300 focus:border-stone-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grind_setting" className="text-stone-700">
                    Grind Setting *
                  </Label>
                  <Input
                    id="grind_setting"
                    value={formData.grind_setting}
                    onChange={(e) => setFormData((prev) => ({ ...prev, grind_setting: e.target.value }))}
                    placeholder="Medium-fine (Baratza 15)"
                    required
                    className="rounded-xl border-stone-300 focus:border-stone-500"
                  />
                </div>
                <div>
                  <Label htmlFor="water_ratio" className="text-stone-700">
                    Water Ratio
                  </Label>
                  <Input
                    id="water_ratio"
                    value={formData.water_ratio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, water_ratio: e.target.value }))}
                    placeholder="1:15"
                    className="rounded-xl border-stone-300 focus:border-stone-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="brew_time_seconds" className="text-stone-700">
                  Total Brew Time (seconds)
                </Label>
                <Input
                  id="brew_time_seconds"
                  type="number"
                  value={formData.brew_time_seconds}
                  onChange={(e) => setFormData((prev) => ({ ...prev, brew_time_seconds: e.target.value }))}
                  placeholder="180"
                  className="rounded-xl border-stone-300 focus:border-stone-500"
                />
              </div>

              {/* Method-Specific Fields */}
              <div id="method-fields">{renderMethodSpecificFields()}</div>

              {/* Rating */}
              <div>
                <Label className="text-stone-700">Rating (Optional)</Label>
                <div className="flex gap-1 mt-2" role="radiogroup" aria-label="Recipe rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, rating: star === prev.rating ? null : star }))}
                      className="p-1 rounded-lg hover:bg-stone-200 transition-colors"
                      role="radio"
                      aria-checked={star === formData.rating}
                      aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                    >
                      <Star
                        className={`w-6 h-6 ${formData.rating != null && star <= formData.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label className="text-stone-700">Tags</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="rounded-xl border-stone-300 focus:border-stone-500"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    variant="outline"
                    className="rounded-xl border-stone-300 hover:bg-stone-100"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1 bg-stone-200 text-stone-700 rounded-lg"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-stone-300 rounded-full p-0.5"
                        aria-label={`Remove ${tag} tag`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-stone-700">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional brewing notes, taste profile, adjustments..."
                  rows={3}
                  className="rounded-xl border-stone-300 focus:border-stone-500"
                />
              </div>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {submitError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-stone-700 hover:bg-stone-800 disabled:bg-stone-400 text-white rounded-xl px-6 py-3"
              >
                {isSubmitting ? "Saving..." : initialRecipe ? "Update Recipe" : "Save Recipe"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 rounded-xl border-stone-300 hover:bg-stone-100 disabled:opacity-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
