"""
Simple Face Recognition Service
A lightweight face recognition service that doesn't rely on complex dependencies
"""

import numpy as np
from typing import Optional, List
import base64
from io import BytesIO
from PIL import Image
import hashlib
import json


class SimpleFaceService:
    """Simple face recognition service using basic image features"""
    
    def __init__(self):
        """Initialize simple face service"""
        print("✅ SimpleFaceService initialized")
    
    def encode_face(self, image_data: str) -> Optional[List[float]]:
        """Extract simple face features from base64 image"""
        try:
            # Convert base64 to image
            image = self._decode_base64_image(image_data)
            if image is None:
                return None
            
            # Create a simple feature vector based on image characteristics
            features = self._extract_simple_features(image)
            return features
                
        except Exception as e:
            print(f"Error encoding face: {e}")
            return None
    
    def identify_face(self, image_data: str, db=None) -> Optional[str]:
        """Identify face by comparing with stored features"""
        try:
            if db is None:
                print("Database session not provided")
                return None
            
            # Load employees with face encodings
            from app.models.employee import Employee
            employees = db.query(Employee).filter(
                Employee.face_encoding.isnot(None),
                Employee.is_active == True
            ).all()
            
            if not employees:
                print("No employees with face encodings found")
                return None
            
            # Get features for input image
            input_features = self.encode_face(image_data)
            if not input_features:
                print("Could not encode input face")
                return None
            
            input_features = np.array(input_features)
            
            # Compare with known faces
            best_match_id = None
            best_similarity = 0.5  # Minimum similarity threshold
            
            for employee in employees:
                if employee.face_encoding:
                    try:
                        employee_features = np.array(employee.face_encoding)
                        
                        # Calculate similarity
                        similarity = self._calculate_similarity(input_features, employee_features)
                        
                        print(f"Similarity with employee {employee.id}: {similarity:.3f}")
                        
                        if similarity > best_similarity:
                            best_similarity = similarity
                            best_match_id = str(employee.id)
                            
                    except Exception as e:
                        print(f"Error comparing with employee {employee.id}: {e}")
                        continue
            
            if best_match_id:
                print(f"✅ Face recognized as employee {best_match_id} with similarity {best_similarity:.3f}")
                return best_match_id
            
            print("❌ No face match found above threshold")
            return None
            
        except Exception as e:
            print(f"Error identifying face: {e}")
            return None
    
    def _extract_simple_features(self, image: np.ndarray) -> List[float]:
        """Extract simple features from image"""
        try:
            # Convert to grayscale
            if len(image.shape) == 3:
                gray = np.mean(image, axis=2)
            else:
                gray = image
            
            # Resize to standard size
            from PIL import Image as PILImage
            pil_image = PILImage.fromarray(gray.astype('uint8'))
            pil_image = pil_image.resize((64, 64))
            resized = np.array(pil_image)
            
            # Extract various features
            features = []
            
            # 1. Histogram features
            hist, _ = np.histogram(resized, bins=16, range=(0, 256))
            hist = hist / (np.sum(hist) + 1e-7)  # Normalize
            features.extend(hist)
            
            # 2. Statistical features
            features.extend([
                np.mean(resized) / 255.0,
                np.std(resized) / 255.0,
                np.min(resized) / 255.0,
                np.max(resized) / 255.0,
                np.median(resized) / 255.0
            ])
            
            # 3. Gradient features
            grad_x = np.gradient(resized, axis=1)
            grad_y = np.gradient(resized, axis=0)
            features.extend([
                np.mean(grad_x) / 255.0,
                np.std(grad_x) / 255.0,
                np.mean(grad_y) / 255.0,
                np.std(grad_y) / 255.0
            ])
            
            # 4. Edge features (simple edge detection)
            edges = self._simple_edge_detection(resized)
            edge_hist, _ = np.histogram(edges, bins=8, range=(0, 256))
            edge_hist = edge_hist / (np.sum(edge_hist) + 1e-7)
            features.extend(edge_hist)
            
            # 5. Texture features (variance in local patches)
            texture_features = self._extract_texture_features(resized)
            features.extend(texture_features)
            
            # Ensure fixed length (64 features)
            features = features[:64]
            while len(features) < 64:
                features.append(0.0)
            
            return features
            
        except Exception as e:
            print(f"Error extracting features: {e}")
            return [0.0] * 64
    
    def _simple_edge_detection(self, image: np.ndarray) -> np.ndarray:
        """Simple edge detection using gradients"""
        grad_x = np.gradient(image, axis=1)
        grad_y = np.gradient(image, axis=0)
        edges = np.sqrt(grad_x**2 + grad_y**2)
        return edges
    
    def _extract_texture_features(self, image: np.ndarray) -> List[float]:
        """Extract texture features from image"""
        features = []
        
        # Divide image into 4x4 patches and calculate variance
        h, w = image.shape
        patch_h, patch_w = h // 4, w // 4
        
        for i in range(4):
            for j in range(4):
                patch = image[i*patch_h:(i+1)*patch_h, j*patch_w:(j+1)*patch_w]
                if patch.size > 0:
                    features.append(np.var(patch) / (255.0**2))
        
        # Pad if necessary
        while len(features) < 16:
            features.append(0.0)
        
        return features[:16]
    
    def _calculate_similarity(self, features1: np.ndarray, features2: np.ndarray) -> float:
        """Calculate similarity between two feature vectors"""
        try:
            # Normalize features
            features1_norm = features1 / (np.linalg.norm(features1) + 1e-7)
            features2_norm = features2 / (np.linalg.norm(features2) + 1e-7)
            
            # Calculate cosine similarity
            similarity = np.dot(features1_norm, features2_norm)
            return float(similarity)
            
        except Exception as e:
            print(f"Error calculating similarity: {e}")
            return 0.0
    
    def _decode_base64_image(self, base64_string: str) -> Optional[np.ndarray]:
        """Convert base64 string to numpy array"""
        try:
            # Handle data URL format
            if ',' in base64_string:
                img_data = base64.b64decode(base64_string.split(',')[1])
            else:
                img_data = base64.b64decode(base64_string)
            
            img = Image.open(BytesIO(img_data))
            
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            return np.array(img)
            
        except Exception as e:
            print(f"Error decoding base64 image: {e}")
            return None


# Create an alias for compatibility
InsightFaceService = SimpleFaceService