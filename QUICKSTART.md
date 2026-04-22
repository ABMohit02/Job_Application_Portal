# 🚀 Job Portal - Quick Start Guide

## Project Setup Complete! ✅

Congratulations! Your full-stack Job Portal application is ready to run. This guide will walk you through getting started.

## Prerequisites

Before running the application, make sure you have:

1. **Node.js** and **npm** installed (v14+)
   - Check: `node --version` and `npm --version`

2. **MongoDB** running locally
   - Download: https://www.mongodb.com/try/download/community
   - OR use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

3. **VS Code** (already open)

## MongoDB Setup

### Option 1: Local MongoDB
```bash
# Windows: Start MongoDB service
# Mac/Linux: mongod
# or use MongoDB Compass GUI
```

### Option 2: MongoDB Atlas (Cloud) 
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env` file: `MONGODB_URI=your_connection_string`

## Running the Application

### Method 1: Using VS Code Tasks (Recommended)

1. Open VS Code Terminal: `Ctrl+~`
2. Run the composite task:
   ```bash
   Ctrl+Shift+B  # or go to Terminal > Run Task > Start Both Servers
   ```
   This starts both backend and frontend simultaneously.

### Method 2: Manual - Terminal by Terminal

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend will run on: `http://localhost:3000`

## Testing the Application

### Create Test Data

1. **Register as different user types:**
   - Job Seeker: Register normally
   - Employer: Register with company name
   - Admin: (create via database or contact admin)

2. **Test as Job Seeker:**
   - Browse jobs
   - Apply to jobs
   - Track applications

3. **Test as Employer:**
   - Post a job
   - View applications
   - Update application status

4. **Test as Admin:**
   - View dashboard stats
   - Manage users
   - View all jobs

## Project Structure

```
job-portal/
├── backend/
│   ├── models/          # Database schemas
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, etc.
│   ├── server.js        # Entry point
│   ├── package.json
│   └── .env            # Configuration
│
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/      # Page components
    │   ├── context/    # State management
    │   ├── styles/     # CSS files
    │   └── App.js      # Main component
    └── package.json
```

## Available Scripts

### Backend
```bash
npm run dev    # Start with auto-reload (Nodemon)
npm start      # Start normally
npm audit      # Check for vulnerabilities
```

### Frontend
```bash
npm start      # Start development server
npm build      # Build for production
npm test       # Run tests
npm audit      # Check for vulnerabilities
```

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Browse jobs
- `GET /api/jobs/:id` - Job details
- `POST /api/jobs` - Post job (employer)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `POST /api/applications/:jobId` - Apply for job
- `GET /api/applications/user/my-applications` - My applications
- `GET /api/applications/job/:jobId` - Job applications
- `PUT /api/applications/:id/status` - Update status

### Admin
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/users` - All users
- `GET /api/admin/jobs` - All jobs

## Troubleshooting

### "MongoDB connection error"
- ✅ Start MongoDB service first
- ✅ Check connection string in `.env`
- ✅ Ensure MongoDB is running on port 27017

### "Cannot find module"
- ✅ Run `npm install` in backend/ and frontend/
- ✅ Check package.json for missing dependencies

### "Port already in use"
- Backend (5000): Kill process or change PORT in .env
- Frontend (3000): npm will ask to use another port

### Frontend not communicating with backend
- ✅ Ensure backend is running on http://localhost:5000
- ✅ Check browser console for CORS errors
- ✅ Verify proxy setting in frontend/package.json

## Features to Test

### User Features ✨
- [x] User registration with role selection
- [x] Secure login with JWT
- [x] Browse jobs with search and filters
- [x] Apply for jobs with resume and cover letter
- [x] Track application status
- [x] User profile/dashboard

### Employer Features 📝
- [x] Post new jobs
- [x] Edit job postings
- [x] Delete job postings
- [x] View applications on own posts
- [x] Update application status

### Admin Features ⚙️
- [x] View platform statistics
- [x] Manage users
- [x] View all jobs and applications
- [x] System-wide controls

## Development Tips

1. **React DevTools** - Install React Developer Tools browser extension
2. **MongoDB Compass** - GUI for viewing database
3. **Postman** - Test API endpoints
4. **Network Tab** - Debug API calls (F12)

## Next Steps

After testing, consider:
- [ ] Deploy to production (Heroku, AWS, etc.)
- [ ] Add email notifications
- [ ] Implement file uploads for resumes
- [ ] Add real-time notifications
- [ ] Create mobile app version
- [ ] Add payment processing

## Security Notes

⚠️ **IMPORTANT for Production:**
- Change JWT_SECRET in .env to a strong value
- Use environment variables for sensitive data
- Enable HTTPS
- Set NODE_ENV=production
- Use environment-specific .env files
- Add input validation and sanitization
- Implement rate limiting
- Add CORS whitelist

## Support & Resources

- **Documentation**: See README.md in backend/ and frontend/
- **MongoDB Docs**: https://docs.mongodb.com/
- **Express Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/
- **Mongoose Docs**: https://mongoosejs.com/

## Useful Commands

```bash
# Backend diagnostics
npm list              # Show installed packages
npm outdated        # Check for updates
npm audit           # Check vulnerabilities

# Frontend build
npm run build       # Production build
npm run eject       # Expose config (caveat emptor!)

# Database
# MongoDB shell: mongosh
use job-portal
db.users.find()     # View users
db.jobs.find()      # View jobs
```

---

**Happy coding!** 🎉 

If you encounter any issues, check the README.md files in backend/ and frontend/ directories for detailed information.
