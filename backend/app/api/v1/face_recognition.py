from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session
import base64

from app.core.database import get_db
from app.services.simple_face_service import SimpleFaceService
from app.models.employee import Employee

router = APIRouter()
face_service = SimpleFaceService()

@router.post("/identify")
async def identify_face(
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Identify employee from face image"""
    # Validate image
    if not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read and encode image
    image_data = await image.read()
    image_base64 = base64.b64encode(image_data).decode('utf-8')
    
    # Identify face
    employee_id = face_service.identify_face(f"data:image/jpeg;base64,{image_base64}", db)
    
    if not employee_id:
        raise HTTPException(status_code=404, detail="Face not recognized")
    
    # Get employee details
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    
    return {
        "employee_id": employee.employee_id,
        "name": employee.first_name + " " + employee.last_name,
        "department": employee.department.name if employee.department else None
    }

@router.post("/encode")
async def encode_face(
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Encode face from image (for testing/debugging)"""
    # Validate image
    if not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read and encode image
    image_data = await image.read()
    image_base64 = base64.b64encode(image_data).decode('utf-8')
    
    # Encode face
    face_encoding = face_service.encode_face(f"data:image/jpeg;base64,{image_base64}")
    
    if not face_encoding:
        raise HTTPException(status_code=400, detail="No face detected in image")
    
    return {
        "face_encoding_length": len(face_encoding),
        "message": "Face encoded successfully"
    }

@router.post("/verify")
async def verify_face(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Verify if two face images belong to the same person"""
    # Validate images
    for img in [image1, image2]:
        if not img.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Files must be images")
    
    # Read and encode images
    image1_data = await image1.read()
    image2_data = await image2.read()
    
    image1_base64 = base64.b64encode(image1_data).decode('utf-8')
    image2_base64 = base64.b64encode(image2_data).decode('utf-8')
    
    # Encode faces
    encoding1 = face_service.encode_face(f"data:image/jpeg;base64,{image1_base64}")
    encoding2 = face_service.encode_face(f"data:image/jpeg;base64,{image2_base64}")
    
    if not encoding1 or not encoding2:
        raise HTTPException(status_code=400, detail="No face detected in one or both images")
    
    # Compare faces using simple similarity
    import numpy as np
    
    # Calculate similarity between encodings
    encoding1_arr = np.array(encoding1)
    encoding2_arr = np.array(encoding2)
    
    # Normalize and calculate cosine similarity
    enc1_norm = encoding1_arr / (np.linalg.norm(encoding1_arr) + 1e-7)
    enc2_norm = encoding2_arr / (np.linalg.norm(encoding2_arr) + 1e-7)
    similarity = np.dot(enc1_norm, enc2_norm)
    
    # Consider a match if similarity > 0.6
    is_match = similarity > 0.6
    confidence = "high" if similarity > 0.8 else "medium" if similarity > 0.6 else "low"
    
    return {
        "match": bool(is_match),
        "confidence": confidence,
        "similarity": float(similarity)
    }
