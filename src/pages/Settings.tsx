import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ProfileManager } from '@/components/profile/ProfileManager'
import { useAuth } from '@/hooks/useAuth'
import { useAttendance } from '@/hooks/useAttendance'
import { exportToCSV, formatAttendanceForExport, formatProfileForExport } from '@/utils/dataExport'
import { ArrowLeft, Settings as SettingsIcon, Bell, Download, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Settings = () => {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const { attendanceRecords } = useAttendance()
  const [notifications, setNotifications] = useState({
    emailReminders: true,
    pushNotifications: false,
    weeklyReports: true,
    attendanceAlerts: true
  })

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

  const handleDeleteAccount = () => {
    // Placeholder for account deletion
    console.log('Account deletion requested...')
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <SettingsIcon className="w-8 h-8" />
              Settings
            </h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileManager />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-reminders" className="text-sm">
                    Email Reminders
                  </Label>
                  <Switch
                    id="email-reminders"
                    checked={notifications.emailReminders}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, emailReminders: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications" className="text-sm">
                    Push Notifications
                  </Label>
                  <Switch
                    id="push-notifications"
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, pushNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly-reports" className="text-sm">
                    Weekly Reports
                  </Label>
                  <Switch
                    id="weekly-reports"
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, weeklyReports: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="attendance-alerts" className="text-sm">
                    Attendance Alerts
                  </Label>
                  <Switch
                    id="attendance-alerts"
                    checked={notifications.attendanceAlerts}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, attendanceAlerts: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Export or manage your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleExportData}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export My Data
                </Button>
                
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Downloads your attendance records, profile data, and activity history as CSV files.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible account actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={signOut}
                >
                  Sign Out
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Account deletion is permanent and cannot be undone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings