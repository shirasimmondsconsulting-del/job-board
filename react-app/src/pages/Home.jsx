import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Briefcase, Users, Building2, MapPin, Clock, CheckCircle2, Star, Zap, Globe, Shield } from 'lucide-react'
import { useJobs } from '../context/JobsContext'
import { useAuth } from '../context/AuthContext'
import heroImage from '../assets/hero.png'

function Home() {
  const { jobs = [] } = useJobs()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()


  const features = [
    {
      icon: Shield,
      title: 'Vetted Opportunities',
      description: 'Every job is carefully reviewed to ensure companies genuinely welcome and support Olim.'
    },
    {
      icon: Globe,
      title: 'English-Friendly',
      description: 'Find positions where English is the primary working language — no Hebrew barrier.'
    },
    {
      icon: Clock,
      title: 'Timeline Matching',
      description: 'Filter jobs by your Aliyah timeline — whether you\'re here now or planning ahead.'
    },
    {
      icon: Zap,
      title: 'Direct Access',
      description: 'Connect directly with hiring managers who understand your unique journey.'
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-6"
              >
                <Star className="w-4 h-4 text-blue-600 fill-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Built by Olim, for Olim</span>
              </motion.div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Find your dream job in Israel and{' '}
                <span className="text-blue-600">come home</span>
              </h1>

              <p className="text-lg text-gray-600 max-w-lg mb-10">
                The #1 job platform connecting talented professionals making Aliyah
                with Israeli companies ready to hire.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-12">
                <Link to="/jobs" className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold group">
                  Explore Jobs
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/companies" className="inline-flex items-center gap-2 px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold">
                  <Building2 className="w-5 h-5" />
                  For Employers
                </Link>
              </div>


            </motion.div>

            {/* Right Content - Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative order-2 lg:order-none"
            >
              <div className="relative">
                {/* Main Hero Image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 group">
                  <img
                    src={heroImage}
                    alt="Man with Israeli flag"
                    className="w-full h-[300px] lg:h-[400px] object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 lg:p-8">
                    <div>
                      <h3 className="text-xl lg:text-2xl font-bold text-white mb-1 lg:mb-2">Welcome Home</h3>
                      <p className="text-blue-100 text-sm lg:text-base italic">Your journey starts here...</p>
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl shadow-gray-200/50 flex items-center gap-3 border border-gray-100"
                >
                  <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Job Accepted!</p>
                    <p className="text-xs text-gray-500">Tel Aviv • Just now</p>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute top-8 -right-4 bg-white rounded-2xl p-4 shadow-xl shadow-gray-200/50 flex items-center gap-3 border border-gray-100"
                >
                  <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">New: DevOps Lead</p>
                    <p className="text-xs text-gray-500">Jerusalem • Remote OK</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-4 text-sm font-semibold text-blue-700">
              ✨ Why Choose Us
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Built for your Aliyah journey
            </h2>
            <p className="text-lg text-gray-600">
              We understand the unique challenges of finding work as a new Oleh.
              That's why we built a platform specifically for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group p-6 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-100/20 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Job Seeker CTA Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to start your career in Israel?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Create your profile and let Israeli companies discover you.
              Get matched with opportunities that fit your skills and timeline.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => {
                    if (!isAuthenticated) return navigate('/register')
                    if (user?.userType === 'job_seeker') return navigate('/create-profile')
                    // Employers -> take them to employer area
                    return navigate('/employer/dashboard')
                  }}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-700 rounded-lg hover:bg-gray-50 shadow-lg font-semibold"
                >
                  <Users className="w-5 h-5" />
                  Create Profile
                </button>

                <Link to="/jobs" className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 font-semibold backdrop-blur-sm">
                  Browse Jobs
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
          </div>
        </div>
      </section>

      {/* Recent Jobs Preview */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-3 text-sm font-semibold text-blue-700">
                ⚡ Fresh Opportunities
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Latest job openings</h2>
            </div>
            <Link to="/jobs" className="inline-flex items-center gap-2 px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold">
              View All Jobs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(jobs && jobs.length > 0 ? jobs.slice(0, 6) : []).map((job, index) => (
              <motion.div
                key={job._id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors truncate">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-600">{job.company}</p>
                  </div>
                  {job.remote && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Remote</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {job.type}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="font-semibold text-gray-900">{job.salaryRange}</span>
                  <Link to="/jobs" className="text-blue-700 text-sm font-semibold hover:text-blue-800">
                    View Details →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10 sm:hidden">
            <Link to="/jobs" className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
              View All Jobs
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
