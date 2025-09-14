import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, MapPin, Wifi, WifiOff } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (result: string) => void;
  onScanError: () => void;
  onClose: () => void;
}

export default function QRScanner({ onScanSuccess, onScanError, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate GPS location verification
    const checkLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Simulate location verification logic
            const { latitude, longitude } = position.coords;
            // In a real app, you'd verify if the user is within the allowed area
            setLocationVerified(true);
            setGpsError(null);
          },
          (error) => {
            setGpsError('Location access denied. Please enable GPS and allow location access.');
            setLocationVerified(false);
          }
        );
      } else {
        setGpsError('GPS not supported on this device.');
      }
    };

    checkLocation();
  }, []);

  const handleStartScan = () => {
    if (!locationVerified) {
      onScanError();
      return;
    }
    
    setIsScanning(true);
    
    // Simulate QR code scanning process
    setTimeout(() => {
      // Simulate successful scan
      const mockQRData = 'CLASS_CS101_2024_SESSION_' + Date.now();
      onScanSuccess(mockQRData);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-primary">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">QR Code Scanner</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Location Status */}
          <div className={`flex items-center space-x-3 p-4 rounded-lg mb-6 ${
            locationVerified ? 'bg-success/10 border border-success' : 'bg-danger/10 border border-danger'
          }`}>
            {locationVerified ? (
              <>
                <MapPin className="w-5 h-5 text-success" />
                <div>
                  <p className="font-medium text-success">Location Verified</p>
                  <p className="text-sm text-success/80">You're in the correct area</p>
                </div>
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5 text-danger" />
                <div>
                  <p className="font-medium text-danger">Location Required</p>
                  <p className="text-sm text-danger/80">{gpsError || 'Verifying location...'}</p>
                </div>
              </>
            )}
          </div>

          {/* Camera Preview Area */}
          <div className="relative bg-muted rounded-lg mb-6 overflow-hidden">
            <div className="aspect-square flex items-center justify-center">
              {isScanning ? (
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-foreground font-medium">Scanning QR Code...</p>
                  <p className="text-sm text-muted-foreground">Hold steady and point at the QR code</p>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="w-24 h-24 border-4 border-dashed border-muted-foreground rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Wifi className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium">Ready to Scan</p>
                  <p className="text-sm text-muted-foreground">Tap the button below to start</p>
                </div>
              )}
            </div>
            
            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-4 border-2 border-primary rounded-lg">
                <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-primary" />
                <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-primary" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-primary" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-primary" />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleStartScan}
              disabled={!locationVerified || isScanning}
              className={`w-full ${
                locationVerified && !isScanning 
                  ? 'bg-gradient-primary hover:opacity-90' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {isScanning ? 'Scanning...' : 'Start Scanning'}
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
              disabled={isScanning}
            >
              Cancel
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Make sure you're in the classroom and the QR code is clearly visible
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}