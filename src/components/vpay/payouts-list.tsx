"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {  BanknoteIcon as Bank, AlertCircle, CheckCircle2, XCircle, Clock,  ChevronDown, Wallet, Store, Calendar, DollarSign, Hash, Copy, Check, BarChart2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
// import type { Payout, PayoutStatus } from "@/lib/api/vpay/types" // Commented out API types
import { Pagination } from "@/components/tables/Pagination"
import { ResponsiveCard } from "@/components/layout/ResponsiveWrapper"
import { Toast } from "@/components/ui/toast"
import Link from "next/link"

// Frontend-only type definitions
type PayoutStatus = "Pending" | "Success" | "Failed" | "Canceled"

interface Payout {
  id: string
  amount: number
  walletNumber: string
  method: string
  status: PayoutStatus
  createdAt: {
    _seconds: number
    _nanoseconds: number
  }
  owner: {
    store: {
      id: string
      name: string
      logo?: string
    }
    user: {
      name: string
      avatar?: string
    }
  }
}

interface PayoutsListProps {
  payouts: Payout[]
  updateStatus: (id: string, status: PayoutStatus) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

// Copy identifier component
const CopyIdentifierButton = ({ identifier }: { identifier: string }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(identifier)
      setCopied(true)
      Toast.success({
        message: 'Identifier copied!',
        description: 'Wallet identifier has been copied to clipboard'
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      Toast.error({
        message: 'Copy failed',
        description: 'Unable to copy identifier to clipboard'
      })
    }
  }

  return (
    <button
      onClick={copyToClipboard}
      className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
      title="Copy identifier"
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-600" />
      ) : (
        <Copy className="h-3 w-3 text-gray-500 hover:text-gray-700" />
      )}
    </button>
  )
}

