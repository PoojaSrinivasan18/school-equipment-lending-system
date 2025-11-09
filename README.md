# School Equipment Lending System 🏫📱

A full-stack web application for managing school equipment loans with React frontend and Go backend.

## 🚀 Quick Start

### Prerequisites
- Go 1.24+ installed
- PostgreSQL running locally
- Node.js 18+ (for frontend)

### Backend Setup (Go)

1. **Start PostgreSQL and create database:**
```bash
# Create the database
createdb school_lending
```

2. **Start the Go backend:**
```bash
# Navigate to project root
cd school-equipment-lending-system

# Start the server (runs on port 8080)
go run cmd/main.go
```

You should see:
```
Connected to PostgreSQL successfully!
[GIN-debug] Listening and serving HTTP on localhost:8080
```

3. **Test the API:**
```bash
# Health check
curl http://localhost:8080/users/

# Test user creation
curl -X POST http://localhost:8080/users/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "password123", "role": "borrower"}'
```

### Frontend Setup (React)

1. **Navigate to frontend directory:**
```bash
cd Frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Update environment (create `.env` file):**
```bash
echo "VITE_API_BASE_URL=http://localhost:8080" > .env
```

4. **Start the React development server:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📊 Backend Architecture (Go + Gin + PostgreSQL)

### Project Structure
```
cmd/main.go          # Application entry point with CORS middleware
user/user.go         # User management with role-based access
equipment/equipment.go # Equipment CRUD operations  
request/request.go   # Request management with status tracking
database/database.go # PostgreSQL connection & auto-migration
```

### Database Schema
- **Database Name**: `school_lending`
- **Tables**: `users`, `equipment`, `requests`
- **Auto-migration**: Enabled via GORM

## 🔐 Authentication & Authorization

### User Roles
- **`borrower`** - Students/Staff who can request equipment
- **`admin`** - Administrators who can manage equipment and approve requests  
- **`inventory`** - Inventory managers with admin-level access

### Role-Based Access
- Users can register via API with any role
- Admin users can be manually added to database
- Email-based login workflow supported

## 📝 Complete API Reference

**Base URL**: `http://localhost:8080`
**CORS**: Enabled for all origins (`*`)

### 👥 USER ENDPOINTS

#### Get All Users
```bash
GET /users/
```

#### Get User by ID  
```bash
GET /users/:id
# Example: GET /users/1
```

#### Get User by Email ⭐ *NEW*
```bash
GET /users/email/:email  
# Example: GET /users/email/admin@test.com
```
**Use Case**: Perfect for login workflow using email instead of manual user ID

#### Create User
```bash
POST /users/
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123",
  "role": "borrower"  // admin, borrower, inventory
}
```

#### Update User
```bash
PUT /users/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "admin"
}
```

#### Delete User
```bash
DELETE /users/:id
```

### 🔧 EQUIPMENT ENDPOINTS

#### Get All Equipment
```bash
GET /equipments/
```

#### Get Equipment by ID
```bash
GET /equipments/:id
```

#### Create Equipment
```bash
POST /equipments/
Content-Type: application/json

{
  "name": "Dell Laptop",
  "availableStock": 5,
  "totalStock": 10,
  "category": "Electronics",
  "description": "Dell Inspiron for students"
}
```

#### Update Equipment
```bash
PUT /equipments/:id
Content-Type: application/json

{
  "availableStock": 3,
  "totalStock": 8
}
```

#### Delete Equipment
```bash
DELETE /equipments/:id
```

### 📋 REQUEST ENDPOINTS

#### Get All Requests
```bash
GET /requests/
```

#### Get Request by ID
```bash
GET /requests/:id
```

#### Get Requests by User ID ⭐ *NEW*
```bash
GET /requests/user/:userId
# Example: GET /requests/user/2
```
**Use Case**: Display all requests for a specific user in their dashboard

#### Get Requests by Status ⭐ *NEW*
```bash
GET /requests/status/:status
# Examples:
# GET /requests/status/pending
# GET /requests/status/approved  
# GET /requests/status/rejected
# GET /requests/status/completed
```
**Use Case**: Filter requests by status for admin management dashboard

#### Create Request
```bash
POST /requests/
Content-Type: application/json

{
  "userId": 1,
  "Username": "John Doe", 
  "equipmentId": 2,
  "quantity": 1,
  "status": "pending",        // pending, approved, rejected, completed
  "borrowDate": "2025-11-15",
  "remarks": "Need for project"
}
```

