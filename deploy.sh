#!/bin/bash

# Attendance Camera System - Deployment Script
# This script sets up and deploys the attendance camera system

set -e

echo "🚀 Attendance Camera System - Deployment Script"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if command_exists docker; then
        print_success "Docker is installed"
    else
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if command_exists docker-compose; then
        print_success "Docker Compose is installed"
    else
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Docker daemon is running
    if docker info >/dev/null 2>&1; then
        print_success "Docker daemon is running"
    else
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
}

# Function to create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    
    if [ ! -f .env ]; then
        cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://attendance_user:attendance_pass@postgres:5432/attendance_db

# Security Configuration
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Face Recognition Configuration
FACE_RECOGNITION_THRESHOLD=0.6
FACE_DETECTION_CONFIDENCE=0.5

# Server Configuration
HOST=0.0.0.0
PORT=8000

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
        print_success "Environment file created"
    else
        print_warning "Environment file already exists, skipping creation"
    fi
}

# Function to build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Stop any existing containers
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Build and start services
    docker-compose up --build -d
    
    print_success "Services started successfully"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for backend
    print_status "Waiting for backend service..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -s http://localhost:8000/health >/dev/null 2>&1; then
            print_success "Backend service is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Backend service failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for frontend
    print_status "Waiting for frontend service..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            print_success "Frontend service is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Frontend service failed to start within 60 seconds"
        exit 1
    fi
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait a bit for database to be ready
    sleep 5
    
    # Run migrations
    if docker-compose exec -T backend alembic upgrade head; then
        print_success "Database migrations completed"
    else
        print_error "Database migrations failed"
        exit 1
    fi
}

# Function to create default admin user
create_admin_user() {
    print_status "Creating default admin user..."
    
    # Check if admin user already exists
    if curl -s -X POST http://localhost:8000/api/v1/auth/login \
        -H "Content-Type: application/json" \
        -d '{"username": "admin", "password": "123456"}' | jq -e '.access_token' >/dev/null 2>&1; then
        print_success "Admin user already exists"
        return 0
    fi
    
    # Create admin user (this would need to be implemented in the backend)
    print_warning "Admin user creation not implemented in backend yet"
    print_warning "Please create admin user manually through the API"
}

# Function to run system tests
run_tests() {
    print_status "Running system tests..."
    
    if [ -f test_system.sh ]; then
        if ./test_system.sh; then
            print_success "All system tests passed"
        else
            print_error "Some system tests failed"
            exit 1
        fi
    else
        print_warning "Test script not found, skipping tests"
    fi
}

# Function to display final information
display_final_info() {
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "====================================="
    echo ""
    echo "📱 Access your application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo "   API Documentation: http://localhost:8000/docs"
    echo ""
    echo "🔐 Default credentials:"
    echo "   Username: admin"
    echo "   Password: 123456"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart services: docker-compose restart"
    echo "   Run tests: ./test_system.sh"
    echo ""
    echo "📚 Documentation: README.md"
    echo ""
}

# Function to cleanup on error
cleanup() {
    print_error "Deployment failed. Cleaning up..."
    docker-compose down --remove-orphans 2>/dev/null || true
    exit 1
}

# Set up error handling
trap cleanup ERR

# Main deployment function
main() {
    echo "Starting deployment process..."
    echo ""
    
    check_prerequisites
    create_env_file
    deploy_services
    wait_for_services
    run_migrations
    create_admin_user
    run_tests
    display_final_info
}

# Check if script is run with help flag
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Attendance Camera System - Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help, -h     Show this help message"
    echo "  --skip-tests   Skip running system tests"
    echo ""
    echo "This script will:"
    echo "  1. Check prerequisites (Docker, Docker Compose)"
    echo "  2. Create environment configuration"
    echo "  3. Build and start all services"
    echo "  4. Run database migrations"
    echo "  5. Create default admin user"
    echo "  6. Run system tests"
    echo "  7. Display access information"
    echo ""
    exit 0
fi

# Check if tests should be skipped
if [ "$1" = "--skip-tests" ]; then
    SKIP_TESTS=true
fi

# Run main deployment
main