// Mobile payout card component
const MobilePayoutCard = ({ 
  payout, 
  onStatusChange, 
  animatingId, 
  getStatusIcon, 
  getStatusColor, 
  getPaymentIcon, 
  formatDate 
}: {
  payout: Payout;
  onStatusChange: (id: string, status: PayoutStatus) => void;
  animatingId: string | null;
  getStatusIcon: (status: PayoutStatus) => React.ReactNode;
  getStatusColor: (status: PayoutStatus) => string;
  getPaymentIcon: (method: string) => React.ReactNode;
  formatDate: (timestamp: { _seconds: number; _nanoseconds: number }) => string;
}) => {
  const analyticsUrl = `/dashboard/merchants/analytics/${payout.owner.store.id}`;

  return (
    <ResponsiveCard padding="md" className="hover:shadow-lg transition-all duration-200">
      <div className="space-y-4">
        {/* Header with store info */}
        <div className="flex items-center space-x-3">
          <Link href={analyticsUrl} className="relative w-12 h-12 flex-shrink-0">
            <Image
              src={payout.owner.store.logo || "/placeholder.svg"}
              alt={payout.owner.store.name}
              fill
              className="rounded-full object-cover border-2 border-purple-100 hover:border-purple-300 transition-all"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Store className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-500">Store</span>
            </div>
            <Link href={analyticsUrl}>
              <h3 className="text-lg font-semibold text-gray-900 truncate hover:text-purple-700 transition-colors">
                {payout.owner.store.name}
              </h3>
            </Link>
          </div>
          <Link href={analyticsUrl} className="flex-shrink-0">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50">
              <BarChart2 className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Amount - Prominent display */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Payout Amount</span>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-purple-800">{Math.floor(payout.amount).toLocaleString()} Egp</span>
          </div>
        </div>

        {/* Payout Details */}
        <div className="space-y-3">
          {/* Wallet Number */}
          <div className="flex items-center space-x-2">
            <Hash className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-500">Identifier:</span>
            <div className="flex items-center flex-1 min-w-0 bg-gray-50 rounded px-2 py-1">
              <span className="text-sm font-mono text-gray-700 truncate flex-1">
                {payout.walletNumber}
              </span>
              <CopyIdentifierButton identifier={payout.walletNumber} />
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-center space-x-2">
            {getPaymentIcon(payout.method)}
            <span className="text-sm font-medium text-gray-500">Method:</span>
            <span className="text-sm text-gray-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
              {payout.method}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-500">Created:</span>
            <span className="text-sm text-gray-700">{formatDate(payout.createdAt)}</span>
          </div>
        </div>

        {/* Status Action */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Status:</span>
            {payout.status === "Pending" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${getStatusColor("Pending")} border hover:bg-opacity-80 relative overflow-hidden flex items-center gap-2 min-w-[120px] justify-center`}
                  >
                    {animatingId === payout.id && (
                      <motion.div
                        className="absolute inset-0 bg-white/30"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                    {getStatusIcon("Pending")}
                    <span>Pending</span>
                    <ChevronDown className="h-3 w-3 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-2">
                  <div className="px-2 py-1 text-xs text-gray-500 font-medium">Change status to:</div>
                  <DropdownMenuItem
                    onClick={() => onStatusChange(payout.id, "Success")}
                    className="flex items-center px-3 py-2 rounded-md cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    <span>Success</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange(payout.id, "Failed")}
                    className="flex items-center px-3 py-2 rounded-md cursor-pointer"
                  >
                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                    <span>Failed</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onStatusChange(payout.id, "Canceled")}
                    className="flex items-center px-3 py-2 rounded-md cursor-pointer"
                  >
                    <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                    <span>Canceled</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className={`${getStatusColor(payout.status)} border flex items-center gap-2 min-w-[120px] justify-center cursor-default`}
                disabled
              >
                {getStatusIcon(payout.status)}
                <span>{payout.status}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </ResponsiveCard>
  );
};

// Desktop payout row component
const DesktopPayoutRow = ({ 
  payout, 
  index, 
  onStatusChange, 
  animatingId, 
  getStatusIcon, 
  getStatusColor, 
  getPaymentIcon, 
  formatDate 
}: {
  payout: Payout;
  index: number;
  onStatusChange: (id: string, status: PayoutStatus) => void;
  animatingId: string | null;
  getStatusIcon: (status: PayoutStatus) => React.ReactNode;
  getStatusColor: (status: PayoutStatus) => string;
  getPaymentIcon: (method: string) => React.ReactNode;
  formatDate: (timestamp: { _seconds: number; _nanoseconds: number }) => string;
}) => {
  const analyticsUrl = `/dashboard/merchants/analytics/${payout.owner.store.id}`;

  return (
    <motion.div
      key={payout.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative overflow-hidden"
    >
      <motion.div
        className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-purple-200 hover:shadow-md transition-all"
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-center space-x-4">
          <Link href={analyticsUrl} className="relative w-16 h-16 flex-shrink-0">
            <Image
              src={payout.owner.store.logo || "/placeholder.svg"}
              alt={payout.owner.store.name}
              fill
              className="rounded-full object-cover border-2 border-purple-100 hover:border-purple-300 transition-all"
            />
          </Link>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <Link href={analyticsUrl}>
                <span className="font-semibold text-gray-900 text-lg hover:text-purple-700 transition-colors">
                  {payout.owner.store.name}
                </span>
              </Link>
              <Link href={analyticsUrl}>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1">
                  <BarChart2 className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium flex items-center gap-2">
                <span className="text-xs text-purple-500">Identifier:</span>
                <span className="font-mono">{payout.walletNumber}</span>
                <CopyIdentifierButton identifier={payout.walletNumber} />
              </div>
              <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                <span className="text-xs text-blue-500">Method:</span>
                <div className="flex items-center gap-1">
                  {getPaymentIcon(payout.method)}
                  <span>{payout.method}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

                  <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="font-bold text-2xl text-purple-800">{Math.floor(payout.amount).toLocaleString()} Egp</span>
          </div>

          <div className="flex items-center gap-3">
            {payout.status === "Pending" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${getStatusColor("Pending")} border hover:bg-opacity-80 relative overflow-hidden flex items-center gap-1 min-w-[120px] justify-center`}
                  >
                    {animatingId === payout.id && (
                      <motion.div
                        className="absolute inset-0 bg-white/30"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                    {getStatusIcon("Pending")}
                    <span>Pending</span>
                    <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-2">
                  <div className="px-2 py-1 text-xs text-gray-500 font-medium">Change status to:</div>
                  <DropdownMenuItem
                    onClick={() => onStatusChange(payout.id, "Success")}
                    className="flex items-center px-3 py-2 rounded-md cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    <span>Success</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange(payout.id, "Failed")}
                    className="flex items-center px-3 py-2 rounded-md cursor-pointer"
                  >
                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                    <span>Failed</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onStatusChange(payout.id, "Canceled")}
                    className="flex items-center px-3 py-2 rounded-md cursor-pointer"
                  >
                    <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                    <span>Canceled</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className={`${getStatusColor(payout.status)} border relative overflow-hidden flex items-center gap-1 min-w-[120px] justify-center cursor-default`}
                disabled
              >
                {getStatusIcon(payout.status)}
                <span>{payout.status}</span>
              </Button>
            )}

            <span className="text-sm text-gray-500 whitespace-nowrap">{formatDate(payout.createdAt)}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function PayoutsList({ payouts, updateStatus, currentPage, totalPages, onPageChange }: PayoutsListProps) {
  const [animatingId, setAnimatingId] = useState<string | null>(null)

  const handlePayoutStatusChange = async (id: string, status: PayoutStatus) => {
    try {
      setAnimatingId(id)
      await updateStatus(id, status)
    } catch (error) {
      console.error("Failed to change status:", error)
    } finally {
      // Clear animating state after animation completes
      setTimeout(() => {
        setAnimatingId(null)
      }, 1000)
    }
  }

  const getStatusIcon = (status: PayoutStatus) => {
    switch (status) {
      case "Success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "Failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "Canceled":
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      default:
        return <Clock className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusColor = (status: PayoutStatus) => {
    switch (status) {
      case "Success":
        return "bg-green-100 text-green-800 border-green-200"
      case "Failed":
        return "bg-red-100 text-red-800 border-red-200"
      case "Canceled":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getPaymentIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "instapay":
        return (
          <div className="h-5 w-5 relative">
            <Image src="/instapay.png" alt="InstaPay" fill className="object-contain" />
          </div>
        )
      case "wallet":
        return <Wallet className="h-5 w-5 text-purple-600" />
      default:
        return <Bank className="h-5 w-5 text-purple-600" />
    }
  }

  const formatDate = (timestamp: { _seconds: number; _nanoseconds: number }) => {
    const date = new Date(timestamp._seconds * 1000)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Recent Payouts</h2>
        {payouts.length > 0 && (
          <div className="text-sm text-gray-500">
            {payouts.length} payout{payouts.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {payouts.length === 0 ? (
          <ResponsiveCard padding="md" className="text-center">
            <div className="py-8">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payouts found</h3>
              <p className="text-gray-500">Payouts will appear here when they&apos;re processed</p>
            </div>
          </ResponsiveCard>
        ) : (
          <AnimatePresence>
            {payouts.map((payout, index) => (
              <motion.div
                key={payout.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MobilePayoutCard
                  payout={payout}
                  onStatusChange={handlePayoutStatusChange}
                  animatingId={animatingId}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  getPaymentIcon={getPaymentIcon}
                  formatDate={formatDate}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        {payouts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No payouts found</h3>
            <p className="text-gray-500">Payouts will appear here when they&apos;re processed</p>
          </div>
        ) : (
          <AnimatePresence>
            {payouts.map((payout, index) => (
              <DesktopPayoutRow
                key={payout.id}
                payout={payout}
                index={index}
                onStatusChange={handlePayoutStatusChange}
                animatingId={animatingId}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                getPaymentIcon={getPaymentIcon}
                formatDate={formatDate}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Responsive Pagination */}
      {totalPages > 1 && (
        <ResponsiveCard padding="sm">
          <Pagination
            totalItems={totalPages * 5}
            itemsPerPage={5}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </ResponsiveCard>
      )}
    </div>
  )
}
  
  