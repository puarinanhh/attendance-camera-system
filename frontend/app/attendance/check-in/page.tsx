// app/attendance/check-in/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CameraCapture from '@/components/camera/CameraCapture';
import { attendanceApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { CheckInResponse } from '@/types';

export default function CheckInPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [checkInData, setCheckInData] = useState<CheckInResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const getCurrentLocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => resolve(null),
        { timeout: 5000, enableHighAccuracy: true }
      );
    });
  };

  const handleCapture = async (imageSrc: string) => {
    setStatus('processing');
    setErrorMessage('');
    
    try {
      // Get location
      const coords = await getCurrentLocation();
      const location = coords ? `${coords.lat},${coords.lng}` : null;

      // Get device info
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString()
      };

      // Get current timestamp in ISO format
      const timestamp = new Date().toISOString();
      
      // Call API
      const response = await attendanceApi.checkIn({
        image_data: imageSrc,
        location,
        device_info: deviceInfo,
        timestamp  // Send local timestamp to backend
      });

      if (response.success) {
        setStatus('success');
        setCheckInData(response);
        toast.success('Check-in successful!');
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setStatus('error');
      const message = error.response?.data?.detail || 'Check-in failed. Please try again.';
      setErrorMessage(message);
      toast.error(message);
      
      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setCheckInData(null);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Check In</h1>
          <p className="text-gray-600">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {(status === 'idle' || status === 'processing') && (
            <div>
              <div className="mb-6 text-center">
                <Clock className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600">
                  Current time: <span className="font-semibold">{format(new Date(), 'HH:mm:ss')}</span>
                </p>
              </div>
              
              <CameraCapture 
                onCapture={handleCapture}
                isProcessing={status === 'processing'}
              />
            </div>
          )}

          {status === 'success' && checkInData && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Check-in Successful!
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-6 mt-6 max-w-md mx-auto">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Employee</p>
                    <p className="text-lg font-semibold">{checkInData.employee_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Check-in Time</p>
                    <p className="text-lg font-semibold">
                      {format(new Date(checkInData.check_in_time), 'HH:mm:ss')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      On Time
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={resetForm}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Check-in Another Person
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Check-in Failed
              </h2>
              
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              
              <button
                onClick={resetForm}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Location Info */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <MapPin className="inline w-4 h-4 mr-1" />
          Location tracking is enabled for security
        </div>
      </div>
    </div>
  );
}