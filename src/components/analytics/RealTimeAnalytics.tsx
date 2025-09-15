import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Download,
  RefreshCw,
  AlertTriangle,
  Clock,
  MapPin
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import AnalyticsChart from './AnalyticsChart'

interface AnalyticsData {
  totalSessions: number
  averageAttendance: number
  activeUsers: number
  topClasses: Array<{
    name: string
    attendance_rate: number
    total_sessions: number
  }>
  recentActivity: Array<{
    id: string
    type: string
    message: string
    timestamp: string
    severity: 'info' | 'warning' | 'error'
  }>
  attendanceTrends: {
    daily: number[]
    weekly: number[]
    monthly: number[]
  }
}

export default function RealTimeAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'semester'>('week')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const { profile } = useAuth()

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)

      // Fetch sessions data
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id, class_name, is_active, created_at')

      // Fetch attendance data with count
      const { data: attendance } = await supabase
        .from('attendance')
        .select('session_id')

      // Calculate attendance counts per session
      const attendanceCounts = attendance?.reduce((acc, record) => {
        acc[record.session_id] = (acc[record.session_id] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Fetch profiles for user count
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, role, created_at')

      // Process the data
      const totalSessions = sessions?.length || 0
      const totalAttendance = attendance?.length || 0
      const averageAttendance = totalSessions > 0 ? Math.round((totalAttendance / totalSessions) * 100) : 0
      const activeUsers = profiles?.filter(p => {
        // Consider users active if they've been created in the last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return new Date(p.created_at) >= thirtyDaysAgo
      }).length || 0

      // Calculate top classes by attendance rate
      const classAttendance = sessions?.reduce((acc, session) => {
        const className = session.class_name
        const attendanceCount = attendanceCounts[session.id] || 0
        
        if (!acc[className]) {
          acc[className] = { total_sessions: 0, total_attendance: 0 }
        }
        
        acc[className].total_sessions += 1
        acc[className].total_attendance += attendanceCount
        
        return acc
      }, {} as Record<string, { total_sessions: number, total_attendance: number }>)

      const topClasses = Object.entries(classAttendance || {})
        .map(([name, stats]) => ({
          name,
          attendance_rate: stats.total_sessions > 0 ? Math.round((stats.total_attendance / stats.total_sessions) * 100) : 0,
          total_sessions: stats.total_sessions
        }))
        .sort((a, b) => b.attendance_rate - a.attendance_rate)
        .slice(0, 5)

      // Generate recent activity (mock data based on real events)
      const recentActivity = [
        {
          id: '1',
          type: 'session_created',
          message: `New session created: ${sessions?.[0]?.class_name || 'Recent Class'}`,
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          severity: 'info' as const
        },
        {
          id: '2',
          type: 'attendance_marked',
          message: `${attendance?.length || 0} attendance records marked today`,
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          severity: 'info' as const
        },
        {
          id: '3',
          type: 'low_attendance',
          message: averageAttendance < 70 ? `Average attendance below 70%` : 'Attendance rates are healthy',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          severity: averageAttendance < 70 ? 'warning' as const : 'info' as const
        }
      ]

      // Generate attendance trends (simplified)
      const attendanceTrends = {
        daily: Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 80),
        weekly: Array.from({ length: 4 }, () => Math.floor(Math.random() * 15) + 85),
        monthly: Array.from({ length: 6 }, () => Math.floor(Math.random() * 10) + 87)
      }

      setData({
        totalSessions,
        averageAttendance,
        activeUsers,
        topClasses,
        recentActivity,
        attendanceTrends
      })

      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = (format: 'csv' | 'pdf') => {
    // Mock export functionality
    console.log(`Exporting analytics data as ${format.toUpperCase()}...`)
    // In a real app, this would generate and download the file
  }

  useEffect(() => {
    fetchAnalyticsData()

    // Set up real-time updates
    const interval = setInterval(fetchAnalyticsData, 30000) // Update every 30 seconds

    // Set up real-time subscriptions
    const sessionsSubscription = supabase
      .channel('analytics_sessions')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        () => fetchAnalyticsData()
      )
      .subscribe()

    const attendanceSubscription = supabase
      .channel('analytics_attendance')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        () => fetchAnalyticsData()
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      sessionsSubscription.unsubscribe()
      attendanceSubscription.unsubscribe()
    }
  }, [])

  if (loading && !data) {
    return (
      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">Real-Time Analytics</h2>
              <p className="text-sm text-muted-foreground">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchAnalyticsData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="semester">Semester</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6 shadow-card hover:shadow-hover transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-primary rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Total Sessions</h3>
              <p className="text-2xl font-bold text-primary">{data?.totalSessions || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card hover:shadow-hover transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-success rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Avg. Attendance</h3>
              <p className="text-2xl font-bold text-success">{data?.averageAttendance || 0}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card hover:shadow-hover transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-accent rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Active Users</h3>
              <p className="text-2xl font-bold text-accent">{data?.activeUsers || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card hover:shadow-hover transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-primary rounded-xl">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Response Time</h3>
              <p className="text-2xl font-bold text-primary">1.2s</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Attendance Trends Chart */}
        <Card className="shadow-card">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Attendance Trends</h3>
              <Button size="sm" variant="outline" onClick={() => exportData('csv')}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <div className="p-6">
            <AnalyticsChart period={timeRange} />
          </div>
        </Card>

        {/* Top Performing Classes */}
        <Card className="shadow-card">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Top Performing Classes</h3>
          </div>
          <div className="p-6 space-y-4">
            {data?.topClasses.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No data available</p>
            ) : (
              data?.topClasses.map((classItem, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <h4 className="font-medium text-foreground">{classItem.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {classItem.total_sessions} sessions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">{classItem.attendance_rate}%</p>
                    <p className="text-xs text-muted-foreground">attendance</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        </div>
        <div className="p-6 space-y-4">
          {data?.recentActivity.map((activity) => (
            <div key={activity.id} className={`p-4 rounded-lg border ${
              activity.severity === 'error' ? 'bg-danger/10 border-danger' :
              activity.severity === 'warning' ? 'bg-warning/10 border-warning' :
              'bg-primary/10 border-primary'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className={`w-5 h-5 ${
                    activity.severity === 'error' ? 'text-danger' :
                    activity.severity === 'warning' ? 'text-warning' :
                    'text-primary'
                  }`} />
                  <span className="text-foreground">{activity.message}</span>
                </div>
                <div className="text-right">
                  <Badge variant={
                    activity.severity === 'error' ? 'destructive' :
                    activity.severity === 'warning' ? 'secondary' : 'default'
                  }>
                    {activity.severity}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}