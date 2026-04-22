# Job Portal - Developer's Guide

## Technology Stack Choices

### Why These Technologies?

#### React 18 (Frontend)
- **Modern Components**: Functional components with hooks
- **Fast Rendering**: Virtual DOM and diffing
- **Large Ecosystem**: Extensive libraries available
- **Developer Experience**: Hot module reloading in development
- **Learning Value**: Industry standard

#### Express.js (Backend Framework)
- **Lightweight**: Minimal overhead, flexible
- **Middleware System**: Easy to extend functionality
- **Routing**: Clean and intuitive API routing
- **Speed**: Fast request handling
- **Popularity**: Large community and resources

#### Node.js (Runtime)
- **JavaScript Everywhere**: Same language frontend and backend
- **Non-blocking I/O**: Efficient with async operations
- **npm Ecosystem**: Massive package library
- **Scalability**: Handles concurrent connections
- **Development Speed**: Rapid prototyping

#### MongoDB (Database)
- **Flexible Schema**: Evolve data structure over time
- **JSON-like Documents**: Natural JavaScript integration
- **Scalability**: Built-in horizontal scaling
- **Queries**: Flexible query language
- **Development**: Quick to prototype without strict schemas

#### Mongoose ODM
- **Schema Validation**: Enforces data structure
- **Hooks**: Pre/post operation logic
- **Relationships**: Handle references between collections
- **Built-in Methods**: save(), find(), update(), delete()
- **Error Handling**: Comprehensive validation errors

#### JWT (Authentication)
- **Stateless**: No server session storage needed
- **Scalable**: Works with microservices
- **Mobile-Friendly**: Works with native apps
- **Secure**: Cryptographically signed
- **Standard**: Industry standard approach

## Development Workflow

### Setting Up Your Environment

1. **Install Node.js**
   - Download from nodejs.org
   - Verify: `node -v` and `npm -v`

2. **Code Editor**
   - VS Code (recommended)
   - Extensions: ES7+ snippets, Prettier, MongoDB for VS Code

3. **Database**
   - Option 1: MongoDB Community (local)
   - Option 2: MongoDB Atlas (cloud - free tier available)

### Development Commands

```bash
# Backend Development
cd backend
npm run dev      # Auto-reload with Nodemon
npm start        # Production mode
npm audit        # Security check

# Frontend Development
cd frontend
npm start        # Dev server with hot reload
npm build        # Production build
npm test         # Run tests

# Project Root
npm install      # Install all dependencies
npm run build    # Build frontend
```

## Code Organization Principles

### Backend (MVC Pattern)
```
Controllers  → Handle requests, call business logic
Routes       → Define URL endpoints
Models       → Database schemas and queries
Middleware   → Authentication, logging, error handling
Utils        → Helper functions
```

### Frontend (Component-Based)
```
Components   → Reusable UI elements (Navbar, Footer)
Pages        → Full page components (Home, Jobs, etc.)
Context      → Global application state (Auth)
Styles       → CSS for each component
Utils        → Helper functions and constants
```

## Common Development Tasks

### Adding a New API Endpoint

