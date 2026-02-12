import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Briefcase, Mail, Linkedin, Clock, Filter, Users, ChevronDown, SlidersHorizontal, ArrowRight, Wifi, GraduationCap, Globe, LogIn, Loader } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usersApi } from '../api'

function JobSeekers() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [seekers, setSeekers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    timeline: '',
    industry: '',
    hebrewLevel: '',
    remote: false
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchSeekers()
  }, [])

  const fetchSeekers = async () => {
    try {
      setLoading(true)
      const response = await usersApi.getJobSeekers()
      setSeekers(response.data.data)
    } catch (error) {
      console.error('Failed to fetch job seekers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContactClick = () => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }

  const filteredSeekers = seekers.filter(seeker => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        `${seeker.firstName} ${seeker.lastName}`.toLowerCase().includes(search) ||
        (seeker.skills && seeker.skills.some(skill => skill.toLowerCase().includes(search))) ||
        (seeker.bio && seeker.bio.toLowerCase().includes(search))
      if (!matchesSearch) return false
    }
    // Add other filters as needed when backend supports them
    return true
  })

  const getTimelineBadge = (timeline) => {
    const badges = {
      'now': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
      '3-months': { color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
      '6-months': { color: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
      '12-months': { color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' }
    }
    return badges[timeline] || { color: 'bg-gray-50 text-gray-700 border-gray-200', dot: 'bg-gray-500' }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 py-16 lg:py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2230%22 height=%2230%22 viewBox=%220 0 30 30%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M15 0v30M0 15h30%22 fill=%22none%22 stroke=%22%23fff%22 stroke-opacity=%220.03%22/%3E%3C/svg%3E')]"></div>

        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
              <Users className="w-4 h-4 text-primary-200" />
              <span className="text-sm font-medium text-white">{filteredSeekers.length} talented professionals</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Job Seeker Profiles
            </h1>
            <p className="text-primary-100 text-lg max-w-xl">
              Connect with talented Olim planning their move to Israel. Verified profiles from professionals worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 lg:py-12">
        <div className="container-custom">
          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100 p-6 mb-8 -mt-12 relative z-10"
          >
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, skills, or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center justify-center gap-2 px-5 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-semibold transition-colors border border-gray-200"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Timeline</label>
                      <select
                        value={filters.timeline}
                        onChange={(e) => setFilters(prev => ({ ...prev, timeline: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-gray-900 text-sm appearance-none bg-white"
                      >
                        <option value="">All Timelines</option>
                        <option value="now">Here Now</option>
                        <option value="3-months">Coming in 3 Months</option>
                        <option value="6-months">Coming in 6 Months</option>
                        <option value="12-months">Coming in 12 Months</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Industry</label>
                      <select
                        value={filters.industry}
                        onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-gray-900 text-sm appearance-none bg-white"
                      >
                        <option value="">All Industries</option>
                        <option value="Technology">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Education">Education</option>
                        <option value="Healthcare">Healthcare</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Hebrew Level</label>
                      <select
                        value={filters.hebrewLevel}
                        onChange={(e) => setFilters(prev => ({ ...prev, hebrewLevel: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-gray-900 text-sm appearance-none bg-white"
                      >
                        <option value="">Any Level</option>
                        <option value="None">None</option>
                        <option value="Basic">Basic</option>
                        <option value="Conversational">Conversational</option>
                        <option value="Fluent">Fluent</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors w-full">
                        <input
                          type="checkbox"
                          checked={filters.remote}
                          onChange={(e) => setFilters(prev => ({ ...prev, remote: e.target.checked }))}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Wifi className="w-4 h-4 text-gray-400" />
                          Open to Remote
                        </span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing <span className="font-bold text-gray-900">{filteredSeekers.length}</span> {filteredSeekers.length === 1 ? 'candidate' : 'candidates'}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
              <Loader className="w-10 h-10 animate-spin text-primary-600 mb-4" />
              <p className="text-gray-600">Finding talented candidates...</p>
            </div>
          ) : (
            <>
              {/* Profile Cards */}
              <div className="grid lg:grid-cols-2 gap-5">
                {filteredSeekers.map((seeker, index) => {
                  const timelineBadge = getTimelineBadge(seeker.availability)
                  return (
                    <motion.div
                      key={seeker._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-100/30 transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg shadow-primary-500/20">
                            {seeker.firstName?.[0]}{seeker.lastName?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors mb-1 truncate">
                              {seeker.firstName} {seeker.lastName}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-2">
                              <Globe className="w-3.5 h-3.5 text-gray-400" />
                              {seeker.location}
                            </p>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${timelineBadge.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${timelineBadge.dot}`}></span>
                              {seeker.availability || 'Available'}
                            </span>
                          </div>
                        </div>

                        {/* Roles / Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {seeker.skills?.slice(0, 3).map(skill => (
                            <span key={skill} className="inline-flex items-center px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-semibold border border-primary-100">
                              {skill}
                            </span>
                          ))}
                          {seeker.remote && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-100">
                              <Wifi className="w-3 h-3" />
                              Remote OK
                            </span>
                          )}
                        </div>

                        {/* Details - Blurred if not authenticated */}
                        <div className={`space-y-2 mb-5 text-sm ${!isAuthenticated ? 'filter blur-sm' : ''}`}>
                          <p className="text-gray-700">
                            <span className="font-semibold text-gray-900">Experience:</span> {seeker.experience?.yearsOfExperience} years
                          </p>
                          <p className="text-gray-500 line-clamp-2">{seeker.bio}</p>
                        </div>

                        {/* Actions */}
                        {isAuthenticated ? (
                          <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <Link
                              to={`/job-seekers/${seeker._id}`}
                              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              View Profile
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a
                              href={seeker.email ? `mailto:${seeker.email}?subject=Job Opportunity` : '#'}
                              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-colors border border-gray-200"
                            >
                              <Mail className="w-4 h-4" />
                              Message
                            </a>
                          </div>
                        ) : (
                          <div className="pt-4 border-t border-gray-100">
                            <button
                              onClick={handleContactClick}
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <LogIn className="w-4 h-4" />
                              Login to View Contact Details
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Empty State */}
              {filteredSeekers.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 bg-white rounded-2xl border border-gray-100"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No candidates found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default JobSeekers
