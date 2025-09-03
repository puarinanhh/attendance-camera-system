# Attendance Camera System - Backend

A FastAPI-based backend for the Attendance Camera System with face recognition capabilities.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Employee Management**: CRUD operations for employee data
- **Face Recognition**: Face detection and identification using face_recognition library
- **Attendance Tracking**: Check-in/check-out with face verification
- **File Management**: Secure file upload and storage
- **Database Integration**: PostgreSQL with SQLAlchemy ORM
- **Caching**: Redis integration for performance optimization

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py              # Authentication endpoints
│   │       ├── attendance.py        # Attendance endpoints
│   │       ├── employees.py         # Employee management
│   │       └── face_recognition.py  # Face recognition endpoints
│   ├── core/
│   │   ├── config.py               # Configuration management
│   │   ├── database.py             # Database connection
│   │   └── security.py             # Security utilities
│   ├── models/                     # SQLAlchemy models
│   ├── schemas/                    # Pydantic schemas
│   ├── services/                   # Business logic services
│   └── main.py                     # FastAPI application
├── alembic/                        # Database migrations
├── uploads/                        # File storage
├── face_models/                    # Face recognition models
├── requirements.txt                # Python dependencies
├── Dockerfile                      # Docker configuration
└── README.md                       # This file
```

## Prerequisites

- Python 3.9+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

## Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd attendance-camera-system/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb attendance_db
   
   # Run migrations
   alembic upgrade head
   ```

6. **Start Redis**
   ```bash
   redis-server
   ```

7. **Run the application**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   cd ..  # Go to project root
   docker-compose up --build
   ```

2. **Or build backend only**
   ```bash
   cd backend
   docker build -t attendance-backend .
   docker run -p 8000:8000 attendance-backend
   ```

## API Documentation

Once the server is running, you can access:

- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user

### Employees
- `GET /api/v1/employees/` - List employees
- `POST /api/v1/employees/` - Create employee
- `GET /api/v1/employees/{id}` - Get employee
- `PUT /api/v1/employees/{id}` - Update employee
- `DELETE /api/v1/employees/{id}` - Delete employee
- `POST /api/v1/employees/{id}/face-registration` - Register face

### Attendance
- `POST /api/v1/attendance/check-in` - Check in
- `POST /api/v1/attendance/check-out` - Check out

### Face Recognition
- `POST /api/v1/face/identify` - Identify face
- `POST /api/v1/face/encode` - Encode face
- `POST /api/v1/face/verify` - Verify faces

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://admin:password@localhost:5432/attendance_db` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `SECRET_KEY` | JWT secret key | `your-secret-key-here-change-in-production` |
| `DEBUG` | Debug mode | `True` |
| `ENVIRONMENT` | Environment name | `development` |
| `UPLOAD_DIR` | File upload directory | `./uploads` |
| `MAX_FILE_SIZE` | Maximum file size in bytes | `5242880` (5MB) |

## Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Development

### Code Style
- Follow PEP 8 guidelines
- Use type hints
- Add docstrings to functions and classes

### Testing
```bash
# Run tests (when implemented)
pytest

# Run with coverage
pytest --cov=app
```

### Linting
```bash
# Install linting tools
pip install flake8 black isort

# Run linters
flake8 app/
black app/
isort app/
```

## Production Deployment

1. **Set production environment variables**
   ```bash
   ENVIRONMENT=production
   DEBUG=False
   SECRET_KEY=<strong-secret-key>
   ```

2. **Use production database**
   - Use managed PostgreSQL service
   - Configure connection pooling
   - Set up backups

3. **Security considerations**
   - Use HTTPS
   - Configure CORS properly
   - Set up rate limiting
   - Use environment-specific secrets

4. **Monitoring**
   - Set up logging
   - Configure health checks
   - Monitor performance metrics

## Troubleshooting

### Common Issues

1. **Face recognition not working**
   - Ensure OpenCV dependencies are installed
   - Check if face_models directory exists
   - Verify image format and size

2. **Database connection errors**
   - Check DATABASE_URL format
   - Ensure PostgreSQL is running
   - Verify database exists

3. **File upload issues**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure proper file format

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
