"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { RecipeStorage } from "@/lib/recipe-storage"
import { supabase } from "@/lib/supabase"

export function MigrationBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [migrationResult, setMigrationResult] = useState<{
    success: number
    errors: number
  } | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    
    // Check if there's local data that might need migration
    try {
      const localRecipes = RecipeStorage.getLocalRecipes()
      const hasLocalData = localRecipes.length > 0
      const hasShownMigration = localStorage.getItem('migration-banner-dismissed')
      
      if (hasLocalData && !hasShownMigration) {
        setShowBanner(true)
      }
    } catch (error) {
      console.error('Error checking migration status:', error)
    }
  }, [isMounted])

  const handleMigrate = async () => {
    setIsLoading(true)
    try {
      const result = await RecipeStorage.migrateToSupabase()
      setMigrationResult(result)
      
      if (result.errors === 0) {
        // Migration successful, hide banner after 3 seconds
        setTimeout(() => {
          setShowBanner(false)
          localStorage.setItem('migration-banner-dismissed', 'true')
        }, 3000)
      }
    } catch (error) {
      console.error('Migration failed:', error)
      setMigrationResult({ success: 0, errors: 1 })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('migration-banner-dismissed', 'true')
  }

  if (!isMounted || !showBanner) return null

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <Upload className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          {migrationResult ? (
            <div className="flex items-center gap-2">
              {migrationResult.errors === 0 ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-800">
                    Successfully migrated {migrationResult.success} recipes to cloud storage!
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-orange-800">
                    Migrated {migrationResult.success} recipes, {migrationResult.errors} failed.
                  </span>
                </>
              )}
            </div>
          ) : (
            <span>
              We found existing recipes on this device. Would you like to sync them to the cloud 
              for access across all your devices?
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {!migrationResult && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMigrate}
                disabled={isLoading}
              >
                {isLoading ? "Syncing..." : "Sync to Cloud"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
