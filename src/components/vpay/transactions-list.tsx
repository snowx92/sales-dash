"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, WalletIcon, Building, MoreVertical, Receipt, CreditCardIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
// import type { Transaction } from "@/lib/api/vpay/types" // Commented out API types
import { Pagination } from "@/components/tables/Pagination"

// Frontend-only type definition
interface Transaction {
  id: string
  totalAmount: number
  amountAfterFees: number
  commission: number
  method: string
  orderId: string
  orderLink: string
  kashierLink: string
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

interface TransactionsListProps {
  transactions: Transaction[]
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export default function TransactionsList({ 
  transactions, 
  currentPage, 
  totalItems,
  onPageChange,
  isLoading = false 
}: TransactionsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getMethodIcon = (method: string) => {
    switch (method.toUpperCase()) {
      case "CARD":
        return <CreditCardIcon className="h-5 w-5 text-purple-600" />
      case "WALLET":
        return <WalletIcon className="h-5 w-5 text-purple-600" />
      default:
        return <Building className="h-5 w-5 text-purple-600" />
    }
  }

  const formatDate = (seconds: number) => {
    const date = new Date(seconds * 1000)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Latest Transactions</h2>
        <div className="text-sm text-gray-700">
          Total: {totalItems.toLocaleString()} transactions
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-700 mt-4">Loading transactions...</p>
        </div>
      )}

      <AnimatePresence>
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="relative overflow-hidden"
          >
            <motion.div
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-purple-200 hover:shadow-md transition-all cursor-pointer"
              onClick={() => toggleExpand(transaction.id)}
              whileHover={{ scale: 1.01 }}
              layoutId={`transaction-${transaction.id}`}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  {getMethodIcon(transaction.method)}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <Image
                      src={transaction.owner.store.logo || "/store-placeholder.png"}
                      alt={transaction.owner.store.name}
                      width={24}
                      height={24}
                      className="rounded-full mr-2"
                    />
                    <span className="font-medium text-gray-900">{transaction.owner.store.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">Order #{transaction.orderId}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="font-bold text-purple-800">
                    {Math.floor(transaction.totalAmount).toLocaleString()} EGP
                  </span>
                  <div className="text-xs text-gray-500">{formatDate(transaction.createdAt._seconds)}</div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpand(transaction.id)
                  }}
                >
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </motion.div>

            {expandedId === transaction.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-b-xl mt-1 border border-purple-100 shadow-inner"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/70 p-3 rounded-lg backdrop-blur-sm">
                    <p className="text-xs text-purple-500 font-medium mb-1">Amount After Fees</p>
                    <p className="font-medium text-gray-800">
                      {Math.floor(transaction.amountAfterFees).toLocaleString()} EGP
                    </p>
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg backdrop-blur-sm">
                    <p className="text-xs text-purple-500 font-medium mb-1">Commission</p>
                    <p className="font-medium text-gray-800">
                      {Math.floor(transaction.commission).toLocaleString()} EGP
                    </p>
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg backdrop-blur-sm">
                    <p className="text-xs text-purple-500 font-medium mb-1">Payment Method</p>
                    <p className="font-medium text-gray-800 flex items-center">
                      {getMethodIcon(transaction.method)}
                      <span className="ml-1">{transaction.method}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      {transaction.owner.user.avatar ? (
                        <Image
                          src={transaction.owner.user.avatar}
                          alt={transaction.owner.user.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="text-xs font-medium text-purple-600">
                          {transaction.owner.user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">{transaction.owner.user.name}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-purple-600 border-purple-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExternalLink(transaction.orderLink)
                      }}
                    >
                      <Receipt className="h-4 w-4 mr-1" />
                      View Order
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-purple-600 border-purple-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExternalLink(transaction.kashierLink)
                      }}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Kashier Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {transactions.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <p className="text-gray-700 font-medium">No transactions found</p>
        </div>
      )}

      {transactions.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={12}
          onPageChange={onPageChange}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}

