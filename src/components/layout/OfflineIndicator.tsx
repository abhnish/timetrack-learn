import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification && isOnline) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <Card className={`p-4 shadow-lg border-2 ${
        isOnline 
          ? 'bg-success/10 border-success' 
          : 'bg-warning/10 border-warning'
      }`}>
        <div className="flex items-center space-x-3">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-success" />
          ) : (
            <WifiOff className="w-5 h-5 text-warning" />
          )}
          <div>
            <p className={`font-medium ${isOnline ? 'text-success' : 'text-warning'}`}>
              {isOnline ? 'Back Online' : 'No Internet Connection'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isOnline 
                ? 'All features are now available'
                : 'Some features may be limited'
              }
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};