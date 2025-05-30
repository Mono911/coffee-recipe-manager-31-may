"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Clock, Coffee, Droplets, Check } from "lucide-react"
import type { Recipe } from "@/types/recipe"

interface BrewingTimerProps {
  recipe: Recipe
  onClose: () => void
}

interface BrewingStep {
  id: string
  name: string
  duration: number
  description: string
  isCompleted: boolean
}

export function BrewingTimer({ recipe, onClose }: BrewingTimerProps) {
  const isMobile = useIsMobile()
  const [steps, setSteps] = useState<BrewingStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [totalElapsed, setTotalElapsed] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Generate brewing steps based on recipe method
    const generatedSteps = generateBrewingSteps(recipe)
    setSteps(generatedSteps)
    if (generatedSteps.length > 0) {
      setTimeRemaining(generatedSteps[0].duration)
    }
  }, [recipe])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          const newTime = time - 1
          setTotalElapsed((elapsed) => elapsed + 1)
          
          if (newTime === 0) {
            // Step completed - play notification
            playNotification()
            completeCurrentStep()
          }
          
          return newTime
        })
      }, 1000)
    } else if (timeRemaining === 0 && currentStepIndex < steps.length - 1) {
      // Move to next step
      const nextStep = currentStepIndex + 1
      setCurrentStepIndex(nextStep)
      setTimeRemaining(steps[nextStep].duration)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeRemaining, currentStepIndex, steps])

  const generateBrewingSteps = (recipe: Recipe): BrewingStep[] => {
    const steps: BrewingStep[] = []

    // Universal preparation step
    steps.push({
      id: "prep",
      name: "Preparation",
      duration: 60,
      description: `Heat water to ${recipe.water_temp_c}°C. Weigh ${recipe.bean_quantity_g}g of ${recipe.bean_name}. Set grinder to ${recipe.grind_setting}.`,
      isCompleted: false
    })

    // Method-specific steps
    switch (recipe.brewing_method) {
      case "pour_over":
      case "v60":
        if (recipe.bloom_time_seconds) {
          steps.push({
            id: "bloom",
            name: "Bloom",
            duration: recipe.bloom_time_seconds,
            description: `Pour 2x coffee weight in water (${(recipe.bean_quantity_g * 2).toFixed(0)}g). Wait for bloom.`,
            isCompleted: false
          })
        }
        
        const remainingBrewTime = (recipe.brew_time_seconds || 180) - (recipe.bloom_time_seconds || 0)
        steps.push({
          id: "main_pour",
          name: "Main Pour",
          duration: remainingBrewTime,
          description: recipe.pour_pattern || "Continue pouring in circular motions until target weight reached.",
          isCompleted: false
        })
        break

      case "french_press":
        steps.push({
          id: "steep",
          name: "Steeping",
          duration: recipe.steeping_time_seconds || 240,
          description: "Add all water, stir gently, place lid on top. Do not plunge yet.",
          isCompleted: false
        })
        
        steps.push({
          id: "plunge",
          name: "Plunge",
          duration: 30,
          description: recipe.plunge_technique || "Press plunger down slowly and steadily.",
          isCompleted: false
        })
        break

      case "espresso":
        steps.push({
          id: "tamp",
          name: "Tamp & Load",
          duration: 30,
          description: recipe.tamping_pressure || "Tamp evenly with 30lbs pressure. Lock portafilter.",
          isCompleted: false
        })
        
        steps.push({
          id: "extraction",
          name: "Extraction",
          duration: recipe.shot_time_seconds || 25,
          description: `Extract at ${recipe.pressure_bar || 9} bar pressure. Watch for honey-like flow.`,
          isCompleted: false
        })
        break

      case "aeropress":
        steps.push({
          id: "brew",
          name: "Brewing",
          duration: (recipe.brew_time_seconds || 120) - 30,
          description: "Add water, stir gently. Let steep.",
          isCompleted: false
        })
        
        steps.push({
          id: "press",
          name: "Press",
          duration: 30,
          description: "Press down slowly for 30 seconds.",
          isCompleted: false
        })
        break

      default:
        steps.push({
          id: "brew",
          name: "Brewing",
          duration: recipe.brew_time_seconds || 180,
          description: "Follow your brewing technique.",
          isCompleted: false
        })
    }

    return steps
  }

  const playNotification = () => {
    // Create a simple beep sound using Web Audio API
    if (typeof window !== 'undefined') {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }
  }

  const completeCurrentStep = () => {
    setSteps(prev => prev.map((step, index) => 
      index === currentStepIndex 
        ? { ...step, isCompleted: true }
        : step
    ))
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setCurrentStepIndex(0)
    setTimeRemaining(steps[0]?.duration || 0)
    setTotalElapsed(0)
    setSteps(prev => prev.map(step => ({ ...step, isCompleted: false })))
  }

  const skipToStep = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex)
    setTimeRemaining(steps[stepIndex].duration)
    setIsRunning(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTotalTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const remainingSecs = seconds % 60
    return `${mins}m ${remainingSecs}s`
  }

  const currentStep = steps[currentStepIndex]
  const progress = currentStep ? ((currentStep.duration - timeRemaining) / currentStep.duration) * 100 : 0
  const isComplete = currentStepIndex >= steps.length || steps.every(step => step.isCompleted)

  if (steps.length === 0) {
    return (
      <Card className="bg-stone-50 border-stone-200 rounded-2xl shadow-sm">
        <CardContent className="p-6 text-center">
          <div className="text-stone-600">Loading brewing steps...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${isMobile ? 'max-w-sm px-4' : 'max-w-md'} mx-auto space-y-4`}
    >
      {/* Header */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'justify-between items-start'}`}>
            <div>
              <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} text-stone-800`}>{recipe.name}</CardTitle>
              <div className={`flex ${isMobile ? 'flex-col space-y-1' : 'items-center gap-2'} mt-1`}>
                <Badge variant="outline" className="text-xs border-stone-300 text-stone-600 w-fit">
                  {recipe.brewing_method.replace('_', ' ')}
                </Badge>
                <span className="text-sm text-stone-600">Total: {formatTotalTime(totalElapsed)}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className={`text-stone-600 hover:text-stone-800 ${isMobile ? 'self-end -mt-8' : ''}`}
            >
              ✕
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Current Step */}
      <Card className="bg-stone-50 border-stone-200 rounded-2xl shadow-sm">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {!isComplete ? (
              <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-4"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-stone-800">
                    {currentStep.name}
                  </h3>
                  <p className="text-stone-600 text-sm">
                    {currentStep.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-mono font-bold text-amber-600`}>
                    {formatTime(timeRemaining)}
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-center gap-3'}`}>
                  <Button
                    onClick={toggleTimer}
                    className={`rounded-xl ${isMobile ? 'py-3' : 'px-6 py-3'} ${
                      isRunning 
                        ? "bg-orange-600 hover:bg-orange-700" 
                        : "bg-green-600 hover:bg-green-700"
                    } text-white`}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetTimer}
                    className={`rounded-xl border-stone-300 ${isMobile ? 'py-3' : ''}`}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="text-6xl">☕</div>
                <h3 className="text-2xl font-semibold text-green-700">
                  Brewing Complete!
                </h3>
                <p className="text-stone-600">
                  Total time: {formatTotalTime(totalElapsed)}
                </p>
                <Button
                  onClick={onClose}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3"
                >
                  Enjoy your coffee!
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Steps Overview */}
      {!isComplete && (
        <Card className="bg-stone-50 border-stone-200 rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-stone-800">Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {steps.map((step, index) => (
              <motion.button
                key={step.id}
                onClick={() => skipToStep(index)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  index === currentStepIndex
                    ? "bg-amber-100 border-amber-300 border"
                    : step.isCompleted
                    ? "bg-green-100 border-green-300 border"
                    : "bg-stone-100 border-stone-200 border hover:bg-stone-200"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {step.isCompleted ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : index === currentStepIndex ? (
                      <Clock className="w-4 h-4 text-amber-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-stone-400" />
                    )}
                    <span className={`font-medium ${
                      index === currentStepIndex 
                        ? "text-amber-800" 
                        : step.isCompleted 
                        ? "text-green-800" 
                        : "text-stone-700"
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  <span className="text-sm text-stone-500">
                    {formatTime(step.duration)}
                  </span>
                </div>
              </motion.button>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
