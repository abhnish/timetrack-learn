import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, 
  Search, 
  QrCode, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Mail,
  MessageSquare
} from 'lucide-react';
import { useState } from 'react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Guide {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  steps: string[];
}

export default function Help() {
  const [searchTerm, setSearchTerm] = useState('');

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I mark attendance?',
      answer: 'Simply scan the QR code displayed by your instructor using the QR scanner in your dashboard. Make sure you\'re in the correct classroom for GPS verification.',
      category: 'attendance'
    },
    {
      id: '2',
      question: 'Why isn\'t my location being verified?',
      answer: 'Ensure you\'ve allowed location access in your browser settings and that you\'re within the classroom area. Try refreshing the page if issues persist.',
      category: 'technical'
    },
    {
      id: '3',
      question: 'Can I mark attendance if I\'m late to class?',
      answer: 'Yes, as long as the session is still active and the instructor hasn\'t ended it. However, your attendance record will show the actual time you marked present.',
      category: 'attendance'
    },
    {
      id: '4',
      question: 'How do I create a new class session?',
      answer: 'Go to Session Management, click "New Session", fill in the class details including time and location, then click "Create Session" to generate a QR code.',
      category: 'faculty'
    },
    {
      id: '5',
      question: 'What happens if the QR code expires?',
      answer: 'QR codes automatically refresh every 5 minutes for security. If a code expires, the instructor can generate a new one instantly.',
      category: 'security'
    }
  ];

  const guides: Guide[] = [
    {
      id: 'student-attendance',
      title: 'Marking Attendance (Students)',
      description: 'Learn how to mark your attendance using QR codes',
      icon: <QrCode className="w-6 h-6" />,
      steps: [
        'Open your student dashboard',
        'Click "Start Scanning" in the QR Code section',
        'Allow location access when prompted',
        'Point your camera at the QR code displayed by your instructor',
        'Wait for confirmation that attendance has been marked'
      ]
    },
    {
      id: 'faculty-session',
      title: 'Creating Sessions (Faculty)',
      description: 'Start a new class session and generate QR codes',
      icon: <Calendar className="w-6 h-6" />,
      steps: [
        'Navigate to Session Management tab',
        'Click "New Session" button',
        'Enter class name, location, and time details',
        'Click "Create Session"',
        'Display the generated QR code to students',
        'Monitor attendance in real-time'
      ]
    },
    {
      id: 'admin-analytics',
      title: 'Using Analytics (Admin)',
      description: 'Access and interpret system analytics',
      icon: <Users className="w-6 h-6" />,
      steps: [
        'Go to Admin Dashboard',
        'Select "Real-Time Analytics" tab',
        'Review key metrics and trends',
        'Use time period filters to analyze specific ranges',
        'Export reports for detailed analysis'
      ]
    }
  ];

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-card">
      {/* Header */}
      <div className="bg-gradient-primary p-6 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-4">
            <HelpCircle className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Help Center</h1>
          </div>
          <p className="text-white/90 text-lg">
            Find answers, guides, and support for TimeTrack Learn
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Search */}
        <Card className="p-6 shadow-card">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq">Frequently Asked</TabsTrigger>
            <TabsTrigger value="guides">Step-by-Step Guides</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-4">
            <div className="grid gap-4">
              {filteredFAQs.length === 0 ? (
                <Card className="p-8 text-center">
                  <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No FAQs found matching your search.
                  </p>
                </Card>
              ) : (
                filteredFAQs.map((faq) => (
                  <Card key={faq.id} className="p-6 hover:shadow-hover transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-foreground pr-4">
                        {faq.question}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {faq.category}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-6">
            <div className="grid md:grid-cols-1 gap-6">
              {guides.map((guide) => (
                <Card key={guide.id} className="p-6 hover:shadow-hover transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                      {guide.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">
                        {guide.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {guide.description}
                      </p>
                      <div className="space-y-2">
                        {guide.steps.map((step, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <span className="text-sm text-foreground">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-foreground">Email Support</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Get help via email. We typically respond within 24 hours.
                </p>
                <Button className="w-full">
                  Send Email
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-foreground">Live Chat</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Chat with our support team during business hours.
                </p>
                <Button className="w-full" variant="outline">
                  Start Chat
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            </div>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-primary mb-2">
                    Technical Issues?
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    If you're experiencing technical difficulties, please include:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>Your device type and browser version</li>
                    <li>Steps to reproduce the issue</li>
                    <li>Any error messages you see</li>
                    <li>Screenshots if applicable</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}