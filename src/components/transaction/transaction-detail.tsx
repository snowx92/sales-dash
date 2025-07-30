"use client"

import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ExternalLink, Copy, Check, CreditCard, Calendar, Tag, User, Wallet, CreditCardIcon } from "lucide-react"
import { useState } from "react"
// import type { Transaction } from "../../lib/api/Subscribtions/types" // Commented out API types
import { Badge } from "@/components/transaction/ui/badge"

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
    _seconds: number;
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
import { Button } from "@/components/transaction/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

// Utility functions
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
      return "text-blue-600"
    case "QUARTER":
      return "text-green-600"
    case "YEAR":
      return "text-purple-600"
    default:
      return "text-gray-600"
  }
}

interface TransactionDetailProps {
  transaction: Transaction
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionDetail({ transaction, open, onOpenChange }: TransactionDetailProps) {
  const [copied, setCopied] = useState(false)

  const copyTransactionId = () => {
    navigator.clipboard.writeText(transaction.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-b from-white to-indigo-50/50 border border-indigo-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">Transaction Details</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span className="text-gray-500">ID: {transaction.id}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={copyTransactionId}>
              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-gray-400" />}
            </Button>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-indigo-200 shadow-lg">
              <Image
                src={transaction.store.logo || "/placeholder.svg?height=64&width=64"}
                alt={transaction.store.name}
                fill
                className="object-cover"
              />
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-800">{transaction.store.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>ID: {transaction.store.merchantId}</span>
                <span className="text-gray-300">•</span>
                <span className="uppercase">{transaction.store.country}</span>
              </div>
              {transaction.store.link && (
                <Link
                  href={transaction.store.link}
                  target="_blank"
                  className="text-indigo-600 flex items-center gap-1 text-sm mt-1.5 hover:text-indigo-700 transition-colors font-medium"
                >
                  Visit Store <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-indigo-100/50">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Amount</span>
                </div>
                <p className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {transaction.amount.toLocaleString()} {transaction.currency}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Date & Time</span>
                </div>
                <p className="font-medium">{format(new Date((transaction.createdAt.seconds || transaction.createdAt._seconds || 0) * 1000), "PPP p")}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1.5">
                  <div className="h-3.5 w-3.5 text-indigo-500">{getMethodIcon(transaction.method)}</div>
                  <span>Payment Method</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                    {getMethodLabel(transaction.method)}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1.5">
                  <Tag className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Transaction Type</span>
                </div>
                <Badge
                  variant={transaction.type === "NEW" ? "default" : "secondary"}
                  className={transaction.type === "NEW" ? "bg-green-500" : "bg-blue-500"}
                >
                  {getTransactionTypeLabel(transaction.type)}
                </Badge>
              </div>

              <div className="col-span-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Subscription</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`${getPlanBadgeColor(transaction.plan.id)} font-semibold text-sm`}
                  >
                    {transaction.plan.name}
                  </Badge>
                  <span className="text-gray-300">•</span>
                  <span
                    className={`font-medium ${getDurationColor(transaction.plan.duration)}`}
                  >
                    {getDurationLabel(transaction.plan.duration)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {transaction.kashierLink && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100"
            >
              <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Link</h4>
              <Link
                href={transaction.kashierLink}
                target="_blank"
                className="text-indigo-600 flex items-center gap-1 hover:text-indigo-700 transition-colors font-medium"
              >
                View on Kashier <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          )}

          {transaction.admin && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100"
            >
              <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="h-3.5 w-3.5 text-indigo-500" />
                <span>Processed By</span>
              </h4>
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-indigo-200 shadow-md">
                  <Image
                    src={transaction.admin.avatar || "/placeholder.svg?height=40&width=40"}
                    alt={transaction.admin.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{transaction.admin.name}</p>
                  <p className="text-sm text-gray-500">{transaction.admin.email}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700 hover:text-indigo-800"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

