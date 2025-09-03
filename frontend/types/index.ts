// types/index.ts
export interface Employee {
    id: string;  // UUID from backend
    employee_code: string;
    full_name: string;
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
    department_id?: string;  // UUID
    position?: string;
    hire_date?: string;
    is_active: boolean;
    face_encoding?: number[];
    face_images?: string[];
  }
  
  export interface AttendanceRecord {
    id: string;
    employee_id: string;
    employee_name?: string;
    check_in_time: string;
    check_out_time?: string;
    status: 'on_time' | 'late' | 'early_leave' | 'absent';
    work_hours?: number;
    location?: string;
  }
  
  export interface CheckInRequest {
    image_data: string;
    location?: string | null;
    device_info?: unknown;
    timestamp?: string;  // ISO format timestamp from frontend
  }
  
  export interface CheckInResponse {
    success: boolean;
    employee_id: string;
    employee_name: string;
    check_in_time: string;
    message: string;
  }
  
  export interface CheckOutResponse {
    success: boolean;
    employee_id: string;
    employee_name: string;
    check_out_time: string;
    message: string;
    work_hours: number;
  }
  export interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'hr' | 'employee';
  }
  
  export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
  }