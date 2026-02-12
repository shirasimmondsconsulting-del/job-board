import React, { createContext, useContext, useState, useCallback } from 'react';
import { jobsApi, companiesApi, applicationsApi, savedJobsApi, reviewsApi, notificationsApi } from '../api';

const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Jobs
  const fetchJobs = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobsApi.getAll(filters);
      setJobs(response.data.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch jobs';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJobById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobsApi.getOne(id);
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch job';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchJobs = useCallback(async (query) => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobsApi.search(query);
      setJobs(response.data.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Search failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = useCallback(async (jobData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobsApi.create(jobData);
      setJobs([...jobs, response.data.data.job]);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create job';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [jobs]);

  // Companies
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await companiesApi.getAll();
      setCompanies(response.data.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch companies';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompanyById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await companiesApi.getOne(id);
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch company';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Applications
  const fetchApplications = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await applicationsApi.getAll(filters);
      setApplications(response.data.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch applications';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitApplication = useCallback(async (applicationData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await applicationsApi.submit(applicationData);
      setApplications([...applications, response.data.data.application]);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to submit application';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [applications]);

  // Saved Jobs
  const fetchSavedJobs = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await savedJobsApi.getAll(filters);
      setSavedJobs(response.data.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch saved jobs';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveJob = useCallback(async (jobId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await savedJobsApi.save(jobId);
      setSavedJobs([...savedJobs, response.data.data.savedJob]);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save job';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [savedJobs]);

  // Notifications
  const fetchNotifications = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationsApi.getAll(filters);
      setNotifications(response.data.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch notifications';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <JobContext.Provider
      value={{
        jobs,
        companies,
        applications,
        savedJobs,
        reviews,
        notifications,
        loading,
        error,
        fetchJobs,
        fetchJobById,
        searchJobs,
        createJob,
        fetchCompanies,
        fetchCompanyById,
        fetchApplications,
        submitApplication,
        fetchSavedJobs,
        saveJob,
        fetchNotifications
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within JobProvider');
  }
  return context;
};