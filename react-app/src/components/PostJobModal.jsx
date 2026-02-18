import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, MapPin, DollarSign, Calendar, FileText, Link as LinkIcon, Tag } from 'lucide-react';
import { jobsApi } from '../api';

// Backend constants mapping
const JOB_TYPES = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  'contract': 'Contract',
  'temporary': 'Temporary',
  'freelance': 'Freelance',
  'internship': 'Internship'
};

const EXPERIENCE_LEVELS = {
  'entry': 'Entry Level',
  'mid': 'Mid Level',
  'senior': 'Senior',
  'executive': 'Executive'
};

const JOB_CATEGORIES = {
  'IT': 'IT',
  'Finance': 'Finance',
  'Healthcare': 'Healthcare',
  'Sales': 'Sales',
  'Marketing': 'Marketing',
  'Operations': 'Operations',
  'HR': 'HR',
  'Other': 'Other'
};

function PostJobModal({ isOpen, onClose, onJobPosted, editJob = null }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    city: '',
    isRemote: false,
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    category: 'IT',
    salaryMin: '',
    salaryMax: '',
    currency: 'ILS',
    requiredSkills: '',
    optionalSkills: '',
    qualifications: '',
    responsibilities: '',
    benefits: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (editJob) {
      setFormData({
        title: editJob.title || '',
        description: editJob.description || '',
        shortDescription: editJob.shortDescription || '',
        city: editJob.location?.city || '',
        isRemote: editJob.location?.isRemote || false,
        jobType: editJob.jobType || 'Full-time',
        experienceLevel: editJob.experienceLevel || 'Mid Level',
        category: editJob.category || 'IT',
        salaryMin: editJob.salary?.minSalary || '',
        salaryMax: editJob.salary?.maxSalary || '',
        currency: editJob.salary?.currency || 'ILS',
        requiredSkills: editJob.requiredSkills?.join('\n') || '',
        optionalSkills: editJob.optionalSkills?.join('\n') || '',
        qualifications: editJob.qualifications || '',
        responsibilities: editJob.responsibilities || '',
        benefits: editJob.benefits?.join('\n') || '',

      });
    } else {
      // Reset form for new job
      setFormData({
        title: "",
        description: "",
        shortDescription: "",
        city: "Tel Aviv, Israel",
        isRemote: false,
        jobType: "Full-time",
        experienceLevel: "Mid Level",
        category: "IT",
        salaryMin: "",
        salaryMax: "",
        currency: "ILS",
        requiredSkills: "",
        optionalSkills: "",
        qualifications: "",
        responsibilities: "",
        benefits: "",
      });
    }
  }, [editJob, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Convert form data to backend schema
      const jobData = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription || formData.description.substring(0, 200),
        location: {
          city: formData.city,
          isRemote: formData.isRemote
        },
        jobType: formData.jobType,
        experienceLevel: formData.experienceLevel,
        category: formData.category,
        salary: {
          minSalary: formData.salaryMin ? Number(formData.salaryMin) : undefined,
          maxSalary: formData.salaryMax ? Number(formData.salaryMax) : undefined,
          currency: formData.currency,
          isVisible: true
        },
        requiredSkills: formData.requiredSkills.split('\n').filter(s => s.trim()),
        optionalSkills: formData.optionalSkills.split('\n').filter(s => s.trim()),
        qualifications: formData.qualifications,
        responsibilities: formData.responsibilities,
        benefits: formData.benefits.split('\n').filter(b => b.trim()),

      };

      if (editJob) {
        await jobsApi.update(editJob._id, jobData);
      } else {
        await jobsApi.create(jobData);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        shortDescription: '',
        city: '',
        isRemote: false,
        jobType: 'Full-time',
        experienceLevel: 'Mid Level',
        category: 'IT',
        salaryMin: '',
        salaryMax: '',
        currency: 'ILS',
        requiredSkills: '',
        optionalSkills: '',
        qualifications: '',
        responsibilities: '',
        benefits: ''
      });

      if (onJobPosted) onJobPosted();
      onClose();
    } catch (err) {
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map(e => e.message).join('. ');
        setError(`Validation failed: ${errorMessages}`);
      } else {
        setError(err.response?.data?.message || 'Failed to post job. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editJob ? 'Edit Job' : 'Post New Job'}
                </h2>
                <p className="text-sm text-gray-500">
                  {editJob ? 'Update your job listing details' : 'Fill in the details below'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Senior Full Stack Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the role, team, and what makes this opportunity unique (minimum 50 characters)..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows={2}
                  maxLength={200}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief summary for job cards (max 200 characters)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Tel Aviv"
                  />
                </div>



                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isRemote"
                      checked={formData.isRemote}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Remote Position</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type *
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(JOB_TYPES).map(([key, value]) => (
                      <option key={key} value={value}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level *
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(EXPERIENCE_LEVELS).map(([key, value]) => (
                      <option key={key} value={value}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(JOB_CATEGORIES).map(([key, value]) => (
                      <option key={key} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>


            </div>

            {/* Salary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Salary Range
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ILS">ILS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Salary
                  </label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. 80000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Salary
                  </label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. 120000"
                  />
                </div>
              </div>
            </div>

            {/* Skills & Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Skills & Requirements
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Skills (one per line)
                  </label>
                  <textarea
                    name="requiredSkills"
                    value={formData.requiredSkills}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5+ years of React experience&#10;Strong TypeScript skills&#10;Experience with Node.js"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Optional/Nice-to-have Skills (one per line)
                  </label>
                  <textarea
                    name="optionalSkills"
                    value={formData.optionalSkills}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Experience with AWS&#10;GraphQL knowledge&#10;Mobile development experience"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualifications
                </label>
                <textarea
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bachelor's degree in Computer Science or related field..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsibilities
                </label>
                <textarea
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Design and build scalable applications&#10;Collaborate with cross-functional teams&#10;Mentor junior developers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefits (one per line)
                </label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Health insurance&#10;Remote work options&#10;Professional development budget"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : editJob ? 'Update Job' : 'Post Job'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default PostJobModal;
