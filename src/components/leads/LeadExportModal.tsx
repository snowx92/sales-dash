"use client"

import React, { useState } from "react"
import { X, Download } from "lucide-react"
import { motion } from "framer-motion"
import { exportService, LeadExportParams } from "@/lib/api/exports/exportService"
import { toast } from "sonner"

interface LeadExportModalProps {
  isOpen: boolean
  onClose: () => void
  currentStatusFilter?: string
}

const leadStatusOptions = [
  { value: "all", label: "All Leads" },
  { value: "NEW", label: "New" },
  { value: "INTERSTED", label: "Interested" },
  { value: "SUBSCRIBED", label: "Subscribed" },
  { value: "NOT_INTERSTED", label: "Not Interested" },
  { value: "NO_ANSWER", label: "No Answer" },
  { value: "FOLLOW_UP", label: "Follow Up" },
] as const

// Mapping from component status filter to API status
const statusFilterToApiMap: Record<string, string> = {
  'interested': 'INTERSTED',
  'subscribed': 'SUBSCRIBED', 
  'not_interested': 'NOT_INTERSTED',
  'no_answer': 'NO_ANSWER',
  'follow_up': 'FOLLOW_UP',
  'new': 'NEW'
}

export function LeadExportModal({ isOpen, onClose, currentStatusFilter }: LeadExportModalProps) {
  // Convert current filter to API format for initial selection
  const getInitialStatus = React.useCallback(() => {
    if (!currentStatusFilter) return "all"
    return statusFilterToApiMap[currentStatusFilter] || "all"
  }, [currentStatusFilter])
  
  const [selectedStatus, setSelectedStatus] = useState(getInitialStatus)
  const [isExporting, setIsExporting] = useState(false)

  // Update selected status when modal opens with new filter
  React.useEffect(() => {
    if (isOpen) {
      setSelectedStatus(getInitialStatus())
    }
  }, [isOpen, getInitialStatus])

  if (!isOpen) return null

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const params: LeadExportParams = {}
      
      if (selectedStatus !== "all") {
        params.status = selectedStatus as LeadExportParams['status']
      }

      await exportService.exportLeads(params)
      toast.success("Leads exported successfully!")
      onClose()
    } catch (error) {
      console.error('Export failed:', error)
      toast.error("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Export Leads</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isExporting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={isExporting}
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {leadStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
            <div className="font-medium text-gray-700 mb-1">Export Details:</div>
            {selectedStatus === "all" 
              ? "📊 This will export all leads regardless of status in Excel format."
              : `📊 This will export only leads with "${leadStatusOptions.find(opt => opt.value === selectedStatus)?.label}" status in Excel format.`
            }
            <div className="mt-1 text-xs text-gray-400">
              File format: Excel (.xlsx) • Includes: Name, Email, Phone, Website, Status, Priority, and more
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
              isExporting 
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            <Download className={`h-4 w-4 ${isExporting ? 'animate-pulse' : ''}`} />
            {isExporting ? 'Exporting...' : 'Export to Excel'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
