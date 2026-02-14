import { useState } from 'react'
import { X, Download, Maximize2, Minimize2, ExternalLink } from 'lucide-react'

export default function ResumeViewerModal({ isOpen, onClose, resumeUrl, candidateName }) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!isOpen) return null

  // Check if it's a PDF
  const isPDF = resumeUrl?.toLowerCase().endsWith('.pdf')
  
  // Google Docs Viewer for DOC/DOCX files
  const viewerUrl = isPDF 
    ? resumeUrl 
    : `https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=true`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all ${
        isFullscreen ? 'w-full h-full' : 'w-full max-w-5xl h-[90vh]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Resume / CV</h2>
            {candidateName && (
              <p className="text-sm text-gray-600">{candidateName}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={resumeUrl}
              download
              className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-blue-600"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-blue-600"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-600 hover:text-red-600"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer */}
        <div className="w-full h-[calc(100%-5rem)] bg-gray-100">
          <iframe
            src={viewerUrl}
            className="w-full h-full border-0"
            title="Resume Viewer"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  )
}
