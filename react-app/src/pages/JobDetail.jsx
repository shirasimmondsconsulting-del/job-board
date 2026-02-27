import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Briefcase, MapPin, DollarSign, Clock, Calendar, Building2,
    ChevronLeft, Bookmark, BookmarkCheck, CheckCircle,
    Loader, Users, Star, Globe, ExternalLink
} from 'lucide-react'
import { jobsApi, savedJobsApi, applicationsApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { useJobs } from "../context/JobsContext";
import { findScrapedJob } from "../utils/scrapedJobs";
import ApplyJobModal from '../components/ApplyJobModal'

function JobDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const { toggleSaveJob, isJobSaved } = useJobs();

    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isSaved, setIsSaved] = useState(false)
    const [hasApplied, setHasApplied] = useState(false)
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [isExternalJob, setIsExternalJob] = useState(false);

    useEffect(() => {
        fetchJobDetails()
    }, [id])

    const fetchJobDetails = async () => {
        try {
            setLoading(true)
            const response = await jobsApi.getOne(id)
            const jobData = response.data.data.job || response.data.data;
            if (!jobData) {
              throw new Error("Invalid job data received");
            }
            setJob(jobData)
            setIsExternalJob(false);
            setHasApplied(jobData.hasApplied || false)
            setIsSaved(jobData.hasSaved || false)
        } catch (error) {
            // API job not found – check if it matches a scraped external job
            const scraped = findScrapedJob(id)
            if (scraped) {
                setJob(scraped)
                setIsExternalJob(true)
                setHasApplied(false)
                setIsSaved(isJobSaved(id))
            } else {
              console.error("Failed to fetch job details:", error);
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSaveJob = async () => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      // External jobs – save to localStorage via context
      if (isExternalJob) {
        toggleSaveJob(id);
        setIsSaved(!isSaved);
        return;
      }

      try {
        setSaving(true);
        if (isSaved) {
          await savedJobsApi.remove(id);
          setIsSaved(false);
        } else {
          await savedJobsApi.save(id);
          setIsSaved(true);
        }
      } catch (error) {
        console.error("Failed to save job:", error);
      } finally {
        setSaving(false);
      }
    };

    const handleApply = () => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        setIsApplyModalOpen(true)
    }

    const handleApplySuccess = () => {
        setHasApplied(true)
        setIsApplyModalOpen(false)
    }



    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading job details...</p>
                </div>
            </div>
        )
    }

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
                    <p className="text-gray-600 mb-6">This job may have been removed or expired.</p>
                    <Link
                        to="/jobs"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Browse Jobs
                    </Link>
                </div>
            </div>
        )
    }

    // Resolve company: direct companyId → postedBy.companyId → fallback
    const directCompany = job.companyId && typeof job.companyId === 'object' ? job.companyId : null;
    const posterCompany = job.postedBy?.companyId && typeof job.postedBy.companyId === 'object' ? job.postedBy.companyId : null;
    const company = directCompany || posterCompany || {}
    const location = typeof job.location === 'object'
        ? `${job.location.city || ''}`.replace(/, $/, '').replace(/^, /, '')
        : job.location

    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-8">
          <div className="container-custom">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Jobs
            </Link>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 -mt-8">
          <div className="container-custom">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Job Details */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
                >
                  {/* Job Header */}
                  <div className="p-6 lg:p-8 border-b border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={company.name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <Building2 className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <div>
                          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                            {job.title}
                          </h1>
                          <p className="text-lg text-gray-600 font-medium mb-3">
                            {company.name || "Company"}
                          </p>

                          <div className="flex flex-wrap gap-3">
                            {location && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                <MapPin className="w-4 h-4" />
                                {location}
                                {job.location?.isRemote && " (Remote)"}
                              </span>
                            )}
                            {job.jobType && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm">
                                <Briefcase className="w-4 h-4" />
                                {job.jobType}
                              </span>
                            )}
                            {job.experienceLevel && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm">
                                <Star className="w-4 h-4" />
                                {job.experienceLevel}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Salary & Stats */}
                  <div className="px-6 lg:px-8 py-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-gray-100">
                    <div className="flex flex-wrap gap-6">
                      {(job.salary?.minSalary || job.salary?.maxSalary) && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                          <div>
                            <p className="text-sm text-gray-600">Salary</p>
                            <p className="font-bold text-emerald-700">
                              {job.salary.currency === "ILS" ||
                              !job.salary.currency
                                ? "₪"
                                : job.salary.currency}{" "}
                              {job.salary.minSalary?.toLocaleString()} -{" "}
                              {job.salary.maxSalary?.toLocaleString()}
                              <span className="font-normal text-sm ml-1">
                                /
                                {job.salary.salaryType?.toLowerCase() || "year"}
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Posted</p>
                          <p className="font-medium text-gray-900">
                            {new Date(
                              job.publishedAt || job.createdAt,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Applications</p>
                          <p className="font-medium text-gray-900">
                            {job.applicationCount || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Job Content */}
                  <div className="p-6 lg:p-8 space-y-8">
                    {/* Description */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        About This Role
                      </h2>
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-600 whitespace-pre-line">
                          {job.description}
                        </p>
                      </div>
                    </div>

                    {/* Requirements */}
                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                          Requirements
                        </h2>
                        <ul className="space-y-2">
                          {job.requiredSkills.map((skill, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-600">{skill}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Qualifications */}
                    {job.qualifications && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                          Qualifications
                        </h2>
                        <p className="text-gray-600 whitespace-pre-line">
                          {job.qualifications}
                        </p>
                      </div>
                    )}

                    {/* Responsibilities */}
                    {job.responsibilities && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                          Responsibilities
                        </h2>
                        <p className="text-gray-600 whitespace-pre-line">
                          {job.responsibilities}
                        </p>
                      </div>
                    )}

                    {/* Benefits */}
                    {job.benefits && job.benefits.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                          Benefits
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {job.benefits.map((benefit, i) => (
                            <span
                              key={i}
                              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Apply Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
                  >
                    {hasApplied ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Application Submitted
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          You've already applied for this position. Track your
                          application status in your dashboard.
                        </p>
                        <Link
                          to="/my-applications"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View My Applications
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    ) : isExternalJob ? (
                      // External / scraped job – redirect to source platform
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-3">
                          This job is listed on
                          <span className="font-semibold text-gray-700">
                            {" "}
                            {job.sourceLabel || "an external site"}
                          </span>
                          . You will be redirected to apply.
                        </p>
                        <a
                          href={job.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
                        >
                          Apply on {job.sourceLabel || "External Site"}
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={handleApply}
                          disabled={user?.userType === "employer"}
                          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Apply Now
                        </button>
                        {user?.userType === "employer" && (
                          <p className="text-sm text-gray-500 text-center mt-2">
                            Employers cannot apply to jobs
                          </p>
                        )}
                      </>
                    )}

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleSaveJob}
                        disabled={saving}
                        className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                          isSaved
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {saving ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : isSaved ? (
                          <BookmarkCheck className="w-4 h-4" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                        {isSaved ? "Saved" : "Save"}
                      </button>
                    </div>
                  </motion.div>

                  {/* Company Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      About the Company
                    </h3>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <Building2 className="w-7 h-7 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {company.name || "Company"}
                        </h4>
                        {company.industry && (
                          <p className="text-sm text-gray-600">
                            {company.industry}
                          </p>
                        )}
                      </div>
                    </div>

                    {company.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {company.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      {company.size && (
                        <p className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          {company.size} employees
                        </p>
                      )}
                      {/* Rating for external / scraped jobs */}
                      {company.rating?.rating && (
                        <p className="flex items-center gap-2 text-gray-600">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          {company.rating.rating.toFixed(1)}
                          {company.rating.count && (
                            <span className="text-gray-400">
                              ({company.rating.count.toLocaleString()} reviews)
                            </span>
                          )}
                        </p>
                      )}
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                          <Globe className="w-4 h-4" />
                          {isExternalJob
                            ? `View on ${job.sourceLabel || "Indeed"}`
                            : "Visit Website"}
                        </a>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Apply Modal – only for employer-posted (database) jobs */}
        {!isExternalJob && (
          <ApplyJobModal
            isOpen={isApplyModalOpen}
            onClose={() => setIsApplyModalOpen(false)}
            job={job}
            onSuccess={handleApplySuccess}
          />
        )}
      </div>
    );
}

export default JobDetail
