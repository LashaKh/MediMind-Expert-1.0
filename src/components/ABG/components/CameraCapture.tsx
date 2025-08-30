import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Camera, 
  X, 
  RotateCcw, 
  Zap, 
  ZapOff, 
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onCancel
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    setIsInitializing(true);
    setError(null);

    try {
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      // Request camera permission with optimal settings for document capture
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 16/9 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);
      }

    } catch (err) {

      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
          case 'PermissionDeniedError':
            setError('Camera permission denied. Please allow camera access to take photos.');
            break;
          case 'NotFoundError':
          case 'DevicesNotFoundError':
            setError('No camera found on this device.');
            break;
          case 'NotReadableError':
          case 'TrackStartError':
            setError('Camera is already in use by another application.');
            break;
          case 'OverconstrainedError':
          case 'ConstraintNotSatisfiedError':
            setError('Camera does not meet the required constraints.');
            break;
          default:
            setError('Failed to access camera. Please try again.');
        }
      } else {
        setError('Camera not available on this device.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Clean up camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Convert blob to data URL for preview
          const reader = new FileReader();
          reader.onload = () => {
            setCapturedImage(reader.result as string);
          };
          reader.readAsDataURL(blob);
          setIsCapturing(false);
        } else {
          throw new Error('Failed to capture image');
        }
      }, 'image/jpeg', 0.9);

    } catch (err) {

      setError('Failed to capture photo. Please try again.');
      setIsCapturing(false);
    }
  }, []);

  // Convert captured image to File object and call onCapture
  const confirmCapture = useCallback(() => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `abg-capture-${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        onCapture(file);
      }
    }, 'image/jpeg', 0.9);
  }, [onCapture]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  // Toggle flash (if supported)
  const toggleFlash = useCallback(async () => {
    if (!streamRef.current) return;

    try {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities();

      if ('torch' in capabilities) {
        await track.applyConstraints({
          advanced: [{ torch: !flashEnabled } as any]
        });
        setFlashEnabled(!flashEnabled);
      }
    } catch (err) {

    }
  }, [flashEnabled]);

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera();
    
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [initializeCamera, stopCamera]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    stopCamera();
    onCancel();
  }, [stopCamera, onCancel]);

  if (isInitializing) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center">
            <h3 className="font-semibold">Initializing Camera</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Please allow camera access when prompted
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div>
            <h3 className="font-semibold text-red-900">Camera Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={initializeCamera}>
              Try Again
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Camera Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Capture Blood Gas Report</h3>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Camera/Preview Area */}
        <div className="relative">
          {!capturedImage ? (
            /* Live Camera Feed */
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Camera Controls Overlay */}
              {hasPermission && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                  {/* Flash Toggle */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleFlash}
                    className="bg-black/50 hover:bg-black/70 text-white border-0"
                  >
                    {flashEnabled ? (
                      <Zap className="h-4 w-4" />
                    ) : (
                      <ZapOff className="h-4 w-4" />
                    )}
                  </Button>

                  {/* Capture Button */}
                  <Button
                    size="lg"
                    onClick={capturePhoto}
                    disabled={isCapturing}
                    className="bg-white hover:bg-gray-100 text-black border-0 rounded-full h-16 w-16"
                  >
                    {isCapturing ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6" />
                    )}
                  </Button>

                  {/* Placeholder for symmetry */}
                  <div className="w-8 h-8" />
                </div>
              )}
            </div>
          ) : (
            /* Captured Image Preview */
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured ABG report"
                className="w-full rounded-lg"
              />
              
              {/* Preview Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={retakePhoto}
                  className="bg-black/50 hover:bg-black/70 text-white border-0"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                
                <Button
                  size="sm"
                  onClick={confirmCapture}
                  className="bg-green-600 hover:bg-green-700 text-white border-0"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Use Photo
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          {!capturedImage ? (
            <>
              <p>• Position the blood gas report in the frame</p>
              <p>• Ensure good lighting for best results</p>
              <p>• Hold the device steady when capturing</p>
            </>
          ) : (
            <p>Review the captured image and confirm it's clear and readable</p>
          )}
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </Card>
  );
};