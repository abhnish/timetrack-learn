import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, MapPin, Camera, AlertTriangle, Shield } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

interface QRScannerProps {
  onScanSuccess: (result: string, location?: { lat: number, lng: number }, deviceInfo?: any) => void;
  onScanError: (error: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScanSuccess, onScanError, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState<any>(null);
  const [scanStartTime, setScanStartTime] = useState<number | null>(null);

  // Generate device fingerprint for fraud detection
  const generateDeviceFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      canvasFingerprint: canvas.toDataURL(),
      timestamp: Date.now(),
      cookiesEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine
    };
    
    setDeviceFingerprint(fingerprint);
  };

  useEffect(() => {
    // Generate device fingerprint
    generateDeviceFingerprint();
    
    // Check camera permissions
    navigator.permissions?.query({ name: 'camera' as PermissionName })
      .then(permission => {
        setCameraPermission(permission.state as any);
        permission.onchange = () => setCameraPermission(permission.state as any);
      })
      .catch(() => setCameraPermission('prompt'));

    // Get precise location with high accuracy
    const checkLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            
            // Verify location accuracy (within 100 meters)
            if (accuracy > 100) {
              setGpsError('Location accuracy is too low. Please ensure GPS is enabled.');
              setLocationVerified(false);
              return;
            }
            
            setCurrentLocation({ lat: latitude, lng: longitude });
            setLocationVerified(true);
            setGpsError(null);
          },
          (error) => {
            let errorMessage = 'Location access denied.';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied. Please enable location permissions.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location unavailable. Please check your GPS settings.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out. Please try again.';
                break;
            }
            setGpsError(errorMessage);
            setLocationVerified(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      } else {
        setGpsError('GPS not supported on this device.');
      }
    };

    checkLocation();
  }, []);

  const handleStartScan = async () => {
    try {
      // Request camera permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Stop the stream immediately as Scanner will handle it
      stream.getTracks().forEach(track => track.stop());
      
      setCameraPermission('granted');
      setIsScanning(true);
      setScanStartTime(Date.now());
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraPermission('denied');
      onScanError('Camera access denied. Please allow camera permissions and try again.');
    }
  };

  const handleQRScan = (detectedCodes: any[]) => {
    if (!detectedCodes || detectedCodes.length === 0) return;
    
    const result = detectedCodes[0].rawValue;
    
    if (!currentLocation || !deviceFingerprint) {
      onScanError('Security verification failed. Please try again.');
      return;
    }

    // Add scan timing for fraud detection
    const scanDuration = scanStartTime ? Date.now() - scanStartTime : 0;
    
    const securityData = {
      ...deviceFingerprint,
      location: currentLocation,
      scanDuration,
      timestamp: Date.now()
    };

    setIsScanning(false);
    onScanSuccess(result, currentLocation, securityData);
  };

  const handleScanError = (error: any) => {
    console.error('QR Scan Error:', error);
    setIsScanning(false);
    onScanError('Failed to scan QR code. Please ensure the code is clear and try again.');
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
            <div className="aspect-square">
              {isScanning ? (
                <div className="relative w-full h-full">
                  <Scanner
                    onScan={handleQRScan}
                    onError={handleScanError}
                    allowMultiple={false}
                    scanDelay={1000}
                    constraints={{
                      facingMode: 'environment',
                      aspectRatio: 1
                    }}
                    styles={{
                      container: {
                        width: '100%',
                        height: '100%'
                      },
                      video: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }
                    }}
                  />
                  
                  {/* Scanning Overlay */}
                  <div className="absolute inset-4 border-2 border-primary rounded-lg pointer-events-none">
                    <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-primary animate-pulse" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-primary animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-primary animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-primary animate-pulse" />
                  </div>
                  
                  {/* Instructions */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white p-2 rounded text-sm text-center">
                    Point camera at QR code
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center p-8">
                  <div>
                    <div className="w-24 h-24 border-4 border-dashed border-muted-foreground rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-medium">Camera Ready</p>
                    <p className="text-sm text-muted-foreground">Tap scan to start camera</p>
                    {cameraPermission === 'denied' && (
                      <p className="text-xs text-danger mt-2">Camera permission required</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Status */}
          <div className="bg-background border rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Security Status</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Location:</span>
                <span className={locationVerified ? 'text-success' : 'text-danger'}>
                  {locationVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Camera:</span>
                <span className={cameraPermission === 'granted' ? 'text-success' : 'text-warning'}>
                  {cameraPermission === 'granted' ? 'Ready' : 'Permission needed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Device:</span>
                <span className={deviceFingerprint ? 'text-success' : 'text-warning'}>
                  {deviceFingerprint ? 'Verified' : 'Checking'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={isScanning ? () => setIsScanning(false) : handleStartScan}
              disabled={!locationVerified && !isScanning}
              className="w-full bg-gradient-primary hover:opacity-90"
            >
              {isScanning ? 'Stop Scanning' : 'Start Camera Scan'}
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
              Ensure you're in the classroom. Location and device verification required for security.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}