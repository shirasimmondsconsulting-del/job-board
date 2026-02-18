const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const { JOB_STATUS, PAGINATION } = require('../config/constants');

class JobService {
  // Create new job
  static async createJob(jobData, postedBy) {
    const job = new Job({
      ...jobData,
      postedBy
    });

    await job.save();

    // Update company job count
    if (job.companyId) {
      await Company.findByIdAndUpdate(job.companyId, {
        $inc: { activeJobsCount: 1 }
      });
    }

    return job.populate('companyId', 'name logo slug');
  }

  // Get jobs with filters and pagination
  static async getJobs(filters = {}, page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, userId = null) {
    const query = { status: JOB_STATUS.PUBLISHED };

    // Apply filters
    if (filters.category) query.category = filters.category;
    if (filters.jobType) query.jobType = filters.jobType;
    if (filters.experienceLevel) query.experienceLevel = filters.experienceLevel;
    if (filters.location) query['location.city'] = new RegExp(filters.location, 'i');
    if (filters.isRemote !== undefined) query['location.isRemote'] = filters.isRemote;
    if (filters.companyId) query.companyId = filters.companyId;
    if (filters.search) {
      query.$or = [
        { title: new RegExp(filters.search, 'i') },
        { description: new RegExp(filters.search, 'i') },
        { requiredSkills: new RegExp(filters.search, 'i') }
      ];
    }

    // Salary range filter
    if (filters.minSalary || filters.maxSalary) {
      query['salary.minSalary'] = {};
      if (filters.minSalary) query['salary.minSalary'].$gte = parseInt(filters.minSalary);
      if (filters.maxSalary) query['salary.minSalary'].$lte = parseInt(filters.maxSalary);
    }

    // Date posted filter
    if (filters.datePosted) {
      const dateFilter = new Date();
      switch (filters.datePosted) {
        case 'today':
          dateFilter.setDate(dateFilter.getDate() - 1);
          break;
        case 'week':
          dateFilter.setDate(dateFilter.getDate() - 7);
          break;
        case 'month':
          dateFilter.setMonth(dateFilter.getMonth() - 1);
          break;
      }
      query.createdAt = { $gte: dateFilter };
    }

    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), PAGINATION.MAX_LIMIT),
      sort: filters.sort || { createdAt: -1 },
      populate: [
        { path: 'companyId', select: 'name logo slug industry website description companySize' },
        { path: 'postedBy', select: 'firstName lastName companyId', populate: { path: 'companyId', select: 'name logo slug industry' } }
      ]
    };

    const result = await Job.paginate(query, options);
    let jobs = result.docs.map(doc => doc.toObject());

    // If userId provided, check which jobs have been applied for or saved
    if (userId) {
      const jobIds = jobs.map(j => j._id);

      const applications = await Application.find({
        jobId: { $in: jobIds },
        userId: userId
      }).select('jobId');
      const appliedJobIds = new Set(applications.map(app => app.jobId.toString()));

      const savedJobs = await SavedJob.find({
        jobId: { $in: jobIds },
        userId: userId
      }).select('jobId');
      const savedJobIds = new Set(savedJobs.map(s => s.jobId.toString()));

      jobs = jobs.map(job => ({
        ...job,
        hasApplied: appliedJobIds.has(job._id.toString()),
        hasSaved: savedJobIds.has(job._id.toString())
      }));
    }

    return {
      jobs,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.totalDocs,
        pages: result.totalPages,
        hasNext: result.hasNextPage,
        hasPrev: result.hasPrevPage
      }
    };
  }

  // Get job by ID
  static async getJobById(jobId, userId = null) {
    const job = await Job.findById(jobId)
      .populate('companyId', 'name logo banner description website industry companySize foundedYear socialLinks')
      .populate({ path: 'postedBy', select: 'firstName lastName profileImage companyId', populate: { path: 'companyId', select: 'name logo slug industry description website companySize foundedYear socialLinks' } });

    if (!job) {
      throw new Error('Job not found');
    }

    // Increment view count (but not for the poster)
    if (userId && job.postedBy && job.postedBy._id.toString() !== userId.toString()) {
      await job.incrementViews();
    }

    // Check if user has applied or saved this job
    let hasApplied = false;
    let hasSaved = false;

    if (userId) {
      hasApplied = await Application.findOne({ jobId, userId }).then(app => !!app);
      hasSaved = await SavedJob.findOne({ jobId, userId }).then(saved => !!saved);
    }

    return {
      ...job.toObject(),
      hasApplied,
      hasSaved
    };
  }

  // Update job
  static async updateJob(jobId, updateData, userId) {
    const job = await Job.findById(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    // Check if user owns this job
    if (job.postedBy.toString() !== userId.toString()) {
      throw new Error('Not authorized to update this job');
    }

    Object.assign(job, updateData);
    await job.save();

    return job.populate('companyId', 'name logo slug');
  }

  // Delete job
  static async deleteJob(jobId, userId) {
    const job = await Job.findById(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    // Check if user owns this job
    if (job.postedBy.toString() !== userId.toString()) {
      throw new Error('Not authorized to delete this job');
    }

    // Update company job count
    if (job.companyId) {
      await Company.findByIdAndUpdate(job.companyId, {
        $inc: { activeJobsCount: -1 }
      });
    }

    await job.deleteOne();
    return { message: 'Job deleted successfully' };
  }

  // Get trending jobs
  static async getTrendingJobs(limit = 10) {
    const jobs = await Job.find({ status: JOB_STATUS.PUBLISHED })
      .sort({ views: -1, createdAt: -1 })
      .limit(limit)
      .populate('companyId', 'name logo slug industry')
      .populate({ path: 'postedBy', select: 'firstName lastName companyId', populate: { path: 'companyId', select: 'name logo slug industry' } });

    return jobs;
  }

  // Search jobs
  static async searchJobs(query, filters = {}, page = 1, limit = 20) {
    const searchQuery = {
      status: JOB_STATUS.PUBLISHED,
      $text: { $search: query }
    };

    // Apply additional filters
    if (filters.category) searchQuery.category = filters.category;
    if (filters.location) searchQuery['location.city'] = new RegExp(filters.location, 'i');

    const jobs = await Job.find(searchQuery, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('companyId', 'name logo slug industry')
      .populate({ path: 'postedBy', select: 'firstName lastName companyId', populate: { path: 'companyId', select: 'name logo slug industry' } });

    const total = await Job.countDocuments(searchQuery);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get jobs by company
  static async getJobsByCompany(companyId, page = 1, limit = 10) {
    const result = await Job.paginate(
      { companyId, status: JOB_STATUS.PUBLISHED },
      {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: 'companyId'
      }
    );

    return {
      jobs: result.docs,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.totalDocs,
        pages: result.totalPages
      }
    };
  }

  // Close job
  static async closeJob(jobId, userId) {
    const job = await Job.findById(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.postedBy.toString() !== userId.toString()) {
      throw new Error('Not authorized to close this job');
    }

    job.status = JOB_STATUS.CLOSED;
    job.closedAt = new Date();
    await job.save();

    // Update company job count
    if (job.companyId) {
      await Company.findByIdAndUpdate(job.companyId, {
        $inc: { activeJobsCount: -1 }
      });
    }

    return job;
  }
}

module.exports = JobService;