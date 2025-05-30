"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, DollarSign, Package, MapPin, Coffee, Thermometer, Droplets, Edit, Trash2 } from "lucide-react"
import type { CoffeeBean } from "@/types/coffee-bean"

interface CoffeeBeanDetailProps {
  bean: CoffeeBean
  onBack: () => void
  onEdit: (bean: CoffeeBean) => void
  onDelete: (id: string) => void
}

export function CoffeeBeanDetail({ bean, onBack, onEdit, onDelete }: CoffeeBeanDetailProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified"
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return "Invalid date"
    }
  }

  const getProcessingColor = (processing?: string) => {
    switch (processing) {
      case 'natural': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'washed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'honey': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'anaerobic': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoastColor = (roast: string) => {
    switch (roast) {
      case 'light': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium-light': return 'bg-orange-200 text-orange-900 border-orange-300'
      case 'medium': return 'bg-amber-200 text-amber-900 border-amber-300'
      case 'medium-dark': return 'bg-stone-200 text-stone-900 border-stone-300'
      case 'dark': return 'bg-stone-800 text-stone-100 border-stone-700'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAcidityColor = (acidity?: string) => {
    switch (acidity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium-low': return 'bg-green-200 text-green-900 border-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'medium-high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'single-origin': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'blend': return 'bg-violet-100 text-violet-800 border-violet-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -300 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2 border-stone-300 text-stone-700 hover:bg-stone-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </Button>
        
        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(bean)}
            className="flex items-center gap-2 border-stone-300 text-stone-700 hover:bg-stone-100"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(bean.id)}
            className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader className="text-center border-b border-stone-200 pb-6">
          <CardTitle className="text-3xl font-bold text-stone-800 mb-2">
            {bean.name}
          </CardTitle>
          <div className="flex items-center justify-center gap-2 text-stone-600">
            <MapPin className="w-4 h-4" />
            <span className="text-lg">{bean.origin}</span>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {/* Primary Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coffee className="w-5 h-5 text-stone-600" />
                <span className="text-stone-600 font-medium">Type</span>
              </div>
              <Badge className={`text-sm px-4 py-2 ${getTypeColor(bean.type)}`}>
                {bean.type === 'single-origin' ? 'Single Origin' : 'Blend'}
              </Badge>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Thermometer className="w-5 h-5 text-stone-600" />
                <span className="text-stone-600 font-medium">Roast</span>
              </div>
              <Badge className={`text-sm px-4 py-2 ${getRoastColor(bean.roast || 'medium')}`}>
                {(bean.roast || 'medium').charAt(0).toUpperCase() + (bean.roast || 'medium').slice(1)} Roast
              </Badge>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Droplets className="w-5 h-5 text-stone-600" />
                <span className="text-stone-600 font-medium">Processing</span>
              </div>
              {bean.processing_method && (
                <Badge className={`text-sm px-4 py-2 ${getProcessingColor(bean.processing_method)}`}>
                  {bean.processing_method.charAt(0).toUpperCase() + bean.processing_method.slice(1)}
                </Badge>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Detailed Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Flavor Profile */}
              <div>
                <h3 className="text-lg font-semibold text-stone-800 mb-3">Flavor Profile</h3>
                
                {bean.acidity && (
                  <div className="mb-4">
                    <span className="text-stone-600 text-sm font-medium">Acidity Level:</span>
                    <div className="mt-1">
                      <Badge className={`text-sm ${getAcidityColor(bean.acidity)}`}>
                        {bean.acidity.charAt(0).toUpperCase() + bean.acidity.slice(1)} Acidity
                      </Badge>
                    </div>
                  </div>
                )}

                {bean.flavor_notes && bean.flavor_notes.length > 0 && (
                  <div>
                    <span className="text-stone-600 text-sm font-medium">Flavor Notes:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {bean.flavor_notes.map((note, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-sm bg-amber-50 text-amber-700 border border-amber-200"
                        >
                          {note}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {bean.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-stone-800 mb-3">Notes</h3>
                  <p className="text-stone-600 leading-relaxed">{bean.notes}</p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Purchase Information */}
              <div>
                <h3 className="text-lg font-semibold text-stone-800 mb-3">Details</h3>
                <div className="space-y-3">
                  {bean.roast_date && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-stone-500" />
                      <div>
                        <span className="text-stone-600 text-sm">Roast Date:</span>
                        <div className="text-stone-800 font-medium">{formatDate(bean.roast_date)}</div>
                      </div>
                    </div>
                  )}

                  {bean.quantity_g && (
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-stone-500" />
                      <div>
                        <span className="text-stone-600 text-sm">Quantity:</span>
                        <div className="text-stone-800 font-medium">
                          {bean.quantity_g} {bean.quantity_unit || 'g'}
                        </div>
                      </div>
                    </div>
                  )}

                  {bean.price_per_kg && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-stone-500" />
                      <div>
                        <span className="text-stone-600 text-sm">Price per kg:</span>
                        <div className="text-stone-800 font-medium">€{bean.price_per_kg}</div>
                      </div>
                    </div>
                  )}

                  {bean.supplier && (
                    <div className="flex items-center gap-3">
                      <Coffee className="w-5 h-5 text-stone-500" />
                      <div>
                        <span className="text-stone-600 text-sm">Supplier:</span>
                        <div className="text-stone-800 font-medium">{bean.supplier}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-stone-50 rounded-lg p-4">
                <h4 className="text-stone-700 font-medium mb-3">Quick Facts</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Type:</span>
                    <span className="text-stone-800 font-medium">
                      {bean.type === 'single-origin' ? 'Single Origin' : 'Blend'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Roast:</span>
                    <span className="text-stone-800 font-medium capitalize">{bean.roast || 'medium'}</span>
                  </div>
                  {bean.processing_method && (
                    <div className="flex justify-between">
                      <span className="text-stone-600">Processing:</span>
                      <span className="text-stone-800 font-medium capitalize">{bean.processing_method}</span>
                    </div>
                  )}
                  {bean.acidity && (
                    <div className="flex justify-between">
                      <span className="text-stone-600">Acidity:</span>
                      <span className="text-stone-800 font-medium capitalize">{bean.acidity}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
