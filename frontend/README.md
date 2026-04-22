# Job Portal Frontend

This is the React frontend for the Job Portal application.

## Features

- User authentication (Job Seeker, Employer, Admin)
- Browse and search jobs
- Apply for jobs
- Track applications
- Post jobs (Employer)
- Admin dashboard for system management
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- React 18+

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file if needed:
```bash
REACT_APP_API_URL=http://localhost:5000
```

## Running the App

### Development
```bash
npm start
```

The app will run on `http://localhost:3000` and will automatically open in your default browser.

### Build for Production
```bash
npm run build
```

## Project Structure

```
src/
├── components/        # Reusable components (Navbar, Footer)
├── pages/            # Page components
├── context/          # React Context for state management
├── styles/           # CSS stylesheets
└── App.js           # Main app component
```

## Key Components

- **Navbar** - Navigation and user menu
- **Home** - Landing page
- **Login/Register** - Authentication pages
- **Jobs** - Browse and search jobs
- **JobDetail** - Job details and application form
- **PostJob** - Submit new job posting
- **Dashboard** - User profile and quick actions
- **MyApplications** - Track job applications
- **AdminDashboard** - Admin statistics and management

## Authentication

The app uses JWT tokens for authentication. Tokens are stored in localStorage and sent with API requests.

### User Roles

1. **Job Seeker (user)** - Can browse, search, and apply for jobs
2. **Employer** - Can post jobs, manage postings, and review applications
3. **Admin** - Full system access and dashboard

## Backend Integration

The app communicates with the backend API at `http://localhost:5000`. Make sure the backend is running before starting the frontend.

## Technologies Used

- React 18 - UI framework
- React Router v6 - Client-side routing
- Axios - HTTP client
- CSS3 - Styling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
