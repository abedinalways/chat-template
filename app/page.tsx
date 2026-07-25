// app/page.tsx
// Landing page with navigation to the messaging dashboard.
// This is the main entry point of the application.

'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Welcome to Chat Template
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A production-ready real-time messaging system built with Next.js, Socket.io, and Redux Toolkit
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/messages"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Open Messages
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-200"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Real-time Messaging</h3>
            <p className="text-gray-600 text-sm">
              Instant message delivery using Socket.io with automatic reconnection
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-3xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold mb-2">Smart Notifications</h3>
            <p className="text-gray-600 text-sm">
              In-app, browser, and sound notifications for new messages
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">Fully Responsive</h3>
            <p className="text-gray-600 text-sm">
              Works perfectly on desktop, tablet, and mobile devices
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-center mb-6">Built With Modern Technologies</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="text-2xl mb-2">⚛️</div>
              <p className="font-medium">Next.js 16</p>
              <p className="text-xs text-gray-500">App Router</p>
            </div>
            <div className="p-4">
              <div className="text-2xl mb-2">🔌</div>
              <p className="font-medium">Socket.io</p>
              <p className="text-xs text-gray-500">Real-time</p>
            </div>
            <div className="p-4">
              <div className="text-2xl mb-2">🔄</div>
              <p className="font-medium">Redux Toolkit</p>
              <p className="text-xs text-gray-500">State Management</p>
            </div>
            <div className="p-4">
              <div className="text-2xl mb-2">🎨</div>
              <p className="font-medium">Tailwind CSS</p>
              <p className="text-xs text-gray-500">Styling</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 text-sm">
          <p>Ready to use in your project. Check the README for setup instructions.</p>
        </div>
      </div>
    </div>
  );
}