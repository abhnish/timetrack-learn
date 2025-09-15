import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { useToast } from './use-toast'

export interface Session {
  id: string
  class_name: string
  faculty_id: string
  start_time: string
  end_time: string
  is_active: boolean
  qr_code?: string
  location?: string
  created_at: string
}

export interface SessionWithAttendance extends Session {
  attendance_count: number
  total_students: number
}

export const useSessions = () => {
  const [sessions, setSessions] = useState<SessionWithAttendance[]>([])
  const [activeSessions, setActiveSessions] = useState<SessionWithAttendance[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile } = useAuth()
  const { toast } = useToast()

  // Fetch sessions based on user role
  const fetchSessions = async () => {
    if (!user || !profile) return

    try {
      let query = supabase
        .from('sessions')
        .select('id, class_name, faculty_id, start_time, end_time, is_active, qr_code, location, created_at')

      // Role-based filtering
      if (profile.role === 'faculty') {
        query = query.eq('faculty_id', user.id)
      }

      const { data: sessions, error } = await query.order('start_time', { ascending: false })

      if (error) throw error

      // Get attendance counts for each session
      const sessionsWithAttendance = await Promise.all(
        (sessions || []).map(async (session) => {
          const { count } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id)

          return {
            ...session,
            attendance_count: count || 0,
            total_students: 45 // This should come from enrollment data
          }
        })
      )

      setSessions(sessionsWithAttendance)
      setActiveSessions(sessionsWithAttendance.filter(s => s.is_active))
    } catch (error: any) {
      console.error('Error fetching sessions:', error)
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Create new session
  const createSession = async (sessionData: {
    class_name: string
    start_time: string
    end_time: string
    location?: string
  }) => {
    if (!user || profile?.role !== 'faculty') return null

    try {
      const qr_code = `SESSION_${sessionData.class_name.replace(/\s+/g, '_')}_${Date.now()}`
      
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          ...sessionData,
          faculty_id: user.id,
          qr_code,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      await fetchSessions() // Refresh sessions
      
      toast({
        title: "Session Created",
        description: `${sessionData.class_name} session started successfully`
      })

      return data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      return null
    }
  }

  // End session
  const endSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ is_active: false })
        .eq('id', sessionId)

      if (error) throw error

      await fetchSessions()
      
      toast({
        title: "Session Ended",
        description: "Session has been closed successfully"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  // Update session QR code
  const refreshQRCode = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId)
      if (!session) return

      const newQRCode = `SESSION_${session.class_name.replace(/\s+/g, '_')}_${Date.now()}`
      
      const { error } = await supabase
        .from('sessions')
        .update({ qr_code: newQRCode })
        .eq('id', sessionId)

      if (error) throw error

      await fetchSessions()
      
      toast({
        title: "QR Code Updated",
        description: "New QR code generated for security"
      })

      return newQRCode
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      return null
    }
  }

  useEffect(() => {
    fetchSessions()

    // Set up real-time subscriptions
    const sessionsSubscription = supabase
      .channel('sessions_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sessions' },
        () => fetchSessions()
      )
      .subscribe()

    const attendanceSubscription = supabase
      .channel('attendance_changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'attendance' },
        () => fetchSessions()
      )
      .subscribe()

    return () => {
      sessionsSubscription.unsubscribe()
      attendanceSubscription.unsubscribe()
    }
  }, [user, profile])

  return {
    sessions,
    activeSessions,
    loading,
    createSession,
    endSession,
    refreshQRCode,
    refetch: fetchSessions
  }
}