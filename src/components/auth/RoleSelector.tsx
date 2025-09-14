import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GraduationCap, Users, Shield } from 'lucide-react';

interface RoleSelectorProps {
  onRoleSelect: (role: 'student' | 'faculty' | 'admin') => void;
}

const roles = [
  {
    id: 'student' as const,
    title: 'Student',
    description: 'Mark attendance, view schedule, and access activities',
    icon: GraduationCap,
    gradient: 'bg-gradient-primary',
  },
  {
    id: 'faculty' as const,
    title: 'Faculty',
    description: 'Generate QR codes, manage attendance, and create activities',
    icon: Users,
    gradient: 'bg-gradient-success',
  },
  {
    id: 'admin' as const,
    title: 'Admin',
    description: 'Access analytics, generate reports, and manage system',
    icon: Shield,
    gradient: 'bg-gradient-primary',
  },
];

export default function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleClick = (roleId: 'student' | 'faculty' | 'admin') => {
    setSelectedRole(roleId);
    setTimeout(() => onRoleSelect(roleId), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-card flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Smart Curriculum & Attendance
          </h1>
          <p className="text-lg text-muted-foreground">
            Select your role to continue
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <Card
                key={role.id}
                className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-hover ${
                  isSelected ? 'scale-105 shadow-primary' : 'shadow-card'
                }`}
                onClick={() => handleRoleClick(role.id)}
              >
                <div className="p-8 text-center">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl ${role.gradient} flex items-center justify-center shadow-primary`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-foreground mb-3">
                    {role.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {role.description}
                  </p>
                  
                  <Button
                    variant="outline"
                    className="w-full transition-smooth hover:bg-primary hover:text-primary-foreground"
                  >
                    Continue as {role.title}
                  </Button>
                </div>
                
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}