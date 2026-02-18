import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { User, Mail, MapPin, Clock, Briefcase, Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usersApi } from "../api";
import EmployerProfile from "./EmployerProfile";
import JobSeekerProfile from "./JobSeekerProfileComponent";

const AVAILABILITY_LABELS = {
  now: "Available Now",
  "3-months": "In 3 Months",
  "6-months": "In 6 Months",
  "12-months": "In 12 Months",
};

export default function MyProfile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showResumeViewer, setShowResumeViewer] = useState(false);

  const [form, setForm] = useState({
    // Job seeker fields
    firstName: "",
    lastName: "",
    bio: "",
    phone: "",
    location: "",
    skills: "",
    availability: "now",
    preferredJobTypes: "",
    linkedinUrl: "",
    yearsOfExperience: "",
    currentJobTitle: "",
    previousCompanies: "",
    // Employer / company fields
    companyName: "",
    companyWebsite: "",
    companyLinkedin: "",
    companyTwitter: "",
    companyAbout: "",
    companySize: "",
    companyIndustry: "",
  });

  // Sync form when user data updates from server
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        phone: user.phone || "",
        location: user.location || "",
        skills: (user.skills || []).join(", "),
        availability: user.availability || "now",
        preferredJobTypes: (user.preferredJobTypes || []).join(", "),
        linkedinUrl: user.linkedinUrl || "",
        yearsOfExperience: user.experience?.yearsOfExperience ?? "",
        currentJobTitle: user.experience?.currentJobTitle || "",
        previousCompanies: (user.experience?.previousCompanies || []).join(
          ", ",
        ),
        // Company fields
        companyName: user.companyId?.name || "",
        companyWebsite: user.companyId?.website || "",
        companyLinkedin: user.companyId?.socialLinks?.linkedin || "",
        companyTwitter: user.companyId?.socialLinks?.twitter || "",
        companyAbout: user.companyId?.description || "",
        companySize: user.companyId?.companySize || "",
        companyIndustry: user.companyId?.industry || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Please log in
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Calculate profile completion based on user type
  const profileCompletion = (() => {
    if (user.userType === "employer") {
      const fields = [
        user.companyId?.name,
        user.companyId?.description,
        user.companyId?.website,
        user.companyId?.industry,
        user.companyId?.companySize,
        user.companyId?.socialLinks?.linkedin,
        user.email,
      ];
      const filled = fields.filter(Boolean).length;
      return Math.round((filled / fields.length) * 100);
    } else {
      const fields = [
        user.bio,
        user.phone,
        user.location,
        user.skills?.length > 0,
        user.resume?.url,
        user.linkedinUrl,
        user.availability,
      ];
      const filled = fields.filter(Boolean).length;
      return Math.round((filled / fields.length) * 100);
    }
  })();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Gradient Header */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-12">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar / Company Logo */}
            <div className="relative group flex-shrink-0">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-3xl font-bold overflow-hidden border-2 border-white/30">
                {user.userType === "employer" ? (
                  user.companyId?.logo?.url ? (
                    <img
                      src={user.companyId.logo.url}
                      alt="Company Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">
                      {(user.companyId?.name ||
                        user.firstName ||
                        "E")[0].toUpperCase()}
                    </span>
                  )
                ) : user.profileImage?.url ? (
                  <img
                    src={user.profileImage.url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {(user.firstName?.[0] || "").toUpperCase()}
                    {(user.lastName?.[0] || "").toUpperCase()}
                  </span>
                )}
              </div>
              {/* Profile image change overlay for job seekers */}
              {user.userType !== "employer" && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setUploadingImage(true);
                      const fd = new FormData();
                      fd.append("profileImage", file);
                      usersApi
                        .uploadProfileImage(fd)
                        .then(() => {
                          toast.success("Profile image updated!");
                          refreshUser();
                        })
                        .catch(() => toast.error("Failed to upload image"))
                        .finally(() => setUploadingImage(false));
                    }}
                  />
                </label>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Name & Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1 truncate">
                {user.userType === "employer"
                  ? user.companyId?.name || "Company Profile"
                  : `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                    "My Profile"}
              </h1>
              <p className="text-blue-100 text-lg mb-3">
                {user.userType === "employer"
                  ? user.companyId?.industry || "Employer Account"
                  : user.experience?.currentJobTitle || "Job Seeker"}
              </p>
              <div className="flex flex-wrap gap-4 text-blue-100/90 text-sm">
                {user.userType === "employer" ? (
                  <>
                    {user.companyId?.industry && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        {user.companyId.industry}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </span>
                  </>
                ) : (
                  <>
                    {user.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {user.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </span>
                    {user.availability && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {AVAILABILITY_LABELS[user.availability] ||
                          user.availability}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Completion Bar */}
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">
                Profile Completion
              </span>
              <span className="text-sm font-bold text-white">
                {profileCompletion}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-emerald-400 h-2 rounded-full transition-all duration-700"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            {profileCompletion < 100 && (
              <p className="text-xs text-blue-100 mt-2">
                {user.userType === "employer"
                  ? "Complete your company profile to attract top talent"
                  : "Complete your profile to increase visibility to employers"}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content - delegated to role-specific components */}
      <section className="py-8">
        <div className="container-custom">
          {user.userType === "employer" ? (
            <EmployerProfile
              user={user}
              editing={editing}
              setEditing={setEditing}
              form={form}
              handleChange={handleChange}
              loading={loading}
              setLoading={setLoading}
              refreshUser={refreshUser}
            />
          ) : (
            <JobSeekerProfile
              user={user}
              editing={editing}
              setEditing={setEditing}
              form={form}
              handleChange={handleChange}
              loading={loading}
              setLoading={setLoading}
              refreshUser={refreshUser}
              showResumeViewer={showResumeViewer}
              setShowResumeViewer={setShowResumeViewer}
              resumeFile={resumeFile}
              setResumeFile={setResumeFile}
              uploadingResume={uploadingResume}
              setUploadingResume={setUploadingResume}
            />
          )}
        </div>
      </section>
    </div>
  );
}

