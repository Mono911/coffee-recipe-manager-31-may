"use client"

import { motion } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Calendar, DollarSign, Package } from "lucide-react"
import type { CoffeeBean } from "@/types/coffee-bean"
import { CoffeeBeanStorage } from "@/lib/coffee-bean-storage"

interface CoffeeBeanListProps {
  beans: CoffeeBean[]
  onEdit: (bean: CoffeeBean) => void
  onDelete: (id: string) => void
  onSelect?: (bean: CoffeeBean) => void
  selectable?: boolean
  selectedBeanId?: string
}

export function CoffeeBeanList({ 
  beans, 
  onEdit, 
  onDelete, 
  onSelect,
  selectable = false,
  selectedBeanId
}: CoffeeBeanListProps) {
  const isMobile = useIsMobile()
  if (beans.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="text-stone-400 text-lg mb-4">☕</div>
        <h3 className="text-stone-600 text-lg font-medium mb-2">No coffee beans yet</h3>
        <p className="text-stone-500">Add your first coffee bean to get started!</p>
      </motion.div>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return null
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return null
    }
  }

  const getProcessingColor = (processing: string) => {
    switch (processing) {
      case 'natural': return 'bg-amber-100 text-amber-800'
      case 'washed': return 'bg-blue-100 text-blue-800'
      case 'honey': return 'bg-yellow-100 text-yellow-800'
      case 'anaerobic': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoastColor = (roast: string) => {
    switch (roast) {
      case 'light': return 'bg-orange-100 text-orange-800'
      case 'medium-light': return 'bg-orange-200 text-orange-900'
      case 'medium': return 'bg-amber-200 text-amber-900'
      case 'medium-dark': return 'bg-stone-200 text-stone-900'
      case 'dark': return 'bg-stone-800 text-stone-100'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAcidityColor = (acidity: string) => {
    switch (acidity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium-low': return 'bg-green-200 text-green-900'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'medium-high': return 'bg-orange-100 text-orange-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
      {beans.map((bean, index) => (
        <motion.div
          key={bean.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card 
            className={`
              bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 cursor-pointer
              ${selectable && selectedBeanId === bean.id ? 'ring-2 ring-stone-500 bg-stone-50' : ''}
              ${selectable ? 'hover:ring-2 hover:ring-stone-300' : ''}
            `}
            onClick={() => selectable && onSelect?.(bean)}
          >
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-800 mb-1">{bean.name}</h3>
                  <p className="text-stone-600 text-sm">{bean.origin}</p>
                </div>
                {bean.type === 'blend' && (
                  <Badge variant="outline" className="text-xs">
                    Blend
                  </Badge>
                )}
              </div>

              {/* Processing and Roast */}
              <div className="flex gap-2 mb-4">
                <Badge className={`text-xs ${getProcessingColor(bean.processing)}`}>
                  {bean.processing}
                </Badge>
                <Badge className={`text-xs ${getRoastColor(bean.roast)}`}>
                  {bean.roast} roast
                </Badge>
                <Badge className={`text-xs ${getAcidityColor(bean.acidity)}`}>
                  {bean.acidity} acidity
                </Badge>
              </div>

              {/* Flavor Notes */}
              {bean.flavor_notes.length > 0 && (
                <div className="mb-4">
                  <p className="text-stone-700 text-sm font-medium mb-2">Flavor Notes:</p>
                  <div className="flex flex-wrap gap-1">
                    {bean.flavor_notes.slice(0, 4).map((note, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-amber-50 text-amber-700">
                        {note}
                      </Badge>
                    ))}
                    {bean.flavor_notes.length > 4 && (
                      <Badge variant="secondary" className="text-xs bg-stone-100 text-stone-600">
                        +{bean.flavor_notes.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="space-y-2 mb-4 text-sm text-stone-600">
                {bean.roast_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Roasted: {formatDate(bean.roast_date)}</span>
                  </div>
                )}
                
                {bean.quantity && (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span>{bean.quantity} {bean.quantity_unit}</span>
                  </div>
                )}
                
                {bean.price && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>€{bean.price}</span>
                  </div>
                )}
                
                {bean.supplier && (
                  <div className="text-xs text-stone-500">
                    from {bean.supplier}
                  </div>
                )}
              </div>

              {/* Notes */}
              {bean.notes && (
                <div className="mb-4">
                  <p className="text-stone-600 text-sm line-clamp-2">{bean.notes}</p>
                </div>
              )}

              {/* Actions */}
              {!selectable && (
                <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'gap-2'} pt-4 border-t border-stone-200`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(bean)
                    }}
                    className="flex-1 border-stone-300 text-stone-700 hover:bg-stone-100"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(bean.id)
                    }}
                    className={`border-red-300 text-red-600 hover:bg-red-50 ${isMobile ? '' : 'w-auto'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    {isMobile && <span className="ml-2">Delete</span>}
                  </Button>
                </div>
              )}

              {/* Selection indicator */}
              {selectable && selectedBeanId === bean.id && (
                <div className="mt-4 text-center">
                  <Badge className="bg-stone-600 text-white">
                    Selected
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
