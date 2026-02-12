# Habayta Jobs — הביתה

A comprehensive job board and relocation platform connecting job seekers planning **Aliyah** with Israeli companies that understand their journey.

## 🌟 Features

### Authentication & Security
- JWT-based authentication with refresh tokens
- **SMTP email verification** — accounts must be verified via email before login
- Password reset via email (forgot password flow)
- Resend verification email with rate limiting (3 requests / 15 min)
- Welcome email sent after successful verification
- Role-based access control (Job Seeker, Employer, Admin)
- Rate limiting, Helmet security headers, CORS, input validation (Joi)
- Passwords hashed with bcrypt

### Job Seekers
- Timeline-based matching, location flexibility, privacy-first profiles
- Save/unsave jobs, track applications, manage profile
- Upload resume & profile image (Cloudinary)

### Employers
- Post & manage jobs, review applications, company dashboard
- Company registration with logo & banner uploads
- **Corporate email required** for employer registration
- Company verification request system

### General
- Real-time notifications system
- Company reviews & ratings
- Advanced job search & filtering (timeline, location, industry, Hebrew level, remote)
- Responsive UI — mobile, tablet, desktop
- Animated UI with Framer Motion

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18 (Vite), Tailwind CSS, Framer Motion, Lucide React, React Router v6 |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose 7+) |
| **Auth** | JWT + bcryptjs |
| **Email** | Nodemailer (SMTP) |
| **File Storage** | Cloudinary (images, resumes, logos) |
| **Validation** | Joi |
| **Logging** | Winston |
| **Security** | Helmet, CORS, express-rate-limit, data sanitization |

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary Account (free tier)
- SMTP Email Provider (Gmail, Outlook, Mailtrap, etc.)

### Installation

```bash
# Clone
git clone https://github.com/yourusername/im-coming-home.git
cd im-coming-home

# Backend
cd backend && npm install

# Frontend
cd ../react-app && npm install
```

### Environment Configuration

#### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/jobboard

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRE=30d

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Habayta Jobs
SMTP_FROM_EMAIL=noreply@habayta.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (for email links)
CLIENT_URL=http://localhost:5173

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (`react-app/.env`)

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Running the Application

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# → http://localhost:5000

# Terminal 2 — Frontend
cd react-app && npm run dev
# → http://localhost:5173
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register (job_seeker / employer) |
| POST | `/api/v1/auth/login` | Login (verified accounts only) |
| POST | `/api/v1/auth/verify-email` | Verify email via token |
| POST | `/api/v1/auth/resend-verification` | Resend verification email (rate limited) |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password with token |
| GET | `/api/v1/auth/profile` | Get current user profile |
| PUT | `/api/v1/auth/profile` | Update profile |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/jobs` | List jobs (with filters & pagination) |
| GET | `/api/v1/jobs/search` | Search jobs |
| GET | `/api/v1/jobs/:id` | Get job details |
| POST | `/api/v1/jobs` | Create job (employer) |
| PUT | `/api/v1/jobs/:id` | Update job |
| DELETE | `/api/v1/jobs/:id` | Delete job |

### Companies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/companies` | List companies |
| GET | `/api/v1/companies/:id` | Get company details |
| POST | `/api/v1/companies` | Create company (employer) |
| PUT | `/api/v1/companies/:id` | Update company |
| POST | `/api/v1/companies/:id/upload-logo` | Upload company logo |
| POST | `/api/v1/companies/:id/upload-banner` | Upload company banner |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/applications` | Get user's applications |
| POST | `/api/v1/applications` | Submit application |
| PUT | `/api/v1/applications/:id/status` | Update application status |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reviews/company/:companyId` | Get company reviews |
| POST | `/api/v1/reviews` | Create review |
| PUT | `/api/v1/reviews/:id` | Update review |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | Get notifications |
| PUT | `/api/v1/notifications/mark-all-read` | Mark all as read |
| PUT | `/api/v1/notifications/:id/read` | Mark one as read |
| DELETE | `/api/v1/notifications/:id` | Delete notification |

### Saved Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/saved-jobs` | Get saved jobs |
| POST | `/api/v1/saved-jobs/:jobId` | Save a job |
| DELETE | `/api/v1/saved-jobs/:jobId` | Unsave a job |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | List users |
| GET | `/api/v1/users/:id` | Get user profile |
| POST | `/api/v1/users/upload-resume` | Upload resume |
| POST | `/api/v1/users/upload-profile-image` | Upload profile image |

