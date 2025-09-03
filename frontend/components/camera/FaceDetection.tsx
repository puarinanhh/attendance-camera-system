// components/camera/FaceDetection.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface FaceDetectionProps {
  imageData: string;
  onFaceDetected?: (detected: boolean) => void;
}

export default function FaceDetection({ 
  imageData, 
  onFaceDetected 
}: FaceDetectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detecting, setDetecting] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    const detectFace = async () => {
      setDetecting(true);
      
      // Simulate face detection (in production, call backend API)
      setTimeout(() => {
        const detected = Math.random() > 0.2; // 80% success rate for demo
        setFaceDetected(detected);
        setDetecting(false);
        onFaceDetected?.(detected);
      }, 1500);
    };

    if (imageData) {
      detectFace();
    }
  }, [imageData, onFaceDetected]);

  return (
    <div className="relative">
      <img 
        src={imageData} 
        alt="Captured" 
        className="w-full rounded-lg"
      />
      
      {detecting && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
            <p>Detecting face...</p>
          </div>
        </div>
      )}

      {!detecting && (
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white text-sm
          ${faceDetected ? 'bg-green-500' : 'bg-red-500'}`}>
          {faceDetected ? '✓ Face detected' : '✗ No face detected'}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}