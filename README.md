# Attendance Camera System

A modern, AI-powered face recognition attendance management system built with FastAPI, Next.js, and Docker.

## 🚀 Features

- **Face Recognition**: AI-powered face detection and recognition for automatic attendance tracking
- **Real-time Processing**: Instant check-in/check-out with face verification
- **Modern UI**: Beautiful, responsive web interface built with Next.js and Tailwind CSS
- **Secure Authentication**: JWT-based authentication system
- **Employee Management**: Complete employee registration and management system
- **Attendance History**: Comprehensive attendance tracking and reporting
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **API Documentation**: Auto-generated API documentation with Swagger UI

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with Python 3.9+
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens with OAuth2
- **Face Recognition**: Custom face detection and encoding system
- **API Documentation**: Swagger UI at `/docs`

### Frontend (Next.js)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **Camera Integration**: WebRTC camera access with face detection
- **Real-time Updates**: WebSocket integration for live updates
- **Responsive Design**: Mobile-first responsive design

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.9+ (for local development)

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd attendance-camera-system
   ```

2. **Start the system**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

4. **Default credentials**
   - Username: `admin`
   - Password: `123456`

### Local Development

1. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Database Setup**
   ```bash
   cd backend
   alembic upgrade head
   ```

## 🧪 Testing

Run the comprehensive test suite:

```bash
./test_system.sh
```

This will test:
- Service availability
- Authentication
- Employee management
- Face recognition
- Attendance tracking
- API endpoints
- Error handling

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Employees
- `GET /api/v1/employees/` - List all employees
- `POST /api/v1/employees/` - Create new employee
- `GET /api/v1/employees/{id}` - Get employee details
- `PUT /api/v1/employees/{id}` - Update employee
- `DELETE /api/v1/employees/{id}` - Delete employee

### Attendance
- `POST /api/v1/attendance/check-in` - Check in with face recognition
- `POST /api/v1/attendance/check-out` - Check out with face recognition
- `GET /api/v1/attendance/history` - Get attendance history

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/attendance_db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Face Recognition
FACE_RECOGNITION_THRESHOLD=0.6
FACE_DETECTION_CONFIDENCE=0.5

# Server
HOST=0.0.0.0
PORT=8000
```

### Docker Configuration

The system uses Docker Compose with the following services:
- `backend`: FastAPI application
- `frontend`: Next.js application
- `postgres`: PostgreSQL database
- `redis`: Redis cache (optional)

## 🎯 Usage

### Employee Registration

1. Navigate to the employee registration page
2. Fill in employee details (name, email, department, etc.)
3. Capture face images using the camera
4. Submit the registration

### Attendance Tracking

1. **Check-in**:
   - Navigate to the check-in page
   - Allow camera access
   - Position face in the camera view
   - System will automatically detect and verify the face
   - Check-in is recorded with timestamp and location

2. **Check-out**:
   - Follow the same process as check-in
   - System calculates work hours automatically

### Dashboard

- View real-time attendance statistics
- Monitor employee check-ins/check-outs
- Access attendance reports and history

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Face Verification**: Multi-factor authentication with face recognition
- **Input Validation**: Comprehensive input validation and sanitization
- **SQL Injection Protection**: Parameterized queries with SQLAlchemy
- **CORS Protection**: Configured CORS policies
- **Rate Limiting**: API rate limiting for abuse prevention

## 🐛 Troubleshooting

### Common Issues

1. **Camera not working**:
   - Ensure HTTPS is enabled (required for camera access)
   - Check browser permissions for camera access
   - Try refreshing the page

2. **Face recognition not working**:
   - Ensure good lighting conditions
   - Position face clearly in the camera view
   - Check if face is properly registered

3. **Database connection issues**:
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Run database migrations: `alembic upgrade head`

4. **Docker issues**:
   - Check if all containers are running: `docker-compose ps`
   - View logs: `docker-compose logs [service-name]`
   - Rebuild containers: `docker-compose up --build`

### Logs

View application logs:

```bash
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# Database logs
docker-compose logs postgres
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `./test_system.sh`
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/docs`
- Review the troubleshooting section above

## 🔄 Updates

To update the system:

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart containers
docker-compose down
docker-compose up --build -d

# Run database migrations (if needed)
docker-compose exec backend alembic upgrade head
```

---

**Note**: This system is designed for educational and demonstration purposes. For production use, additional security measures and compliance considerations should be implemented.
