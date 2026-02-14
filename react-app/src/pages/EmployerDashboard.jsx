import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Briefcase, Users, TrendingUp, Eye, Clock, CheckCircle,
    XCircle, Plus, ChevronRight, Loader, Building2, FileText,
    BarChart3, Calendar, Star
} from 'lucide-react'
import { jobsApi, applicationsApi } from '../api'
import { useAuth } from '../context/AuthContext'
import PostJobModal from '../components/PostJobModal'

function EmployerDashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        pendingApplications: 0
    })
    const [recentJobs, setRecentJobs] = useState([])
    const [recentApplications, setRecentApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false)

    useEffect(() => {
        fetchDashboardData()

        const handler = () => fetchDashboardData()
        window.addEventListener('application:statusChanged', handler)
        return () => window.removeEventListener('application:statusChanged', handler)
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch employer's jobs
            const jobsResponse = await jobsApi.getMyJobs()
            const jobs = jobsResponse.data.data || []
            setRecentJobs(jobs.slice(0, 5))

            // Calculate stats
            const activeJobs = jobs.filter(j => j.status === 'published').length

            // Fetch all applications for employer's jobs in ONE go
            const appResponse = await applicationsApi.getAll()
            const allApplications = appResponse.data.data || []

            const pendingApps = allApplications.filter(a => a.status === 'pending')

            setStats({
                totalJobs: jobs.length,
                activeJobs,
                totalApplications: allApplications.length,
                pendingApplications: pendingApps.length
            })

            setRecentApplications(allApplications.slice(0, 5))

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleJobPosted = () => {
        fetchDashboardData()
        setIsPostJobModalOpen(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading dashboard...</p>
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
                            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                                Welcome back, {user?.firstName || 'Employer'}!
                            </h1>
                            <p className="text-purple-200">Manage your job postings and review applications</p>
                        </div>
                        <button
                            onClick={() => setIsPostJobModalOpen(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                            Post New Job
                        </button>
                    </div>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="py-8 -mt-8">
                <div className="container-custom">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                label: 'Total Jobs',
                                value: stats.totalJobs,
                                icon: Briefcase,
                                color: 'from-blue-500 to-blue-600',
                                link: '/employer/jobs'
                            },
                            {
                                label: 'Active Jobs',
                                value: stats.activeJobs,
                                icon: TrendingUp,
                                color: 'from-emerald-500 to-green-600',
                                link: '/employer/jobs'
                            },
                            {
                                label: 'Total Applications',
                                value: stats.totalApplications,
                                icon: Users,
                                color: 'from-indigo-500 to-purple-600',
                                link: '/employer/applications'
                            },
                            {
                                label: 'Pending Review',
                                value: stats.pendingApplications,
                                icon: Clock,
                                color: 'from-amber-500 to-orange-600',
                                link: '/employer/applications'
                            }
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link
                                    to={stat.link}
                                    className="block bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-sm text-gray-600">{stat.label}</p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-8">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Recent Jobs */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Briefcase className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">Recent Jobs</h2>
                                </div>
                                <Link
                                    to="/employer/jobs"
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                                >
                                    View All
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {recentJobs.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600 mb-4">No jobs posted yet</p>
                                        <button
                                            onClick={() => setIsPostJobModalOpen(true)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Post Your First Job
                                        </button>
                                    </div>
                                ) : (
                                    recentJobs.map((job) => (
                                        <Link
                                            key={job._id}
                                            to={`/jobs/${job._id}`}
                                            className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4"
                                        >
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3.5 h-3.5" />
                                                        {job.applicationCount || 0} applications
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3.5 h-3.5" />
                                                        {job.views || 0} views
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${job.status === 'published'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : job.status === 'draft'
                                                    ? 'bg-gray-100 text-gray-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {job.status}
                                            </span>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Recent Applications */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <Users className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
                                </div>
                                <Link
                                    to="/employer/applications"
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                                >
                                    View All
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {recentApplications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600">No applications yet</p>
                                        <p className="text-sm text-gray-500 mt-1">Applications will appear here when candidates apply</p>
                                    </div>
                                ) : (
                                    recentApplications.map((app) => {
                                        const applicant = app.userId || {}
                                        return (
                                            <div
                                                key={app._id}
                                                className="p-4 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white font-bold text-sm">
                                                            {applicant.firstName?.[0]}{applicant.lastName?.[0]}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-900">
                                                            {applicant.firstName} {applicant.lastName}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 truncate">
                                                            Applied for: {app.job?.title || 'Job'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${app.status === 'pending'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : app.status === 'shortlisted'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : app.status === 'accepted'
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                                {/* Action Buttons */}
                                                <div className="flex gap-2 mt-3 ml-13">
                                                    {applicant.email && (
                                                        <a
                                                            href={`mailto:${applicant.email}?subject=${encodeURIComponent(`Regarding your application for ${app.job?.title || 'the position'}`)}`}
                                                            onClick={(e) => {
                                                              // try mailto; if not available, copy email to clipboard as fallback
                                                              try {
                                                                // allow default navigation to mail client
                                                              } catch (err) {
                                                                e.preventDefault();
                                                              }
                                                              // set a timeout to copy to clipboard if mail client doesn't open in some environments
                                                              setTimeout(() => {
                                                                // best-effort: copy email to clipboard so user can paste into their mail client
                                                                if (navigator.clipboard) navigator.clipboard.writeText(applicant.email)
                                                              }, 500);
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            Message
                                                        </a>
                                                    )}
                                                    <Link
                                                        to={`/job-seekers/${applicant._id || app.userId?._id}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors border border-gray-200"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        View Profile
                                                    </Link>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="py-8">
                <div className="container-custom">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                label: 'Post New Job',
                                icon: Plus,
                                color: 'bg-blue-600 hover:bg-blue-700',
                                action: () => setIsPostJobModalOpen(true)
                            },
                            {
                                label: 'Manage Jobs',
                                icon: Briefcase,
                                color: 'bg-indigo-600 hover:bg-indigo-700',
                                link: '/employer/jobs'
                            },
                            {
                                label: 'View Applications',
                                icon: FileText,
                                color: 'bg-purple-600 hover:bg-purple-700',
                                link: '/employer/applications'
                            },
                            {
                                label: 'Browse Candidates',
                                icon: Users,
                                color: 'bg-emerald-600 hover:bg-emerald-700',
                                link: '/job-seekers'
                            }
                        ].map((action, i) => (
                            <motion.div
                                key={action.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                            >
                                {action.link ? (
                                    <Link
                                        to={action.link}
                                        className={`${action.color} text-white rounded-xl p-6 flex flex-col items-center text-center transition-colors`}
                                    >
                                        <action.icon className="w-8 h-8 mb-3" />
                                        <span className="font-semibold">{action.label}</span>
                                    </Link>
                                ) : (
                                    <button
                                        onClick={action.action}
                                        className={`${action.color} text-white rounded-xl p-6 flex flex-col items-center text-center transition-colors w-full`}
                                    >
                                        <action.icon className="w-8 h-8 mb-3" />
                                        <span className="font-semibold">{action.label}</span>
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Post Job Modal */}
            <PostJobModal
                isOpen={isPostJobModalOpen}
                onClose={() => setIsPostJobModalOpen(false)}
                onJobPosted={handleJobPosted}
            />
        </div>
    )
}

export default EmployerDashboard
