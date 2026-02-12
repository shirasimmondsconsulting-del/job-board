import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowRight, ArrowLeft, Building2, Briefcase, FileText, Eye, Send, Sparkles, Users, Zap, Shield, Mail } from 'lucide-react'

const steps = [
  { id: 1, label: 'Account', icon: Building2 },
  { id: 2, label: 'Verify', icon: Mail },
  { id: 3, label: 'Job Info', icon: Briefcase },
  { id: 4, label: 'Requirements', icon: FileText },
  { id: 5, label: 'Review', icon: Eye },
]

const benefits = [
  { icon: Users, title: 'Access Talent Pool', desc: 'Connect with thousands of skilled Olim' },
  { icon: Zap, title: 'Post in Minutes', desc: 'Simple 5-step wizard gets you live fast' },
  { icon: Shield, title: 'Vetted Candidates', desc: 'Verified profiles from serious professionals' },
]

function Companies() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLogin, setIsLogin] = useState(false)
  const [formData, setFormData] = useState({
    // Account
    companyName: '',
    email: '',
    password: '',
    // Job Info
    jobTitle: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    description: '',
    // Requirements
    hebrewLevel: 'none',
    englishLevel: 'fluent',
    remote: false,
    timeline: 'now',
    industry: 'tech'
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const progressWidth = ((currentStep - 1) / (steps.length - 1)) * 100

  const inputClasses = "w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-gray-900 placeholder:text-gray-400"
  const selectClasses = "w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-gray-900 appearance-none bg-white"
  const labelClasses = "text-sm font-semibold text-gray-700 mb-2 block"

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
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-semibold text-white">100% Free Job Posting</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-bold text-white mb-4"
            >
              Post a Job in 5 Minutes
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-primary-100 text-lg max-w-xl mx-auto mb-8"
            >
              Connect with talented professionals making Aliyah. Post your job and start receiving applications today.
            </motion.p>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6"
            >
              {benefits.map((benefit) => {
                const Icon = benefit.icon
                return (
                  <div key={benefit.title} className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary-200" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{benefit.title}</p>
                      <p className="text-primary-200 text-xs">{benefit.desc}</p>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wizard */}
      <section className="py-8 lg:py-12">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100 p-6 lg:p-10 -mt-12 relative z-10"
          >
            {/* Progress Steps */}
            <div className="relative mb-10">
              <div className="flex justify-between relative z-10">
                {steps.map((step) => {
                  const Icon = step.icon
                  return (
                    <div
                      key={step.id}
                      className={`flex flex-col items-center ${
                        step.id <= currentStep ? 'text-primary-700' : 'text-gray-400'
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 ${
                          step.id < currentStep
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                            : step.id === currentStep
                            ? 'bg-primary-600 text-white ring-4 ring-primary-100 shadow-lg shadow-primary-500/30'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {step.id < currentStep ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className={`text-xs font-semibold hidden sm:block ${step.id <= currentStep ? 'text-gray-700' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
              {/* Progress Bar */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-100 -z-0 rounded-full mx-8">
                <div
                  className="h-full bg-gradient-to-r from-primary-600 to-primary-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </div>

            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[350px]"
            >
              {/* Step 1: Account */}
              {currentStep === 1 && (
                <div>
                  <div className="flex gap-1 mb-8 bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setIsLogin(false)}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                        !isLogin
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Create Account
                    </button>
                    <button
                      onClick={() => setIsLogin(true)}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                        isLogin
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Log In
                    </button>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {isLogin ? 'Welcome Back' : 'Create Employer Account'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {isLogin ? 'Sign in to manage your job postings' : 'Get started with your free account'}
                  </p>

                  <div className="space-y-4">
                    {!isLogin && (
                      <div>
                        <label className={labelClasses}>Company Name</label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className={inputClasses}
                          placeholder="Your company name"
                        />
                      </div>
                    )}
                    <div>
                      <label className={labelClasses}>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={inputClasses}
                        placeholder="company@example.com"
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={inputClasses}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Verify */}
              {currentStep === 2 && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary-100">
                    <Send className="w-10 h-10 text-primary-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Verify Your Email
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    We've sent a verification link to your email address. 
                    Please check your inbox and click the link to continue.
                  </p>
                  <button className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                    Resend verification email →
                  </button>
                </div>
              )}

              {/* Step 3: Job Info */}
              {currentStep === 3 && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Job Details</h3>
                  <p className="text-gray-500 mb-6">Tell us about the position you're hiring for</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={labelClasses}>Job Title</label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className={inputClasses}
                        placeholder="e.g. Senior Software Engineer"
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Location</label>
                      <select
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className={selectClasses}
                      >
                        <option value="">Select location</option>
                        <option value="Tel Aviv">Tel Aviv</option>
                        <option value="Jerusalem">Jerusalem</option>
                        <option value="Haifa">Haifa</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClasses}>Min Salary (₪)</label>
                        <input
                          type="number"
                          name="salaryMin"
                          value={formData.salaryMin}
                          onChange={handleInputChange}
                          className={inputClasses}
                          placeholder="20,000"
                        />
                      </div>
                      <div>
                        <label className={labelClasses}>Max Salary (₪)</label>
                        <input
                          type="number"
                          name="salaryMax"
                          value={formData.salaryMax}
                          onChange={handleInputChange}
                          className={inputClasses}
                          placeholder="35,000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>Job Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className={`${inputClasses} resize-none`}
                        placeholder="Describe the role, responsibilities, and what makes this opportunity great for Olim..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Requirements */}
              {currentStep === 4 && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Requirements</h3>
                  <p className="text-gray-500 mb-6">Specify what you're looking for in candidates</p>
                  
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClasses}>Hebrew Level Required</label>
                        <select
                          name="hebrewLevel"
                          value={formData.hebrewLevel}
                          onChange={handleInputChange}
                          className={selectClasses}
                        >
                          <option value="none">None Required</option>
                          <option value="basic">Basic</option>
                          <option value="conversational">Conversational</option>
                          <option value="fluent">Fluent</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClasses}>English Level Required</label>
                        <select
                          name="englishLevel"
                          value={formData.englishLevel}
                          onChange={handleInputChange}
                          className={selectClasses}
                        >
                          <option value="basic">Basic</option>
                          <option value="conversational">Conversational</option>
                          <option value="fluent">Fluent</option>
                          <option value="native">Native</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClasses}>Industry</label>
                        <select
                          name="industry"
                          value={formData.industry}
                          onChange={handleInputChange}
                          className={selectClasses}
                        >
                          <option value="tech">Technology</option>
                          <option value="finance">Finance</option>
                          <option value="marketing">Marketing</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="education">Education</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClasses}>When are you hiring?</label>
                        <select
                          name="timeline"
                          value={formData.timeline}
                          onChange={handleInputChange}
                          className={selectClasses}
                        >
                          <option value="now">Immediately</option>
                          <option value="3-months">Within 3 months</option>
                          <option value="6-months">Within 6 months</option>
                          <option value="flexible">Flexible</option>
                        </select>
                      </div>
                    </div>
                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          name="remote"
                          checked={formData.remote}
                          onChange={handleInputChange}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="font-medium text-gray-700">This position allows remote work</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Review Your Job Posting</h3>
                  <p className="text-gray-500 mb-6">Make sure everything looks good before publishing</p>
                  
                  <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-gray-100">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-1">
                          {formData.jobTitle || 'Job Title'}
                        </h4>
                        <p className="text-gray-600">
                          {formData.companyName || 'Company Name'} • {formData.location || 'Location'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200">
                        {formData.industry}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200">
                        Hebrew: {formData.hebrewLevel}
                      </span>
                      {formData.remote && (
                        <span className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-semibold border border-primary-100">
                          Remote OK
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 mb-4 text-sm">
                      {formData.description || 'No description provided'}
                    </p>

                    <p className="text-lg font-bold text-gray-900">
                      ₪{formData.salaryMin || '0'} - ₪{formData.salaryMax || '0'} / month
                    </p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-emerald-700 font-medium text-sm">
                      Your job will be posted for free and visible to all Olim job seekers
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                  currentStep === 1 
                    ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              {currentStep < 5 ? (
                <button 
                  onClick={nextStep} 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30">
                  <Check className="w-4 h-4" />
                  Publish Job
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Companies
