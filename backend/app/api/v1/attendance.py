# app/api/v1/attendance.py
from fastapi import APIRouter, HTTPException, Depends, Body
from datetime import datetime
from typing import Optional, Dict, Any
from app.models.attendance import AttendanceRecord, AttendanceStatus
from app.models.employee import Employee
from app.core.database import get_db
from app.core.config import settings
from app.services.file_service import FileService
import pytz

# Set timezone to Bangkok/Vietnam (UTC+7)
LOCAL_TZ = pytz.timezone('Asia/Bangkok')

# Initialize face recognition service
def get_face_service():
    """Get face recognition service - uses SimpleFaceService"""
    from app.services.simple_face_service import SimpleFaceService
    return SimpleFaceService()

router = APIRouter()
face_service = get_face_service()
file_service = FileService()

print(f"Using face recognition service: {type(face_service).__name__}")

@router.post("/check-in")
async def check_in(
    data: Dict[str, Any] = Body(...),
    db = Depends(get_db)
):
    """Process check-in with face recognition"""
    
    # Extract data from request body
    image_data = data.get("image_data")
    location = data.get("location")
    device_info = data.get("device_info")
    timestamp = data.get("timestamp")  # Get timestamp from frontend
    
    if not image_data:
        raise HTTPException(status_code=400, detail="image_data is required")
    
    # Identify employee
    employee_id_str = face_service.identify_face(image_data, db)
    
    if not employee_id_str:
        raise HTTPException(status_code=404, detail="Face not recognized")
    
    # Convert string ID to UUID
    import uuid
    try:
        employee_id = uuid.UUID(employee_id_str)
    except ValueError:
        raise HTTPException(status_code=500, detail="Invalid employee ID format")
    
    # Use timestamp from frontend if provided, otherwise use server time
    if timestamp:
        # Parse the timestamp from frontend (assumes ISO format)
        check_in_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    else:
        # Fallback to server time in local timezone
        check_in_time = datetime.now(LOCAL_TZ)
    
    # Get today's date for checking existing records
    local_today = check_in_time.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Check if already checked in today
    existing_record = db.query(AttendanceRecord).filter(
        AttendanceRecord.employee_id == employee_id,
        AttendanceRecord.check_in_time >= local_today
    ).first()
    
    if existing_record and not existing_record.check_out_time:
        raise HTTPException(status_code=400, detail="Already checked in")
    
    # Save image to storage
    image_url = await file_service.save_base64_image(image_data, f"checkin_{employee_id}_{check_in_time.strftime('%Y%m%d_%H%M%S')}.jpg")
    
    # Create attendance record with check-in time
    record = AttendanceRecord(
        employee_id=employee_id,
        check_in_time=check_in_time,
        check_in_image=image_url,
        check_in_location=location,
        check_in_device=device_info,
        status=AttendanceStatus.ON_TIME  # Calculate based on shift
    )
    
    db.add(record)
    db.commit()
    
    # Get employee info for response
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    
    return {
        "success": True,
        "employee_id": str(employee_id),
        "employee_name": f"{employee.first_name} {employee.last_name}" if employee else None,
        "check_in_time": record.check_in_time.isoformat(),
        "message": "Check-in successful"
    }

@router.post("/check-out")
async def check_out(
    data: Dict[str, Any] = Body(...),
    db = Depends(get_db)
):
    """Process check-out with face recognition"""
    
    # Extract data from request body
    image_data = data.get("image_data")
    timestamp = data.get("timestamp")  # Get timestamp from frontend
    
    if not image_data:
        raise HTTPException(status_code=400, detail="image_data is required")
    
    employee_id_str = face_service.identify_face(image_data, db)
    
    if not employee_id_str:
        raise HTTPException(status_code=404, detail="Face not recognized")
    
    # Convert string ID to UUID
    import uuid
    try:
        employee_id = uuid.UUID(employee_id_str)
    except ValueError:
        raise HTTPException(status_code=500, detail="Invalid employee ID format")
    
    # Use timestamp from frontend if provided, otherwise use server time
    if timestamp:
        # Parse the timestamp from frontend (assumes ISO format)
        check_out_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    else:
        # Fallback to server time in local timezone
        check_out_time = datetime.now(LOCAL_TZ)
    
    # Get today's date for finding check-in record
    local_today = check_out_time.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Find today's check-in record
    record = db.query(AttendanceRecord).filter(
        AttendanceRecord.employee_id == employee_id,
        AttendanceRecord.check_in_time >= local_today,
        AttendanceRecord.check_out_time == None
    ).first()
    
    if not record:
        raise HTTPException(status_code=400, detail="No check-in record found")
    
    # Update record with check-out time
    record.check_out_time = check_out_time
    record.check_out_image = await file_service.save_base64_image(image_data, f"checkout_{employee_id}_{check_out_time.strftime('%Y%m%d_%H%M%S')}.jpg")
    record.work_hours = calculate_work_hours(
        record.check_in_time, 
        record.check_out_time
    )
    
    db.commit()
    
    # Get employee info for response
    from app.models.employee import Employee
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    
    return {
        "success": True,
        "employee_id": str(employee_id),
        "employee_name": f"{employee.first_name} {employee.last_name}" if employee else None,
        "check_out_time": record.check_out_time.isoformat(),
        "work_hours": record.work_hours,
        "message": "Check-out successful"
    }

