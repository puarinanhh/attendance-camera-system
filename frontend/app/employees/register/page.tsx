// app/employees/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CameraCapture from '@/components/camera/CameraCapture';
import { employeeApi, authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Save, X, Copy, CheckCircle } from 'lucide-react';

export default function RegisterEmployeePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    employee_code: '',
    full_name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    password: ''  // Optional password field
  });
  const [faceImages, setFaceImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast.error('Please login first to access this page');
        router.push('/login');
        return;
      }

      try {
        // Verify token is valid by checking user profile
        await authApi.getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication failed:', error);
        toast.error('Session expired. Please login again');
        localStorage.removeItem('access_token');
        router.push('/login');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCapture = (imageSrc: string) => {
    if (faceImages.length < 5) {
      setFaceImages([...faceImages, imageSrc]);
      toast.success(`Photo ${faceImages.length + 1} captured`);
    }

    if (faceImages.length === 2) {
      toast.success('Minimum 3 photos captured. You can submit now.');
    }
  };

  const removeImage = (index: number) => {
    setFaceImages(faceImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (faceImages.length < 3) {
      toast.error('Please capture at least 3 photos');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await employeeApi.register({
        ...formData,
        face_images: faceImages
      });

      // Check if response contains credentials
      if (response.credentials) {
        setRegistrationResult(response);
        setShowCredentials(true);
        toast.success('Employee registered successfully! Please save the login credentials.');
      } else {
        toast.success('Employee registered successfully!');
        router.push('/employees');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCredentials = () => {
    setShowCredentials(false);
    router.push('/employees');
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render the form (will redirect in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Register New Employee</h1>
            <p className="text-gray-600 mt-1">Add employee information and capture face photos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Code *
                </label>
                <input
                  type="text"
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="EMP001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Input full name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Input email..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Input department..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position *
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Input position..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password (Optional)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Input password..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  If left blank, a password will be generated automatically
                </p>
              </div>
            </div>

            {/* Face Photos Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Face Photos * (Minimum 3, Maximum 5)
              </label>

              {/* Captured Images */}
              {faceImages.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                  {faceImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Face ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Camera Capture */}
              {faceImages.length < 5 && (
                <CameraCapture onCapture={handleCapture} />
              )}

              <p className="text-sm text-gray-500 mt-2">
                {faceImages.length}/5 photos captured (minimum 3 required)
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || faceImages.length < 3}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Register Employee
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Credentials Modal */}
      {showCredentials && registrationResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="mb-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-center text-gray-900">
                Employee Registered Successfully!
              </h2>
              <p className="text-center text-gray-600 mt-2">
                Please save these login credentials
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username (Email):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={registrationResult.credentials?.username || ''}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(registrationResult.credentials?.username || '');
                      toast.success('Username copied!');
                    }}
                    className="p-2 hover:bg-gray-200 rounded-lg transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={registrationResult.credentials?.password || ''}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(registrationResult.credentials?.password || '');
                      toast.success('Password copied!');
                    }}
                    className="p-2 hover:bg-gray-200 rounded-lg transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> Please save these credentials securely.
                The employee can use them to login and perform check-in/check-out operations.
              </p>
            </div>

            <button
              onClick={handleCloseCredentials}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Continue to Employee List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}