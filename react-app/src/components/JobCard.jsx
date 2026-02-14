import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin, Building2, Clock, Bookmark, BookmarkCheck, ExternalLink,
  Wifi, Banknote, GraduationCap, LogIn, Trash2, Pencil, Briefcase, CheckCircle
} from 'lucide-react'
import { useState } from 'react'
import { useJobs } from '../context/JobsContext'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { jobsApi, savedJobsApi } from '../api'
import ApplyJobModal from './ApplyJobModal'
import ConfirmModal from './ConfirmModal'

function JobCard({ job, index = 0, onJobDeleted, onJobEdited }) {
  const { toggleSaveJob, isJobSaved, fetchJobsFromAPI } = useJobs()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  // Support both old format (job.id) and new format (job._id)
  const jobId = job._id || job.id
  const saved = isJobSaved(jobId)
  const [localSaved, setLocalSaved] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)

  const isEmployer = user?.userType === 'employer'
  const isJobSeeker = user?.userType === 'job_seeker'

  // Get company name from different possible sources
  const companyName = job.companyId?.name || job.company || 'Company'

  // Get location from different possible formats
  const getLocation = () => {
    if (typeof job.location === 'object') {
      const parts = [job.location.city].filter(Boolean)
      return parts.join(', ') || 'Location TBD'
    }
    return job.location || 'Location TBD'
  }

  const isRemote = job.remote || job.location?.isRemote

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await jobsApi.delete(jobId);
      toast.success('Job deleted successfully');
      if (onJobDeleted) onJobDeleted();
      else fetchJobsFromAPI();
    } catch (err) {
      toast.error('Failed to delete job');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  const handleSaveClick = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Try using the API for real jobs, fallback to context for mock jobs
    if (job._id) {
      try {
        setSaving(true)
        if (localSaved || saved) {
          await savedJobsApi.remove(job._id)
          setLocalSaved(false)
          toast.success('Job removed from saved');
        } else {
          await savedJobsApi.save(job._id)
          setLocalSaved(true)
          toast.success('Job saved successfully');
        }
      } catch (err) {
        toast.error('Failed to save job');
        console.error('Failed to save job:', err)
      } finally {
        setSaving(false)
      }
    } else {
      toggleSaveJob(jobId)
    }
  }

  const handleApplyClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault()
      navigate('/login')
    }
  }

  const handleApplyNow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isAuthenticated) {
      setShowApplyModal(true)
    } else {
      navigate('/login')
    }
  }

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently'
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return `${Math.floor(diffDays / 30)}mo ago`
  }

  const getJobTypeBadge = () => {
    const jobType = job.jobType || job.type || 'Full-time'
    return { text: jobType, color: 'bg-blue-50 text-blue-700 border-blue-200' }
  }

  const getSalary = () => {
    if (job.salary?.minSalary || job.salary?.maxSalary) {
      const currencyCode = job.salary.currency || 'ILS'
      const currency = currencyCode === 'ILS' ? '₪' : currencyCode
      const min = job.salary.minSalary
      const max = job.salary.maxSalary
      if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
      if (min) return `${currency} ${min.toLocaleString()}+`
      if (max) return `Up to ${currency} ${max.toLocaleString()}`
    }
    return job.salaryRange || 'Competitive'
  }

  const jobTypeBadge = getJobTypeBadge()
  const isSaved = localSaved || saved

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-100/30 transition-all duration-300 overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1 min-w-0">
            {/* Badges Row */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${jobTypeBadge.color}`}>
                <Briefcase className="w-3 h-3" />
                {jobTypeBadge.text}
              </span>
              {isRemote && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 border border-primary-100">
                  <Wifi className="w-3 h-3" />
                  Remote OK
                </span>
              )}
              {job.hasApplied && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <CheckCircle className="w-3 h-3" />
                  Applied
                </span>
              )}
              <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3" />
                {getTimeAgo(job.publishedAt || job.createdAt || job.postedDate)}
              </span>
            </div>

            {/* Title & Company */}
            <Link to={`/jobs/${jobId}`}>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors mb-1.5 truncate cursor-pointer">
                {job.title}
              </h3>
            </Link>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Building2 className="w-4 h-4 text-gray-400" />
                {companyName}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                {getLocation()}
              </span>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveClick}
            disabled={saving}
            className={`flex-shrink-0 p-2.5 rounded-xl transition-all duration-200 ${isSaved
              ? 'bg-primary-100 text-primary-700 hover:bg-primary-200 shadow-sm'
              : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
            aria-label={isSaved ? 'Remove from saved' : 'Save job'}
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {job.shortDescription || job.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {job.category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium border border-gray-100">
              {job.category}
            </span>
          )}
          {job.experienceLevel && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium border border-gray-100">
              <GraduationCap className="w-3 h-3" />
              {job.experienceLevel}
            </span>
          )}
          {job.industry && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium border border-gray-100">
              {job.industry}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span className="text-base font-bold text-gray-900">{getSalary()}</span>
          </div>

          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            {/* View Details */}
            <Link
              to={`/jobs/${jobId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all duration-200"
            >
              View
            </Link>

            {/* Employer Actions */}
            {isEmployer && job.postedBy === user?._id && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold transition-all duration-200"
                title="Delete Job"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Apply Button - only for job seekers or unauthenticated */}
            {!isEmployer && (
              isAuthenticated ? (
                <button
                  onClick={job.hasApplied ? undefined : handleApplyNow}
                  disabled={job.hasApplied}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md ${job.hasApplied
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 cursor-default opacity-80'
                    : 'bg-primary-600 hover:bg-primary-700 text-white cursor-pointer'
                    }`}
                >
                  {job.hasApplied ? 'Applied' : 'Apply'}
                  {!job.hasApplied && <ExternalLink className="w-3.5 h-3.5" />}
                  {job.hasApplied && <CheckCircle className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <button
                  onClick={handleApplyClick}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyJobModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        job={job}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Job Post"
        message={`Are you sure you want to delete "${job.title}"? This action cannot be undone.`}
        confirmText={deleting ? 'Deleting...' : 'Delete Job'}
        type="danger"
      />
    </motion.div>
  )
}

export default JobCard
