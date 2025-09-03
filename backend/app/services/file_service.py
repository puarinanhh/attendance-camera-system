import os
import base64
from datetime import datetime
from typing import Optional
from fastapi import UploadFile, HTTPException
from PIL import Image
import io

from app.core.config import settings

class FileService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.max_file_size = settings.MAX_FILE_SIZE
        self._ensure_upload_dir()
    
    def _ensure_upload_dir(self):
        """Ensure upload directory exists"""
        os.makedirs(self.upload_dir, exist_ok=True)
    
    async def save_uploaded_file(self, file: UploadFile, subdirectory: str = "") -> str:
        """Save uploaded file and return file path"""
        # Validate file size
        if file.size and file.size > self.max_file_size:
            raise HTTPException(status_code=400, detail="File too large")
        
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Create subdirectory if specified
        if subdirectory:
            full_dir = os.path.join(self.upload_dir, subdirectory)
            os.makedirs(full_dir, exist_ok=True)
        else:
            full_dir = self.upload_dir
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(full_dir, filename)
        
        # Save file
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        return file_path
    
    async def save_base64_image(self, base64_data: str, filename: str) -> str:
        """Save base64 image and return file path"""
        try:
            # Remove data URL prefix if present
            if base64_data.startswith('data:image/'):
                base64_data = base64_data.split(',')[1]
            
            # Decode base64
            image_data = base64.b64decode(base64_data)
            
            # Validate image
            image = Image.open(io.BytesIO(image_data))
            
            # Create attendance directory
            attendance_dir = os.path.join(self.upload_dir, "attendance")
            os.makedirs(attendance_dir, exist_ok=True)
            
            # Use provided filename
            file_path = os.path.join(attendance_dir, filename)
            
            # Save image
            image.save(file_path, "JPEG")
            
            return file_path
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")
    
    def delete_file(self, file_path: str) -> bool:
        """Delete file from storage"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception:
            return False
    
    def get_file_url(self, file_path: str) -> str:
        """Get file URL for frontend access"""
        # In production, this would return a CDN URL
        # For now, return relative path
        return f"/uploads/{os.path.basename(file_path)}"
