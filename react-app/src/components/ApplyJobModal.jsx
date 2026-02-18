import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader, CheckCircle } from 'lucide-react'
import { applicationsApi } from '../api'
import { useAuth } from '../context/AuthContext'

function ApplyJobModal({ isOpen, onClose, job, onSuccess }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    coverLetter: '',
    expectedSalary: '',
    linkedinUrl: '',
    resumeUrl: user?.resume || null
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Prefill from logged-in user's profile when modal opens
    if (isOpen && user) {
      setFormData(prev => ({
        ...prev,
        linkedinUrl: user.linkedinUrl || prev.linkedinUrl,
        resumeUrl: user.resume || prev.resumeUrl
      }))
    }
  }, [isOpen, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // NOTE: Here is where you would upload the resumeFile to Cloudinary
      // and get the secure_url and public_id to send to the backend.
      // const uploadRes = await uploadToCloudinary(formData.resumeFile);
      // const resumeUrl = { url: uploadRes.secure_url, publicId: uploadRes.public_id };

      const response = await applicationsApi.submit({
        jobId: job._id || job.id,
        ...formData,
        // if resumeUrl is an object returned from user profile, send that
        resumeUrl: formData.resumeUrl || undefined,
      });

      setSuccess(true)
      setTimeout(() => {
        if (onSuccess) onSuccess()
        onClose()
        setSuccess(false)
        setFormData({
          coverLetter: '',
          expectedSalary: '',
          linkedinUrl: ''
        })
      }, 2000)
    } catch (err) {
      const backendError = err.response?.data;
      const statusCode = err.response?.status;
      if (
        statusCode === 409 ||
        backendError?.message?.includes("already applied") ||
        backendError?.message?.includes("duplicate")
      ) {
        setError(
          "You have already applied for this job. You can only apply once per position.",
        );
      } else if (backendError?.errors && Array.isArray(backendError.errors)) {
        setError(backendError.errors.map((e) => e.message).join(". "));
      } else {
        setError(backendError?.message || "Failed to submit application");
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Apply for Position</h2>
              <p className="text-sm text-gray-600 mt-1">{job?.title} at {job?.company}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Success State */}
          {success ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
              <p className="text-gray-600">Your application has been sent to the employer.</p>
            </div>
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Tell us why you're a great fit for this position..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume / CV
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      name="resume"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          setFormData(prev => ({ ...prev, resumeFile: file }))
                        }
                      }}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="flex items-center justify-center gap-3 w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                    >
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div className="text-center">
                        {formData.resumeFile ? (
                          <span className="text-sm font-medium text-blue-600">{formData.resumeFile.name}</span>
                        ) : (
                          <>
                            <span className="text-sm font-medium text-gray-700">Click to upload resume</span>
                            <span className="text-xs text-gray-500 block mt-0.5">PDF, DOC, DOCX (max 5MB)</span>
                          </>
                        )}
                      </div>
                    </label>
                    {formData.resumeFile && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, resumeFile: null }))}
                        className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Upload your resume to give employers a complete picture of your qualifications
                  </p>
                </div>

                {/* Expected Salary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Salary (Annual in ILS)
                  </label>
                  <input
                    type="number"
                    name="expectedSalary"
                    value={formData.expectedSalary}
                    onChange={handleChange}
                    placeholder="e.g., 60000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>



                {/* LinkedIn URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="text"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.coverLetter}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-colors inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ApplyJobModal
