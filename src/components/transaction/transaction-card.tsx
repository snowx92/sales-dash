"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { CreditCard, Wallet, User, CreditCardIcon, ExternalLink } from "lucide-react"
// import type { Transaction } from "../../lib/api/Subscribtions/types" // Commented out API types
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/transaction/ui/tooltip"
import { Badge } from "@/components/transaction/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/transaction/ui/dialog"

// Frontend-only Transaction type definition
interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  type: string;
  method: string;
  createdAt: {
    seconds: number;
    _nanoseconds: number;
  };
  user?: {
    name: string;
    phone: string;
    email?: string;
  };
  store: {
    name: string;
    logo?: string;
    country: string;
    merchantId: string;
    link?: string;
  };
  plan: {
    id: string;
    name: string;
    duration: string;
  };
  admin?: {
    name: string;
    avatar?: string;
    email?: string;
  };
  kashierLink?: string;
}
import Link from "next/link"

// Utility functions
function formatTimestamp(seconds: number) {
  const date = new Date(seconds * 1000)
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  })
}

function getMethodIcon(method: string) {
  switch (method) {
    case "CARD":
      return <CreditCard className="h-4 w-4 text-blue-500" />
    case "WALLET":
      return <Wallet className="h-4 w-4 text-emerald-500" />
    case "ADMIN":
      return <User className="h-4 w-4 text-purple-500" />
    default:
      return <CreditCardIcon className="h-4 w-4 text-gray-500" />
  }
}

