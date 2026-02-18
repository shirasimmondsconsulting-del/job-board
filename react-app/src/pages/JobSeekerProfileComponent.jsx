import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Award,
  FileText,
  CheckCircle,
  Eye,
  Upload,
  Edit3,
  Save,
  X,
  Linkedin,
  Star,
} from "lucide-react";
import { usersApi } from "../api";
import ResumeViewerModal from "../components/ResumeViewerModal";

const AVAILABILITY_LABELS = {
  now: "Available Now",
  "3-months": "In 3 Months",
  "6-months": "In 6 Months",
  "12-months": "In 12 Months",
};

export default function JobSeekerProfile({
  user,
  editing,
  setEditing,
  form,
  handleChange,
  loading,
  setLoading,
  refreshUser,
  showResumeViewer,
  setShowResumeViewer,
  resumeFile,
  setResumeFile,
  uploadingResume,
  setUploadingResume,
}) {
  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        bio: form.bio || undefined,
        phone: form.phone || undefined,
        location: form.location || undefined,
        linkedinUrl: form.linkedinUrl || undefined,
        availability: form.availability || undefined,
        skills: form.skills
          ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        preferredJobTypes: form.preferredJobTypes
          ? form.preferredJobTypes.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        experience: {
          yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
          currentJobTitle: form.currentJobTitle || undefined,
          previousCompanies: form.previousCompanies
            ? form.previousCompanies.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        },
      };

      await usersApi.updateProfile(payload);
      await refreshUser();
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error("Failed to save profile", err);
      toast.error(err?.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return toast.error("Please select a resume file first");
    setUploadingResume(true);
    try {
      const fd = new FormData();
      fd.append("resume", resumeFile);
      await usersApi.uploadResume(fd);
      toast.success("Resume uploaded successfully!");
      await refreshUser();
      setResumeFile(null);
    } catch (err) {
      console.error("Resume upload failed", err);
      toast.error(err?.response?.data?.message || "Failed to upload resume");
    } finally {
      setUploadingResume(false);
    }
  };

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* About / Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              About Me
            </h2>
            {editing ? (
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write a brief summary about yourself, your experience, and what you're looking for..."
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">
                {user.bio || (
                  <span className="text-gray-400 italic">
                    No bio added yet. Click "Edit Profile" to add one.
                  </span>
                )}
              </p>
            )}
          </motion.div>

          {/* Personal Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Personal Information
            </h2>
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">First Name</label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name</label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Tel Aviv, Israel"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                      placeholder="+972..."
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">LinkedIn Profile</label>
                  <input
                    name="linkedinUrl"
                    value={form.linkedinUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <InfoItem
                  icon={<User className="w-4 h-4 text-blue-600" />}
                  label="Full Name"
                  value={`${user.firstName || ""} ${user.lastName || ""}`.trim()}
                />
                <InfoItem
                  icon={<Mail className="w-4 h-4 text-blue-600" />}
                  label="Email"
                  value={user.email}
                />
                <InfoItem
                  icon={<MapPin className="w-4 h-4 text-emerald-600" />}
                  label="Location"
                  value={user.location}
                />
                <InfoItem
                  icon={<Phone className="w-4 h-4 text-emerald-600" />}
                  label="Phone"
                  value={user.phone}
                />
                <InfoItem
                  icon={<Linkedin className="w-4 h-4 text-indigo-600" />}
                  label="LinkedIn"
                  value={
                    user.linkedinUrl ? (
                      <a
                        href={user.linkedinUrl.startsWith("http") ? user.linkedinUrl : `https://${user.linkedinUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate block"
                      >
                        {user.linkedinUrl}
                      </a>
                    ) : null
                  }
                />
                <InfoItem
                  icon={<Calendar className="w-4 h-4 text-gray-500" />}
                  label="Member Since"
                  value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}
                />
              </div>
            )}
          </motion.div>

          {/* Skills */}
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
            {editing ? (
              <div>
                <input
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="React, Node.js, Python (comma separated)"
                />
                <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.skills?.length > 0 ? (
                  user.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic text-sm">No skills added yet</span>
                )}
              </div>
            )}
          </motion.div>

          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Experience
            </h2>
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Years of Experience</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={form.yearsOfExperience}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 5"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Current Job Title</label>
                    <input
                      name="currentJobTitle"
                      value={form.currentJobTitle}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Senior Developer"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Previous Companies (comma separated)</label>
                  <input
                    name="previousCompanies"
                    value={form.previousCompanies}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Google, Microsoft"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {user.experience?.yearsOfExperience != null ? (
                  <div>
                    <span className="text-sm text-gray-500">Years of Experience</span>
                    <p className="font-semibold text-gray-900">{user.experience.yearsOfExperience} years</p>
                  </div>
                ) : null}
                {user.experience?.currentJobTitle ? (
                  <div>
                    <span className="text-sm text-gray-500">Current / Most Recent Role</span>
                    <p className="font-semibold text-gray-900">{user.experience.currentJobTitle}</p>
                  </div>
                ) : null}
                {user.experience?.previousCompanies?.length > 0 ? (
                  <div>
                    <span className="text-sm text-gray-500">Previous Companies</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {user.experience.previousCompanies.map((company, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {!user.experience?.yearsOfExperience &&
                  !user.experience?.currentJobTitle &&
                  !user.experience?.previousCompanies?.length && (
                    <span className="text-gray-400 italic text-sm">No experience information added yet</span>
                  )}
              </div>
            )}
          </motion.div>

          {/* Resume */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Resume / CV
            </h2>

            {user.resume?.url ? (
              <div className="flex items-center justify-between gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Resume Uploaded</p>
                    <p className="text-xs text-gray-500">
                      {user.resume.uploadedAt
                        ? `Uploaded on ${new Date(user.resume.uploadedAt).toLocaleDateString()}`
                        : "On file"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResumeViewer(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <a
                    href={user.resume.url}
                    download
                    className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 text-sm font-medium"
                  >
                    Download
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 mb-4">
                <p className="text-sm text-amber-800">
                  No resume uploaded yet. Upload your CV to increase your chances.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                type="button"
                onClick={handleResumeUpload}
                disabled={!resumeFile || uploadingResume}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploadingResume ? "Uploading..." : user.resume?.url ? "Replace Resume" : "Upload Resume"}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Edit / Save Buttons */}
          <div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-lg border border-gray-200"
              >
                <Edit3 className="w-5 h-5" />
                Edit Profile
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Availability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Availability</h2>
            {editing ? (
              <select
                name="availability"
                value={form.availability}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="now">Available Now</option>
                <option value="3-months">In 3 Months</option>
                <option value="6-months">In 6 Months</option>
                <option value="12-months">In 12 Months</option>
              </select>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                {AVAILABILITY_LABELS[user.availability] || "Not set"}
              </span>
            )}
          </motion.div>

          {/* Preferred Job Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Preferred Job Types
            </h2>
            {editing ? (
              <div>
                <input
                  name="preferredJobTypes"
                  value={form.preferredJobTypes}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="Full-time, Remote, Part-time"
                />
                <p className="text-xs text-gray-500 mt-1">Comma separated</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.preferredJobTypes?.length > 0 ? (
                  user.preferredJobTypes.map((type, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      {type}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic text-sm">Not specified</span>
                )}
              </div>
            )}
          </motion.div>

          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Account</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Account Type</span>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                  Job Seeker
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Email Verified</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${user.isEmailVerified ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                  {user.isEmailVerified ? "Verified" : "Not Verified"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Member Since</span>
                <span className="text-sm font-medium text-gray-700">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Resume</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${user.resume?.url ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {user.resume?.url ? "Uploaded" : "Not Uploaded"}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Resume Viewer Modal */}
      <ResumeViewerModal
        isOpen={showResumeViewer}
        onClose={() => setShowResumeViewer(false)}
        resumeUrl={user?.resume?.url}
        candidateName={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
      />
    </>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <div className="font-medium text-gray-900 text-sm">
          {value || <span className="text-gray-400 italic font-normal">Not added</span>}
        </div>
      </div>
    </div>
  );
}
