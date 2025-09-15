import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { useToast } from './use-toast'

export const useProfile = () => {
  const [loading, setLoading] = useState(false)
  const { profile, user } = useAuth()
  const { toast } = useToast()

  const updateProfile = async (updates: {
    full_name?: string
    department?: string
    student_id?: string
  }) => {
    if (!user || !profile) return false

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      })
      return true
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (newPassword: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      toast({
        title: "Password changed",
        description: "Your password has been successfully updated."
      })
      return true
    } catch (error: any) {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    loading,
    updateProfile,
    changePassword
  }
}