import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp,
  Download,
  Settings,
  AlertTriangle,
  School,
  Clock,
  MapPin
} from 'lucide-react';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'semester'>('week');

  const mockData = {
    overview: {
      totalStudents: 1245,
      totalFaculty: 87,
      activeClasses: 156,
      avgAttendance: 87.3
    },
    alerts: [
      { id: 1, type: 'low_attendance', message: 'CS101 attendance below 70%', severity: 'warning' },
      { id: 2, type: 'system', message: 'GPS verification issues in Building A', severity: 'error' },
      { id: 3, type: 'activity', message: 'High engagement in Math study groups', severity: 'info' },
    ],
    recentSessions: [
      { id: 1, class: 'Computer Science 101', faculty: 'Dr. Smith', attendance: '42/45', time: '2 hours ago' },
      { id: 2, class: 'Mathematics', faculty: 'Prof. Johnson', attendance: '38/40', time: '3 hours ago' },
      { id: 3, class: 'Physics Lab', faculty: 'Dr. Brown', attendance: '25/30', time: '5 hours ago' },
    ]
  };

  const handleExportReport = (format: 'csv' | 'pdf') => {
    // In a real app, this would trigger the export
    console.log(`Exporting ${format.toUpperCase()} report...`);
  };

  return (
    <div className="min-h-screen bg-gradient-card">
      {/* Header */}
      <div className="bg-gradient-primary p-6 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="opacity-90">System overview and analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" onClick={onLogout} className="text-white border-white hover:bg-white hover:text-primary">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6 shadow-card hover:shadow-hover transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-primary rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Total Students</h3>
                <p className="text-2xl font-bold text-primary">{mockData.overview.totalStudents.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-hover transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-success rounded-xl">
                <School className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Faculty Members</h3>
                <p className="text-2xl font-bold text-success">{mockData.overview.totalFaculty}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-hover transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Active Classes</h3>
                <p className="text-2xl font-bold text-accent">{mockData.overview.activeClasses}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-hover transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-primary rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Avg. Attendance</h3>
                <p className="text-2xl font-bold text-primary">{mockData.overview.avgAttendance}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Alerts */}
        {mockData.alerts.length > 0 && (
          <Card className="shadow-card">
            <div className="p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-warning" />
                <h2 className="text-xl font-semibold text-foreground">System Alerts</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {mockData.alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${
                  alert.severity === 'error' ? 'bg-danger/10 border-danger' :
                  alert.severity === 'warning' ? 'bg-warning/10 border-warning' :
                  'bg-primary/10 border-primary'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">{alert.message}</span>
                    <Badge variant={
                      alert.severity === 'error' ? 'destructive' :
                      alert.severity === 'warning' ? 'secondary' : 'default'
                    }>
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Analytics and Reports */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Analytics Chart */}
          <Card className="shadow-card">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Attendance Analytics</h2>
                </div>
                <div className="flex space-x-2">
                  {(['week', 'month', 'semester'] as const).map((period) => (
                    <Button
                      key={period}
                      size="sm"
                      variant={selectedPeriod === period ? 'default' : 'outline'}
                      onClick={() => setSelectedPeriod(period)}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6">
              <AnalyticsChart period={selectedPeriod} />
            </div>
          </Card>

          {/* Export Reports */}
          <Card className="shadow-card">
            <div className="p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <Download className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Export Reports</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-card border border-border">
                  <h3 className="font-medium text-foreground mb-2">Attendance Report</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comprehensive attendance data for all students and classes
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleExportReport('csv')}>
                      Export CSV
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleExportReport('pdf')}>
                      Export PDF
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-card border border-border">
                  <h3 className="font-medium text-foreground mb-2">Analytics Report</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Detailed analytics and trends for the selected period
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleExportReport('csv')}>
                      Export CSV
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleExportReport('pdf')}>
                      Export PDF
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-card border border-border">
                  <h3 className="font-medium text-foreground mb-2">Usage Report</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    System usage statistics and user engagement metrics
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleExportReport('csv')}>
                      Export CSV
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleExportReport('pdf')}>
                      Export PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card className="shadow-card">
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Recent Sessions</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {mockData.recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{session.class}</h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <span>Faculty: {session.faculty}</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{session.time}</span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{session.attendance}</p>
                  <p className="text-sm text-muted-foreground">Attendance</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}