"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Download, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Simplified data for filters
const merchantStatuses = [
  { value: "all", label: "All" },
  { value: "subscribed", label: "Subscribed" },
  { value: "not_subscribed", label: "Not Subscribed" },
  { value: "hidden", label: "Hidden" },
]

const plans = [
  { value: "all", label: "All" },
  { value: "starter", label: "Starter" },
  { value: "plus", label: "Plus" },
  { value: "pro", label: "Pro" },
  { value: "free", label: "Free" },
]

const sortOptions = [
  { value: "date", label: "Date (Newest First)" },
  { value: "orders", label: "Total Orders" },
  { value: "products", label: "Products Count" },
  { value: "site", label: "Website Visits" },
]

export function ExportSidebar() {
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  // State for filters - simplified to only status, plan, and sort
  const [merchantStatus, setMerchantStatus] = React.useState("all")
  const [selectedPlan, setSelectedPlan] = React.useState("all")
  const [sortBy, setSortBy] = React.useState("date")

  // Ensure component is mounted before rendering portal
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent body scroll when sidebar is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '';
    };
  }, [open]);

  const handleExport = () => {
    // Simplified export functionality
    console.log("Exporting data with filters:", {
      merchantStatus,
      selectedPlan,
      sortBy,
    })

    // In a real application, this would trigger an API call to generate and download the Excel file
    alert("Export initiated! Check console for filter details.")
    setOpen(false) // Close sidebar after export
  }

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const sidebarVariants = {
    hidden: { x: "100%" },
    visible: { x: "0%" },
  }

  const contentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: 10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  }

  // Sidebar Portal Component
  const SidebarPortal = () => {
    if (!mounted) return null

    return createPortal(
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9998
              }}
            />

            {/* Sidebar */}
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={sidebarVariants}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed right-0 top-0 bottom-0 w-[85vw] max-w-sm sm:w-96 lg:w-[28rem] bg-white shadow-2xl z-[9999] flex flex-col"
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999
              }}
            >
              {/* Header */}
              <div className="border-b border-gray-200 bg-white p-4 flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900">Export Store Data</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </motion.button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <motion.div className="space-y-6 p-4" initial="hidden" animate="visible" variants={contentVariants}>
                  
                  {/* Merchant Status */}
                  <motion.div className="space-y-3" variants={itemVariants}>
                    <h3 className="font-medium text-lg text-gray-700">Merchant Status</h3>
                    <select
                      value={merchantStatus}
                      onChange={(e) => setMerchantStatus(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                    >
                      {merchantStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <hr className="border-gray-200" />

                  {/* Plan Selection */}
                  <motion.div className="space-y-3" variants={itemVariants}>
                    <h3 className="font-medium text-lg text-gray-700">Plan</h3>
                    <select
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                    >
                      {plans.map((plan) => (
                        <option key={plan.value} value={plan.value}>
                          {plan.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <hr className="border-gray-200" />

                  {/* Sort By */}
                  <motion.div className="space-y-3" variants={itemVariants}>
                    <h3 className="font-medium text-lg text-gray-700">Sort By</h3>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                </motion.div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-md transition-all duration-200 shadow-md hover:bg-purple-700 hover:shadow-lg flex items-center justify-center font-medium text-base"
                  onClick={handleExport}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Export to Excel
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    )
  }

  return (
    <div>
      {/* Export Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 shadow-sm hover:shadow-md font-medium"
      >
        <Download className="w-4 h-4 mr-2" />
        Export
      </button>

      {/* Portal for the sidebar */}
      <SidebarPortal />
    </div>
  )
}

