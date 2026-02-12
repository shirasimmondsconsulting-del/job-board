import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, Users, CheckCircle, XCircle, Clock, Mail, Phone, MapPin, Calendar, ExternalLink, Loader, User } from 'lucide-react'
import { jobsApi, applicationsApi } from '../api'
import { toast } from 'react-hot-toast'
import ConfirmModal from '../components/ConfirmModal'

function MyApplications() {
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  useEffect(() => {
    fetchJobsAndApplications()
  }, [])

  const fetchJobsAndApplications = async () => {
    try {
      setLoading(true)
      // Fetch employer's jobs
      const jobsResponse = await jobsApi.getMyJobs()
      const jobsData = jobsResponse.data.data || []
      setJobs(jobsData)

      // Fetch all applications in ONE go
      const appResponse = await applicationsApi.getAll()
      const allApps = appResponse.data.data || []

      // Group applications by jobId
      const groupedApps = {}
      allApps.forEach(app => {
        const jobId = app.jobId?._id || app.jobId
        if (!groupedApps[jobId]) groupedApps[jobId] = []
        groupedApps[jobId].push(app)
      })
      setApplications(groupedApps)

      if (jobsData.length > 0) {
        setSelectedJob(jobsData[0]._id)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (applicationId, action) => {
    // Show confirmation for final status changes
    if ((action === 'accept' || action === 'reject') && !pendingAction) {
      setPendingAction({ applicationId, action });
      setShowConfirm(true);
      return;
    }

    try {
      if (action === 'accept') {
        await applicationsApi.accept(applicationId)
        toast.success('Application accepted!')
      } else if (action === 'reject') {
        await applicationsApi.reject(applicationId, 'Position filled')
        toast.success('Application rejected')
      } else if (action === 'shortlist') {
        await applicationsApi.shortlist(applicationId)
        toast.success('Candidate shortlisted')
      }

      // Refresh applications
      fetchJobsAndApplications()
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update application status')
    } finally {
      setShowConfirm(false);
      setPendingAction(null);
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
      shortlisted: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Users },
      accepted: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
    }
    return badges[status] || badges.pending
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const selectedJobData = jobs.find(j => j._id === selectedJob)
  const selectedApplications = applications[selectedJob] || []

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 py-12">
        <div className="container-custom">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Job Applications</h1>
          <p className="text-blue-100">Manage candidates who applied to your job postings</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container-custom">
          {jobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Jobs Posted Yet</h3>
              <p className="text-gray-600">Post your first job to start receiving applications</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Jobs Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Your Jobs</h3>
                  <div className="space-y-2">
                    {jobs.map(job => {
                      const appCount = applications[job._id]?.length || 0
                      return (
                        <button
                          key={job._id}
                          onClick={() => setSelectedJob(job._id)}
                          className={`w-full text-left p-3 rounded-xl transition-all ${selectedJob === job._id
                            ? 'bg-blue-50 border-2 border-blue-500'
                            : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                            }`}
                        >
                          <p className="font-semibold text-sm text-gray-900 truncate">{job.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {appCount} {appCount === 1 ? 'Application' : 'Applications'}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Applications List */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl border border-gray-200">
                  {/* Job Header */}
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedJobData?.title}</h2>
                    <p className="text-gray-600 mt-1">{selectedApplications.length} Applications</p>
                  </div>

                  {/* Applications */}
                  <div className="divide-y divide-gray-200">
                    {selectedApplications.length === 0 ? (
                      <div className="p-12 text-center">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No applications yet for this position</p>
                      </div>
                    ) : (
                      selectedApplications.map((app, index) => {
                        const statusBadge = getStatusBadge(app.status)
                        const StatusIcon = statusBadge.icon

                        return (
                          <motion.div
                            key={app._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-6 hover:bg-gray-50 transition-colors"
                          >
                            {/* Applicant Info */}
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                  {app.userId?.firstName} {app.userId?.lastName}
                                </h3>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                                  {app.userId?.email && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="w-4 h-4" />
                                      {app.userId.email}
                                    </span>
                                  )}
                                  {app.userId?.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-4 h-4" />
                                      {app.userId.phone}
                                    </span>
                                  )}
                                  {app.userId?.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {app.userId.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusBadge.color}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {app.status}
                              </span>
                            </div>

                            {/* Cover Letter */}
                            {app.coverLetter && (
                              <div className="mb-4">
                                <p className="text-sm font-semibold text-gray-700 mb-1">Cover Letter:</p>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                  {app.coverLetter}
                                </p>
                              </div>
                            )}

                            {/* Additional Info */}
                            <div className="flex flex-wrap gap-4 mb-4 text-sm">
                              {app.expectedSalary && (
                                <div>
                                  <span className="font-semibold text-gray-700">Expected Salary:</span>
                                  <span className="text-gray-600 ml-1">${app.expectedSalary.toLocaleString()}/year</span>
                                </div>
                              )}
                              {app.availableFrom && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span className="font-semibold text-gray-700">Available:</span>
                                  <span className="text-gray-600 ml-1">
                                    {new Date(app.availableFrom).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Links */}
                            {(app.portfolioUrl || app.linkedinUrl) && (
                              <div className="flex gap-3 mb-4">
                                {app.portfolioUrl && (
                                  <a
                                    href={app.portfolioUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Portfolio
                                  </a>
                                )}
                                {app.linkedinUrl && (
                                  <a
                                    href={app.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    LinkedIn
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                              {/* Message Button */}
                              {app.userId?.email && (
                                <a
                                  href={`mailto:${app.userId.email}?subject=Regarding your application for ${selectedJobData?.title || 'the position'}`}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-semibold transition-colors"
                                >
                                  <Mail className="w-4 h-4" />
                                  Message
                                </a>
                              )}

                              {/* View Profile Button */}
                              <Link
                                to={`/job-seekers/${app.userId?._id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-semibold transition-colors border border-gray-200"
                              >
                                <User className="w-4 h-4" />
                                View Profile
                              </Link>

                              {/* Status Actions */}
                              {app.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleStatusUpdate(app._id, 'shortlist')}
                                    className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm font-semibold transition-colors"
                                  >
                                    Shortlist
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(app._id, 'accept')}
                                    className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 text-sm font-semibold transition-colors"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(app._id, 'reject')}
                                    className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-semibold transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </motion.div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setPendingAction(null);
        }}
        onConfirm={() => handleStatusUpdate(pendingAction.applicationId, pendingAction.action)}
        title={pendingAction?.action === 'accept' ? 'Accept Application' : 'Reject Application'}
        message={`Are you sure you want to ${pendingAction?.action} this application?`}
        confirmText={pendingAction?.action === 'accept' ? 'Accept' : 'Reject'}
        type={pendingAction?.action === 'accept' ? 'success' : 'danger'}
      />
    </div>
  )
}

export default MyApplications
