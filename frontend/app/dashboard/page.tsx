// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { attendanceApi } from '@/lib/api';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_employees: 0,
    checked_in: 0,
    checked_out: 0,
    absent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await attendanceApi.getTodayStatus();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.total_employees,
      icon: Users,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100'
    },
    {
      title: 'Checked In',
      value: stats.checked_in,
      icon: UserCheck,
      color: 'bg-green-500',
      lightColor: 'bg-green-100'
    },
    {
      title: 'Checked Out',
      value: stats.checked_out,
      icon: Clock,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-100'
    },
    {
      title: 'Absent',
      value: stats.absent,
      icon: UserX,
      color: 'bg-red-500',
      lightColor: 'bg-red-100'
    }
  ];

  const quickActions = [
    {
      title: 'Check In',
      description: 'Start your work day',
      href: '/attendance/check-in',
      icon: UserCheck,
      color: 'bg-green-600'
    },
    {
      title: 'Check Out',
      description: 'End your work day',
      href: '/attendance/check-out',
      icon: Clock,
      color: 'bg-orange-600'
    },
    {
      title: 'View History',
      description: 'Check attendance records',
      href: '/attendance/history',
      icon: Calendar,
      color: 'bg-blue-600'
    },
    {
      title: 'Register Employee',
      description: 'Add new employee',
      href: '/employees/register',
      icon: Users,
      color: 'bg-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.lightColor} p-3 rounded-full`}>
                    <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Attendance Rate Chart (placeholder) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Attendance Overview
          </h2>
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Attendance chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}