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

# Function to update environment variable
update_env_var() {
    local file="$1"
    local var_name="$2"
    local var_value="$3"
    local placeholder="${4:-$var_name=}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|${placeholder}|${var_name}=${var_value}|" "$file"
    else
        # Linux
        sed -i "s|${placeholder}|${var_name}=${var_value}|" "$file"
    fi
}

# Backend .env file
if [ -f "apps/backend/.env.example" ]; then
    if [ ! -f "apps/backend/.env" ]; then
        cp "apps/backend/.env.example" "apps/backend/.env"
        
        # Generate secure random keys
        print_step "Generating secure encryption keys for backend..."
        
        # Generate encryption keys
        JWT_SECRET=$(openssl rand -hex 32)
        JWT_REFRESH_SECRET=$(openssl rand -hex 32)
        TOKEN_ENCRYPTION_KEY=$(openssl rand -hex 32)
        
        # Update the .env file with generated keys
        update_env_var "apps/backend/.env" "JWT_SECRET" "$JWT_SECRET" "JWT_SECRET=your-jwt-secret-here"
        update_env_var "apps/backend/.env" "JWT_REFRESH_SECRET" "$JWT_REFRESH_SECRET" "JWT_REFRESH_SECRET=your-jwt-refresh-secret-here"
        update_env_var "apps/backend/.env" "TOKEN_ENCRYPTION_KEY" "$TOKEN_ENCRYPTION_KEY" "TOKEN_ENCRYPTION_KEY=your-32-byte-hex-encryption-key"
        
        # Ensure BASE_URL is set correctly
        update_env_var "apps/backend/.env" "BASE_URL" "http://localhost:3000" "BASE_URL=http://localhost:3000"
        
        print_success "Backend .env file created with generated encryption keys"
    else
        print_warning "Backend .env file already exists, skipping copy"
        
        # Check if keys are missing and offer to generate them
        missing_keys=()
        if grep -q "JWT_SECRET=your-jwt-secret-here\|JWT_SECRET=$" "apps/backend/.env"; then
            missing_keys+=("JWT_SECRET")
        fi
        if grep -q "JWT_REFRESH_SECRET=your-jwt-refresh-secret-here\|JWT_REFRESH_SECRET=$" "apps/backend/.env"; then
            missing_keys+=("JWT_REFRESH_SECRET")
        fi
        if grep -q "TOKEN_ENCRYPTION_KEY=your-32-byte-hex-encryption-key\|TOKEN_ENCRYPTION_KEY=$" "apps/backend/.env"; then
            missing_keys+=("TOKEN_ENCRYPTION_KEY")
        fi
        
        if [ ${#missing_keys[@]} -gt 0 ]; then
            print_warning "Missing or placeholder encryption keys detected: ${missing_keys[*]}"
            read -p "Would you like to generate missing encryption keys? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                print_step "Generating missing encryption keys..."
                
                for key in "${missing_keys[@]}"; do
                    case $key in
                        "JWT_SECRET")
                            JWT_SECRET=$(openssl rand -hex 32)
                            update_env_var "apps/backend/.env" "JWT_SECRET" "$JWT_SECRET" "JWT_SECRET=your-jwt-secret-here"
                            update_env_var "apps/backend/.env" "JWT_SECRET" "$JWT_SECRET" "JWT_SECRET=$"
                            print_success "Generated JWT_SECRET"
                            ;;
                        "JWT_REFRESH_SECRET")
                            JWT_REFRESH_SECRET=$(openssl rand -hex 32)
                            update_env_var "apps/backend/.env" "JWT_REFRESH_SECRET" "$JWT_REFRESH_SECRET" "JWT_REFRESH_SECRET=your-jwt-refresh-secret-here"
                            update_env_var "apps/backend/.env" "JWT_REFRESH_SECRET" "$JWT_REFRESH_SECRET" "JWT_REFRESH_SECRET=$"
                            print_success "Generated JWT_REFRESH_SECRET"
                            ;;
                        "TOKEN_ENCRYPTION_KEY")
                            TOKEN_ENCRYPTION_KEY=$(openssl rand -hex 32)
                            update_env_var "apps/backend/.env" "TOKEN_ENCRYPTION_KEY" "$TOKEN_ENCRYPTION_KEY" "TOKEN_ENCRYPTION_KEY=your-32-byte-hex-encryption-key"
                            update_env_var "apps/backend/.env" "TOKEN_ENCRYPTION_KEY" "$TOKEN_ENCRYPTION_KEY" "TOKEN_ENCRYPTION_KEY=$"
                            print_success "Generated TOKEN_ENCRYPTION_KEY"
                            ;;
                    esac
                done
            fi
        fi
        
        # Ensure BASE_URL is set properly (add if missing)
        if ! grep -q "BASE_URL=" "apps/backend/.env"; then
            echo "BASE_URL=http://localhost:3000" >> "apps/backend/.env"
            print_success "Added BASE_URL to backend .env"
        fi
    fi
else
    print_warning "Backend .env.example not found"
fi

