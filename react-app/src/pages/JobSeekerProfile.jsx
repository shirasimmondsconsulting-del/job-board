import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Globe,
  Linkedin,
  ExternalLink,
  ArrowLeft,
  Loader,
  FileText,
  GraduationCap,
  Award,
  Clock,
  Eye,
} from "lucide-react";
import { usersApi } from '../api'
import { useAuth } from '../context/AuthContext'
import ResumeViewerModal from "../components/ResumeViewerModal";

function JobSeekerProfile() {
    const { id } = useParams()
    const { user: currentUser } = useAuth()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showResumeViewer, setShowResumeViewer] = useState(false);

    useEffect(() => {
        fetchProfile()
    }, [id])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const response = await usersApi.getPublicProfile(id)
            setProfile(response.data.data.user)
        } catch (err) {
            setError('Failed to load profile')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
                    <p className="text-gray-600 mb-4">{error || 'This profile does not exist or has been removed.'}</p>
                    <Link to="/job-seekers" className="text-blue-600 hover:text-blue-700 font-medium">
                        ← Back to Job Seekers
                    </Link>
                </div>
            </div>
        )
    }

    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-12">
          <div className="container-custom">
            <Link
              to="/job-seekers"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Job Seekers
            </Link>

            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                {profile.firstName?.[0]}
                {profile.lastName?.[0]}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-blue-100 text-lg mb-4">
                  {profile.experience?.currentJobTitle || "Job Seeker"}
                </p>
                <div className="flex flex-wrap gap-4 text-blue-100/90">
                  {profile.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {profile.availability || "Available"}
                  </span>
                </div>
              </div>

              {/* Contact Button (use handler with fallbacks) */}
              {currentUser?.userType === "employer" && (
                <button
                  onClick={() => {
                    // Prefer email, then phone; fallback to copy email
                    if (profile.email) {
                      window.location.href = `mailto:${profile.email}?subject=Job Opportunity: ${encodeURIComponent(profile.firstName + " " + (profile.lastName || ""))}`;
                      return;
                    }
                    if (profile.phone) {
                      window.location.href = `tel:${profile.phone}`;
                      return;
                    }
                    // fallback: copy email/phone to clipboard if present
                    const toCopy = profile.email || profile.phone || "";
                    if (toCopy) {
                      navigator.clipboard?.writeText(toCopy);
                      alert("Contact details copied to clipboard");
                    } else {
                      alert(
                        "No contact information available for this candidate",
                      );
                    }
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <Mail className="w-5 h-5" />
                  Contact
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container-custom">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* About */}
                {profile.bio && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6"
                  >
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      About
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {profile.bio}
                    </p>
                  </motion.div>
                )}

                {/* Skills */}
                {profile.skills?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6"
                  >
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Resume / CV */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="bg-white rounded-2xl border border-gray-200 p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Resume / CV
                  </h2>

                  {profile.resume && profile.resume.url ? (
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Uploaded</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {new Date(
                            profile.resume.uploadedAt ||
                              profile.updatedAt ||
                              profile.createdAt,
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {profile.resume.url.split("/").pop()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowResumeViewer(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View Resume
                        </button>
                        <a
                          href={profile.resume.url}
                          download
                          className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 text-sm"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      No resume uploaded. Encourage candidates to upload a CV to
                      increase chances of being contacted.
                    </p>
                  )}
                </motion.div>

                {/* Experience */}
                {profile.experience && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6"
                  >
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      Experience
                    </h2>
                    <div className="space-y-3">
                      {profile.experience.currentJobTitle && (
                        <div>
                          <span className="text-sm text-gray-500">
                            Current / Most Recent Role
                          </span>
                          <p className="font-semibold text-gray-900">
                            {profile.experience.currentJobTitle}
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="text-sm text-gray-500">
                          Years of Experience
                        </span>
                        <p className="font-semibold text-gray-900">
                          {profile.experience.yearsOfExperience || 0} years
                        </p>
                      </div>

                      {profile.experience.previousCompanies?.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-500">
                            Previous Companies
                          </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {profile.experience.previousCompanies.map(
                              (company, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                                >
                                  {company}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Education */}
                {profile.education && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6"
                  >
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      Education
                    </h2>
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">
                        {profile.education.degree} in{" "}
                        {profile.education.fieldOfStudy}
                      </p>
                      <p className="text-gray-600">
                        {profile.education.university}
                      </p>
                      <p className="text-sm text-gray-500">
                        Graduated {profile.education.graduationYear}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right Column - Contact Info */}
              <div className="space-y-6">
                {/* Contact Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl border border-gray-200 p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Contact Information
                  </h2>
                  <div className="space-y-4">
                    {profile.email && (
                      <a
                        href={`mailto:${profile.email}`}
                        className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium">{profile.email}</p>
                        </div>
                      </a>
                    )}

                    {profile.phone && (
                      <a
                        href={`tel:${profile.phone}`}
                        className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                          <Phone className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="font-medium">{profile.phone}</p>
                        </div>
                      </a>
                    )}

                    {profile.linkedinUrl && (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                          <Linkedin className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">LinkedIn</p>
                          <p className="font-medium flex items-center gap-1">
                            View Profile <ExternalLink className="w-3 h-3" />
                          </p>
                        </div>
                      </a>
                    )}
                  </div>
                </motion.div>

                {/* Preferences */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl border border-gray-200 p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Job Preferences
                  </h2>
                  <div className="space-y-4">
                    {profile.preferredJobTypes?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Job Types</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.preferredJobTypes.map((type, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.preferredLocations?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">
                          Preferred Locations
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profile.preferredLocations.map((loc, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                            >
                              {loc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Availability</p>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        {profile.availability || "Available"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Resume Viewer Modal */}
        <ResumeViewerModal
          isOpen={showResumeViewer}
          onClose={() => setShowResumeViewer(false)}
          resumeUrl={profile?.resume?.url}
          candidateName={`${profile?.firstName} ${profile?.lastName}`}
        />
      </div>
    );
}

export default JobSeekerProfile
