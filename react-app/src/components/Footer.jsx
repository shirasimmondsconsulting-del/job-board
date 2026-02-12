import { Link } from 'react-router-dom'
import { Heart, MapPin, Mail, Linkedin, Twitter, ExternalLink, Github } from 'lucide-react'
import logoImage from '../assets/logo.png'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-5 group">
              <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg shadow-blue-900/30 group-hover:scale-105 transition-transform">
                <img
                  src={logoImage}
                  alt="Habayta Jobs"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold text-white">Habayta Jobs</span>
            </Link>
            <p className="text-gray-400 max-w-md mb-6 leading-relaxed text-sm">
              Built by Olim, for Olim. Connecting talented professionals with
              Israeli companies that understand and value the unique journey of
              making Aliyah.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800/80 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800/80 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800/80 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="mailto:hello@habaytajobs.com"
                className="w-10 h-10 bg-gray-800/80 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">
              For Job Seekers
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/jobs"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                >
                  Browse Jobs
                  <ExternalLink className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link
                  to="/job-seekers"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                >
                  Create Profile
                  <ExternalLink className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link
                  to="/saved-jobs"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                >
                  Saved Jobs
                  <ExternalLink className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Career Resources
                </a>
              </li>
            </ul>
          </div>

          {/* For Employers & Contact */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">
              For Employers
            </h3>
            <ul className="space-y-3 mb-8">
              <li>
                <Link
                  to="/companies"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                >
                  Post a Job — Free
                  <ExternalLink className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Browse Candidates
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Pricing Plans
                </a>
              </li>
            </ul>

            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Tel Aviv, Israel</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-blue-500" />
                <a
                  href="mailto:hello@habaytajobs.com"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  hello@habaytajobs.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              © {currentYear} Habayta Jobs. All rights reserved.
            </p>
            <p>
              Powered by{" "}
              <a
                href="https://smartreachai.com/"
                className="text-blue-400 hover:underline"
              >
                SmartReachAI.com
              </a>
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              Made with{" "}
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />{" "}
              for those making Aliyah
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer
