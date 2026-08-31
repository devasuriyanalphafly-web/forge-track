# ForgeTrack

**ForgeTrack** is a full-stack fitness and workout tracking web application built using **Django REST Framework, MySQL, React, Vite, and Tailwind CSS**.

The application allows users to securely create accounts, track workouts, monitor weight progress, set fitness goals, explore exercises, browse diet plans and recipes, and manage their fitness journey from a responsive dashboard.

---

## Features

### Authentication & User Management

- User registration
- Email OTP verification during registration
- JWT authentication
- Secure login and logout
- Automatic access-token refresh
- Password reset using email OTP
- User profile management
- Protected frontend routes
- User-specific private data
- Django Admin user management

### Workout Tracking

- Create workout logs
- Add multiple exercises
- Record sets, repetitions, and weight
- Edit existing workouts
- Delete workouts
- Workout history
- Workout volume calculations
- Personal record tracking
- Workout statistics and analytics

### Exercise Library

- Browse exercises
- Search exercises
- Filter exercises
- View muscle groups
- Exercise information

### Weight Tracking

- Add weight logs
- Edit weight entries
- Delete weight entries
- Track weight history
- Set target weight
- Monitor weight progress
- Calculate remaining weight
- Progress percentage tracking

### Fitness Goals

- Create personal fitness goals
- Update goals
- Delete goals
- Track goal progress

### Nutrition

- Browse diet plans
- Browse recipes
- Search and filter recipes
- Add recipes to favorites
- Remove recipes from favorites
- User-specific favorite recipes

### User Interface

- Responsive design
- Dashboard
- Dark theme
- Light theme
- Mobile navigation
- Toast notifications
- Loading states
- Form validation
- Modern fitness-focused UI

---

## Tech Stack

### Backend

- Python
- Django
- Django REST Framework
- MySQL
- SimpleJWT
- Django CORS Headers
- Gmail SMTP

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- Axios
- React Router
- Framer Motion
- Lucide React
- React Hot Toast

### Development Tools

- Git
- GitHub
- VS Code
- npm
- Python Virtual Environment

---

## Project Architecture

```text
forge-track/
│
├── config/
│   ├── settings.py
│   ├── urls.py
│   └── ...
│
├── users/
├── exercises/
├── workouts/
├── nutrition/
├── goals/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── api.js
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── manage.py
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

## Backend Applications

### Users

The `users` application handles:

- User registration
- Registration OTP verification
- JWT authentication
- Login
- User profiles
- Password reset
- Password reset OTP verification

### Exercises

The `exercises` application handles:

- Exercise library
- Exercise details
- Exercise searching
- Exercise filtering
- Muscle group information

### Workouts

The `workouts` application handles:

- Workout creation
- Workout history
- Workout exercises
- Sets
- Repetitions
- Weight
- Workout volume
- Workout editing
- Workout deletion

### Nutrition

The `nutrition` application handles:

- Weight logs
- Weight goals
- Weight progress
- Diet plans
- Recipes
- Favorite recipes

### Goals

The `goals` application handles:

- Personal fitness goals
- Goal creation
- Goal updates
- Goal deletion
- Goal progress management

---

## Authentication Flow

ForgeTrack uses **JWT authentication** for protected API requests.

### Login Flow

```text
User enters email and password
        ↓
React sends credentials to Django API
        ↓
Django validates credentials
        ↓
Access + Refresh tokens returned
        ↓
React stores authentication tokens
        ↓
Access token is attached to API requests
```

When an access token expires, the frontend attempts to obtain a new access token using the refresh token.

---

## Registration OTP Flow

New accounts require email verification.

```text
User enters registration details
        ↓
Frontend sends registration request
        ↓
Backend generates OTP
        ↓
OTP is sent to user's email
        ↓
User enters 6-digit OTP
        ↓
Backend verifies OTP
        ↓
User account is created
        ↓
User can log in
```

---

## Password Reset Flow

```text
User enters registered email
        ↓
Backend generates password reset OTP
        ↓
OTP is sent by email
        ↓
User enters OTP
        ↓
Backend validates OTP
        ↓
User enters new password
        ↓
Password is updated
```

---

# Installation

## 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd forge-track
```

---

# Backend Setup

## 2. Create a Python Virtual Environment

### Windows

```powershell
python -m venv venv
venv\Scripts\activate
```

---

## 3. Install Backend Dependencies

```powershell
pip install -r requirements.txt
```

---

# Environment Configuration

Create a `.env` file in the project root.

You can use `.env.example` as the template.

Example:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True

