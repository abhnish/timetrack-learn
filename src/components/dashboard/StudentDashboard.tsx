import React, { useState, useEffect } from 'react';
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
import { useAttendance } from '@/hooks/useAttendance';
import { useActivities } from '@/hooks/useActivities';
import { useAuth } from '@/hooks/useAuth';

interface StudentDashboardProps {
  onLogout: () => void;
}

export default function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const { profile } = useAuth();
  const { stats, markAttendance, getTodaySchedule } = useAttendance();
  const { getRecommendedActivities } = useActivities();
  
  const [showScanner, setShowScanner] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<'none' | 'scanning' | 'success' | 'error'>('none');
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [recommendedActivities, setRecommendedActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchTodayData = async () => {
      const schedule = await getTodaySchedule();
      setTodayClasses(schedule);
      setRecommendedActivities(getRecommendedActivities());
    };
    
    fetchTodayData();
  }, []);

  const handleScanSuccess = async (result: string) => {
    try {
      await markAttendance(result);
      setAttendanceStatus('success');
      setShowScanner(false);
      setTimeout(() => setAttendanceStatus('none'), 3000);
      
      // Refresh today's schedule
      const schedule = await getTodaySchedule();
      setTodayClasses(schedule);
    } catch (error) {
      setAttendanceStatus('error');
      setShowScanner(false);
      setTimeout(() => setAttendanceStatus('none'), 3000);
    }
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
            <p className="opacity-90">Welcome back, {profile?.full_name}</p>
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
                <p className="text-2xl font-bold text-success">{stats?.attendance_percentage || 0}%</p>
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
            {todayClasses.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No classes scheduled for today</p>
              </div>
            ) : (
              todayClasses.map((class_, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{class_.class_name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(class_.start_time).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}</span>
                      </span>
                      {class_.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{class_.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant={
                      class_.attendance_status === 'present' ? 'default' :
                      class_.attendance_status === 'pending' ? 'secondary' : 'outline'
                    }
                    className={
                      class_.attendance_status === 'present' ? 'bg-success text-white' :
                      class_.attendance_status === 'pending' ? 'bg-warning text-white' : ''
                    }
                  >
                    {class_.attendance_status === 'present' ? 'Attended' :
                     class_.attendance_status === 'pending' ? 'Mark Now' : 'Upcoming'}
                  </Badge>
                </div>
              ))
            )}
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
            {recommendedActivities.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No activities available</p>
              </div>
            ) : (
              recommendedActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg bg-gradient-card border border-border">
                  <div>
                    <h3 className="font-medium text-foreground">{activity.title}</h3>
                    <p className="text-sm text-muted-foreground">{activity.description || activity.activity_type}</p>
                  </div>
                  <Badge variant="outline">{activity.activity_type}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}