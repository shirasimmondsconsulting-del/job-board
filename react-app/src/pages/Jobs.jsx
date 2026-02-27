import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  X,
  RefreshCcw,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  ChevronDown,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useJobs } from "../context/JobsContext";
import { useAuth } from "../context/AuthContext";
import JobCard from "../components/JobCard";
import PostJobModal from "../components/PostJobModal";

const JOBS_PER_PAGE = 30;

function Jobs() {
  const { filters, setFilters, getFilteredJobs, clearFilters, fetchJobs } =
    useJobs();
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredJobs = getFilteredJobs();

  console.log("📄 Jobs Page:", {
    allJobs: filteredJobs.length,
    currentPage,
    jobsPerPage: JOBS_PER_PAGE,
  });

  // Paginate jobs
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * JOBS_PER_PAGE;
    const endIdx = startIdx + JOBS_PER_PAGE;
    const paged = filteredJobs.slice(startIdx, endIdx);
    const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
    return { paged, totalPages, totalJobs: filteredJobs.length };
  }, [filteredJobs, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (key, value) => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const timelineOptions = [
    { value: "now", label: "Here Now", emoji: "✅" },
    { value: "3-months", label: "3 Months", emoji: "🗓️" },
    { value: "6-months", label: "6 Months", emoji: "📆" },
    { value: "12-months", label: "12 Months", emoji: "🎯" },
  ];

  const locations = [
    "Tel Aviv",
    "Jerusalem",
    "Haifa",
    "Sharon",
    "Shomron",
    "Gush Etzion",
    "North",
    "South",
    "Petah Tikva",
  ];

  const industries = [
    { value: "tech", label: "Technology" },
    { value: "finance", label: "Finance" },
    { value: "marketing", label: "Marketing" },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" },
  ];

  const hebrewLevels = ["None Required", "Basic", "Conversational", "Fluent"];

  const activeFilterCount = [
    filters.location,
    filters.industry,
    filters.hebrewLevel,
    filters.remote,
    filters.search,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 py-16 lg:py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2230%22 height=%2230%22 viewBox=%220 0 30 30%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M15 0v30M0 15h30%22 fill=%22none%22 stroke=%22%23fff%22 stroke-opacity=%220.03%22/%3E%3C/svg%3E')]"></div>

        <div className="container-custom relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6"
            >
              <Briefcase className="w-4 h-4 text-primary-200" />
              <span className="text-sm font-medium text-white">
                {paginatedData.totalJobs} opportunities available
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-bold text-white mb-4"
            >
              Find your perfect role in Israel
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-primary-100 text-lg max-w-xl mx-auto"
            >
              Every position listed here welcomes Olim. Filter by your timeline
              and find your next opportunity.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 lg:py-12">
        <div className="container-custom">
          {/* Search & Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100 p-6 mb-8 -mt-12 lg:-mt-16 relative z-10"
          >
            {/* Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-gray-900 placeholder:text-gray-400 text-sm sm:text-base"
                />
              </div>

              {/* Post Job Button (Hidden for job seekers) */}
              {(!user || user.userType === "employer") && (
                <button
                  onClick={() => {
                    if (!user || user.userType !== "employer") {
                      window.location.href =
                        "/login?next=/jobs&msg=employer_required";
                    } else {
                      setShowPostJobModal(true);
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  Post Job
                </button>
              )}
            </div>

            {/* Timeline Tabs */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-700 mb-3 block">
                When are you arriving in Israel?
              </label>
              <div className="flex flex-wrap gap-2">
                {timelineOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange("timeline", option.value)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      filters.timeline === option.value
                        ? "bg-primary-600 text-white shadow-md shadow-primary-500/25"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <span>{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle More Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 text-primary-700 font-semibold text-sm hover:text-primary-800 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showFilters ? "Hide Advanced Filters" : "Advanced Filters"}
              {activeFilterCount > 0 && !showFilters && (
                <span className="ml-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>

            {/* Extended Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          value={filters.location}
                          onChange={(e) =>
                            handleFilterChange("location", e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-gray-900 text-sm appearance-none bg-white"
                        >
                          <option value="">All Locations</option>
                          {locations.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Industry
                      </label>
                      <select
                        value={filters.industry}
                        onChange={(e) =>
                          handleFilterChange("industry", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-gray-900 text-sm appearance-none bg-white"
                      >
                        <option value="">All Industries</option>
                        {industries.map((ind) => (
                          <option key={ind.value} value={ind.value}>
                            {ind.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Hebrew Level
                      </label>
                      <select
                        value={filters.hebrewLevel}
                        onChange={(e) =>
                          handleFilterChange("hebrewLevel", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-gray-900 text-sm appearance-none bg-white"
                      >
                        <option value="">Any Level</option>
                        {hebrewLevels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Remote Work
                      </label>
                      <select
                        value={filters.remote}
                        onChange={(e) =>
                          handleFilterChange("remote", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-gray-900 text-sm appearance-none bg-white"
                      >
                        <option value="">All Options</option>
                        <option value="true">Remote OK</option>
                        <option value="false">On-site Only</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Filters & Clear */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                <span className="text-sm text-gray-500 font-medium">
                  Active:
                </span>
                <div className="flex flex-wrap gap-2">
                  {filters.search && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-semibold border border-primary-100">
                      "{filters.search}"
                      <button
                        onClick={() => handleFilterChange("search", "")}
                        className="hover:text-primary-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.location && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-semibold border border-primary-100">
                      <MapPin className="w-3 h-3" />
                      {filters.location}
                      <button
                        onClick={() => handleFilterChange("location", "")}
                        className="hover:text-primary-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.industry && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-semibold border border-primary-100">
                      {filters.industry}
                      <button
                        onClick={() => handleFilterChange("industry", "")}
                        className="hover:text-primary-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.hebrewLevel && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-semibold border border-primary-100">
                      Hebrew: {filters.hebrewLevel}
                      <button
                        onClick={() => handleFilterChange("hebrewLevel", "")}
                        className="hover:text-primary-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.remote && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-semibold border border-primary-100">
                      {filters.remote === "true" ? "Remote OK" : "On-site"}
                      <button
                        onClick={() => handleFilterChange("remote", "")}
                        className="hover:text-primary-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
                <button
                  onClick={clearFilters}
                  className="ml-auto text-sm text-gray-500 hover:text-red-600 flex items-center gap-1.5 font-medium transition-colors"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Clear All
                </button>
              </div>
            )}
          </motion.div>

          {/* Results Count & Pagination Info */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing{" "}
              <span className="font-bold text-gray-900">
                {Math.min(currentPage * JOBS_PER_PAGE, paginatedData.totalJobs)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-900">
                {paginatedData.totalJobs}
              </span>{" "}
              {paginatedData.totalJobs === 1 ? "job" : "jobs"}
            </p>
            <div className="text-sm text-gray-500">
              Sorted by:{" "}
              <span className="font-medium text-gray-700">Most Recent</span>
            </div>
          </div>

          {/* Jobs Grid */}
          {paginatedData.totalJobs > 0 ? (
            <>
              <div className="grid gap-4 mb-8">
                {paginatedData.paged.map((job, index) => (
                  <JobCard key={job.id} job={job} index={index} />
                ))}
              </div>

              {/* Pagination Controls */}
              {paginatedData.totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 mb-8"
                >
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    {Array.from(
                      { length: paginatedData.totalPages },
                      (_, i) => i + 1,
                    )
                      .slice(
                        Math.max(0, currentPage - 2),
                        Math.min(paginatedData.totalPages, currentPage + 3),
                      )
                      .map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg font-medium transition-all ${
                            currentPage === pageNum
                              ? "bg-primary-600 text-white shadow-md"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(paginatedData.totalPages, p + 1),
                      )
                    }
                    disabled={currentPage === paginatedData.totalPages}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white rounded-2xl border border-gray-100"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No jobs found
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Try adjusting your filters or search terms to see more results
              </p>
              <button onClick={clearFilters} className="btn btn-primary">
                <RefreshCcw className="w-4 h-4" />
                Reset All Filters
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Post Job Modal */}
      <PostJobModal
        isOpen={showPostJobModal}
        onClose={() => setShowPostJobModal(false)}
        onJobPosted={() => {
          fetchJobs();
          setShowPostJobModal(false);
        }}
      />
    </div>
  );
}

export default Jobs;
