// app/attendance/check-out/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CameraCapture from '@/components/camera/CameraCapture';
import { attendanceApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { LogOut, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { CheckOutResponse } from '@/types';

export default function CheckOutPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [checkOutData, setCheckOutData] = useState<CheckOutResponse | null>(null);

  const handleCapture = async (imageSrc: string) => {
    setStatus('processing');
    
    try {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timestamp: new Date().toISOString()
      };

      // Get current timestamp in ISO format
      const timestamp = new Date().toISOString();
      
      const response = await attendanceApi.checkOut({
        image_data: imageSrc,
        device_info: deviceInfo,
        timestamp  // Send local timestamp to backend
      });

      if (response.success) {
        setStatus('success');
        setCheckOutData(response);
        toast.success('Check-out successful!');
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setStatus('error');
      toast.error(error.response?.data?.detail || 'Check-out failed');
      
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    }
  };

  const formatWorkHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Check Out</h1>
          <p className="text-gray-600">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {(status === 'idle' || status === 'processing') && (
            <div>
              <div className="mb-6 text-center">
                <LogOut className="w-12 h-12 text-orange-600 mx-auto mb-2" />
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

          {status === 'success' && checkOutData && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Check-out Successful!
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-6 mt-6 max-w-md mx-auto">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Employee</p>
                    <p className="text-lg font-semibold">{checkOutData.employee_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Check-out Time</p>
                    <p className="text-lg font-semibold">
                      {format(new Date(checkOutData.check_out_time), 'HH:mm:ss')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Work Hours</p>
                    <p className="text-lg font-semibold">
                      {formatWorkHours(checkOutData.work_hours)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Check-out Failed
              </h2>
              
              <p className="text-gray-600 mb-6">
                Face not recognized or no check-in record found
              </p>
              
              <button
                onClick={() => setStatus('idle')}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}