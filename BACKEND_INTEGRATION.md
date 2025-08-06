# Stockify - Full Stack Authentication Integration

This project integrates the Stockify frontend with the backend for complete authentication functionality.

## 🚀 Features

- **User Registration**: Sign up with name, email, and password
- **User Login**: Secure login with JWT authentication
- **Protected Routes**: Dashboard access only for authenticated users
- **Auto-logout**: Automatic token management and logout functionality
- **Error Handling**: Comprehensive error handling and user feedback
- **Responsive UI**: Modern, responsive design with Tailwind CSS

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### 1. Environment Setup

#### Backend Environment
Create a `.env` file in the `backend` directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your_session_secret
```

#### Frontend Environment
The frontend `.env` file is already created with:
```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Start Development Servers

#### Option 1: Start Both Servers Automatically
Double-click `start-dev.bat` or run `start-dev.ps1` from the root directory.

#### Option 2: Start Manually

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 🌐 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/test` - Test auth routes

## 🔐 Authentication Flow

1. **Registration**: User fills signup form → API validates → User created → Auto-login or redirect to login
2. **Login**: User enters credentials → API validates → JWT token generated → User redirected to dashboard
3. **Protected Access**: User accesses dashboard → Auth context checks token → Access granted/denied
4. **Logout**: User clicks logout → Token cleared → Redirected to login

## 📁 Key Files

### Frontend
- `src/lib/api.ts` - API service and types
- `src/contexts/AuthContext.tsx` - Authentication context
- `src/components/ProtectedRoute.tsx` - Route protection
- `src/components/login-form.tsx` - Login form with backend integration
- `src/components/signup-form.tsx` - Signup form with backend integration
- `src/pages/Dashboard.tsx` - Protected dashboard page

### Backend
- `controllers/authController.js` - Authentication logic
- `routes/auth.js` - Authentication routes
- `middleware/auth.js` - JWT middleware
- `models/Users.js` - User model

## 🎯 Usage

1. **Sign Up**: Go to `/signup` to create a new account
2. **Login**: Go to `/login` to sign in
3. **Dashboard**: Access `/dashboard` (requires authentication)
4. **Logout**: Click the logout button in the dashboard

## 🔧 Technical Stack

### Frontend
- React 19 with TypeScript
- React Router DOM for routing
- Tailwind CSS for styling
- Custom hooks for authentication
- Context API for state management

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS enabled for frontend communication

## 🚦 Development URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **API Base**: http://localhost:5000/api

## 🔍 Testing

1. Register a new user
2. Verify login functionality
3. Access dashboard (should work)
4. Try accessing dashboard without login (should redirect)
5. Test logout functionality

## 🐛 Troubleshooting

1. **CORS Issues**: Ensure backend CORS is configured for `http://localhost:5173`
2. **Database Connection**: Verify MongoDB is running and connection string is correct
3. **Port Conflicts**: Make sure ports 5000 and 5173 are available
4. **Environment Variables**: Double-check all `.env` files are properly configured

## 📝 Notes

- JWT tokens are stored in localStorage
- User data is managed through React Context
- All API calls include proper error handling
- Forms include client-side validation
- Protected routes automatically redirect unauthenticated users