def calculate_work_hours(check_in_time: datetime, check_out_time: datetime) -> float:
    """Calculate work hours between check-in and check-out times"""
    time_diff = check_out_time - check_in_time
    return round(time_diff.total_seconds() / 3600, 2)  # Convert to hours

@router.get("/today-status")
async def get_today_status(db = Depends(get_db)):
    """Get today's attendance status summary"""
    from app.models.employee import Employee
    from sqlalchemy import func, and_
    
    # Get today in local timezone
    local_now = datetime.now(LOCAL_TZ)
    today = local_now.date()
    
    # Get total number of active employees
    total_employees = db.query(func.count(Employee.id)).filter(
        Employee.is_active == True
    ).scalar()
    
    # Get number of employees who checked in today
    checked_in = db.query(func.count(AttendanceRecord.id.distinct())).filter(
        func.date(AttendanceRecord.check_in_time) == today
    ).scalar()
    
    # Get number of employees who checked out today
    checked_out = db.query(func.count(AttendanceRecord.id)).filter(
        and_(
            func.date(AttendanceRecord.check_in_time) == today,
            AttendanceRecord.check_out_time != None
        )
    ).scalar()
    
    # Calculate absent employees
    absent = total_employees - checked_in if total_employees > checked_in else 0
    
    return {
        "total_employees": total_employees,
        "checked_in": checked_in,
        "checked_out": checked_out,
        "absent": absent,
        "date": today.isoformat()
    }

@router.get("/history")
async def get_attendance_history(
    employee_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db = Depends(get_db)
):
    """Get attendance history with optional filters"""
    from app.models.employee import Employee
    
    query = db.query(AttendanceRecord).join(Employee, AttendanceRecord.employee_id == Employee.id)
    
    if employee_id:
        query = query.filter(AttendanceRecord.employee_id == employee_id)
    
    if start_date:
        query = query.filter(AttendanceRecord.check_in_time >= datetime.fromisoformat(start_date))
    
    if end_date:
        query = query.filter(AttendanceRecord.check_in_time <= datetime.fromisoformat(end_date))
    
    records = query.order_by(AttendanceRecord.check_in_time.desc()).all()
    
    # Format the response
    result = []
    for record in records:
        result.append({
            "id": str(record.id),
            "employee_id": str(record.employee_id),
            "employee_name": f"{record.employee.first_name} {record.employee.last_name}" if record.employee else None,
            "check_in_time": record.check_in_time.isoformat() if record.check_in_time else None,
            "check_out_time": record.check_out_time.isoformat() if record.check_out_time else None,
            "status": record.status,
            "work_hours": record.work_hours,
            "location": record.check_in_location
        })
    
    return result

@router.post("/test-face-recognition")
async def test_face_recognition(
    data: Dict[str, Any] = Body(...),
    db = Depends(get_db)
):
    """Test face recognition with InsightFace service"""
    image_data = data.get("image_data")
    service_type = data.get("service", "current")  # current or insightface only
    
    if not image_data:
        raise HTTPException(status_code=400, detail="image_data is required")
    
    try:
        # Get the appropriate service (only InsightFace supported now)
        if service_type == "insightface" or service_type == "current":
            from app.services.insightface_service import InsightFaceService
            test_service = InsightFaceService()
        else:
            test_service = face_service
        
        # Try to identify face
        employee_id = test_service.identify_face(image_data, db)
        
        if employee_id:
            # Get employee info
            employee = db.query(Employee).filter(Employee.id == employee_id).first()
            return {
                "success": True,
                "service_used": type(test_service).__name__,
                "model_used": getattr(test_service, 'model_name', 'unknown'),
                "employee_id": employee_id,
                "employee_name": f"{employee.first_name} {employee.last_name}" if employee else None
            }
        else:
            return {
                "success": False,
                "service_used": type(test_service).__name__,
                "model_used": getattr(test_service, 'model_name', 'unknown'),
                "message": "Face not recognized"
            }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Face recognition test failed"
        }