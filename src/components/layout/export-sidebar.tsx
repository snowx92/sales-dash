"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Download, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { exportService, ExportParams } from "@/lib/api/exports/exportService"
import { toast } from "sonner"

// Updated data for filters based on API requirements
const merchantStatuses = [
  { value: "all", label: "All" },
  { value: "subscribed", label: "Subscribed" },
  { value: "not_subscribed", label: "Not Subscribed" },
  { value: "hidden", label: "Hidden" },
  { value: "auto_renew", label: "Auto Renew" },
  { value: "stopped_subscribe", label: "Stopped Subscribe" },
] as const

const plans = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "starter", label: "Starter" },
  { value: "plus", label: "Plus" },
  { value: "pro", label: "Pro" },
] as const

const sortOptions = [
  { value: "date", label: "Date (Newest First)" },
  { value: "orders", label: "Total Orders" },
  { value: "products", label: "Products Count" },
  { value: "site", label: "Website Visits" },
] as const

interface StoreCategory {
  id: number;
  name: string;
  icon: string;
}

const ExportSidebar = React.memo(() => {
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)

  // State for filters - updated for API requirements
  const [merchantStatus, setMerchantStatus] = React.useState("all")
  const [selectedPlan, setSelectedPlan] = React.useState("all")
  const [sortBy, setSortBy] = React.useState("date")
  const [selectedCategory, setSelectedCategory] = React.useState("all")
  const [categories, setCategories] = React.useState<StoreCategory[]>([])

  // Fetch store categories on mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        // You'll need to implement this API call when the endpoint is available
        // const response = await apiService.get('/store-categories')
        // setCategories(response.data)
        
        // For now, using mock data
        setCategories([
          { id: 1, name: "All Categories", icon: "🏪" },
          { id: 2, name: "Fashion", icon: "👗" },
          { id: 3, name: "Electronics", icon: "📱" },
          { id: 4, name: "Food & Beverage", icon: "🍕" },
          { id: 5, name: "Health & Beauty", icon: "💄" },
        ])
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }

    fetchCategories()
  }, [])

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

  const handleExport = React.useCallback(async () => {
    setIsExporting(true)
    try {
      const params: ExportParams = {
        status: merchantStatus === "all" ? undefined : merchantStatus as ExportParams['status'],
        sortBy: sortBy as ExportParams['sortBy'],
        planId: selectedPlan === "all" ? undefined : selectedPlan as ExportParams['planId'],
        storeCategoryNo: selectedCategory === "all" ? undefined : parseInt(selectedCategory),
      }

      await exportService.exportStores(params)
      toast.success("Export completed successfully!")
      setOpen(false)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }, [merchantStatus, sortBy, selectedPlan, selectedCategory])

  // Memoized handlers to prevent unnecessary re-renders
  const handleMerchantStatusChange = React.useCallback((value: string) => {
    setMerchantStatus(value)
  }, [])

  const handlePlanChange = React.useCallback((value: string) => {
    setSelectedPlan(value)
  }, [])

  const handleSortChange = React.useCallback((value: string) => {
    setSortBy(value)
  }, [])

  const handleCategoryChange = React.useCallback((value: string) => {
    setSelectedCategory(value)
  }, [])

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
                      onChange={(e) => handleMerchantStatusChange(e.target.value)}
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
                      onChange={(e) => handlePlanChange(e.target.value)}
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

                  {/* Store Category */}
                  <motion.div className="space-y-3" variants={itemVariants}>
                    <h3 className="font-medium text-lg text-gray-700">Store Category</h3>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id.toString()}>
                          {category.icon} {category.name}
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
                      onChange={(e) => handleSortChange(e.target.value)}
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
                  whileHover={{ scale: isExporting ? 1 : 1.02 }}
                  whileTap={{ scale: isExporting ? 1 : 0.98 }}
                  className={`w-full px-4 py-3 rounded-md transition-all duration-200 shadow-md flex items-center justify-center font-medium text-base ${
                    isExporting 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg'
                  }`}
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  <Download className={`mr-2 h-5 w-5 ${isExporting ? 'animate-pulse' : ''}`} />
                  {isExporting ? 'Exporting...' : 'Export to Excel'}
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
})

ExportSidebar.displayName = 'ExportSidebar'

export { ExportSidebar }

