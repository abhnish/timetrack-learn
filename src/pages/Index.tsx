import { useState } from 'react';
import RoleSelector from '@/components/auth/RoleSelector';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import FacultyDashboard from '@/components/dashboard/FacultyDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

type UserRole = 'student' | 'faculty' | 'admin' | null;

const Index = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
  };

  // Role-based dashboard rendering
  if (userRole === 'student') {
    return <StudentDashboard onLogout={handleLogout} />;
  }

  if (userRole === 'faculty') {
    return <FacultyDashboard onLogout={handleLogout} />;
  }

  if (userRole === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // Default: Show role selector
  return <RoleSelector onRoleSelect={handleRoleSelect} />;
};

export default Index;