## 📁 Project Structure

```
im-coming-home/
├── backend/
│   ├── server.js                    # Entry point
│   ├── src/
│   │   ├── app.js                   # Express app setup
│   │   ├── config/
│   │   │   ├── database.js          # MongoDB connection
│   │   │   ├── cloudinary.js        # Cloudinary config
│   │   │   └── constants.js         # App-wide constants & enums
│   │   ├── controllers/
│   │   │   ├── authController.js    # Auth (register, login, verify, resend, reset)
│   │   │   ├── jobController.js     # Job CRUD
│   │   │   ├── companyController.js # Company CRUD & uploads
│   │   │   ├── applicationController.js
│   │   │   ├── reviewController.js
│   │   │   ├── notificationController.js
│   │   │   ├── savedJobController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification & role check
│   │   │   ├── cors.js              # CORS configuration
│   │   │   ├── errorHandler.js      # Global error handler
│   │   │   ├── fileUpload.js        # Multer (resume, image, logo, banner)
│   │   │   ├── rateLimiter.js       # Rate limiters per endpoint type
│   │   │   └── validate.js          # Joi validation schemas
│   │   ├── models/
│   │   │   ├── User.js              # User schema (job_seeker / employer)
│   │   │   ├── Job.js
│   │   │   ├── Company.js           # With paginate plugin
│   │   │   ├── Application.js
│   │   │   ├── Review.js
│   │   │   ├── Notification.js
│   │   │   └── SavedJob.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── jobs.js
│   │   │   ├── companies.js
│   │   │   ├── applications.js
│   │   │   ├── reviews.js
│   │   │   ├── notifications.js
│   │   │   ├── savedJobs.js
│   │   │   └── users.js
│   │   ├── services/
│   │   │   ├── authService.js       # Auth logic (tokens, verify, reset)
│   │   │   ├── emailService.js      # SMTP emails (verify, reset, welcome)
│   │   │   ├── jobService.js        # Job search & matching
│   │   │   └── uploadService.js     # Cloudinary uploads
│   │   └── utils/
│   │       ├── helpers.js
│   │       ├── logger.js            # Winston logger
│   │       └── validators.js
│   └── tests/
│
├── react-app/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.jsx                 # Entry point
│   │   ├── App.jsx                  # Router & routes
│   │   ├── api.js                   # Axios API client
│   │   ├── index.css                # Tailwind + custom styles
│   │   ├── components/
│   │   │   ├── Layout.jsx           # Main layout wrapper
│   │   │   ├── Navbar.jsx           # Navigation (role-based)
│   │   │   ├── Footer.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── ApplyJobModal.jsx
│   │   │   ├── PostJobModal.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   └── ProtectedRoute.jsx   # Auth guard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Auth state & methods
│   │   │   ├── JobContext.jsx
│   │   │   └── JobsContext.jsx
│   │   └── pages/
│   │       ├── Home.jsx
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── VerifyEmail.jsx
│   │       ├── ForgotPassword.jsx
│   │       ├── ResetPassword.jsx
│   │       ├── Jobs.jsx
│   │       ├── JobDetail.jsx
│   │       ├── SavedJobs.jsx
│   │       ├── Companies.jsx
│   │       ├── JobSeekers.jsx
│   │       ├── JobSeekerProfile.jsx
│   │       ├── JobSeekerApplications.jsx
│   │       ├── MyApplications.jsx
│   │       ├── EmployerDashboard.jsx
│   │       └── EmployerJobs.jsx
│   └── public/
│
└── README.md
```

## 🔒 Security

- **Email Verification**: Accounts must verify email before login (SMTP)
- **Corporate Email**: Employers must register with a corporate email domain
- **Rate Limiting**: Auth endpoints, resend verification, applications — all rate limited
- **File Security**: Cloudinary with access controls
- **Data Safety**: bcrypt password hashing, JWT protected routes, Joi input validation
- **Headers**: Helmet security headers on all responses

## � Deployment

For complete deployment instructions including:
- GitHub repository setup
- Backend deployment on Render
- Frontend deployment on Vercel
- Domain configuration with Netlify

**See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for detailed step-by-step instructions in Roman Urdu/English.

## �📄 License

This project is for educational purposes.
