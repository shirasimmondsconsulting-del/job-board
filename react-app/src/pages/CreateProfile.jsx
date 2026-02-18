import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { usersApi } from "../api";

export default function CreateProfile() {
  const { user, updateProfile, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    bio: user?.bio || "",
    phone: user?.phone || "",
    location: user?.location || "",
    skills: (user?.skills || []).join(", "),
    availability: user?.availability || "now",
    preferredJobTypes: (user?.preferredJobTypes || []).join(", "),
    linkedinUrl: user?.linkedinUrl || "",
    yearsOfExperience: user?.experience?.yearsOfExperience || "",
    currentJobTitle: user?.experience?.currentJobTitle || "",
    previousCompanies: (user?.experience?.previousCompanies || []).join(", "),
  });
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setForm({
        bio: user.bio || "",
        phone: user.phone || "",
        location: user.location || "",
        skills: (user.skills || []).join(", "),
        availability: user.availability || "now",
        preferredJobTypes: (user.preferredJobTypes || []).join(", "),
        linkedinUrl: user.linkedinUrl || "",
        yearsOfExperience: user.experience?.yearsOfExperience || "",
        currentJobTitle: user.experience?.currentJobTitle || "",
        previousCompanies: (user.experience?.previousCompanies || []).join(
          ", ",
        ),
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return toast.error("Please select a resume file first");
    setUploadingResume(true);
    try {
      const fd = new FormData();
      fd.append("resume", resumeFile);
      const res = await usersApi.uploadResume(fd);
      toast.success("Resume uploaded");
      // Refresh auth user so resume shows up in context
      await refreshUser();
      setResumeFile(null);
    } catch (err) {
      console.error("Resume upload failed", err);
      toast.error(err?.response?.data?.message || "Failed to upload resume");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        bio: form.bio || undefined,
        phone: form.phone || undefined,
        location: form.location || undefined,
        skills: form.skills
          ? form.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        availability: form.availability || undefined,
        preferredJobTypes: form.preferredJobTypes
          ? form.preferredJobTypes
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        linkedinUrl: form.linkedinUrl || undefined,
        experience: {
          yearsOfExperience: form.yearsOfExperience
            ? Number(form.yearsOfExperience)
            : undefined,
          currentJobTitle: form.currentJobTitle || undefined,
          previousCompanies: form.previousCompanies
            ? form.previousCompanies
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        },
      };

      await updateProfile(payload);
      toast.success("Profile saved");
      navigate("/jobs");
    } catch (err) {
      console.error("Failed to save profile", err);
      toast.error(err?.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border border-gray-100 shadow-lg">
          <h1 className="text-2xl font-bold mb-4">
            Create / Edit Your Profile
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Fill out the fields below so employers can find you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Bio
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                placeholder="Short summary of your experience and what you're looking for"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Location (city)
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg border-gray-300"
                  placeholder="Tel Aviv, Israel"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Phone (optional)
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg border-gray-300"
                  placeholder="+972..."
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Skills (comma separated)
              </label>
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-gray-300"
                placeholder="React, Node.js, DevOps"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                LinkedIn Profile (optional)
              </label>
              <input
                name="linkedinUrl"
                value={form.linkedinUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-gray-300"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-md font-semibold text-gray-900 mb-3">
                Experience
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={form.yearsOfExperience}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg border-gray-300"
                    placeholder="e.g. 5"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Current Job Title
                  </label>
                  <input
                    name="currentJobTitle"
                    value={form.currentJobTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg border-gray-300"
                    placeholder="e.g. Senior Developer"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Previous Companies (comma separated)
                </label>
                <input
                  name="previousCompanies"
                  value={form.previousCompanies}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg border-gray-300"
                  placeholder="e.g. Google, Microsoft, Apple"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Availability
              </label>
              <select
                name="availability"
                value={form.availability}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-gray-300"
              >
                <option value="now">Here now</option>
                <option value="3-months">Coming in 3 months</option>
                <option value="6-months">Coming in 6 months</option>
                <option value="12-months">Coming in 12 months</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Preferred job types (comma separated)
              </label>
              <input
                name="preferredJobTypes"
                value={form.preferredJobTypes}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-gray-300"
                placeholder="Full-time, Part-time, Contract"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Resume / CV (optional)
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
                <button
                  type="button"
                  onClick={handleResumeUpload}
                  disabled={!resumeFile || uploadingResume}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-sm"
                >
                  {uploadingResume ? "Uploading..." : "Upload Resume"}
                </button>
                <span className="text-sm text-gray-500">
                  {user?.resume?.url ? "Resume on file" : ""}
                </span>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-lg text-white font-semibold ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {loading ? "Saving..." : "Save Profile"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/jobs")}
                className="px-6 py-3 rounded-lg border border-gray-200 bg-white text-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
