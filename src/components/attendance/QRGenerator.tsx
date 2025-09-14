import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Copy, RefreshCcw, Users, Clock, MapPin } from 'lucide-react';
import QRCode from 'qrcode';

interface QRGeneratorProps {
  sessionData: any;
  onClose: () => void;
}

export default function QRGenerator({ sessionData, onClose }: QRGeneratorProps) {
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [sessionCode, setSessionCode] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [studentsJoined, setStudentsJoined] = useState(0);

  useEffect(() => {
    generateQRCode();
    
    // Simulate students joining
    const studentInterval = setInterval(() => {
      setStudentsJoined(prev => Math.min(prev + Math.floor(Math.random() * 3), sessionData?.students || 45));
    }, 2000);

    // Countdown timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          generateQRCode(); // Regenerate QR code
          return 300; // Reset to 5 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(studentInterval);
      clearInterval(timer);
    };
  }, []);

  const generateQRCode = async () => {
    const newSessionCode = `SESSION_${sessionData?.name?.replace(/\s+/g, '_')}_${Date.now()}`;
    setSessionCode(newSessionCode);
    
    const qrData = JSON.stringify({
      sessionCode: newSessionCode,
      className: sessionData?.name,
      timestamp: Date.now(),
      location: 'Room 201' // In real app, this would be dynamic
    });

    try {
      const qrImageUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#4F46E5', // Primary color
          light: '#FFFFFF'
        }
      });
      setQrCodeImage(qrImageUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode);
    // In a real app, you'd show a toast notification
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-primary max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Attendance QR Code</h2>
              <p className="text-muted-foreground">{sessionData?.name}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Session Info */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Time Remaining</p>
                <p className="font-semibold text-lg text-foreground">{formatTime(timeRemaining)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Students Joined</p>
                <p className="font-semibold text-lg text-foreground">{studentsJoined}/{sessionData?.students}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold text-foreground">Room 201</p>
              </div>
            </div>
          </div>

          {/* QR Code Display */}
          <Card className="p-8 bg-gradient-card border-2 border-primary/20 mb-6">
            <div className="text-center">
              {qrCodeImage ? (
                <div>
                  <img 
                    src={qrCodeImage} 
                    alt="Attendance QR Code" 
                    className="mx-auto mb-4 rounded-lg shadow-card"
                  />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Session Code:</p>
                    <div className="flex items-center justify-center space-x-2">
                      <code className="px-3 py-1 bg-muted rounded text-sm font-mono">
                        {sessionCode.substring(0, 16)}...
                      </code>
                      <Button size="sm" variant="outline" onClick={copySessionCode}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-[300px] h-[300px] mx-auto bg-muted rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </Card>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Attendance Progress</span>
              <span>{Math.round((studentsJoined / (sessionData?.students || 45)) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-gradient-success h-3 rounded-full transition-all duration-300"
                style={{ width: `${(studentsJoined / (sessionData?.students || 45)) * 100}%` }}
              />
            </div>
          </div>

          {/* Auto-refresh info */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <RefreshCcw className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-primary">Auto-refresh enabled</p>
                <p className="text-sm text-primary/80">QR code refreshes every 5 minutes for security</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-3">
            <Button 
              onClick={generateQRCode}
              className="bg-gradient-primary hover:opacity-90"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh QR Code
            </Button>
            
            <Button variant="outline" onClick={onClose}>
              End Session
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Students must scan this QR code within the classroom to mark attendance
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}