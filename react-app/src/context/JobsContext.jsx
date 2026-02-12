import { createContext, useContext, useState, useEffect } from 'react'
import { jobsApi } from '../api'

const JobsContext = createContext()

export function JobsProvider({ children }) {
  const [jobs, setJobs] = useState([])
  const [savedJobIds, setSavedJobIds] = useState(() => {
    const saved = localStorage.getItem('savedJobs')
    return saved ? JSON.parse(saved) : []
  })
  const [filters, setFilters] = useState({
    timeline: 'all',
    location: '',
    industry: '',
    hebrewLevel: '',
    remote: '',
    search: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch jobs from API on mount
  useEffect(() => {
    fetchJobsFromAPI()
  }, [])

  // Fetch jobs from API
  const fetchJobsFromAPI = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await jobsApi.getAll()
      const jobsData = response.data.data || []
      
      // Map API response to expected format
      const formattedJobs = jobsData.map(job => ({
        id: job._id,
        title: job.title,
        company: job.companyId?.name || 'Unknown Company',
        location: job.location?.city || 'Unknown Location',
        description: job.description,
        salaryRange: job.salary?.minSalary && job.salary?.maxSalary 
          ? `₪${job.salary.minSalary.toLocaleString()} - ₪${job.salary.maxSalary.toLocaleString()}`
          : 'Not specified',
        hebrewLevel: job.languageRequirements?.hebrew || 'None Required',
        englishLevel: job.languageRequirements?.english || 'Fluent',
        workAuth: job.workAuthorization || 'Support Provided',
        timeline: job.startDate || 'now',
        industry: job.category || 'tech',
        type: job.jobType || 'full-time',
        remote: job.location?.isRemote || false,
        applyUrl: job.applyUrl || '#',
        source: 'database',
        postedDate: job.createdAt || new Date().toISOString(),
        experienceLevel: job.experienceLevel,
        requiredSkills: job.requiredSkills || [],
        jobStatus: job.status
      }))
      
      setJobs(formattedJobs)
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
      setError('Failed to load jobs. Please try again later.')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  // Save to localStorage when savedJobIds changes
  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(savedJobIds))
  }, [savedJobIds])

  const toggleSaveJob = (jobId) => {
    setSavedJobIds(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    )
  }

  const isJobSaved = (jobId) => savedJobIds.includes(jobId)

  const getSavedJobs = () => jobs.filter(job => savedJobIds.includes(job.id))

  const getFilteredJobs = () => {
    return jobs.filter(job => {
      if (filters.timeline !== 'all' && job.timeline !== filters.timeline) return false
      if (filters.location && job.location !== filters.location) return false
      if (filters.industry && job.industry !== filters.industry) return false
      if (filters.hebrewLevel && job.hebrewLevel !== filters.hebrewLevel) return false
      if (filters.remote === 'true' && !job.remote) return false
      if (filters.remote === 'false' && job.remote) return false
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        return (
          job.title.toLowerCase().includes(searchLower) ||
          job.company.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower)
        )
      }
      return true
    })
  }

  const clearFilters = () => {
    setFilters({
      timeline: 'all',
      location: '',
      industry: '',
      hebrewLevel: '',
      remote: '',
      search: ''
    })
  }

  const value = {
    jobs,
    savedJobIds,
    filters,
    setFilters,
    toggleSaveJob,
    isJobSaved,
    getSavedJobs,
    getFilteredJobs,
    clearFilters,
    loading,
    error,
    fetchJobsFromAPI
  }

  return (
    <JobsContext.Provider value={value}>
      {children}
    </JobsContext.Provider>
  )
}

export function useJobs() {
  const context = useContext(JobsContext)
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider')
  }
  return context
}
