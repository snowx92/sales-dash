"use client";

import { Suspense } from "react";
import DynamicLoginForm from "@/components/auth/DynamicLoginForm"
import Image from "next/image"
import { motion } from "framer-motion"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { PAGE_TITLES } from "@/lib/config/page-titles"
import { Loader2 } from "lucide-react"

// Loading component for suspense boundary
function LoginLoading() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
        <p className="mt-2 text-gray-600">Loading login form...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  usePageTitle(PAGE_TITLES.LOGIN);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mx-auto mb-6">
              <Image
                src="/logo.png"
                alt="Vondera Logo"
                width={120}
                height={120}
                className="mx-auto"
                priority
              />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome to Vondera Sales
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Access your sales dashboard to track targets and merchant performance
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Suspense fallback={<LoginLoading />}>
              <DynamicLoginForm />
            </Suspense>
          </motion.div>
        </div>
      </div>

      {/* Right side - Hero Image/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-50 to-indigo-50 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 flex items-center justify-center p-12"
        >
          <div className="relative w-full max-w-lg">
            {/* Animated background shapes */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -90, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1
              }}
              className="absolute -bottom-8 right-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            />
            <div className="relative">
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Sales Team Portal
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Vondera Sales Hub
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Empowering our sales team to track targets, manage merchant relationships, and drive ecommerce growth
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-md border border-purple-100">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Merchant Tracking</h3>
                  </div>
                  <p className="text-sm text-gray-600">Monitor merchant onboarding and performance</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-md border border-indigo-100">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Sales Targets</h3>
                  </div>
                  <p className="text-sm text-gray-600">Track progress against monthly and quarterly goals</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-md border border-green-100">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Revenue Analytics</h3>
                  </div>
                  <p className="text-sm text-gray-600">Real-time revenue insights and forecasting</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-md border border-blue-100">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Team Performance</h3>
                  </div>
                  <p className="text-sm text-gray-600">Compare team metrics and achievements</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
