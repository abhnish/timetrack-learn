import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { useToast } from './use-toast'

export interface Activity {
  id: string
  title: string
  description?: string
  activity_type: string
  difficulty_level?: string
  duration_minutes?: number
  target_roles: string[]
  tags?: string[]
  is_active: boolean
  created_by?: string
  created_at: string
}

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile } = useAuth()
  const { toast } = useToast()

  // Fetch activities based on user role
  const fetchActivities = async () => {
    try {
      let query = supabase
        .from('activities')
        .select('*')
        .eq('is_active', true)

      // Filter by target roles for students
      if (profile?.role === 'student') {
        query = query.contains('target_roles', [profile.role])
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      setActivities(data || [])
    } catch (error: any) {
      console.error('Error fetching activities:', error)
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Create new activity (faculty/admin only)
  const createActivity = async (activityData: {
    title: string
    description?: string
    activity_type: string
    difficulty_level?: string
    duration_minutes?: number
    target_roles: string[]
    tags?: string[]
  }) => {
    if (!user || !['faculty', 'admin'].includes(profile?.role || '')) {
      throw new Error('Unauthorized to create activities')
    }

    try {
      const { data, error } = await supabase
        .from('activities')
        .insert({
          ...activityData,
          created_by: user.id,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      await fetchActivities()
      
      toast({
        title: "Activity Created",
        description: `${activityData.title} has been created successfully`
      })

      return data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      throw error
    }
  }

  // Update activity
  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    if (!user || !['faculty', 'admin'].includes(profile?.role || '')) {
      throw new Error('Unauthorized to update activities')
    }

    try {
      const { data, error } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchActivities()
      
      toast({
        title: "Activity Updated",
        description: "Activity has been updated successfully"
      })

      return data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      throw error
    }
  }

  // Delete activity
  const deleteActivity = async (id: string) => {
    if (!user || !['faculty', 'admin'].includes(profile?.role || '')) {
      throw new Error('Unauthorized to delete activities')
    }

    try {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('activities')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error

      await fetchActivities()
      
      toast({
        title: "Activity Deleted",
        description: "Activity has been removed successfully"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      throw error
    }
  }

  // Get recommended activities for students
  const getRecommendedActivities = () => {
    if (profile?.role !== 'student') return []

    // Simple recommendation logic - can be enhanced with ML
    return activities
      .filter(activity => 
        activity.target_roles.includes('student') &&
        activity.is_active
      )
      .slice(0, 5) // Limit to top 5 recommendations
  }

  // Get activities by type
  const getActivitiesByType = (type: string) => {
    return activities.filter(activity => 
      activity.activity_type.toLowerCase() === type.toLowerCase() && 
      activity.is_active
    )
  }

  // Search activities
  const searchActivities = (searchTerm: string) => {
    if (!searchTerm.trim()) return activities

    const term = searchTerm.toLowerCase()
    return activities.filter(activity =>
      activity.title.toLowerCase().includes(term) ||
      activity.description?.toLowerCase().includes(term) ||
      activity.tags?.some(tag => tag.toLowerCase().includes(term))
    )
  }

  useEffect(() => {
    fetchActivities()

    // Set up real-time subscription
    const subscription = supabase
      .channel('activities_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        () => fetchActivities()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, profile])

  return {
    activities,
    loading,
    createActivity,
    updateActivity,
    deleteActivity,
    getRecommendedActivities,
    getActivitiesByType,
    searchActivities,
    refetch: fetchActivities
  }
}