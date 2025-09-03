/* app/employeess/page.tsx */
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { employeeApi, authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Employee } from '@/types';

export default function EmployeesListPage() {
  const router = useRouter();
  const [items, setItems] = useState<Employee[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const pageSize = 10;

  const load = async (p: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await employeeApi.getAll(p, pageSize);
      setItems(res.items || []);
      setPage(res.page || p);
      setPages(res.pages || 1);
      setTotal(res.total || 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

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
        // Verify token is valid
        await authApi.getCurrentUser();
        setIsAuthenticated(true);
        setIsCheckingAuth(false);
        // Load data after authentication is confirmed
        load(1);
      } catch (error) {
        console.error('Authentication failed:', error);
        toast.error('Session expired. Please login again');
        localStorage.removeItem('access_token');
        router.push('/login');
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const canPrev = page > 1;
  const canNext = page < pages;

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

  // If not authenticated, don't render the page (will redirect in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Employees</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{total} employees registered</p>
          </div>
          <Link 
            href="/employees/register" 
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Register Employee
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading employees...</p>
          </div>
        ) : error ? (
          <div className="py-4 px-6 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No employees found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">Code</th>
                  <th className="text-left px-6 py-4 font-semibold">Name</th>
                  <th className="text-left px-6 py-4 font-semibold">Email</th>
                  <th className="text-left px-6 py-4 font-semibold">Department</th>
                  <th className="text-left px-6 py-4 font-semibold">Position</th>
                  <th className="text-left px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400">{emp.employee_code}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{emp.email}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{emp.department_id ? 'Assigned' : '-'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{emp.position || '-'}</td>
                    <td className="px-6 py-4">
                      {emp.is_active ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {pages} • {total} total employees
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => canPrev && load(page - 1)}
              disabled={!canPrev}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => canNext && load(page + 1)}
              disabled={!canNext}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
