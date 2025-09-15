import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  QrCode, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Users,
  ArrowRight,
  X
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  action?: () => void;
}

interface UserOnboardingProps {
  userRole: 'student' | 'faculty' | 'admin';
  onComplete: () => void;
  onSkip: () => void;
}

export const UserOnboarding = ({ userRole, onComplete, onSkip }: UserOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);

  useEffect(() => {
    const stepsByRole = {
      student: [
        {
          id: 'welcome',
          title: 'Welcome to TimeTrack Learn!',
          description: 'Your smart attendance and learning companion',
          icon: <CheckCircle className="w-6 h-6" />,
          completed: false
        },
        {
          id: 'scan-qr',
          title: 'Scan QR Codes',
          description: 'Mark attendance by scanning QR codes displayed by your instructors',
          icon: <QrCode className="w-6 h-6" />,
          completed: false
        },
        {
          id: 'location',
          title: 'Location Verification',
          description: 'We use GPS to ensure you\'re in the right classroom',
          icon: <MapPin className="w-6 h-6" />,
          completed: false
        },
        {
          id: 'schedule',
          title: 'View Your Schedule',
          description: 'See today\'s classes and track your attendance progress',
          icon: <Calendar className="w-6 h-6" />,
          completed: false
        },
        {
          id: 'activities',
          title: 'Discover Activities',
          description: 'Find personalized learning activities and study groups',
          icon: <BookOpen className="w-6 h-6" />,
          completed: false
        }
      ],
      faculty: [
        {
          id: 'welcome',
          title: 'Welcome, Instructor!',
          description: 'Manage your classes and track student engagement',
          icon: <CheckCircle className="w-6 h-6" />,
          completed: false
        },
        {
          id: 'sessions',
          title: 'Create Sessions',
          description: 'Start new class sessions and generate QR codes for attendance',
          icon: <Calendar className="w-6 h-6" />,
          completed: false
        },
        {
          id: 'qr-generation',
          title: 'QR Code Management',
          description: 'Generate secure QR codes that refresh automatically',
          icon: <QrCode className="w-6 h-6" />,
          completed: false
        },
        {
          id: 'attendance-tracking',
          title: 'Monitor Attendance',
          description: 'View real-time attendance and student engagement data',
          icon: <Users className="w-6 h-6" />,
          completed: false
        },
        {
          id: 'activities',
          title: 'Create Activities',
          description: 'Design learning activities and assignments for your students',
          icon: <BookOpen className="w-6 h-6" />,
          completed: false
        }
      ],
      admin: [
        {
          id: 'welcome',
          title: 'Admin Dashboard',
          description: 'Complete system oversight and analytics',
          icon: <CheckCircle className="w-6 h-6" />,
          completed: false
        },
        {
          id: 'analytics',
          title: 'Real-time Analytics',
          description: 'Monitor attendance trends and system performance',
          icon: <Users className="w-6 h-6" />,
          completed: false
        },
        {
          id: 'management',
          title: 'User Management',
          description: 'Oversee faculty and student accounts across the system',
          icon: <Users className="w-6 h-6" />,
          completed: false
        },
        {
          id: 'reports',
          title: 'Generate Reports',
          description: 'Export detailed attendance and engagement reports',
          icon: <BookOpen className="w-6 h-6" />,
          completed: false
        }
      ]
    };

    setSteps(stepsByRole[userRole]);
  }, [userRole]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      // Mark current step as completed
      const updatedSteps = [...steps];
      updatedSteps[currentStep].completed = true;
      setSteps(updatedSteps);
      setCurrentStep(currentStep + 1);
    } else {
      // Mark final step as completed and finish
      const updatedSteps = [...steps];
      updatedSteps[currentStep].completed = true;
      setSteps(updatedSteps);
      setTimeout(onComplete, 500);
    }
  };

  const skipOnboarding = () => {
    onSkip();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  if (!currentStepData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Badge variant="outline">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipOnboarding}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              {currentStepData.icon}
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-muted-foreground">
              {currentStepData.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={skipOnboarding}
              className="text-muted-foreground"
            >
              Skip Tour
            </Button>
            
            <Button onClick={nextStep} className="bg-gradient-primary hover:opacity-90">
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Steps Indicator */}
          <div className="flex justify-center space-x-2 mt-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};