DB_NAME=forgetrack
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

ALLOWED_HOSTS=127.0.0.1,localhost

TIME_ZONE=Asia/Kolkata

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True

EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_gmail_app_password
DEFAULT_FROM_EMAIL=your_email@gmail.com
```

> Never commit your real `.env` file to GitHub.

---

# MySQL Setup

Make sure MySQL Server is running.

Create the ForgeTrack database:

```sql
CREATE DATABASE forgetrack;
```

Configure your MySQL username and password inside `.env`.

Then apply Django migrations:

```powershell
python manage.py migrate
```

---

# Django Admin

Create an administrator account:

```powershell
python manage.py createsuperuser
```

Start Django:

```powershell
python manage.py runserver
```

Open the Django Admin panel:

```text
http://127.0.0.1:8000/admin/
```

Administrators can manage registered users and application data through Django Admin.

---

# Run the Backend

From the ForgeTrack root directory:

```powershell
python manage.py runserver
```

Backend:

```text
http://127.0.0.1:8000/
```

API base:

```text
http://127.0.0.1:8000/api/
```

---

# Frontend Setup

Open another terminal and move into the frontend:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start Vite:

```powershell
npm run dev
```

Frontend:

```text
http://localhost:5173/
```

---

# API Overview

## Authentication

```text
POST  /api/auth/register/
POST  /api/auth/register/verify/
POST  /api/auth/login/
POST  /api/auth/refresh/
GET   /api/auth/profile/
POST  /api/auth/request-otp/
POST  /api/auth/verify-otp/
```

## Exercises

```text
/api/exercises/
```

## Workouts

```text
/api/workouts/
```

## Goals

```text
/api/goals/
```

## Weight Tracking

```text
/api/weight-logs/
/api/weight-goal/
```

## Nutrition

```text
/api/diets/
/api/recipes/
```

---

# Frontend and Backend Communication

ForgeTrack follows a client-server architecture.

```text
React / Vite Frontend
        ↓
      Axios
        ↓
Django REST Framework API
        ↓
      Django
        ↓
      MySQL
```

The frontend communicates with Django through REST API requests.

Authenticated requests include a JWT access token.

---

# Security

ForgeTrack implements several security practices:

- Django password hashing
- JWT authentication
- Access and refresh tokens
- Automatic token refresh
- Protected API endpoints
- Protected frontend routes
- User-specific database queries
- Email OTP verification
- Password reset OTP verification
- Environment-based secrets
- CORS configuration
- Server-side validation

Sensitive credentials are stored inside `.env`, which is excluded from Git using `.gitignore`.

---

# Testing

The Django backend includes automated tests for the application's major functionality.

Run all backend tests:

```powershell
python manage.py test
```

Current result:

```text
Ran 69 tests
OK
```

**69 backend tests passing.**

---

# Production Build

To verify the React application can be compiled for production:

```powershell
cd frontend
npm run build
```

The generated production files are stored in:

```text
frontend/dist/
```

ForgeTrack's frontend production build completes successfully.

---

# Screenshots

Project screenshots can be added here to demonstrate the application.

Recommended screenshots:

1. Login
2. Registration
3. Email OTP verification
4. Dashboard
5. Workout logger
6. Workout history
7. Exercise library
8. Weight tracker
9. Fitness goals
10. Diet plans
11. Recipes
12. User profile
13. Dark theme
14. Light theme

---

# Future Improvements

Potential future improvements include:

- Cloud deployment
- Advanced workout analytics
- Progressive Web App support
- Expanded exercise database
- Expanded nutrition tracking
- Additional performance visualizations

---

# Author

**J. Deva Suriyan**

Python Full Stack Developer

### Technical Skills

- Python
- Django
- Django REST Framework
- React
- JavaScript
- MySQL
- HTML
- CSS
- Tailwind CSS
- REST APIs
- JWT Authentication
- Git
- GitHub

---

# Project Status

**ForgeTrack — Completed**

- Backend development: Complete
- Frontend development: Complete
- MySQL integration: Complete
- JWT authentication: Complete
- Registration email OTP: Complete
- Password reset OTP: Complete
- Workout tracking: Complete
- Exercise management: Complete
- Weight tracking: Complete
- Goal tracking: Complete
- Nutrition features: Complete
- Dark/light themes: Complete
- Backend automated tests: **69 passing**
- Frontend production build: **Passing**

---

Built as a full-stack portfolio project demonstrating practical experience with **React, Django REST Framework, REST APIs, authentication, MySQL, testing, and frontend-backend integration**.