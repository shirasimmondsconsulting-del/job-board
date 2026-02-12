import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import SavedJobs from './pages/SavedJobs'
import JobSeekers from './pages/JobSeekers'
import JobSeekerProfile from './pages/JobSeekerProfile'
import Companies from './pages/Companies'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

import MyApplications from './pages/MyApplications'
import JobSeekerApplications from './pages/JobSeekerApplications'
import EmployerDashboard from './pages/EmployerDashboard'
import EmployerJobs from './pages/EmployerJobs'
import Test from './pages/Test'

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/test" element={<Test />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetail />} />
          <Route
            path="saved-jobs"
            element={
              <ProtectedRoute allowedUserTypes={['job_seeker']}>
                <SavedJobs />
              </ProtectedRoute>
            }
          />
          <Route path="job-seekers" element={<JobSeekers />} />
          <Route path="job-seekers/:id" element={<JobSeekerProfile />} />
          <Route path="companies" element={<Companies />} />

          {/* Job Seeker Routes */}
          <Route
            path="my-applications"
            element={
              <ProtectedRoute allowedUserTypes={['job_seeker']}>
                <JobSeekerApplications />
              </ProtectedRoute>
            }
          />

          {/* Employer Routes */}
          <Route
            path="employer/dashboard"
            element={
              <ProtectedRoute allowedUserTypes={['employer']}>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="employer/jobs"
            element={
              <ProtectedRoute allowedUserTypes={['employer']}>
                <EmployerJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="employer/applications"
            element={
              <ProtectedRoute allowedUserTypes={['employer']}>
                <MyApplications />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default App