# Frontend .env.local file
if [ -f "apps/frontend/.env.example" ]; then
    if [ ! -f "apps/frontend/.env.local" ]; then
        cp "apps/frontend/.env.example" "apps/frontend/.env.local"
        
        # Generate secure random keys for frontend
        print_step "Generating secure keys for frontend..."
        
        # Generate NextAuth secret
        NEXTAUTH_SECRET=$(openssl rand -hex 32)
        
        # Update the .env.local file with generated keys
        update_env_var "apps/frontend/.env.local" "NEXTAUTH_SECRET" "$NEXTAUTH_SECRET" "NEXTAUTH_SECRET=your-secret-here"
        
        print_success "Frontend .env.local file created with generated secrets"
    else
        print_warning "Frontend .env.local file already exists, skipping copy"
        
        # Check if NEXTAUTH_SECRET is missing
        if grep -q "NEXTAUTH_SECRET=your-secret-here\|NEXTAUTH_SECRET=$" "apps/frontend/.env.local"; then
            print_warning "Missing or placeholder NEXTAUTH_SECRET detected"
            read -p "Would you like to generate a new NEXTAUTH_SECRET? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                print_step "Generating NEXTAUTH_SECRET..."
                NEXTAUTH_SECRET=$(openssl rand -hex 32)
                update_env_var "apps/frontend/.env.local" "NEXTAUTH_SECRET" "$NEXTAUTH_SECRET" "NEXTAUTH_SECRET=your-secret-here"
                update_env_var "apps/frontend/.env.local" "NEXTAUTH_SECRET" "$NEXTAUTH_SECRET" "NEXTAUTH_SECRET=$"
                print_success "Generated NEXTAUTH_SECRET"
            fi
        fi
    fi
else
    print_warning "Frontend .env.example not found"
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

# Step 7: Health check and validation
print_step "Running health checks and validation..."

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

# Validate environment files
print_step "Validating environment configuration..."

# Check backend environment
if [ -f "apps/backend/.env" ]; then
    missing_backend_vars=()
    
    # Check for required variables
    if ! grep -q "^BASE_URL=" "apps/backend/.env" || grep -q "BASE_URL=$" "apps/backend/.env"; then
        missing_backend_vars+=("BASE_URL")
    fi
    if ! grep -q "^JWT_SECRET=" "apps/backend/.env" || grep -q "JWT_SECRET=$\|JWT_SECRET=your-jwt-secret-here" "apps/backend/.env"; then
        missing_backend_vars+=("JWT_SECRET")
    fi
    if ! grep -q "^DATABASE_URL=" "apps/backend/.env" || grep -q "DATABASE_URL=$" "apps/backend/.env"; then
        missing_backend_vars+=("DATABASE_URL")
    fi
    
    if [ ${#missing_backend_vars[@]} -gt 0 ]; then
        print_warning "Backend missing required variables: ${missing_backend_vars[*]}"
    else
        print_success "Backend environment configuration looks good"
    fi
fi

# Check frontend environment
if [ -f "apps/frontend/.env.local" ]; then
    missing_frontend_vars=()
    
    # Check for required variables
    if ! grep -q "^NEXTAUTH_SECRET=" "apps/frontend/.env.local" || grep -q "NEXTAUTH_SECRET=$\|NEXTAUTH_SECRET=your-secret-here" "apps/frontend/.env.local"; then
        missing_frontend_vars+=("NEXTAUTH_SECRET")
    fi
    if ! grep -q "^NEXT_PUBLIC_BACKEND_API_URL=" "apps/frontend/.env.local"; then
        missing_frontend_vars+=("NEXT_PUBLIC_BACKEND_API_URL")
    fi
    
    if [ ${#missing_frontend_vars[@]} -gt 0 ]; then
        print_warning "Frontend missing required variables: ${missing_frontend_vars[*]}"
    else
        print_success "Frontend environment configuration looks good"
    fi
fi

print_success "Setup completed successfully! 🎉"

echo ""
echo -e "${BLUE}📋 Environment Setup Summary:${NC}"
echo "• Backend .env: apps/backend/.env"
echo "• Frontend .env: apps/frontend/.env.local"
echo "• Database: PostgreSQL running on localhost:5432"
echo "• Redis: Running on localhost:6379"
echo ""

echo -e "${BLUE}🔧 Environment Variables Configured:${NC}"
echo "• Backend API (NestJS): http://localhost:3000"
echo "• Frontend (Next.js): http://localhost:3030"
echo "• BASE_URL (for OAuth/webhooks): http://localhost:3000"
echo "• Generated secure encryption keys and secrets"
echo ""

echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Update OAuth credentials in environment files:"
echo "   - apps/backend/.env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, etc."
echo "   - apps/frontend/.env.local: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, etc."
echo "2. Run 'yarn dev' to start the development servers"
echo "3. Frontend will be available at http://localhost:3030"
echo "4. Backend API will be available at http://localhost:3000"
echo "5. API docs (Swagger) at http://localhost:3000/api/docs"
echo "6. Use 'docker-compose logs -f' to view container logs"
echo ""

# Ask if user wants to start development servers
read -p "Would you like to start the development servers now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Starting development servers..."
    yarn dev
fi