1. **Create Controller Function**
```javascript
// controllers/myController.js
exports.myFunction = async (req, res) => {
  try {
    // Logic here
    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

2. **Create Route**
```javascript
// routes/myRoute.js
const express = require('express');
const { myFunction } = require('../controllers/myController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.post('/', authMiddleware, myFunction);

module.exports = router;
```

3. **Register Route in server.js**
```javascript
app.use('/api/my-route', require('./routes/myRoute'));
```

4. **Test with Frontend or Postman**
```javascript
// frontend
const response = await axios.post('/api/my-route', { data });
```

### Adding a New Frontend Page

1. **Create Component**
```javascript
// pages/MyPage.js
import React from 'react';
import './MyPage.css';

const MyPage = () => {
  return (
    <div className="my-page">
      <h1>My Page</h1>
    </div>
  );
};

export default MyPage;
```

2. **Create Styles**
```css
/* pages/MyPage.css */
.my-page {
  padding: 20px;
}
```

3. **Add Route in App.js**
```javascript
import MyPage from './pages/MyPage';

// In Routes
<Route path="/my-page" element={<MyPage />} />
```

4. **Add Navigation Link in Navbar**
```javascript
<Link to="/my-page">My Page</Link>
```

## Debugging Guide

### Backend Debugging

**1. Check Server Logs**
```bash
# Terminal output shows errors and console.log statements
npm run dev
# Look for error messages or stack traces
```

**2. Add Debug Logs**
```javascript
console.log('User:', user);
console.log('Query:', filter);
```

**3. Use Postman to Test APIs**
- Download Postman
- Create requests for each endpoint
- Check request/response data
- Set Authorization header: `Bearer {token}`

**4. MongoDB Connection Issues**
```javascript
// Check connection string
console.log(process.env.MONGODB_URI);

// Verify MongoDB is running
// Windows: MongoDB service should be running
// Mac: brew services list | grep mongodb
// Linux: systemctl status mongod
```

**5. JWT Token Issues**
```javascript
// Decode token to verify claims
const token = localStorage.getItem('token');

// Use jwt.io or Node.js debugger
// Check expiration and payload
```

### Frontend Debugging

**1. Browser Console (F12)**
- Check for JavaScript errors (red)
- Check for API errors (network tab)
- Use console.log for debugging

**2. React DevTools Extension**
- Inspect component tree
- Check props and state
- Profile performance

**3. Network Tab**
- See all API requests
- Check status codes
- View request/response data
- Look for CORS errors

**4. Common Issues**
```javascript
// CORS Error
// Solution: Backend needs CORS enabled
// Check: cors middleware in server.js

// 401 Unauthorized
// Solution: Token missing or invalid
// Check: localStorage for token
// Check: Authorization header in requests

// 404 Not Found
// Solution: Wrong endpoint URL
// Check: Backend route spelling
// Check: Request method (POST vs GET)

// Blank Page
// Solution: JavaScript error
// Check: Browser console for errors
// Check: Network tab for failed requests
```

## Performance Optimization Tips

### Backend
- Use indexes on frequently queried fields
- Implement pagination for large datasets
- Cache static data
- Use async/await for non-blocking code
- Compress responses with gzip

### Frontend
- Code splitting with React.lazy
- Lazy load images
- Memoize expensive computations
- Minimize bundle size
- Optimize component re-renders

## Testing Workflow

### Manual Testing Checklist

**Authentication Flow**
- [ ] Register new user
- [ ] Login with credentials
- [ ] Logout clears token
- [ ] Protected pages require login
- [ ] Incorrect credentials show error

**Job Features**
- [ ] Browse all jobs
- [ ] Search jobs by keyword
- [ ] Filter by location
- [ ] Filter by job type
- [ ] View job details
- [ ] Apply for job as job seeker
- [ ] Cannot apply as own posting
- [ ] See application in "My Applications"

**Employer Features**
- [ ] Post new job
- [ ] Edit job post
- [ ] Delete job post
- [ ] See applications on post
- [ ] Update application status

**Admin Features**
- [ ] View statistics
- [ ] See all users
- [ ] See all jobs
- [ ] Delete user
- [ ] Change user role

## Git Workflow

### Initial Setup
```bash
git init
git add .
git commit -m "Initial commit: Full-stack job portal"
git branch -M main
# Add remote: git remote add origin <url>
# git push -u origin main
```

### During Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub
# After review, merge to main
```

## Environment Variables

### Backend (.env)
```
PORT=5000                                    # Server port
MONGODB_URI=mongodb://localhost:27017/db    # Database connection
JWT_SECRET=your_secret_key                  # JWT signing key
JWT_EXPIRE=7d                               # Token expiration
NODE_ENV=development                        # Environment mode
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000     # Backend API URL
```

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot find module 'express'` | Missing npm packages | Run `npm install` |
| `MongoError: connect ECONNREFUSED` | MongoDB not running | Start MongoDB service |
| `JWT malformed` | Invalid token | Regenerate token via login |
| `CORS error` | Frontend/backend port mismatch | Check localhost:3000 vs 5000 |
| `Port already in use` | Another app using port | Kill process or change port |
| `Cannot POST /api/route` | Route not registered | Check server.js routing |
| `Unexpected token < in JSON` | HTML error page as response | Check endpoint, usually 404 |

## Best Practices Applied

### Security
✓ Password hashing with bcryptjs
✓ JWT token authentication
✓ CORS enabled for specific origins
✓ Environment variables for secrets
✓ Input validation on backend

### Code Quality
✓ MVC architectural pattern
✓ Separation of concerns
✓ DRY (Don't Repeat Yourself)
✓ Meaningful variable/function names
✓ Comments on complex logic

### Performance
✓ Pagination for large datasets
✓ MongoDB indexes recommended
✓ Lazy loading on frontend
✓ Efficient queries with Mongoose lean()
✓ Compression middleware

### Scalability
✓ Stateless authentication (JWT)
✓ Database abstraction with Mongoose
✓ Component-based frontend
✓ Modular routing structure
✓ Environment configuration

## Resources for Learning

### Official Documentation
- [Node.js](https://nodejs.org/docs/)
- [Express](https://expressjs.com/)
- [React](https://react.dev/)
- [MongoDB](https://docs.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)

### Learning Platforms
- MDN Web Docs (Mozilla)
- FreeCodeCamp
- Pluralsight
- Udemy
- Frontend Masters

### Tools
- VS Code
- Postman
- MongoDB Compass
- Git/GitHub
- DevTools (F12)

## Next Steps

After mastering this project:

1. **Add Testing**
   - Jest (unit tests)
   - React Testing Library (component tests)
   - Supertest (API tests)

2. **Implement Features**
   - Email notifications
   - File uploads
   - Real-time chat
   - Payment processing
   - Video interviews

3. **Deploy**
   - Heroku (free tier)
   - AWS (EC2, RDS)
   - DigitalOcean
   - Vercel (frontend)
   - MongoDB Atlas (database)

4. **Scale**
   - Docker containerization
   - Kubernetes orchestration
   - Microservices architecture
   - GraphQL API
   - WebSockets

---

**Happy Coding!** 🚀

For detailed information on specific topics, refer to the README files in backend/ and frontend/ directories.
