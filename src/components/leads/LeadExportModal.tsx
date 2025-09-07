"use client"

import React, { useState } from "react"
import { X, Download } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface SimpleLead {
  name: string;
  email: string;
  phone: string;
  website: string;
  status: string;
  priority: string;
  leadSource?: string;
  attempts?: number;
  createdAt: string;
  lastUpdated?: string;
  lastContact?: string;
  feedback?: string;
}

interface LeadExportModalProps {
  isOpen: boolean
  onClose: () => void
  currentStatusFilter?: string
  // Provide full datasets so we can export locally
  leads?: SimpleLead[]
  upcomingLeads?: SimpleLead[]
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

export function LeadExportModal({ isOpen, onClose, currentStatusFilter, leads = [], upcomingLeads = [] }: LeadExportModalProps) {
  // Convert current filter to API format for initial selection
  const getInitialStatus = React.useCallback(() => {
    if (!currentStatusFilter) return "all"
    return statusFilterToApiMap[currentStatusFilter] || "all"
  }, [currentStatusFilter])
  
  const [selectedStatus, setSelectedStatus] = useState(getInitialStatus)
  const [isExporting, setIsExporting] = useState(false)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [includeUpcoming, setIncludeUpcoming] = useState(true)

  // Update selected status when modal opens with new filter
  React.useEffect(() => {
    if (isOpen) {
      setSelectedStatus(getInitialStatus())
    }
  }, [isOpen, getInitialStatus])

  if (!isOpen) return null

  const normalize = (status: string) => status?.toUpperCase().replace(/ /g, '_')
  const dateInRange = (dateStr: string) => {
    if (!fromDate && !toDate) return true
    if (!dateStr) return false
    if (fromDate && dateStr < fromDate) return false
    if (toDate && dateStr > toDate) return false
    return true
  }

  const buildRow = (lead: SimpleLead) => ({
    Name: lead.name,
    Email: lead.email,
    Phone: lead.phone,
    Website: lead.website,
    Status: lead.status,
    Priority: lead.priority,
    LeadSource: lead.leadSource,
    Attempts: lead.attempts ?? '',
    CreatedAt: lead.createdAt,
    LastUpdated: lead.lastUpdated || lead.lastContact,
    Feedback: lead.feedback?.replace(/\n/g, ' ')
  })

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const targetStatus = selectedStatus === 'all' ? null : selectedStatus
      const allData = [...leads, ...(includeUpcoming ? upcomingLeads : [])]
      const filtered = allData.filter(l => {
        const apiStatus = normalize(l.status)
        const matchesStatus = !targetStatus || apiStatus === targetStatus
        const matchesDate = dateInRange(l.createdAt)
        return matchesStatus && matchesDate
      })

      if (!filtered.length) {
        toast.error('No leads match filters')
        return
      }

  const rows = filtered.map(buildRow)
  // Dynamic import so xlsx isn't in initial bundle
  const xlsx = await import('xlsx')
  const ws = xlsx.utils.json_to_sheet(rows)
  const wb = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(wb, ws, 'Leads')
  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')
  xlsx.writeFile(wb, `leads_export_${stamp}.xlsx`)
  toast.success(`Exported ${rows.length} leads (Excel)`)      
  onClose()
    } catch (err) {
      console.error('Local export failed', err)
      toast.error('Export failed')
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
          <div className="space-y-4">
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e)=>setFromDate(e.target.value)}
                  disabled={isExporting}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e)=>setToDate(e.target.value)}
                  disabled={isExporting}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-gray-600 mt-2">
              <input
                type="checkbox"
                checked={includeUpcoming}
                onChange={(e)=>setIncludeUpcoming(e.target.checked)}
                disabled={isExporting}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              Include Upcoming (NEW)
            </label>
          </div>

          <div className="text-xs text-gray-400">Status, date range & NEW inclusion filters apply. Output: Excel (.xlsx).</div>
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
