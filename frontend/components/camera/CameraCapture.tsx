// components/camera/CameraCapture.tsx
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, CameraOff, RotateCw, Smartphone } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  isProcessing?: boolean;
}

export default function CameraCapture({ 
  onCapture, 
  isProcessing = false 
}: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  // Get available cameras
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setDevices(videoDevices);
        
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      } catch (error) {
        setCameraError('Cannot access camera devices');
      }
    };

    getDevices();
  }, []);

  // Handle capture
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [onCapture]);

  // Toggle camera (front/back)
  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Video constraints
  const videoConstraints = {
    width: 1280,
    height: 720,
    deviceId: selectedDevice,
    facingMode
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        {cameraError ? (
          <div className="flex flex-col items-center justify-center h-96 text-white">
            <CameraOff className="w-16 h-16 mb-4" />
            <p className="text-lg">{cameraError}</p>
            <p className="text-sm mt-2">Please allow camera access</p>
          </div>
        ) : (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMedia={() => setIsReady(true)}
              onUserMediaError={(error) => {
                console.error('Camera error:', error);
                setCameraError('Failed to access camera');
              }}
              className="w-full h-auto"
              style={{
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)',
              }}
            />
            
            {/* Face detection guide */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full">
                <defs>
                  <mask id="face-outline">
                    <rect width="100%" height="100%" fill="white" />
                    <ellipse
                      cx="50%"
                      cy="45%"
                      rx="120"
                      ry="150"
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill="black"
                  fillOpacity="0.5"
                  mask="url(#face-outline)"
                />
                <ellipse
                  cx="50%"
                  cy="45%"
                  rx="120"
                  ry="150"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  className={isProcessing ? 'animate-pulse' : ''}
                />
              </svg>
              
              {/* Instructions */}
              <div className="absolute top-4 left-4 right-4">
                <p className="text-white text-center bg-black/50 rounded px-2 py-1">
                  Position your face within the circle
                </p>
              </div>
            </div>

            {/* Camera controls */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              {devices.length > 1 && (
                <button
                  onClick={toggleCamera}
                  className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm"
                  title="Switch camera"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
              )}
              
              {devices.length > 1 && (
                <select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  className="bg-black/50 text-white px-3 py-1 rounded backdrop-blur-sm text-sm"
                >
                  {devices.map((device, idx) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </>
        )}
      </div>

      {/* Capture button */}
      <button
        onClick={capture}
        disabled={isProcessing || !isReady || !!cameraError}
        className={`
          mt-6 w-full py-3 rounded-lg font-medium
          flex items-center justify-center gap-2
          transition-all duration-200
          ${isProcessing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isProcessing ? (
          <>
            <RotateCw className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Camera className="w-5 h-5" />
            Capture Photo
          </>
        )}
      </button>

      {/* Mobile hint */}
      <p className="text-center text-sm text-gray-500 mt-2">
        <Smartphone className="inline w-4 h-4 mr-1" />
        Works with mobile camera too!
      </p>
    </div>
  );
}