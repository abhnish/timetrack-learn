import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useProfile } from '@/hooks/useProfile'
import { useAttendance } from '@/hooks/useAttendance'
import { exportToCSV, formatAttendanceForExport, formatProfileForExport } from '@/utils/dataExport'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { User, Mail, Building, IdCard, Key } from 'lucide-react'

export const ProfileManager = () => {
  const { profile, loading, updateProfile, changePassword } = useProfile()
  const { attendanceRecords } = useAttendance()
  const [editMode, setEditMode] = useState(false)
  const [passwordMode, setPasswordMode] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    department: profile?.department || '',
    student_id: profile?.student_id || ''
  })
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  if (!profile) {
    return <LoadingSpinner text="Loading profile..." />
  }

  const handleSave = async () => {
    const success = await updateProfile(formData)
    if (success) {
      setEditMode(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      return
    }
    if (passwords.newPassword.length < 6) {
      return
    }

    const success = await changePassword(passwords.newPassword)
    if (success) {
      setPasswordMode(false)
      setPasswords({ newPassword: '', confirmPassword: '' })
    }
  }

  const handleExportData = () => {
    if (profile) {
      // Export profile data
      const profileData = formatProfileForExport(profile)
      exportToCSV(profileData, `profile_${profile.full_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`)
      
      // Export attendance data if available
      if (attendanceRecords && attendanceRecords.length > 0) {
        const attendanceData = formatAttendanceForExport(attendanceRecords)
        exportToCSV(attendanceData, `attendance_${profile.full_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`)
      }
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'faculty': return 'default'
      case 'student': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Manage your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={editMode ? formData.full_name : profile.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={!editMode}
                className={!editMode ? 'bg-muted' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="department"
                  value={editMode ? formData.department : profile.department || 'Not specified'}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={!editMode}
                  className={!editMode ? 'bg-muted' : ''}
                />
              </div>
            </div>

            {profile.role === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID</Label>
                <div className="flex items-center gap-2">
                  <IdCard className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="student_id"
                    value={editMode ? formData.student_id : profile.student_id || 'Not specified'}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    disabled={!editMode}
                    className={!editMode ? 'bg-muted' : ''}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Role:</span>
              <Badge variant={getRoleBadgeVariant(profile.role)}>
                {profile.role.toUpperCase()}
              </Badge>
            </div>

            <div className="flex gap-2">
              {editMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditMode(false)
                      setFormData({
                        full_name: profile.full_name,
                        department: profile.department || '',
                        student_id: profile.student_id || ''
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditMode(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription>
            Change your password and manage security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {passwordMode ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPasswordMode(false)
                    setPasswords({ newPassword: '', confirmPassword: '' })
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePasswordChange} 
                  disabled={loading || passwords.newPassword !== passwords.confirmPassword || passwords.newPassword.length < 6}
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Change Password'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">Last changed recently</p>
              </div>
              <Button variant="outline" onClick={() => setPasswordMode(true)}>
                Change Password
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}