// app/page.tsx
import Link from 'next/link';
import { Camera, Users, Clock, BarChart, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Camera,
      title: 'Face Recognition',
      description: 'Advanced AI-powered facial recognition for accurate identification'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with encrypted data storage'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Check in/out in less than 2 seconds'
    },
    {
      icon: BarChart,
      title: 'Real-time Analytics',
      description: 'Comprehensive reports and attendance insights'
    }
  ];

  const actions = [
    {
      title: 'Check In',
      description: 'Start your work day',
      href: '/attendance/check-in',
      icon: Users,
      color: 'from-green-400 to-green-600'
    },
    {
      title: 'Check Out',
      description: 'End your work day',
      href: '/attendance/check-out',
      icon: Clock,
      color: 'from-orange-400 to-orange-600'
    },
    {
      title: 'Dashboard',
      description: 'View statistics',
      href: '/dashboard',
      icon: BarChart,
      color: 'from-blue-400 to-blue-600'
    },
    {
      title: 'Employees',
      description: 'Manage staff',
      href: '/employees',
      icon: Users,
      color: 'from-purple-400 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                Smart Attendance
              </span>
              <br />
              Management System
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Streamline your workforce management with AI-powered facial recognition technology
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/attendance/check-in"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                Get Started
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose Our System?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-90`}></div>
                <div className="relative p-6 text-white">
                  <Icon className="w-10 h-10 mb-3" />
                  <h3 className="text-xl font-semibold mb-1">{action.title}</h3>
                  <p className="text-white/80">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}