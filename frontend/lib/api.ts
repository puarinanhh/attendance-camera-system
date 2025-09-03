// lib/api.ts
import axios from 'axios';
import type {
  Employee,
  AttendanceRecord,
  CheckInRequest,
  CheckInResponse,
  CheckOutResponse,
  AuthResponse,
  User
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just clean up token on 401, but don't redirect automatically
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      // Let components handle the redirect logic themselves
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { username, password });
    if (response.data.access_token && typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },

  register: async (data: { full_name: string; email: string; password: string }) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.access_token && typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      // Don't force redirect here, let the calling component handle it
    }
  },

  getCurrentUser: async () => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// Employee API
export const employeeApi = {
  register: async (data: {
    employee_code: string;
    full_name: string;
    email: string;
    phone?: string;
    department: string;
    position: string;
    face_images: string[];
    password?: string;
  }) => {
    const response = await api.post<any>('/employees/register', data);
    return response.data;
  },

  getAll: async (page = 1, limit = 10) => {
    const response = await api.get<{
      items: Employee[];
      total: number;
      page: number;
      pages: number;
    }>('/employees', { params: { page, limit } });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<Employee>) => {
    const response = await api.patch<Employee>(`/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/employees/${id}`);
  },
};

// Attendance API
export const attendanceApi = {
  checkIn: async (data: CheckInRequest) => {
    const response = await api.post<CheckInResponse>('/attendance/check-in', data);
    return response.data;
  },

  checkOut: async (data: CheckInRequest) => {
    const response = await api.post<CheckOutResponse>('/attendance/check-out', data);
    return response.data;
  },

  getHistory: async (employeeId?: string, startDate?: string, endDate?: string) => {
    const response = await api.get<AttendanceRecord[]>('/attendance/history', {
      params: { employee_id: employeeId, start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getTodayStatus: async () => {
    const response = await api.get<{
      total_employees: number;
      checked_in: number;
      checked_out: number;
      absent: number;
    }>('/attendance/today-status');
    return response.data;
  },
};

export default api;