import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/auth/AuthForm';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import FacultyDashboard from '@/components/dashboard/FacultyDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { UserOnboarding } from '@/components/onboarding/UserOnboarding';
import { NotificationSystem } from '@/components/layout/NotificationSystem';
import { FullPageLoader } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Landing from './Landing';

const Index = () => {
  const { isAuthenticated, userRole, loading, signOut } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Check if user needs onboarding (simplified - in real app, check localStorage or user preferences)
  useEffect(() => {
    if (isAuthenticated && !localStorage.getItem('onboarding-completed')) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboarding-completed', 'true');
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboarding-completed', 'true');
  };

  if (loading) {
    return <FullPageLoader text="Loading your dashboard..." />;
  }

  if (!isAuthenticated) {
    if (showAuth) {
      return <AuthForm />;
    }
    return <Landing onGetStarted={() => setShowAuth(true)} />;
  }

  // Show onboarding if needed
  if (showOnboarding && userRole) {
    return (
      <UserOnboarding
        userRole={userRole}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  const DashboardComponent = () => {
    const dashboardProps = { 
      onLogout: signOut,
      showHelp: () => setShowHelp(true)
    };

    switch (userRole) {
      case 'student':
        return <StudentDashboard {...dashboardProps} />;
      case 'faculty':
        return <FacultyDashboard {...dashboardProps} />;
      case 'admin':
        return <AdminDashboard {...dashboardProps} />;
      default:
        return <AuthForm />;
    }
  };

  return (
    <div className="relative">
      <DashboardComponent />
      
      {/* Floating Help Button */}
      <Button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-gradient-primary hover:opacity-90 z-40"
        onClick={() => setShowHelp(true)}
      >
        <HelpCircle className="w-6 h-6" />
      </Button>

      {/* Notification System */}
      <div className="fixed top-4 right-4 z-50">
        <NotificationSystem />
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Help & Support</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowHelp(false)}>
                ×
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Inline Help Content */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Quick Actions</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Need Help?</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Visit our comprehensive help center for detailed guides.
                      </p>
                      <Button size="sm" variant="outline">View Help Center</Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Report Issue</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Found a bug or need technical support?
                      </p>
                      <Button size="sm" variant="outline">Report Problem</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
