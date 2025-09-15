import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/auth/AuthForm';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import FacultyDashboard from '@/components/dashboard/FacultyDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, userRole, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  // Role-based dashboard rendering
  if (userRole === 'student') {
    return <StudentDashboard onLogout={signOut} />;
  }

  if (userRole === 'faculty') {
    return <FacultyDashboard onLogout={signOut} />;
  }

  if (userRole === 'admin') {
    return <AdminDashboard onLogout={signOut} />;
  }

  // Fallback
  return <AuthForm />;
};

export default Index;
