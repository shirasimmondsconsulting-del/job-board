import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  Briefcase,
  Globe,
  Linkedin,
  Mail,
  Users,
  Calendar,
  Edit3,
  Save,
  X,
  Building2,
} from "lucide-react";
import { useJobs } from "../context/JobsContext";
import { companiesApi } from "../api";

export default function EmployerProfile({
  user,
  editing,
  setEditing,
  form,
  handleChange,
  loading,
  setLoading,
  refreshUser,
}) {
  const { fetchJobsFromAPI } = useJobs();

  const handleSave = async () => {
    setLoading(true);
    try {
      const companyPayload = {
        name: form.companyName || `${user.firstName}'s Company`,
        description: form.companyAbout || undefined,
        website: form.companyWebsite || undefined,
        industry: form.companyIndustry || undefined,
        companySize: form.companySize || undefined,
        socialLinks: {
          linkedin: form.companyLinkedin || undefined,
          twitter: form.companyTwitter || undefined,
        },
      };

      if (user.companyId?._id) {
        await companiesApi.update(user.companyId._id, companyPayload);
      } else {
        await companiesApi.create(companyPayload);
      }

      await refreshUser();
      await fetchJobsFromAPI();
      toast.success("Company profile updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error("Failed to save company profile", err);
      toast.error(err?.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* About Company */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            About Company
          </h2>
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Company Name *
                </label>
                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="Your company name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  About / Description
                </label>
                <textarea
                  name="companyAbout"
                  value={form.companyAbout}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your company, what you do, your culture..."
                />
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {user.companyId?.name || (
                  <span className="text-gray-400 italic font-normal text-base">No company name set</span>
                )}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {user.companyId?.description || (
                  <span className="text-gray-400 italic">
                    No description added yet. Click "Edit Profile" to add one.
                  </span>
                )}
              </p>
            </div>
          )}
        </motion.div>

        {/* Company Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Company Details
          </h2>
          {editing ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Website</label>
                <input
                  name="companyWebsite"
                  value={form.companyWebsite}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yourcompany.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Industry</label>
                <input
                  name="companyIndustry"
                  value={form.companyIndustry}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Technology, Finance"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Company Size</label>
                <select
                  name="companySize"
                  value={form.companySize}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select size</option>
                  <option value="Startup">Startup (1–10)</option>
                  <option value="Small">Small (11–50)</option>
                  <option value="Medium">Medium (51–200)</option>
                  <option value="Large">Large (201–1000)</option>
                  <option value="Enterprise">Enterprise (1000+)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Contact Email</label>
                <div className="w-full px-4 py-2.5 border rounded-xl border-gray-200 bg-gray-50 text-gray-500 text-sm">
                  {user.email}
                  <span className="ml-2 text-xs text-gray-400">(account email)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoItem
                icon={<Globe className="w-4 h-4 text-blue-600" />}
                label="Website"
                value={
                  user.companyId?.website ? (
                    <a
                      href={user.companyId.website.startsWith("http") ? user.companyId.website : `https://${user.companyId.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {user.companyId.website}
                    </a>
                  ) : null
                }
              />
              <InfoItem
                icon={<Briefcase className="w-4 h-4 text-blue-600" />}
                label="Industry"
                value={user.companyId?.industry}
              />
              <InfoItem
                icon={<Users className="w-4 h-4 text-emerald-600" />}
                label="Company Size"
                value={user.companyId?.companySize}
              />
              <InfoItem
                icon={<Mail className="w-4 h-4 text-emerald-600" />}
                label="Contact Email"
                value={user.email}
              />
            </div>
          )}
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Linkedin className="w-5 h-5 text-blue-600" />
            Social Links
          </h2>
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">LinkedIn Page</label>
                <input
                  name="companyLinkedin"
                  value={form.companyLinkedin}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Twitter / X</label>
                <input
                  name="companyTwitter"
                  value={form.companyTwitter}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="https://twitter.com/yourcompany"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {user.companyId?.socialLinks?.linkedin ? (
                <a
                  href={user.companyId.socialLinks.linkedin.startsWith("http") ? user.companyId.socialLinks.linkedin : `https://${user.companyId.socialLinks.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline font-medium"
                >
                  <Linkedin className="w-4 h-4" /> LinkedIn Company Page
                </a>
              ) : (
                <span className="text-gray-400 italic text-sm">No LinkedIn page added</span>
              )}
              {user.companyId?.socialLinks?.twitter && (
                <a
                  href={user.companyId.socialLinks.twitter.startsWith("http") ? user.companyId.socialLinks.twitter : `https://${user.companyId.socialLinks.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sky-500 hover:underline font-medium"
                >
                  Twitter / X
                </a>
              )}
            </div>
          )}
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

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Account Info</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Account Type</span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">Employer</span>
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
            {user.companyId?.name && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Company</span>
                <span className="text-sm font-medium text-gray-700">{user.companyId.name}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <a
              href="/employer/dashboard"
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors text-sm font-medium"
            >
              <Briefcase className="w-4 h-4" />
              Employer Dashboard
            </a>
            <a
              href="/employer/jobs"
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors text-sm font-medium"
            >
              <Calendar className="w-4 h-4" />
              Manage Jobs
            </a>
          </div>
        </motion.div>
      </div>
    </div>
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
