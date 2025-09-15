import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { useToast } from './use-toast'

export interface AttendanceRecord {
  id: string
  student_id: string
  session_id: string
  class_name: string
  status: string
  marked_at: string
  qr_code_used?: string
  location_lat?: number
  location_lng?: number
  faculty_id?: string
}

export interface AttendanceStats {
  total_classes: number
  attended_classes: number
  attendance_percentage: number
  recent_attendance: AttendanceRecord[]
}

export const useAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, profile } = useAuth()
  const { toast } = useToast()

  // Mark attendance using QR code
  const markAttendance = async (qrData: string, location?: { lat: number, lng: number }) => {
    if (!user || profile?.role !== 'student') {
      throw new Error('Only students can mark attendance')
    }

    try {
      // Parse QR data
      let sessionInfo
      try {
        sessionInfo = JSON.parse(qrData)
      } catch {
        // Fallback for simple QR codes
        sessionInfo = { sessionCode: qrData }
      }

      // Find the session by QR code
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('qr_code', sessionInfo.sessionCode || qrData)
        .eq('is_active', true)
        .single()

      if (sessionError || !session) {
        throw new Error('Invalid or expired QR code')
      }

      // Check if already marked
      const { data: existingRecord } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', user.id)
        .eq('session_id', session.id)
        .single()

      if (existingRecord) {
        throw new Error('Attendance already marked for this session')
      }

      // Mark attendance
      const { error } = await supabase
        .from('attendance')
        .insert({
          student_id: user.id,
          session_id: session.id,
          class_name: session.class_name,
          faculty_id: session.faculty_id,
          status: 'present',
          qr_code_used: sessionInfo.sessionCode || qrData,
          location_lat: location?.lat,
          location_lng: location?.lng
        })

      if (error) throw error

      await fetchAttendanceData()
      
      toast({
        title: "Attendance Marked",
        description: `Successfully marked present for ${session.class_name}`,
      })

      return true
    } catch (error: any) {
      toast({
        title: "Attendance Failed",
        description: error.message,
        variant: "destructive"
      })
      throw error
    }
  }

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    if (!user || !profile) return

    try {
      let query = supabase.from('attendance').select('*')

      // Role-based filtering
      if (profile.role === 'student') {
        query = query.eq('student_id', user.id)
      } else if (profile.role === 'faculty') {
        query = query.eq('faculty_id', user.id)
      }

      const { data, error } = await query.order('marked_at', { ascending: false })

      if (error) throw error

      setAttendanceRecords(data || [])

      // Calculate stats for students
      if (profile.role === 'student' && data) {
        const totalClasses = data.length
        const attendedClasses = data.filter(record => record.status === 'present').length
        const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0

        setStats({
          total_classes: totalClasses,
          attended_classes: attendedClasses,
          attendance_percentage: Math.round(attendancePercentage),
          recent_attendance: data.slice(0, 10)
        })
      }
    } catch (error: any) {
      console.error('Error fetching attendance:', error)
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Get attendance for a specific session (for faculty)
  const getSessionAttendance = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          profiles:student_id(full_name, student_id)
        `)
        .eq('session_id', sessionId)

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching session attendance:', error)
      return []
    }
  }

  // Get today's schedule for students
  const getTodaySchedule = async () => {
    if (profile?.role !== 'student') return []

    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('sessions')
        .select('id, class_name, start_time, location')
        .gte('start_time', `${today}T00:00:00`)
        .lt('start_time', `${today}T23:59:59`)
        .order('start_time', { ascending: true })

      if (error) throw error

      // Get attendance status for each session
      const sessionsWithAttendance = await Promise.all(
        (data || []).map(async (session) => {
          const { data: attendanceRecord } = await supabase
            .from('attendance')
            .select('id, status')
            .eq('session_id', session.id)
            .eq('student_id', user?.id)
            .single()

          return {
            ...session,
            attendance_status: attendanceRecord?.status || 'pending'
          }
        })
      )

      return sessionsWithAttendance
    } catch (error: any) {
      console.error('Error fetching today schedule:', error)
      return []
    }
  }

  useEffect(() => {
    fetchAttendanceData()

    // Set up real-time subscription for attendance changes
    const subscription = supabase
      .channel('attendance_changes')
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'attendance',
          filter: profile?.role === 'student' ? `student_id=eq.${user?.id}` : undefined
        },
        () => fetchAttendanceData()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, profile])

  return {
    attendanceRecords,
    stats,
    loading,
    markAttendance,
    getSessionAttendance,
    getTodaySchedule,
    refetch: fetchAttendanceData
  }
}