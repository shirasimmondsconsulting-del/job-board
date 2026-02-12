import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Briefcase, CheckCircle, XCircle, Clock, AlertCircle,
  MapPin, Calendar, DollarSign, ExternalLink, Loader,
  Trash2, Eye, Building2, ChevronRight, Star
} from 'lucide-react'
import { applicationsApi } from '../api'
import { toast } from 'react-hot-toast'
import ConfirmModal from '../components/ConfirmModal'

function JobSeekerApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(null)
  const [filter, setFilter] = useState('all')
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
  const [appToWithdraw, setAppToWithdraw] = useState(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await applicationsApi.getAll()
      setApplications(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawClick = (applicationId) => {
    setAppToWithdraw(applicationId)
    setShowWithdrawConfirm(true)
  }

  const handleWithdraw = async () => {
    if (!appToWithdraw) return

    try {
      setWithdrawing(appToWithdraw)
      await applicationsApi.withdraw(appToWithdraw)
      setApplications(prev => prev.filter(app => app._id !== appToWithdraw))
      toast.success('Application withdrawn successfully')
    } catch (error) {
      console.error('Failed to withdraw application:', error)
      toast.error('Failed to withdraw application')
    } finally {
      setWithdrawing(null)
      setShowWithdrawConfirm(false)
      setAppToWithdraw(null)
    }
  }

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: Clock,
        label: 'Pending Review',
        description: 'Your application is being reviewed'
      },
      reviewed: {
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Eye,
        label: 'Reviewed',
        description: 'Employer has seen your application'
      },
      shortlisted: {
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        icon: Star,
        label: 'Shortlisted',
        description: 'You\'ve been shortlisted!'
      },
      accepted: {
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: CheckCircle,
        label: 'Accepted',
        description: 'Congratulations! You\'ve been accepted'
      },
      rejected: {
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
        label: 'Not Selected',
        description: 'Application was not successful'
      },
      withdrawn: {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: AlertCircle,
        label: 'Withdrawn',
        description: 'You withdrew this application'
      }
    }
    return configs[status] || configs.pending
  }

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-12">
        <div className="container-custom">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">My Applications</h1>
          <p className="text-blue-100">Track the status of all your job applications</p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="container-custom py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'shortlisted', label: 'Shortlisted' },
              { key: 'accepted', label: 'Accepted' },
              { key: 'rejected', label: 'Rejected' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {label} ({statusCounts[key] || 0})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Applications List */}
      <section className="py-8">
        <div className="container-custom">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {filter === 'all' ? 'No Applications Yet' : `No ${filter} applications`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? 'Start exploring jobs and submit your first application!'
                  : 'Try selecting a different filter'}
              </p>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Browse Jobs
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app, index) => {
                const statusConfig = getStatusConfig(app.status)
                const StatusIcon = statusConfig.icon
                const job = app.jobId || {}
                const company = job.companyId || app.companyId || {}

                return (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Header Row */}
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            {/* Company Logo */}
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                              {company.logo ? (
                                <img src={company.logo} alt={company.name} className="w-full h-full object-cover rounded-xl" />
                              ) : (
                                <Building2 className="w-7 h-7 text-white" />
                              )}
                            </div>

                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {job.title || 'Job Title'}
                              </h3>
                              <p className="text-gray-600 font-medium">
                                {company.name || 'Company Name'}
                              </p>

                              {/* Job Meta */}
                              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                                {job.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {typeof job.location === 'object'
                                      ? `${job.location.city || ''}, ${job.location.country || ''}`.replace(/, $/, '')
                                      : job.location}
                                  </span>
                                )}
                                {job.jobType && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="w-4 h-4" />
                                    {job.jobType}
                                  </span>
                                )}
                                {(job.salary?.minSalary || job.salary?.maxSalary) && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    {job.salary.currency || 'USD'} {job.salary.minSalary?.toLocaleString()} - {job.salary.maxSalary?.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex flex-col items-end gap-2">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${statusConfig.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig.label}
                          </span>
                          <p className="text-xs text-gray-500">{statusConfig.description}</p>
                        </div>
                      </div>

                      {/* Application Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4 pt-4 border-t border-gray-100">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied: {new Date(app.appliedAt || app.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        {app.reviewedAt && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            Reviewed: {new Date(app.reviewedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        )}
                      </div>

                      {/* Cover Letter Preview */}
                      {app.coverLetter && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Your Cover Letter:</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{app.coverLetter}</p>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {app.status === 'rejected' && app.rejectionReason && (
                        <div className="bg-red-50 rounded-xl p-4 mb-4 border border-red-100">
                          <p className="text-sm font-medium text-red-700 mb-1">Feedback:</p>
                          <p className="text-sm text-red-600">{app.rejectionReason}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <Link
                          to={`/jobs/${job._id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Job
                        </Link>

                        {app.status === 'pending' && (
                          <button
                            onClick={() => handleWithdrawClick(app._id)}
                            disabled={withdrawing === app._id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {withdrawing === app._id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <ConfirmModal
        isOpen={showWithdrawConfirm}
        onClose={() => {
          setShowWithdrawConfirm(false)
          setAppToWithdraw(null)
        }}
        onConfirm={handleWithdraw}
        title="Withdraw Application"
        message="Are you sure you want to withdraw your application? This cannot be undone."
        confirmText={withdrawing ? 'Withdrawing...' : 'Withdraw'}
        type="danger"
      />
    </div>
  )
}

export default JobSeekerApplications
