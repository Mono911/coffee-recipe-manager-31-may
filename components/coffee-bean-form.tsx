"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { CoffeeBeanStorage } from "@/lib/coffee-bean-storage"
import type { CoffeeBean, CreateCoffeeBeanData } from "@/types/coffee-bean"

interface CoffeeBeanFormProps {
  onSave: (bean: CreateCoffeeBeanData) => Promise<void>
  onCancel: () => void
  initialBean?: CoffeeBean | null
}

const processingOptions = [
  { value: "natural", label: "Natural" },
  { value: "washed", label: "Washed" },
  { value: "honey", label: "Honey" },
  { value: "anaerobic", label: "Anaerobic" },
  { value: "other", label: "Other" },
]

const roastOptions = [
  { value: "light", label: "Light" },
  { value: "medium-light", label: "Medium-Light" },
  { value: "medium", label: "Medium" },
  { value: "medium-dark", label: "Medium-Dark" },
  { value: "dark", label: "Dark" },
]

const acidityOptions = [
  { value: "low", label: "Low" },
  { value: "medium-low", label: "Medium-Low" },
  { value: "medium", label: "Medium" },
  { value: "medium-high", label: "Medium-High" },
  { value: "high", label: "High" },
]

const quantityUnits = [
  { value: "g", label: "Grams" },
  { value: "kg", label: "Kilograms" },
  { value: "lbs", label: "Pounds" },
  { value: "oz", label: "Ounces" },
]

export function CoffeeBeanForm({ onSave, onCancel, initialBean }: CoffeeBeanFormProps) {
  const [formData, setFormData] = useState<CreateCoffeeBeanData>({
    name: initialBean?.name || "",
    processing: initialBean?.processing || "washed",
    origin: initialBean?.origin || "",
    roast: initialBean?.roast || "medium",
    type: initialBean?.type || "single-origin",
    flavor_notes: initialBean?.flavor_notes || [],
    acidity: initialBean?.acidity || "medium",
    notes: initialBean?.notes || "",
    roast_date: initialBean?.roast_date || "",
    quantity: initialBean?.quantity || undefined,
    quantity_unit: initialBean?.quantity_unit || "g",
    price: initialBean?.price || undefined,
    currency: "EUR",
    supplier: initialBean?.supplier || "",
  })

  const [newFlavorNote, setNewFlavorNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.origin.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addFlavorNote = () => {
    if (newFlavorNote.trim() && !formData.flavor_notes.includes(newFlavorNote.trim())) {
      setFormData(prev => ({
        ...prev,
        flavor_notes: [...prev.flavor_notes, newFlavorNote.trim()]
      }))
      setNewFlavorNote("")
    }
  }

  const removeFlavorNote = (note: string) => {
    setFormData(prev => ({
      ...prev,
      flavor_notes: prev.flavor_notes.filter(n => n !== note)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addFlavorNote()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader className="text-center border-b border-stone-200">
          <CardTitle className="text-2xl font-bold text-stone-800">
            {initialBean ? "Edit Coffee Bean" : "Add New Coffee Bean"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-stone-700 font-medium">
                  Bean Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Ethiopian Yirgacheffe"
                  className="border-stone-300 focus:border-stone-500 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin" className="text-stone-700 font-medium">
                  Origin *
                </Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                  placeholder="e.g., Ethiopia, Gedeb"
                  className="border-stone-300 focus:border-stone-500 rounded-lg"
                  required
                />
              </div>
            </div>

            {/* Processing and Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium">Processing Method</Label>
                <Select 
                  value={formData.processing} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, processing: value }))}
                >
                  <SelectTrigger className="border-stone-300 focus:border-stone-500 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {processingOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-stone-700 font-medium">Roast Level</Label>
                <Select 
                  value={formData.roast} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, roast: value }))}
                >
                  <SelectTrigger className="border-stone-300 focus:border-stone-500 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roastOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-stone-700 font-medium">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="border-stone-300 focus:border-stone-500 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-origin">Single Origin</SelectItem>
                    <SelectItem value="blend">Blend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Acidity and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium">Acidity Level</Label>
                <Select 
                  value={formData.acidity} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, acidity: value }))}
                >
                  <SelectTrigger className="border-stone-300 focus:border-stone-500 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {acidityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roast_date" className="text-stone-700 font-medium">
                  Roast Date
                </Label>
                <Input
                  id="roast_date"
                  type="date"
                  value={formData.roast_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, roast_date: e.target.value }))}
                  className="border-stone-300 focus:border-stone-500 rounded-lg"
                />
              </div>
            </div>

            {/* Flavor Notes */}
            <div className="space-y-4">
              <Label className="text-stone-700 font-medium">Flavor Notes</Label>
              
              <div className="flex gap-2">
                <Input
                  value={newFlavorNote}
                  onChange={(e) => setNewFlavorNote(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a flavor note (e.g., chocolate, floral)"
                  className="border-stone-300 focus:border-stone-500 rounded-lg"
                />
                <Button
                  type="button"
                  onClick={addFlavorNote}
                  variant="outline"
                  size="icon"
                  className="border-stone-300 hover:bg-stone-100"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.flavor_notes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.flavor_notes.map((note, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-amber-100 text-amber-800 hover:bg-amber-200 px-3 py-1"
                    >
                      {note}
                      <button
                        type="button"
                        onClick={() => removeFlavorNote(note)}
                        className="ml-2 hover:text-amber-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-stone-700 font-medium">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.1"
                    value={formData.quantity || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="250"
                    className="border-stone-300 focus:border-stone-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-stone-700 font-medium">Unit</Label>
                  <Select 
                    value={formData.quantity_unit} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, quantity_unit: value }))}
                  >
                    <SelectTrigger className="border-stone-300 focus:border-stone-500 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {quantityUnits.map(unit => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-stone-700 font-medium">
                  Price (EUR)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="25.00"
                  className="border-stone-300 focus:border-stone-500 rounded-lg"
                />
              </div>
            </div>

            {/* Supplier and Notes */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-stone-700 font-medium">
                  Supplier
                </Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                  placeholder="e.g., Local Coffee Roasters"
                  className="border-stone-300 focus:border-stone-500 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-stone-700 font-medium">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes about this coffee..."
                  className="border-stone-300 focus:border-stone-500 rounded-lg min-h-[100px]"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-stone-200">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-stone-300 text-stone-700 hover:bg-stone-100 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name.trim() || !formData.origin.trim()}
                className="flex-1 bg-stone-700 hover:bg-stone-800 text-white rounded-lg"
              >
                {isSubmitting ? "Saving..." : initialBean ? "Update Bean" : "Add Bean"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
