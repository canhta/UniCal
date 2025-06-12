#!/bin/bash

# UniCal Development Setup Script
# This script provides a clean development environment setup

set -e  # Exit on any error

echo "🚀 Starting UniCal Development Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Get the project root directory (parent of scripts folder)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

print_step "Working in project directory: $PROJECT_ROOT"

# Step 1: Copy environment files
print_step "Setting up environment files..."

# Backend .env file
if [ -f "apps/backend/.env.example" ]; then
    if [ ! -f "apps/backend/.env" ]; then
        cp "apps/backend/.env.example" "apps/backend/.env"
        
        # Generate secure random keys for JWT_SECRET and TOKEN_ENCRYPTION_KEY
        print_step "Generating secure encryption keys..."
        
        # Generate a 64-character random JWT secret
        JWT_SECRET=$(openssl rand -hex 32)
        
        # Generate a 64-character random token encryption key
        TOKEN_ENCRYPTION_KEY=$(openssl rand -hex 32)
        
        # Update the .env file with generated keys
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/JWT_SECRET=/JWT_SECRET=${JWT_SECRET}/" "apps/backend/.env"
            sed -i '' "s/TOKEN_ENCRYPTION_KEY=/TOKEN_ENCRYPTION_KEY=${TOKEN_ENCRYPTION_KEY}/" "apps/backend/.env"
        else
            # Linux
            sed -i "s/JWT_SECRET=/JWT_SECRET=${JWT_SECRET}/" "apps/backend/.env"
            sed -i "s/TOKEN_ENCRYPTION_KEY=/TOKEN_ENCRYPTION_KEY=${TOKEN_ENCRYPTION_KEY}/" "apps/backend/.env"
        fi
        
        print_success "Backend .env file created with generated encryption keys"
    else
        print_warning "Backend .env file already exists, skipping copy"
        
        # Check if keys are missing and offer to generate them
        if grep -q "JWT_SECRET=$" "apps/backend/.env" || grep -q "TOKEN_ENCRYPTION_KEY=$" "apps/backend/.env"; then
            print_warning "Empty encryption keys detected in existing .env file"
            read -p "Would you like to generate missing encryption keys? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                print_step "Generating missing encryption keys..."
                
                # Generate keys only if they're empty
                if grep -q "JWT_SECRET=$" "apps/backend/.env"; then
                    JWT_SECRET=$(openssl rand -hex 32)
                    if [[ "$OSTYPE" == "darwin"* ]]; then
                        sed -i '' "s/JWT_SECRET=/JWT_SECRET=${JWT_SECRET}/" "apps/backend/.env"
                    else
                        sed -i "s/JWT_SECRET=/JWT_SECRET=${JWT_SECRET}/" "apps/backend/.env"
                    fi
                    print_success "Generated JWT_SECRET"
                fi
                
                if grep -q "TOKEN_ENCRYPTION_KEY=$" "apps/backend/.env"; then
                    TOKEN_ENCRYPTION_KEY=$(openssl rand -hex 32)
                    if [[ "$OSTYPE" == "darwin"* ]]; then
                        sed -i '' "s/TOKEN_ENCRYPTION_KEY=/TOKEN_ENCRYPTION_KEY=${TOKEN_ENCRYPTION_KEY}/" "apps/backend/.env"
                    else
                        sed -i "s/TOKEN_ENCRYPTION_KEY=/TOKEN_ENCRYPTION_KEY=${TOKEN_ENCRYPTION_KEY}/" "apps/backend/.env"
                    fi
                    print_success "Generated TOKEN_ENCRYPTION_KEY"
                fi
            fi
        fi
    fi
else
    print_warning "Backend .env.example not found"
fi

# Step 2: Clean up existing Docker containers and volumes
print_step "Cleaning up existing Docker containers and volumes..."

# Get the project directory name for volume naming
PROJECT_NAME=$(basename "$PROJECT_ROOT" | tr '[:upper:]' '[:lower:]')

# Stop and remove specific UniCal containers
print_step "Stopping and removing UniCal containers..."
docker stop unical_postgres unical_redis 2>/dev/null || true
docker rm unical_postgres unical_redis 2>/dev/null || true

# Remove specific UniCal volumes
print_step "Removing UniCal volumes..."
docker volume rm ${PROJECT_NAME}_postgres_data ${PROJECT_NAME}_redis_data 2>/dev/null || true

# Alternative: Use docker-compose to clean up (safer approach)
if [ -f "docker-compose.yml" ]; then
    print_step "Using docker-compose to clean up project resources..."
    docker-compose down -v --remove-orphans 2>/dev/null || true
fi

# Only clean up UniCal-related orphaned resources
print_step "Cleaning up UniCal-related orphaned resources..."
# Remove only networks created by this project
docker network ls --filter "name=${PROJECT_NAME}" --format "{{.ID}}" | xargs -r docker network rm 2>/dev/null || true

print_success "Docker cleanup completed"

# Step 3: Start Docker services
print_step "Starting Docker services with docker-compose..."

if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found in project root"
    exit 1
fi

docker-compose up -d

print_success "Docker services started"

# Step 4: Wait for database to be ready
print_step "Waiting for database to be ready..."

# Function to check if PostgreSQL is ready
check_postgres() {
    docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1
}

# Wait up to 60 seconds for PostgreSQL
for i in {1..60}; do
    if check_postgres; then
        print_success "Database is ready"
        break
    fi
    
    if [ $i -eq 60 ]; then
        print_error "Database failed to start within 60 seconds"
        print_error "Check Docker logs: docker-compose logs postgres"
        exit 1
    fi
    
    echo "Waiting for database... ($i/60)"
    sleep 1
done

# Step 5: Install dependencies
print_step "Installing project dependencies..."

yarn install

print_success "Dependencies installed"

# Step 6: Setup Prisma database
print_step "Setting up Prisma database..."

# Generate Prisma client
yarn workspace @unical/backend prisma generate

print_success "Prisma client generated"

# Run database migrations
print_step "Running database migrations..."
yarn workspace @unical/backend prisma migrate dev --name init

print_success "Database migrations completed"

# Optional: Seed database if seed script exists
if yarn workspace @unical/backend run --help 2>/dev/null | grep -q "seed"; then
    print_step "Seeding database..."
    yarn workspace @unical/backend run seed
    print_success "Database seeded"
fi

# Step 7: Health check
print_step "Running health checks..."

# Check if all services are running
if docker-compose ps | grep -q "Up"; then
    print_success "Docker services are running"
else
    print_warning "Some Docker services may not be running properly"
fi

# Check if Prisma can connect to database
if yarn workspace @unical/backend prisma db pull >/dev/null 2>&1; then
    print_success "Database connection verified"
else
    print_warning "Database connection issue detected"
fi

print_success "Setup completed successfully! 🎉"

echo ""
echo -e "${BLUE}📋 Environment Setup Summary:${NC}"
echo "• Backend .env: apps/backend/.env"
echo "• Database: PostgreSQL running on localhost:5432"
echo "• Redis: Running on localhost:6379"
echo ""

echo -e "${BLUE}🔧 Next steps:${NC}"
echo "1. Update environment variables in the .env files with your credentials"
echo "2. Run 'yarn dev' to start the development servers"
echo "3. Frontend will be available at http://localhost:3030"
echo "4. Backend API will be available at http://localhost:3000"
echo "5. Use 'docker-compose logs -f' to view container logs"
echo ""

# Ask if user wants to start development servers
read -p "Would you like to start the development servers now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Starting development servers..."
    yarn dev
fi
