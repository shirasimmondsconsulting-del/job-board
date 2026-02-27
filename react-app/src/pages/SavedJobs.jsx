import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, ExternalLink, Briefcase, MapPin, Building2, Bookmark, ArrowRight, Banknote, Wifi } from 'lucide-react'
import { useJobs } from '../context/JobsContext'

function SavedJobs() {
  const { getSavedJobs, toggleSaveJob } = useJobs()
  const savedJobs = getSavedJobs()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2230%22 height=%2230%22 viewBox=%220 0 30 30%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M15 0v30M0 15h30%22 fill=%22none%22 stroke=%22%23fff%22 stroke-opacity=%220.03%22/%3E%3C/svg%3E')]"></div>
        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
              <Bookmark className="w-4 h-4 text-primary-200" />
              <span className="text-sm font-medium text-white">
                {savedJobs.length} saved{" "}
                {savedJobs.length === 1 ? "job" : "jobs"}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Your Saved Jobs
            </h1>
            <p className="text-primary-100 text-lg">
              Keep track of the opportunities that interest you most.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Saved Jobs List */}
      <section className="py-10">
        <div className="container-custom">
          {savedJobs.length > 0 ? (
            <div className="grid gap-4">
              {savedJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-100/30 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary-100">
                            <Briefcase className="w-6 h-6 text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {job.remote && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 border border-primary-100">
                                  <Wifi className="w-3 h-3" />
                                  Remote OK
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors mb-1 truncate">
                              {job.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                              <span className="inline-flex items-center gap-1.5 font-medium">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                {job.company}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                {job.location}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                              {job.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium border border-gray-100">
                                {job.industry}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium border border-gray-100">
                                Hebrew: {job.hebrewLevel}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end flex-shrink-0">
                        <div className="flex items-center gap-2 mb-2 lg:text-right">
                          <Banknote className="w-4 h-4 text-emerald-600" />
                          <span className="text-lg font-bold text-gray-900">
                            {job.salaryRange}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {/* External / scraped jobs → open external platform */}
                          {job.source === "external" ? (
                            <a
                              href={job.applyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              Apply on {job.sourceLabel || "Indeed"}
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : (
                            /* Employer-posted jobs → view job detail page */
                            <Link
                              to={`/jobs/${job._id || job.id}`}
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              View & Apply
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                          <button
                            onClick={() => toggleSaveJob(job.id)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-semibold transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white rounded-2xl border border-gray-100"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bookmark className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Saved Jobs Yet
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start browsing jobs and save the ones you're interested in to
                access them quickly later.
              </p>
              <Link to="/jobs" className="btn btn-primary btn-lg">
                Browse Jobs
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

export default SavedJobs
