"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { DateGroup } from "@/components/transaction/date-group"
// import type { Transaction } from "../../lib/api/Subscribtions/types" // Commented out API types
import { Skeleton } from "@/components/transaction/ui/skeleton"

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
  kashierLink?: string | null;
  discountCode?: string;
}

// Utility function moved directly to this component
function groupTransactionsByDate(transactions: Transaction[]): Array<{ 
  date: string; 
  transactions: Transaction[]; 
  totalAmount: number; 
}> {
  // First, deduplicate transactions by ID
  const uniqueTransactions = Array.from(
    new Map(transactions.map(transaction => [transaction.id, transaction])).values()
  );
  
  const grouped: Record<string, Transaction[]> = {}

  uniqueTransactions.forEach((transaction) => {
    // Use seconds or _seconds depending on what's available
    const timestampSeconds = transaction.createdAt.seconds || transaction.createdAt._seconds || 0;
    const date = new Date(timestampSeconds * 1000)
    const dateStr = date.toISOString().split('T')[0] // Format: yyyy-MM-dd

    if (!grouped[dateStr]) {
      grouped[dateStr] = []
    }

    grouped[dateStr].push(transaction)
  })

  const result = Object.entries(grouped)
    .map(([date, txns]) => {
      const totalAmount = txns.reduce((sum, txn) => sum + txn.amount, 0)
      return {
        date,
        transactions: txns,
        totalAmount,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return result
}

interface TransactionListProps {
  transactions: Transaction[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
}

export function TransactionList({ transactions, loading, hasMore, onLoadMore }: TransactionListProps) {
  const observer = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (loading) return

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore()
        }
      },
      { threshold: 0.5 },
    )

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [loading, hasMore, onLoadMore])

  // Group transactions by date
  const dailyTransactions = groupTransactionsByDate(transactions)

  if (transactions.length === 0 && loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-indigo-100/40 shadow-xl shadow-indigo-100/20 overflow-hidden backdrop-blur-sm"
          >
            <div className="p-6 border-b border-indigo-100/30 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
              <Skeleton className="h-8 w-48 bg-indigo-100/60" />
              <Skeleton className="h-4 w-32 mt-2 bg-indigo-100/60" />
            </div>
            <div className="p-6 space-y-5">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full bg-indigo-100/60" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full bg-indigo-100/60" />
                    <Skeleton className="h-4 w-3/4 bg-indigo-100/60" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        {dailyTransactions.map((day: { date: string, transactions: Transaction[], totalAmount: number }, index: number) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <DateGroup day={day} />
          </motion.div>
        ))}
      </div>

      <div ref={loadMoreRef} className="py-10 flex justify-center">
        {loading && (
          <div className="flex items-center gap-3 text-indigo-600 font-medium">
            <div className="h-5 w-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            <span>Loading more transactions...</span>
          </div>
        )}

        {!hasMore && transactions.length > 0 && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-lg shadow-indigo-200">
              You&apos;ve reached the end of the list
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}

