import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, MapPin, Users, Plus, QrCode, Eye, StopCircle } from 'lucide-react'
import { useSessions } from '@/hooks/useSessions'
import { useAttendance } from '@/hooks/useAttendance'
import QRGenerator from '@/components/attendance/QRGenerator'

interface SessionManagerProps {
  userRole: 'faculty' | 'admin'
}

export default function SessionManager({ userRole }: SessionManagerProps) {
  const { sessions, loading, createSession, endSession } = useSessions()
  const { getSessionAttendance } = useAttendance()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showQRGenerator, setShowQRGenerator] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [sessionAttendance, setSessionAttendance] = useState<any[]>([])
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false)

  const [formData, setFormData] = useState({
    class_name: '',
    location: '',
    start_time: '',
    end_time: '',
    description: ''
  })

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createSession({
        class_name: formData.class_name,
        location: formData.location,
        start_time: formData.start_time,
        end_time: formData.end_time
      })
      
      setShowCreateDialog(false)
      setFormData({
        class_name: '',
        location: '',
        start_time: '',
        end_time: '',
        description: ''
      })
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  const handleViewAttendance = async (session: any) => {
    try {
      const attendance = await getSessionAttendance(session.id)
      setSessionAttendance(attendance)
      setSelectedSession(session)
      setShowAttendanceDialog(true)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    }
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (timeString: string) => {
    return new Date(timeString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  if (showQRGenerator && selectedSession) {
    return (
      <QRGenerator
        sessionData={selectedSession}
        onClose={() => {
          setShowQRGenerator(false)
          setSelectedSession(null)
        }}
      />
    )
  }

  return (
    <Card className="shadow-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">Session Management</h2>
              <p className="text-sm text-muted-foreground">Create and manage class sessions</p>
            </div>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <Label htmlFor="class_name">Class Name</Label>
                  <Input
                    id="class_name"
                    value={formData.class_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, class_name: e.target.value }))}
                    placeholder="e.g., Computer Science 101"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Room 201, Building A"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                    Create Session
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No sessions found</p>
            <p className="text-sm text-muted-foreground">Create your first session to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="p-4 rounded-lg bg-gradient-card border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-foreground">{session.class_name}</h3>
                      <Badge 
                        variant={session.is_active ? "default" : "outline"}
                        className={session.is_active ? "bg-success text-white" : ""}
                      >
                        {session.is_active ? "Active" : "Ended"}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(session.start_time)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                      </span>
                      {session.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{session.location}</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{session.attendance_count}/{session.total_students} attended</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Attendance Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Attendance Progress</span>
                    <span>{Math.round((session.attendance_count / session.total_students) * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-success h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(session.attendance_count / session.total_students) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {session.is_active && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedSession(session)
                        setShowQRGenerator(true)
                      }}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Generate QR
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewAttendance(session)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Attendance
                  </Button>
                  
                  {session.is_active && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => endSession(session.id)}
                    >
                      <StopCircle className="w-4 h-4 mr-2" />
                      End Session
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attendance Dialog */}
      <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Attendance - {selectedSession?.class_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {sessionAttendance.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No attendance records found
              </p>
            ) : (
              sessionAttendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{record.profiles?.full_name || 'Unknown Student'}</p>
                    <p className="text-sm text-muted-foreground">
                      ID: {record.profiles?.student_id || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-success text-white">Present</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(record.marked_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}