import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Briefcase, Plus, Eye, Users, Edit2, Trash2, MoreVertical,
    MapPin, Clock, CheckCircle, XCircle, Loader, Search,
    TrendingUp, TrendingDown, ToggleLeft, ToggleRight, ChevronDown
} from 'lucide-react'
import { jobsApi } from '../api'
import PostJobModal from '../components/PostJobModal'
import ConfirmModal from '../components/ConfirmModal'
import { toast } from 'react-hot-toast'

function EmployerJobs() {
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false)
    const [editingJob, setEditingJob] = useState(null)
    const [actionLoading, setActionLoading] = useState(null)
    const [menuOpen, setMenuOpen] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [jobToDelete, setJobToDelete] = useState(null)

    useEffect(() => {
        fetchJobs()

        const handler = () => fetchJobs()
        window.addEventListener('application:statusChanged', handler)
        return () => window.removeEventListener('application:statusChanged', handler)
    }, [])

    const fetchJobs = async () => {
        try {
            setLoading(true)
            const response = await jobsApi.getMyJobs()
            setJobs(response.data.data || [])
        } catch (error) {
            console.error('Failed to fetch jobs:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePublish = async (jobId) => {
        try {
            setActionLoading(jobId)
            await jobsApi.publish(jobId)
            toast.success('Job published successfully')
            await fetchJobs()
        } catch (error) {
            console.error('Failed to publish job:', error)
            toast.error(error.response?.data?.message || 'Failed to publish job')
        } finally {
            setActionLoading(null)
        }
    }

    const handleUnpublish = async (jobId) => {
        try {
            setActionLoading(jobId)
            await jobsApi.unpublish(jobId)
            toast.success('Job unpublished successfully')
            await fetchJobs()
        } catch (error) {
            console.error('Failed to unpublish job:', error)
            toast.error(error.response?.data?.message || 'Failed to unpublish job')
        } finally {
            setActionLoading(null)
        }
    }

    const handleDeleteClick = (jobId) => {
        setJobToDelete(jobId)
        setShowDeleteConfirm(true)
    }

    const handleDelete = async () => {
        if (!jobToDelete) return

        try {
            setActionLoading(jobToDelete)
            await jobsApi.delete(jobToDelete)
            setJobs(prev => prev.filter(j => j._id !== jobToDelete))
            toast.success('Job deleted successfully')
        } catch (error) {
            console.error('Failed to delete job:', error)
            toast.error(error.response?.data?.message || 'Failed to delete job')
        } finally {
            setActionLoading(null)
            setShowDeleteConfirm(false)
            setJobToDelete(null)
        }
    }

    const handleEdit = (job) => {
        setEditingJob(job)
        setIsPostJobModalOpen(true)
    }

    const handleJobPosted = () => {
        fetchJobs()
        setIsPostJobModalOpen(false)
        setEditingJob(null)
    }

    const filteredJobs = jobs
        .filter(job => {
            if (filter === 'all') return true
            return job.status === filter
        })
        .filter(job => {
            if (!searchQuery) return true
            return job.title.toLowerCase().includes(searchQuery.toLowerCase())
        })

    const statusCounts = {
        all: jobs.length,
        published: jobs.filter(j => j.status === 'published').length,
        draft: jobs.filter(j => j.status === 'draft').length,
        closed: jobs.filter(j => j.status === 'closed').length
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your jobs...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 py-12">
                <div className="container-custom">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">My Job Postings</h1>
                            <p className="text-purple-200">Manage all your job listings in one place</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingJob(null)
                                setIsPostJobModalOpen(true)
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                            Post New Job
                        </button>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="bg-white border-b border-gray-200 sticky top-16 z-10">
                <div className="container-custom py-4">
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                        {/* Status Filters */}
                        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                            {[
                                { key: 'all', label: 'All Jobs' },
                                { key: 'published', label: 'Published' },
                                { key: 'draft', label: 'Drafts' },
                                { key: 'closed', label: 'Closed' }
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setFilter(key)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === key
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {label} ({statusCounts[key] || 0})
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl w-full lg:w-64 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Jobs List */}
            <section className="py-8">
                <div className="container-custom">
                    {filteredJobs.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {jobs.length === 0 ? 'No Jobs Posted Yet' : 'No matching jobs found'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {jobs.length === 0
                                    ? 'Start by posting your first job to attract top talent!'
                                    : 'Try adjusting your filters or search query'}
                            </p>
                            {jobs.length === 0 && (
                                <button
                                    onClick={() => setIsPostJobModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Post Your First Job
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredJobs.map((job, index) => {
                                const location = typeof job.location === 'object'
                                    ? `${job.location.city || ''}`.replace(/, $/, '').replace(/^, /, '')
                                    : job.location

                                return (
                                    <motion.div
                                        key={job._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-2xl border border-gray-200 hover:border-indigo-200 hover:shadow-lg transition-all overflow-hidden"
                                    >
                                        <div className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                                {/* Job Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                            <Briefcase className="w-7 h-7 text-white" />
                                                        </div>
                                                        <div>
                                                            <Link to={`/jobs/${job._id}`}>
                                                                <h3 className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors">
                                                                    {job.title}
                                                                </h3>
                                                            </Link>

                                                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                                                                {location && (
                                                                    <span className="flex items-center gap-1">
                                                                        <MapPin className="w-4 h-4" />
                                                                        {location}
                                                                    </span>
                                                                )}
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-4 h-4" />
                                                                    {new Date(job.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>

                                                            {/* Stats */}
                                                            <div className="flex gap-4 mt-3">
                                                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                                                                    <Eye className="w-4 h-4 text-gray-500" />
                                                                    <span className="text-sm font-medium text-gray-700">{job.views || 0} views</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                                                                    <Users className="w-4 h-4 text-gray-500" />
                                                                    <span className="text-sm font-medium text-gray-700">{job.applicationCount || 0} applications</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status & Actions */}
                                                <div className="flex flex-col items-end gap-3">
                                                    {/* Status Badge */}
                                                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${job.status === 'published'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : job.status === 'draft'
                                                            ? 'bg-gray-100 text-gray-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {job.status === 'published' ? '● Live' : job.status === 'draft' ? '○ Draft' : '✕ Closed'}
                                                    </span>

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-2">
                                                        {/* Toggle Publish */}
                                                        {job.status === 'published' ? (
                                                            <button
                                                                onClick={() => handleUnpublish(job._id)}
                                                                disabled={actionLoading === job._id}
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors disabled:opacity-50"
                                                            >
                                                                {actionLoading === job._id ? (
                                                                    <Loader className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <ToggleRight className="w-4 h-4" />
                                                                )}
                                                                Unpublish
                                                            </button>
                                                        ) : job.status === 'draft' ? (
                                                            <button
                                                                onClick={() => handlePublish(job._id)}
                                                                disabled={actionLoading === job._id}
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                                            >
                                                                {actionLoading === job._id ? (
                                                                    <Loader className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <ToggleLeft className="w-4 h-4" />
                                                                )}
                                                                Publish
                                                            </button>
                                                        ) : null}

                                                        {/* Edit */}
                                                        <button
                                                            onClick={() => handleEdit(job)}
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                            Edit
                                                        </button>

                                                        {/* View Applications */}
                                                        <Link
                                                            to="/employer/applications"
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                                                        >
                                                            <Users className="w-4 h-4" />
                                                            Applications
                                                        </Link>

                                                        {/* Delete */}
                                                        <button
                                                            onClick={() => handleDeleteClick(job._id)}
                                                            disabled={actionLoading === job._id}
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                                                        >
                                                            {actionLoading === job._id ? (
                                                                <Loader className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Post/Edit Job Modal */}
            <PostJobModal
                isOpen={isPostJobModalOpen}
                onClose={() => {
                    setIsPostJobModalOpen(false)
                    setEditingJob(null)
                }}
                onJobPosted={handleJobPosted}
                editJob={editingJob}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false)
                    setJobToDelete(null)
                }}
                onConfirm={handleDelete}
                title="Delete Job Post"
                message="Are you sure you want to delete this job? This action cannot be undone."
                confirmText={actionLoading ? 'Deleting...' : 'Delete Job'}
                type="danger"
            />
        </div>
    )
}

export default EmployerJobs