#### Update Request
```bash
PUT /requests/:id
Content-Type: application/json

{
  "status": "approved",
  "remarks": "Approved by admin"
}
```

#### Delete Request
```bash
DELETE /requests/:id
```

## 🗃️ Data Models

### User
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$14$...",
  "role": "borrower",
  "createdAt": "2025-11-09 15:04:05",
  "updatedAt": "2025-11-09 15:04:05"
}
```

### Equipment
```json
{
  "id": 1,
  "name": "Digital Camera",
  "availableStock": 3,
  "totalStock": 5,
  "category": "Photography",
  "description": "DSLR camera for projects",
  "createdAt": "2025-11-09 15:04:05",
  "updatedAt": "2025-11-09 15:04:05"
}
```

### Request
```json
{
  "requestId": 1,
  "userId": 1,
  "Username": "John Doe",
  "equipmentId": 1,
  "quantity": 1,
  "status": "pending",
  "createdAt": "2025-11-09 15:04:05",
  "borrowDate": "2025-11-10",
  "remarks": "Needed for photography project"
}
```

## 🔄 Request Status Workflow

1. **User creates request** → Status: `pending`
2. **Admin reviews request** → Status: `approved` or `rejected`  
3. **Equipment usage completed** → Status: `completed`

**Status Values**: `pending`, `approved`, `rejected`, `completed`

## 🧪 Testing Examples

### Register a new user:
```bash
curl -X POST http://localhost:8080/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com", 
    "password": "password123",
    "role": "borrower"
  }'
```

### Get user by email:
```bash
curl http://localhost:8080/users/email/john@example.com
```

### Create equipment request:
```bash
curl -X POST http://localhost:8080/requests/ \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "Username": "John Doe",
    "equipmentId": 1,
    "quantity": 1,
    "status": "pending",
    "borrowDate": "2025-11-15",
    "remarks": "Needed for project"
  }'
```

### Get requests by status:
```bash
curl http://localhost:8080/requests/status/pending
```

### Get user's requests:
```bash
curl http://localhost:8080/requests/user/1
```

## 🗄️ Database Information

### Connection Details
- **Host**: localhost
- **Database**: school_lending  
- **User**: postgres
- **Tables**: users, equipment, requests

### View Database Data
```bash
# Connect to database
psql -h localhost -U postgres -d school_lending

# View tables
\dt

# View users with roles
SELECT id, name, email, role FROM users;

# View requests with status
SELECT request_id, user_id, equipment_id, status FROM requests;

# View equipment
SELECT id, name, available_stock, total_stock FROM equipment;
```

## ✨ Key Backend Features

✅ **Role-Based User System** - Admin, borrower, and inventory roles  
✅ **Email-Based Login** - Users can login using email address
✅ **Request Status Tracking** - Complete status workflow (pending → approved/rejected → completed)
✅ **User-Specific Requests** - Get all requests for a specific user
✅ **Status-Based Filtering** - Filter requests by status for admin management
✅ **CORS Enabled** - Cross-origin requests supported for frontend integration
✅ **Database Auto-Migration** - Automatic table creation with proper schemas
✅ **PostgreSQL Integration** - Full CRUD operations with GORM ORM

## 🚨 Backend Troubleshooting

### Port Issues
**Port 8080 already in use:**
```bash
# Check what's using the port
lsof -i :8080

# Kill the process
kill <PID>
```

### Database Issues
**Connection failed:**
```bash
# Start PostgreSQL
brew services start postgresql

# Create database
createdb school_lending

# Test connection
psql -h localhost -U postgres -d school_lending -c "SELECT 1;"
```

**Migration errors:**
```bash
# Drop and recreate tables if needed
psql -h localhost -U postgres -d school_lending -c "DROP TABLE IF EXISTS users, equipment, requests CASCADE;"

# Restart the Go server to auto-migrate
go run cmd/main.go
```

## 🎯 Assignment Completion

### Backend Features ✅
- [x] **User Management** - CRUD operations with role-based access
- [x] **Equipment Management** - Full inventory tracking  
- [x] **Request Management** - Complete workflow with status tracking
- [x] **Role-Based Access** - Admin, borrower, inventory roles
- [x] **Email Authentication** - Login using email instead of ID
- [x] **Status Filtering** - Filter requests by status for dashboards
- [x] **User Request History** - View all requests for specific users
- [x] **CORS Support** - Frontend integration ready
- [x] **Database Integration** - PostgreSQL with auto-migration
- [x] **REST API Design** - Proper HTTP methods and status codes
