from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import base64
from io import BytesIO
from pydantic import BaseModel
import secrets
import string

from app.core.database import get_db
from app.models.employee import Employee
from app.models.user import User, UserRole
from app.schemas.employee import EmployeeCreate, EmployeeResponse, EmployeeUpdate
from app.services.simple_face_service import SimpleFaceService
from app.api.v1.auth import get_current_user, get_password_hash

router = APIRouter()
face_service = SimpleFaceService()

class EmployeeRegistrationRequest(BaseModel):
    employee_code: str
    full_name: str
    email: str
    phone: Optional[str] = None
    department: str
    position: str
    face_images: List[str]
    password: Optional[str] = None  # If not provided, will generate random password

class PaginatedEmployeeResponse(BaseModel):
    items: List[EmployeeResponse]
    total: int
    page: int
    pages: int

def generate_random_password(length: int = 8) -> str:
    """Generate a random password with letters and digits"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

@router.post("/register")
async def register_employee(
    registration_data: EmployeeRegistrationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register a new employee with face images and create a user account"""
    # Check if employee already exists
    existing_employee = db.query(Employee).filter(
        Employee.employee_code == registration_data.employee_code
    ).first()
    if existing_employee:
        raise HTTPException(status_code=400, detail="Employee code already exists")
    
    # Check if user with this email already exists
    existing_user = db.query(User).filter(
        User.email == registration_data.email
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Split full name into first and last name
    name_parts = registration_data.full_name.strip().split(' ', 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""
    
    # Process face images and get encoding
    face_encoding = None
    face_images = []
    if registration_data.face_images:
        for face_image in registration_data.face_images:
            encoding = face_service.encode_face(face_image)
            if encoding:
                face_encoding = encoding
                # Store the base64 image for later use
                face_images.append(face_image)
                break
    
    # Generate password if not provided
    password = registration_data.password if registration_data.password else generate_random_password()
    
    try:
        # Create employee first
        db_employee = Employee(
            employee_code=registration_data.employee_code,
            full_name=registration_data.full_name,
            first_name=first_name,
            last_name=last_name,
            email=registration_data.email,
            phone=registration_data.phone,
            department_id=None,  # Will be updated when department system is implemented
            position=registration_data.position,
            face_encoding=face_encoding,
            face_images=face_images if face_images else None,
            is_active=True
        )
        
        db.add(db_employee)
        db.flush()  # Flush to get the employee ID without committing
        
        # Create user account linked to employee
        db_user = User(
            username=registration_data.email,  # Use email as username
            email=registration_data.email,
            full_name=registration_data.full_name,
            hashed_password=get_password_hash(password),
            employee_id=db_employee.id,  # Link to employee
            role=UserRole.EMPLOYEE,
            is_active=True,
            is_verified=True  # Auto-verify since admin is creating
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_employee)
        
        # Return response with credentials info
        return {
            "employee": db_employee,
            "credentials": {
                "username": registration_data.email,
                "password": password,  # Return password only during registration
                "message": "User account created successfully. Please save these credentials."
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=EmployeeResponse)
async def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new employee (legacy endpoint)"""
    # Check if employee already exists
    existing_employee = db.query(Employee).filter(
        Employee.employee_code == employee.employee_code
    ).first()
    if existing_employee:
        raise HTTPException(status_code=400, detail="Employee code already exists")
    
    db_employee = Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.get("/", response_model=PaginatedEmployeeResponse)
async def get_employees(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all employees with pagination"""
    skip = (page - 1) * limit
    
    # Get total count
    total = db.query(Employee).count()
    
    # Get employees with pagination
    employees = db.query(Employee).offset(skip).limit(limit).all()
    
    # Return paginated response matching frontend expectations
    return PaginatedEmployeeResponse(
        items=employees,
        total=total,
        page=page,
        pages=(total + limit - 1) // limit  # Calculate total pages
    )

@router.get("/{employee_code}", response_model=EmployeeResponse)
async def get_employee(
    employee_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get employee by code"""
    employee = db.query(Employee).filter(Employee.employee_code == employee_code).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.put("/{employee_code}", response_model=EmployeeResponse)
async def update_employee(
    employee_code: str,
    employee_update: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update employee information (PUT)"""
    db_employee = db.query(Employee).filter(Employee.employee_code == employee_code).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    for field, value in employee_update.dict(exclude_unset=True).items():
        setattr(db_employee, field, value)
    
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.patch("/{employee_code}", response_model=EmployeeResponse)
async def patch_employee(
    employee_code: str,
    employee_update: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update employee information (PATCH)"""
    db_employee = db.query(Employee).filter(Employee.employee_code == employee_code).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    for field, value in employee_update.dict(exclude_unset=True).items():
        setattr(db_employee, field, value)
    
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.delete("/{employee_code}")
async def delete_employee(
    employee_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete employee"""
    db_employee = db.query(Employee).filter(Employee.employee_code == employee_code).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    db.delete(db_employee)
    db.commit()
    return {"message": "Employee deleted successfully"}

@router.post("/{employee_code}/face-registration")
async def register_face(
    employee_code: str,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register employee face for recognition"""
    # Validate image
    if not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read and encode image
    image_data = await image.read()
    image_base64 = base64.b64encode(image_data).decode('utf-8')
    
    # Get employee
    employee = db.query(Employee).filter(Employee.employee_code == employee_code).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Encode face
    face_encoding = face_service.encode_face(f"data:image/jpeg;base64,{image_base64}")
    if not face_encoding:
        raise HTTPException(status_code=400, detail="No face detected in image")
    
    # Update employee with face encoding
    employee.face_encoding = face_encoding
    db.commit()
    
    return {"message": "Face registered successfully"}

@router.get("/{employee_code}/attendance")
async def get_employee_attendance(
    employee_code: str,
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get employee attendance records"""
    from app.models.attendance import AttendanceRecord
    from datetime import datetime
    
    # First get the employee to get their ID
    employee = db.query(Employee).filter(Employee.employee_code == employee_code).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    query = db.query(AttendanceRecord).filter(
        AttendanceRecord.employee_id == employee.id
    )
    
    if start_date:
        query = query.filter(AttendanceRecord.check_in_time >= start_date)
    if end_date:
        query = query.filter(AttendanceRecord.check_in_time <= end_date)
    
    records = query.order_by(AttendanceRecord.check_in_time.desc()).all()
    return records
