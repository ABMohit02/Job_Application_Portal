# Job Portal Backend

This is the backend API for the Job Portal application built with Node.js and Express.

## Features

- User authentication with JWT
- Role-based access control (User, Employer, Admin)
- Job posting and management
- Job application system
- Admin dashboard and statistics
- MongoDB database integration

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/job-portal
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Jobs
- `GET /api/jobs` - Get all jobs with filters
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Post a new job (employer only)
- `PUT /api/jobs/:id` - Update job (employer only)
- `DELETE /api/jobs/:id` - Delete job (employer only)

### Applications
- `POST /api/applications/:jobId` - Apply for a job
- `GET /api/applications/user/my-applications` - Get user's applications
- `GET /api/applications/job/:jobId` - Get applications for a job (employer)
- `PUT /api/applications/:applicationId/status` - Update application status (employer)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/jobs` - Get all jobs
- `DELETE /api/admin/users/:userId` - Delete user
- `PUT /api/admin/users/:userId/role` - Update user role

## Database Structure

### User Schema
- name, email, password, role, company, bio, avatar, createdAt

### Job Schema
- title, description, company, location, salary, jobType, experience, skills, postedBy, applicants, isActive, createdAt, updatedAt

### Application Schema
- jobId, userId, resume, coverLetter, status, appliedAt

## Technologies Used

- Express.js - Web framework
- Mongoose - MongoDB ORM
- JWT - Authentication
- bcryptjs - Password hashing
- CORS - Cross-origin requests
- Validator - Input validation
