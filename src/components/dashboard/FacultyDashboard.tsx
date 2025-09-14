import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  Users, 
  Calendar, 
  TrendingUp,
  Clock,
  Settings,
  Plus,
  Eye
} from 'lucide-react';
import QRGenerator from '@/components/attendance/QRGenerator';

interface FacultyDashboardProps {
  onLogout: () => void;
}

export default function FacultyDashboard({ onLogout }: FacultyDashboardProps) {
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(null);

  const mockData = {
    todayClasses: [
      { id: 1, name: 'Computer Science 101', time: '09:00 AM', students: 45, attended: 42, status: 'completed' },
      { id: 2, name: 'Data Structures', time: '11:00 AM', students: 38, attended: 35, status: 'active' },
      { id: 3, name: 'Algorithms', time: '02:00 PM', students: 32, attended: 0, status: 'upcoming' },
    ],
    weeklyStats: {
      totalStudents: 115,
      averageAttendance: 87,
      activeSessions: 2
    },
    recentActivity: [
      { id: 1, action: 'QR Code generated for CS101', time: '10 minutes ago' },
      { id: 2, action: 'Attendance updated for Data Structures', time: '1 hour ago' },
      { id: 3, action: 'New activity created: Study Group', time: '2 hours ago' },
    ]
  };

  const handleGenerateQR = (classData: any) => {
    setActiveSession(classData);
    setShowQRGenerator(true);
  };

  if (showQRGenerator) {
    return (
      <QRGenerator
        sessionData={activeSession}
        onClose={() => {
          setShowQRGenerator(false);
          setActiveSession(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-card">
      {/* Header */}
      <div className="bg-gradient-success p-6 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
            <p className="opacity-90">Manage your classes and students</p>
          </div>
          <Button variant="outline" onClick={onLogout} className="text-white border-white hover:bg-white hover:text-success">
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 shadow-card hover:shadow-hover transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-primary rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Total Students</h3>
                <p className="text-2xl font-bold text-primary">{mockData.weeklyStats.totalStudents}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-hover transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-success rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Avg. Attendance</h3>
                <p className="text-2xl font-bold text-success">{mockData.weeklyStats.averageAttendance}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-hover transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Active Sessions</h3>
                <p className="text-2xl font-bold text-accent">{mockData.weeklyStats.activeSessions}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Today's Classes */}
        <Card className="shadow-card">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Today's Classes</h2>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Session
              </Button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {mockData.todayClasses.map((class_) => (
              <div key={class_.id} className="p-4 rounded-lg bg-gradient-card border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-foreground">{class_.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{class_.time}</span>
                      </span>
                      <span>{class_.students} students enrolled</span>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      class_.status === 'completed' ? 'default' :
                      class_.status === 'active' ? 'secondary' : 'outline'
                    }
                    className={
                      class_.status === 'completed' ? 'bg-success text-white' :
                      class_.status === 'active' ? 'bg-warning text-white' : ''
                    }
                  >
                    {class_.status.charAt(0).toUpperCase() + class_.status.slice(1)}
                  </Badge>
                </div>
                
                {class_.status !== 'upcoming' && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Attendance: {class_.attended}/{class_.students}</span>
                      <span>{Math.round((class_.attended / class_.students) * 100)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-success h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(class_.attended / class_.students) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  {class_.status === 'active' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleGenerateQR(class_)}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Generate QR
                    </Button>
                  )}
                  
                  {class_.status === 'upcoming' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleGenerateQR(class_)}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Start Session
                    </Button>
                  )}
                  
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-card">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
          </div>
          <div className="p-6 space-y-4">
            {mockData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <div className="flex-1">
                  <p className="text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}