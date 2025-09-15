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

  // Mark attendance using QR code with fraud detection
  const markAttendance = async (qrData: string, location?: { lat: number, lng: number }, deviceInfo?: any) => {
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

      // Advanced fraud detection checks
      const fraudCheckResult = await performFraudDetection(session, location, deviceInfo);
      
      if (!fraudCheckResult.isValid) {
        throw new Error(fraudCheckResult.reason);
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

      // Mark attendance with security data
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

      // Log security event
      await logSecurityEvent('attendance_marked', {
        session_id: session.id,
        location,
        device_info: deviceInfo,
        fraud_score: fraudCheckResult.fraudScore
      });

      await fetchAttendanceData()
      
      toast({
        title: "Attendance Marked",
        description: `Successfully marked present for ${session.class_name}`,
      })

      return true
    } catch (error: any) {
      // Log security event for failed attempts
      await logSecurityEvent('attendance_failed', {
        error: error.message,
        location,
        device_info: deviceInfo
      });

      toast({
        title: "Attendance Failed",
        description: error.message,
        variant: "destructive"
      })
      throw error
    }
  }

  // Advanced fraud detection system
  const performFraudDetection = async (session: any, location?: { lat: number, lng: number }, deviceInfo?: any) => {
    let fraudScore = 0;
    const reasons = [];

    try {
      // 1. Time-based validation
      const now = new Date();
      const sessionStart = new Date(session.start_time);
      const sessionEnd = new Date(session.end_time);
      
      if (now < sessionStart || now > sessionEnd) {
        fraudScore += 50;
        reasons.push('Attendance marked outside session time window');
      }

      // 2. Location-based validation (geofencing)
      if (location && session.location) {
        // Call fraud detection edge function for complex analysis
        const { data: fraudAnalysis } = await supabase.functions.invoke('fraud-detection', {
          body: {
            type: 'location_check',
            session_id: session.id,
            location,
            device_info: deviceInfo,
            user_id: user?.id
          }
        });

        if (fraudAnalysis?.fraud_score) {
          fraudScore += fraudAnalysis.fraud_score;
          if (fraudAnalysis.reasons) {
            reasons.push(...fraudAnalysis.reasons);
          }
        }
      }

      // 3. Device fingerprint analysis
      if (deviceInfo) {
        // Check for suspicious device characteristics
        const deviceRisk = await analyzeDeviceRisk(deviceInfo);
        fraudScore += deviceRisk.score;
        if (deviceRisk.reasons) {
          reasons.push(...deviceRisk.reasons);
        }
      }

      // 4. Pattern analysis - check recent attendance behavior
      const recentAttendance = await checkRecentAttendancePatterns();
      fraudScore += recentAttendance.riskScore;
      if (recentAttendance.reasons) {
        reasons.push(...recentAttendance.reasons);
      }

      // Determine if attendance is valid based on fraud score
      const isValid = fraudScore < 70; // Threshold for fraud detection

      return {
        isValid,
        fraudScore,
        reason: isValid ? 'Valid attendance' : reasons.join('; '),
        details: reasons
      };
    } catch (error) {
      console.error('Fraud detection error:', error);
      // Fail open for now, but log the error
      return {
        isValid: true,
        fraudScore: 0,
        reason: 'Fraud detection unavailable'
      };
    }
  };

  // Analyze device risk factors
  const analyzeDeviceRisk = async (deviceInfo: any) => {
    let score = 0;
    const reasons = [];

    // Check for suspicious timing
    if (deviceInfo.scanDuration < 1000) { // Less than 1 second scan
      score += 20;
      reasons.push('Unusually fast QR scan detected');
    }

    // Check for suspicious user agent patterns
    if (deviceInfo.userAgent && (
      deviceInfo.userAgent.includes('bot') ||
      deviceInfo.userAgent.includes('crawler') ||
      deviceInfo.userAgent.includes('spider')
    )) {
      score += 30;
      reasons.push('Suspicious user agent detected');
    }

    // Check for offline status during scan
    if (deviceInfo.onlineStatus === false) {
      score += 15;
      reasons.push('Device was offline during scan');
    }

    return { score, reasons };
  };

  // Check recent attendance patterns for anomalies
  const checkRecentAttendancePatterns = async () => {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const { data: recentAttendance } = await supabase
        .from('attendance')
        .select('marked_at, location_lat, location_lng, session_id')
        .eq('student_id', user?.id)
        .gte('marked_at', oneWeekAgo.toISOString())
        .order('marked_at', { ascending: false });

      let riskScore = 0;
      const reasons = [];

      if (!recentAttendance || recentAttendance.length === 0) {
        return { riskScore: 0, reasons: [] };
      }

      // Check for rapid succession of attendance marks
      for (let i = 1; i < recentAttendance.length; i++) {
        const current = new Date(recentAttendance[i-1].marked_at);
        const previous = new Date(recentAttendance[i].marked_at);
        const timeDiff = current.getTime() - previous.getTime();
        
        if (timeDiff < 300000) { // Less than 5 minutes apart
          riskScore += 25;
          reasons.push('Multiple rapid attendance marks detected');
          break;
        }
      }

      return { riskScore, reasons };
    } catch (error) {
      console.error('Pattern analysis error:', error);
      return { riskScore: 0, reasons: [] };
    }
  };

  // Log security events for monitoring
  const logSecurityEvent = async (eventType: string, data: any) => {
    try {
      await supabase.functions.invoke('fraud-detection', {
        body: {
          type: 'security_log',
          event_type: eventType,
          user_id: user?.id,
          data,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Security logging error:', error);
    }
  };
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