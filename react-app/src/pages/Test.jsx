import React from 'react'

export default function Test() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🎉 ہالو! App Load ہو رہا ہے</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-blue-900 mb-3">✅ اگر یہ text نظر آ رہا ہے تو:</h2>
          <ul className="text-blue-800 space-y-2 list-disc list-inside">
            <li>React app properly load ہو رہا ہے</li>
            <li>Routing کام کر رہی ہے</li>
            <li>Tailwind CSS کام کر رہی ہے</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Links کو Test کریں:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a href="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Home Page
            </a>
            <a href="/login" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Login Page
            </a>
            <a href="/register" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Register Page
            </a>
            <a href="/jobs" className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
              Jobs Page
            </a>
          </div>
        </div>

        <div className="mt-10 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-bold text-yellow-900 mb-2">اگر Home page خالی ہے تو:</h3>
          <p className="text-yellow-800">یہ ہو سکتا ہے:</p>
          <ul className="list-disc list-inside text-yellow-800 mt-2 space-y-1">
            <li>Backend API سے jobs نہیں مل رہی</li>
            <li>Context میں jobs array خالی ہے</li>
            <li>CSS classes کا مسئلہ ہے</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
