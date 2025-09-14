import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  MapPin, 
  Calendar, 
  BookOpen, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import QRScanner from '@/components/attendance/QRScanner';

interface StudentDashboardProps {
  onLogout: () => void;
}

export default function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<'none' | 'scanning' | 'success' | 'error'>('none');

  const mockData = {
    todayClasses: [
      { id: 1, name: 'Computer Science 101', time: '09:00 AM', status: 'attended', location: 'Room 201' },
      { id: 2, name: 'Mathematics', time: '11:00 AM', status: 'pending', location: 'Room 105' },
      { id: 3, name: 'Physics', time: '02:00 PM', status: 'upcoming', location: 'Lab 301' },
    ],
    weeklyAttendance: 85,
    activities: [
      { id: 1, title: 'Study Group - Algorithms', time: 'Free Period 1', type: 'Academic' },
      { id: 2, title: 'Basketball Practice', time: 'Free Period 2', type: 'Sports' },
    ]
  };

  const handleScanSuccess = (result: string) => {
    setAttendanceStatus('success');
    setShowScanner(false);
    setTimeout(() => setAttendanceStatus('none'), 3000);
  };

  const handleScanError = () => {
    setAttendanceStatus('error');
    setShowScanner(false);
    setTimeout(() => setAttendanceStatus('none'), 3000);
  };

  if (showScanner) {
    return (
      <QRScanner
        onScanSuccess={handleScanSuccess}
        onScanError={handleScanError}
        onClose={() => setShowScanner(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-card">
      {/* Header */}
      <div className="bg-gradient-primary p-6 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
            <p className="opacity-90">Welcome back, John Doe</p>
          </div>
          <Button variant="outline" onClick={onLogout} className="text-white border-white hover:bg-white hover:text-primary">
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 shadow-card hover:shadow-hover transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-primary rounded-xl">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Scan QR Code</h3>
                <p className="text-sm text-muted-foreground">Mark your attendance</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowScanner(true)}
              className="w-full mt-4 bg-gradient-primary hover:opacity-90"
            >
              Start Scanning
            </Button>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-hover transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-success rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Weekly Attendance</h3>
                <p className="text-2xl font-bold text-success">{mockData.weeklyAttendance}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-hover transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent rounded-xl">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Location Status</h3>
                <Badge variant="default" className="bg-success text-white">Verified</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Attendance Status Alert */}
        {attendanceStatus === 'success' && (
          <Card className="p-4 bg-success/10 border-success shadow-card">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-success font-medium">Attendance marked successfully!</span>
            </div>
          </Card>
        )}

        {attendanceStatus === 'error' && (
          <Card className="p-4 bg-danger/10 border-danger shadow-card">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-danger" />
              <span className="text-danger font-medium">Failed to mark attendance. Please try again.</span>
            </div>
          </Card>
        )}

        {/* Today's Schedule */}
        <Card className="shadow-card">
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Today's Classes</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {mockData.todayClasses.map((class_) => (
              <div key={class_.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{class_.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{class_.time}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{class_.location}</span>
                    </span>
                  </div>
                </div>
                <Badge 
                  variant={
                    class_.status === 'attended' ? 'default' :
                    class_.status === 'pending' ? 'secondary' : 'outline'
                  }
                  className={
                    class_.status === 'attended' ? 'bg-success text-white' :
                    class_.status === 'pending' ? 'bg-warning text-white' : ''
                  }
                >
                  {class_.status === 'attended' ? 'Attended' :
                   class_.status === 'pending' ? 'Mark Now' : 'Upcoming'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommended Activities */}
        <Card className="shadow-card">
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Recommended Activities</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {mockData.activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg bg-gradient-card border border-border">
                <div>
                  <h3 className="font-medium text-foreground">{activity.title}</h3>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
                <Badge variant="outline">{activity.type}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}