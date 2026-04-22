# Job Portal - Full Stack Application

A modern, full-stack job portal application built with React, Node.js, Express, and MongoDB. This application allows users to search and apply for jobs, employers to post jobs, and admins to manage the platform.

## Architecture Overview

```
┌─────────────────┐
│  React Frontend │
│  (Port 3000)    │
└────────┬────────┘
         │ API Requests
         ▼
┌─────────────────────┐
│  Express Backend    │
│  (Port 5000)        │
└────────┬────────────┘
         │ MongoDB Driver
         ▼
┌─────────────────┐
│   MongoDB       │
│  (Port 27017)   │
└─────────────────┘
```

## Features

### User Features
- **User Authentication**: Register and login with different roles (Job Seeker, Employer, Admin)
- **Job Browsing**: Search and filter jobs by title, location, job type, and experience level
- **Job Applications**: Apply for jobs with resume and cover letter
- **Application Tracking**: Track all submitted applications and their status
- **User Dashboard**: View profile and quick navigation

### Employer Features
- **Post Jobs**: Create new job listings with detailed information
- **Manage Jobs**: Edit and delete posted jobs
- **Application Management**: Review applications and update their status
- **Job Analytics**: View number of applicants and job statistics

### Admin Features
- **Dashboard**: View platform statistics
- **User Management**: Manage all users and their roles
- **Job Management**: Oversee all job postings
- **System Control**: Full administrative controls

## Tech Stack

### Backend
- **Runtime**: Node.js v14+
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Security**: bcryptjs, CORS, Validator
- **Package Manager**: npm

### Frontend
- **UI Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS3
- **Package Manager**: npm

### Development Tools
- **Backend**: Nodemon (auto-reload)
- **Build Tool**: React Scripts

## Project Structure

```
job-portal/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── Footer.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Jobs.js
    │   │   ├── JobDetail.js
    │   │   ├── PostJob.js
    │   │   ├── Dashboard.js
    │   │   ├── MyApplications.js
    │   │   └── AdminDashboard.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── styles/
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── package.json
    └── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (running locally or connection string to MongoDB Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/job-portal
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

5. Start the backend server:
```bash
npm run dev
```

Backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

Frontend will open on `http://localhost:3000`

## Usage

### As a Job Seeker
1. Register as a "Job Seeker"
2. Login to your account
3. Navigate to "Browse Jobs"
4. Use filters to search for jobs
5. Click "View Details" on a job and click "Apply Now"
6. Fill in your resume link and cover letter
7. Track applications in "My Applications"

### As an Employer
1. Register as an "Employer" with company name
2. Login to your account
3. Click "Post Job" in the navbar
4. Fill in job details and submit
5. View applications for your jobs
6. Update application status (reviewed, shortlisted, rejected)

### As an Admin
1. Login with admin credentials
2. Navigate to "Admin Dashboard"
3. View platform statistics
4. Manage users and jobs

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Job Endpoints
- `GET /api/jobs?search=&location=&jobType=&experience=` - Fetch jobs with filters
- `GET /api/jobs/:id` - Get single job details
- `POST /api/jobs` - Create new job (employer)
- `PUT /api/jobs/:id` - Update job (employer)
- `DELETE /api/jobs/:id` - Delete job (employer)

### Application Endpoints
- `POST /api/applications/:jobId` - Apply for job
- `GET /api/applications/user/my-applications` - Get user's applications
- `GET /api/applications/job/:jobId` - Get job applications (employer)
- `PUT /api/applications/:applicationId/status` - Update application status

### Admin Endpoints
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - All users
- `GET /api/admin/jobs` - All jobs
- `DELETE /api/admin/users/:userId` - Delete user
- `PUT /api/admin/users/:userId/role` - Update user role

## Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/employer/admin),
  company: String (optional, for employer),
  bio: String,
  avatar: String,
  createdAt: Date
}
```

### Job
```javascript
{
  title: String,
  description: String,
  company: String,
  location: String,
  salary: { min: Number, max: Number },
  jobType: String (Full-time/Part-time/Contract/Internship),
  experience: String,
  skills: [String],
  postedBy: ObjectId (User reference),
  applicants: [ObjectId],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Application
```javascript
{
  jobId: ObjectId (Job reference),
  userId: ObjectId (User reference),
  resume: String,
  coverLetter: String,
  status: String (applied/reviewed/shortlisted/rejected),
  appliedAt: Date
}
```

## Key Features Implementation

### Role-Based Authentication
- Different user roles (Job Seeker, Employer, Admin)
- JWT token-based authentication
- Protected routes and endpoints

### Advanced Job Filtering
- Search by job title and skills
- Filter by location
- Filter by job type
- Filter by experience level
- Pagination support

### Complex Forms
- Multi-field job posting form
- Application form with file uploads
- User registration with role selection

### Real-World Backend Logic
- Job posting and management
- Application tracking and status updates
- Admin statistics and user management
- Secure password hashing and authentication

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- CORS enabled for frontend-backend communication
- Input validation using validator.js
- Role-based access control
- Protected admin endpoints

## Learning Outcomes

Through building this application, you'll learn:

1. **Full-stack development** with React, Node.js, and MongoDB
2. **Authentication and authorization** using JWT and middleware
3. **Database design** with MongoDB and Mongoose
4. **API development** with Express.js
5. **React patterns** including hooks, context, and routing
6. **Complex form handling** with validation
7. **Filtering and search** implementation
8. **Admin dashboards** and statistics
9. **Real-world backend logic** for job management
10. **Responsive web design** with CSS

## Future Enhancements

- Email notifications for applications
- File upload for resumes
- Advanced job recommendations
- Video interview integration
- Payment integration for premium features
- Social login (Google, LinkedIn)
- Mobile app version
- Real-time notifications
- Job analytics and reporting

## License

MIT License

## Support

For issues or questions, please open an issue in the repository.

---

**Happy Coding!** 🚀
