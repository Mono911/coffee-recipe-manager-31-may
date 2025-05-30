import { supabase } from './supabase'
import type { CoffeeBean } from '@/types/coffee-bean'

export class CoffeeBeanStorage {
  private static readonly STORAGE_KEY = 'coffee-beans'

  static async getBeans(): Promise<CoffeeBean[]> {
    try {
      const { data, error } = await supabase
        .from('coffee_beans')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      return data || []
    } catch (error) {
      console.warn('Failed to fetch from Supabase, falling back to localStorage:', error)
      return this.getLocalBeans()
    }
  }

  static getLocalBeans(): CoffeeBean[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return []
    }
  }

  static async saveBean(bean: Omit<CoffeeBean, 'id' | 'created_at' | 'updated_at'>): Promise<CoffeeBean> {
    const tempId = crypto.randomUUID()
    const now = new Date().toISOString()
    const tempBean: CoffeeBean = {
      ...bean,
      id: tempId,
      created_at: now,
      updated_at: now
    }

    const localBeans = this.getLocalBeans()
    localBeans.unshift(tempBean)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(localBeans))

    const insertData: Record<string, any> = {}
    Object.entries(bean).forEach(([key, value]) => {
      if (value !== undefined) {
        insertData[key] = key.endsWith('_date') && value === '' ? null : value
      }
    })

    try {
      const { data, error } = await supabase
        .from('coffee_beans')
        .insert([insertData])
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('No data returned')

      const updatedLocalBeans = localBeans.map(b => 
        b.id === tempId ? data : b
      )
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedLocalBeans))
      return data
    } catch (error) {
      console.error('Failed to save to Supabase:', error)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      try {
        const { data, error: retryError } = await supabase
          .from('coffee_beans')
          .insert([insertData])
          .select()
          .single()

        if (retryError) throw retryError
        if (!data) throw new Error('No data returned')

        const updatedLocalBeans = localBeans.map(b => 
          b.id === tempId ? data : b
        )
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedLocalBeans))
        return data
      } catch (retryError) {
        console.error('Retry failed:', retryError)
        return {
          ...tempBean,
          _error: retryError instanceof Error ? retryError.message : 'Database save failed'
        }
      }
    }
  }

  static async updateBean(id: string, updates: Partial<CoffeeBean>): Promise<CoffeeBean | null> {
    try {
      const dbUpdates = Object.fromEntries(
        Object.entries(updates).map(([key, value]) => [
          key,
          key.endsWith('_date') && value === '' ? null : value
        ]))
      
      const { data, error } = await supabase
        .from('coffee_beans')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const localBeans = this.getLocalBeans()
      const updatedBeans = localBeans.map(b => 
        b.id === id ? { ...b, ...data } : b
      )
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedBeans))

      return data
    } catch (error) {
      console.error('Failed to update bean:', error)
      return null
    }
  }

  static async deleteBean(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('coffee_beans')
        .delete()
        .eq('id', id)

      if (error) throw error

      const localBeans = this.getLocalBeans()
      const filteredBeans = localBeans.filter(b => b.id !== id)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredBeans))

      return true
    } catch (error) {
      console.error('Failed to delete from Supabase:', error)
      return false
    }
  }
}