function getPlanBadgeColor(planId: string) {
  switch (planId) {
    case "starter":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "plus":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "pro":
      return "bg-purple-50 text-purple-700 border-purple-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

function getMethodLabel(method: string) {
  switch (method) {
    case "CARD":
      return "Credit Card"
    case "WALLET":
      return "Digital Wallet"
    case "ADMIN":
      return "Admin Payment"
    default:
      return method
  }
}

function getTransactionTypeLabel(type: string) {
  switch (type) {
    case "NEW":
      return "New Subscription"
    case "RENEW":
      return "Renewal"
    default:
      return type
  }
}

function getDurationLabel(duration: string) {
  switch (duration) {
    case "MONTH":
      return "Monthly"
    case "QUARTER":
      return "Quarterly"
    case "YEAR":
      return "Yearly"
    default:
      return duration
  }
}

function getDurationColor(duration: string) {
  switch (duration) {
    case "MONTH":
      return "bg-blue-50 text-blue-700"
    case "QUARTER":
      return "bg-green-50 text-green-700"
    case "YEAR":
      return "bg-purple-50 text-purple-700"
    default:
      return "bg-gray-50 text-gray-700"
  }
}

interface TransactionCardProps {
  transaction: Transaction
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 sm:px-6 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 cursor-pointer transition-all duration-300 group relative"
              whileHover={{ x: 5 }}
              onClick={() => setShowDetails(true)}
            >
              {/* Transaction Type Indicator */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                transaction.type === "NEW" ? "bg-emerald-500" : "bg-amber-500"
              }`} />

              {/* Mobile: Top row with logo and amount */}
              <div className="flex sm:hidden items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-indigo-100 shadow-lg group-hover:shadow-indigo-200 transition-shadow duration-300">
                    <Image
                      src={transaction.store.logo || "/placeholder.svg"}
                      alt={transaction.store.name}
                      width={48}
                      height={48}
                      className="object-cover"
                      unoptimized
                    />
                    {/* Admin indicator overlay */}
                    {transaction.admin && transaction.method === "ADMIN" && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full overflow-hidden border-2 border-white bg-purple-100 shadow-md">
                        <Image
                          src={transaction.admin.avatar || "/placeholder.svg"}
                          alt={transaction.admin.name}
                          width={20}
                          height={20}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm truncate max-w-[120px]">{transaction.store.name}</h3>
                    <span className="text-xs text-gray-500">{transaction.store.country}</span>
                  </div>
                </div>
                <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {transaction.amount.toLocaleString()} {transaction.currency}
                </span>
              </div>

              {/* Desktop: Original layout */}
              <div className="hidden sm:flex items-center gap-4 w-full">
                <div className="relative h-14 w-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-indigo-100 shadow-lg group-hover:shadow-indigo-200 transition-shadow duration-300">
                  <Image
                    src={transaction.store.logo || "/placeholder.svg"}
                    alt={transaction.store.name}
                    width={56}
                    height={56}
                    className="object-cover"
                    unoptimized
                  />
                  {/* Admin indicator overlay */}
                  {transaction.admin && transaction.method === "ADMIN" && (
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full overflow-hidden border-2 border-white bg-purple-100 shadow-md">
                      <Image
                        src={transaction.admin.avatar || "/placeholder.svg"}
                        alt={transaction.admin.name}
                        width={24}
                        height={24}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800 truncate">{transaction.store.name}</h3>
                      <Badge 
                        variant="outline" 
                        className={`${
                          transaction.type === "NEW" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100" 
                            : "bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100"
                        } text-xs shadow-sm`}
                      >
                        {getTransactionTypeLabel(transaction.type)}
                      </Badge>
                      {/* Admin payment indicator */}
                      {transaction.admin && transaction.method === "ADMIN" && (
                        <Badge 
                          variant="outline" 
                          className="bg-purple-50 text-purple-700 border-purple-200 shadow-purple-100 text-xs shadow-sm"
                        >
                          Admin Payment
                        </Badge>
                      )}
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {transaction.amount.toLocaleString()} {transaction.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Badges and info - responsive layout */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 text-xs sm:text-sm text-gray-500 w-full sm:w-auto sm:mt-2 flex-wrap">
                {/* Mobile: First row */}
                <div className="flex sm:hidden items-center gap-2 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className={`${
                      transaction.type === "NEW" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100" 
                        : "bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100"
                    } text-xs shadow-sm`}
                  >
                    {getTransactionTypeLabel(transaction.type)}
                  </Badge>
                  {/* Admin payment indicator */}
                  {transaction.admin && transaction.method === "ADMIN" && (
                    <Badge 
                      variant="outline" 
                      className="bg-purple-50 text-purple-700 border-purple-200 shadow-purple-100 text-xs shadow-sm"
                    >
                      Admin Payment
                    </Badge>
                  )}
                  <Badge variant="outline" className={`${getPlanBadgeColor(transaction.plan.id)} font-semibold group-hover:bg-opacity-70 transition-colors duration-300 text-xs`}>
                    {transaction.plan.name}
                  </Badge>
                </div>

                {/* Mobile: Second row */}
                <div className="flex sm:hidden items-center gap-2 flex-wrap">
                  <span className="bg-indigo-50/80 text-indigo-700 px-2 py-0.5 rounded-full font-medium text-xs">
                    {formatTimestamp(transaction.createdAt.seconds)}
                  </span>
                  <div className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full shadow-sm text-xs">
                    {getMethodIcon(transaction.method)}
                    <span className="font-medium">{getMethodLabel(transaction.method)}</span>
                    {/* Show admin name for admin payments */}
                    {transaction.admin && transaction.method === "ADMIN" && (
                      <>
                        <span className="text-gray-300">by</span>
                        <span className="font-semibold text-purple-700">{transaction.admin.name}</span>
                      </>
                    )}
                  </div>
                  <span className={`font-medium px-2 py-0.5 rounded-full ${getDurationColor(transaction.plan.duration)} text-xs`}>
                    {getDurationLabel(transaction.plan.duration)}
                  </span>
                </div>

                {/* Desktop: Original single row layout */}
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 mt-2 flex-wrap">
                  <span className="bg-indigo-50/80 text-indigo-700 px-2.5 py-1 rounded-full font-medium group-hover:bg-indigo-100/80 transition-colors duration-300">
                    {formatTimestamp(transaction.createdAt.seconds)}
                  </span>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-full shadow-sm">
                    {getMethodIcon(transaction.method)}
                    <span className="font-medium">{getMethodLabel(transaction.method)}</span>
                    {/* Show admin name for admin payments */}
                    {transaction.admin && transaction.method === "ADMIN" && (
                      <>
                        <span className="text-gray-300">by</span>
                        <span className="font-semibold text-purple-700">{transaction.admin.name}</span>
                      </>
                    )}
                  </div>
                  <span className="text-gray-300">•</span>
                  <Badge variant="outline" className={`${getPlanBadgeColor(transaction.plan.id)} font-semibold group-hover:bg-opacity-70 transition-colors duration-300`}>
                    {transaction.plan.name}
                  </Badge>
                  <span className="text-gray-300">•</span>
                  <span className={`font-medium px-2.5 py-1 rounded-full ${getDurationColor(transaction.plan.duration)}`}>
                    {getDurationLabel(transaction.plan.duration)}
                  </span>
                </div>
              </div>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="right" className="p-4 sm:p-6 max-w-sm bg-white rounded-xl shadow-xl border border-indigo-100 hidden sm:block">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-indigo-200 shadow-lg">
                  <Image
                    src={transaction.store.logo || "/placeholder.svg"}
                    alt={transaction.store.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-800">{transaction.store.name}</h4>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <span>ID: {transaction.store.merchantId}</span>
                    <span className="text-gray-300">•</span>
                    <span className="uppercase font-medium">{transaction.store.country}</span>
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-3 rounded-xl">
                  <p className="text-gray-500 mb-1">Amount</p>
                  <p className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    {transaction.amount.toLocaleString()} {transaction.currency}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl">
                  <p className="text-gray-500 mb-1">Payment Method</p>
                  <div className="flex items-center gap-2 font-bold text-purple-700">
                    {getMethodIcon(transaction.method)}
                    {getMethodLabel(transaction.method)}
                  </div>
                  {/* Show admin info in tooltip for admin payments */}
                  {transaction.admin && transaction.method === "ADMIN" && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="relative h-6 w-6 rounded-full overflow-hidden border border-purple-200">
                        <Image
                          src={transaction.admin.avatar || "/placeholder.svg"}
                          alt={transaction.admin.name}
                          width={24}
                          height={24}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="text-xs text-purple-600 font-medium">{transaction.admin.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {transaction.kashierLink && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-xl border border-emerald-100">
                  <p className="text-sm text-emerald-800 font-medium flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Payment Link Available
                  </p>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
        </TooltipProvider>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-white to-indigo-50 border-0 shadow-2xl shadow-indigo-200/30">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5 pointer-events-none"></div>
          
          <DialogHeader className="pt-6 sm:pt-8 px-4 sm:px-6 pb-4 border-b border-indigo-100/30">
            <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Store Information */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-indigo-100 shadow-lg mx-auto sm:mx-0">
                <Image
                  src={transaction.store.logo || "/placeholder.svg"}
                  alt={transaction.store.name}
                  width={64}
                  height={64}
                  className="object-cover"
                  unoptimized
                />
              </div>
              
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">{transaction.store.name}</h3>
                <p className="text-gray-500 text-sm flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span>{transaction.store.country}</span>
                  {transaction.store.link && (
                    <>
                      <span className="text-gray-500 hidden sm:inline">•</span>
                      <Link 
                        href={transaction.store.link} 
                        target="_blank" 
                        className="text-indigo-600 hover:text-indigo-800 flex items-center justify-center sm:justify-start gap-1 transition-colors"
                      >
                        Visit store <ExternalLink size={12} />
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </div>
            
            {/* Transaction ID */}
            <div className="bg-indigo-50/50 rounded-xl p-3 sm:p-4 border border-indigo-100/30">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">Transaction ID</div>
              <div className="font-mono text-sm sm:text-base text-gray-700 flex items-center justify-between">
                <span className="truncate">{transaction.id}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(transaction.id);
                  }}
                  className="ml-2 text-indigo-600 hover:text-indigo-800 p-1 rounded-md hover:bg-indigo-100/50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Payment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 sm:p-4 border border-emerald-100/30 shadow-sm">
                <div className="text-xs sm:text-sm text-emerald-600 mb-1">Amount</div>
                <div className="text-lg sm:text-xl font-bold text-emerald-700">
                  {transaction.amount.toLocaleString()} {transaction.currency}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-purple-100/30 shadow-sm">
                <div className="text-xs sm:text-sm text-purple-600 mb-1">Payment Method</div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0">
                    {getMethodIcon(transaction.method)}
                  </div>
                  <span className="font-medium text-sm sm:text-base text-purple-700">{getMethodLabel(transaction.method)}</span>
                </div>
              </div>
            </div>
            
            {/* Subscription Details */}
            <div className="bg-white rounded-xl p-3 sm:p-4 border border-indigo-100/30 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                <div className="text-xs sm:text-sm text-gray-500">Subscription Plan</div>
                <Badge className={`${getPlanBadgeColor(transaction.plan.id)} text-xs sm:text-sm w-fit`}>
                  {transaction.plan.duration}
                </Badge>
              </div>
              <div className="text-base sm:text-lg font-bold text-gray-800">{transaction.plan.name}</div>
              <div className="text-xs sm:text-sm text-gray-500">
                Created on {formatTimestamp(transaction.createdAt.seconds)}
              </div>
            </div>
            
            {/* Payment Link */}
            {transaction.kashierLink && (
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-3 sm:p-4 text-white shadow-lg shadow-indigo-200/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/20 flex items-center justify-center">
                      <ExternalLink size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-white/80 mb-1">Payment Link</div>
                      <div className="font-medium text-sm sm:text-base">Available</div>
                    </div>
                  </div>
                  <Link
                    href={transaction.kashierLink}
                    target="_blank"
                    className="px-3 sm:px-4 py-2 bg-white rounded-lg text-indigo-600 font-medium hover:bg-indigo-50 transition-colors shadow-md text-sm sm:text-base text-center"
                  >
                    Open Link
                  </Link>
                </div>
              </div>
            )}
            
            {/* Admin Info */}
            {transaction.admin && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
                <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 mx-auto sm:mx-0">
                  <Image
                    src={transaction.admin.avatar || "/placeholder.svg"}
                    alt={transaction.admin.name}
                    width={40}
                    height={40}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Created by</div>
                  <div className="font-medium text-sm sm:text-base text-gray-800">{transaction.admin.name}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 sm:p-6 pt-0 flex justify-center sm:justify-end">
            <button
              onClick={() => setShowDetails(false)}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-md shadow-indigo-200/30"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

