import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Briefcase, Bookmark, Users, Building2, Home, Sparkles, LogOut, User, FileText, Podcast } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import logoImage from '../assets/logo.png'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsOpen(false)
  }

  // Different nav links for different user types
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { to: "/", label: "Home", icon: Home },
        { to: "/jobs", label: "Find Jobs", icon: Briefcase },
        { to: "/companies", label: "Companies", icon: Building2 },
        {
          to: "https://youtube.com/playlist?list=PLTPqHtIjLBAfX3C_l_-dZ0HJE6fzCSIMl&si=BCJzXVHBruGoMTzS",
          label: "Podcast",
          icon: Podcast,
          external: true,
        },
      ];
    }

    if (user?.userType === 'employer') {
      return [
        { to: "/employer/dashboard", label: "Dashboard", icon: Home },
        { to: "/employer/jobs", label: "My Jobs", icon: Briefcase },
        { to: "/employer/applications", label: "Applications", icon: FileText },
        { to: "/job-seekers", label: "Talent", icon: Users },
        { to: "/my-profile", label: "Profile", icon: User },
        {
          to: "https://youtube.com/playlist?list=PLTPqHtIjLBAfX3C_l_-dZ0HJE6fzCSIMl&si=BCJzXVHBruGoMTzS",
          label: "Podcast",
          icon: Podcast,
          external: true,
        },
      ];
    }

    // job_seeker
    return [
      { to: "/", label: "Home", icon: Home },
      { to: "/jobs", label: "Find Jobs", icon: Briefcase },
      { to: "/saved-jobs", label: "Saved", icon: Bookmark },
      { to: "/my-applications", label: "My Applications", icon: FileText },
      { to: "/my-profile", label: "Profile", icon: User },
      {
        to: "https://youtube.com/playlist?list=PLTPqHtIjLBAfX3C_l_-dZ0HJE6fzCSIMl&si=BCJzXVHBruGoMTzS",
        label: "Podcast",
        icon: Podcast,
        external: true,
      },
    ];
  }

  const navLinks = getNavLinks()

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
      ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-100/50 border-b border-gray-100'
      : 'bg-white border-b border-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <img src={logoImage} alt="Habayta Jobs" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold text-gray-900">Habayta</span>
              <span className="text-xl font-bold text-blue-600">Jobs</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
              const Icon = link.icon
              if (link.external) {
                return (
                  <li key={link.to}>
                    <a
                      href={link.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </a>
                  </li>
                )
              }
              return (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>

          {/* CTA Button - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition">
                  Login
                </Link>
                <Link to="/register" className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                  <Sparkles className="w-4 h-4" />
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.userType === 'employer' && user?.companyId?.name
                      ? user.companyId.name
                      : user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
                  </span>
                  <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                    {user?.userType === 'employer' ? 'Employer' : 'Job Seeker'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden border-t border-gray-100 bg-white"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <ul className="flex flex-col gap-1">
                {navLinks.map(link => {
                  const Icon = link.icon
                  if (link.external) {
                    return (
                      <li key={link.to}>
                        <a
                          href={link.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                          <Icon className="w-5 h-5" />
                          {link.label}
                        </a>
                      </li>
                    )
                  }
                  return (
                    <li key={link.to}>
                      <NavLink
                        to={link.to}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5" />
                        {link.label}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-100">
                {!isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center justify-center gap-2 w-full px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center justify-center gap-2 w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      <Sparkles className="w-4 h-4" />
                      Sign Up
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-lg">
                      <User className="w-4 h-4 text-gray-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}</p>
                        <p className="text-xs text-gray-500">{user?.userType === 'employer' ? 'Employer' : 'Job Seeker'}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center justify-center gap-2 w-full px-6 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
