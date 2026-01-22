"use client"

import { useEffect, useState } from "react"
import { TransactionList } from "@/components/transaction/transaction-list"
import { transactionService } from "@/lib/api/transactions/transactionService"
import type { Transaction as ApiTransaction } from "@/lib/api/transactions/types"
import { motion } from "framer-motion"

const ITEMS_PER_PAGE = 10

// Map API transaction to component-expected format
const mapApiTransaction = (apiTx: ApiTransaction): Transaction | null => {
  // Validate required fields
  if (!apiTx.store || !apiTx.plan) {
    console.warn("⚠️ Transaction missing required fields:", {
      id: apiTx.id,
      hasStore: !!apiTx.store,
      hasPlan: !!apiTx.plan
    });
    return null;
  }

  return {
    id: apiTx.id,
    amount: apiTx.amount,
    currency: apiTx.currency,
    status: "completed", // Default status since API doesn't provide this
    paymentMethod: apiTx.method,
    type: apiTx.type || "subscription", // Use API type (RENEW/NEW)
    method: apiTx.method,
    createdAt: {
      seconds: apiTx.createdAt._seconds,
      _seconds: apiTx.createdAt._seconds,
      _nanoseconds: apiTx.createdAt._nanoseconds
    },
    store: {
      name: apiTx.store.name,
      logo: apiTx.store.logo,
      country: apiTx.store.country,
      merchantId: apiTx.store.merchantId,
      link: apiTx.store.link
    },
    plan: {
      id: apiTx.plan.id,
      name: apiTx.plan.name,
      duration: apiTx.plan.duration
    },
    admin: apiTx.admin ? {
      name: apiTx.admin.name,
      email: apiTx.admin.email,
      avatar: apiTx.admin.avatar
    } : undefined,
    kashierLink: apiTx.kashierLink,
    discountCode: apiTx.discountCode
  };
};

// Component Transaction type - keeping for compatibility with existing TransactionList component
interface Transaction {
  id: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  type: string
  method: string
  createdAt: {
    seconds: number
    _seconds: number
    _nanoseconds: number
  }
  user?: {
    name: string
    phone: string
    email?: string
  }
  store: {
    name: string
    logo?: string
    country: string
    merchantId: string
    link?: string
  }
  plan: {
    id: string
    name: string
    duration: string
  }
  admin?: {
    name: string
    avatar?: string
    email?: string
  }
  kashierLink?: string | null
  discountCode?: string
}

// API response structure
interface ApiResponse {
  items: Transaction[]
  nextPageNumber: number
  isLastPage: boolean
  totalItems: number
}

// Fetch transactions from API
const fetchTransactions = async (page: number, itemsPerPage: number): Promise<ApiResponse> => {
  try {
    console.log("📊 Fetching transactions for page:", page, "with limit:", itemsPerPage);
    
    const apiData = await transactionService.getTransactions({
      pageNo: page,
      limit: itemsPerPage
    });

    console.log("📊 Raw API response:", apiData);

    if (!apiData) {
      throw new Error('No response from transactions API');
    }

    // The ApiService returns the 'data' property directly for non-auth endpoints
    // So 'apiData' is: { items, pageItems, totalItems, isLastPage, nextPageNumber, currentPage, totalPages }
    
    if (!apiData.items) {
      throw new Error('Invalid response structure from transactions API');
    }

    console.log("📊 API data items:", apiData.items.length);

    // Map API transactions to component format and filter out invalid ones
    const mappedTransactions = apiData.items
      .map(mapApiTransaction)
      .filter((tx): tx is Transaction => tx !== null);

    console.log("📊 Mapped transactions:", mappedTransactions.length);

    return {
      items: mappedTransactions,
      nextPageNumber: apiData.nextPageNumber,
      isLastPage: apiData.isLastPage,
      totalItems: apiData.totalItems
    };
  } catch (error) {
    console.error("🚨 Error fetching transactions:", error);
    throw error;
  }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([]))

  // Load more transactions
  const loadMore = async () => {
    if (loading || !hasMore || loadedPages.has(currentPage)) {
      console.log("📊 Skipping loadMore:", { loading, hasMore, alreadyLoaded: loadedPages.has(currentPage) });
      return;
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log("📊 Loading page:", currentPage);
      const response = await fetchTransactions(currentPage, ITEMS_PER_PAGE)
      
      if (!response) {
        throw new Error('Failed to fetch transactions')
      }

      // Add current page to loaded pages
      setLoadedPages(prev => new Set([...prev, currentPage]))

      setTransactions(prev => {
        // Filter out any potential duplicates by ID
        const newTransactions = response.items.filter(
          (newTx: Transaction) => !prev.some(existingTx => existingTx.id === newTx.id)
        )
        console.log("📊 Adding new transactions:", newTransactions.length);
        return [...prev, ...newTransactions]
      })
      
      setCurrentPage(response.nextPageNumber)
      setHasMore(!response.isLastPage)
      setTotalItems(response.totalItems)
      
    } catch (error) {
      console.error("🚨 Error loading more transactions:", error);
      setError(error instanceof Error ? error.message : 'Failed to load transactions');
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    const initialFetch = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log("📊 Initial fetch starting...");
        const response = await fetchTransactions(1, ITEMS_PER_PAGE)
        
        if (!response) {
          throw new Error('Failed to fetch transactions')
        }

        console.log("📊 Initial fetch successful:", response.items.length, "items");
        
        setLoadedPages(new Set([1]))
        setTransactions(response.items)
        setCurrentPage(response.nextPageNumber)
        setHasMore(!response.isLastPage)
        setTotalItems(response.totalItems)
        
      } catch (error) {
        console.error("🚨 Error in initial fetch:", error);
        setError(error instanceof Error ? error.message : 'Failed to load transactions');
      } finally {
        setLoading(false)
      }
    }

    initialFetch()
  }, []) // Empty dependency array to prevent re-runs

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start justify-between mb-8 sm:mb-10 gap-4 sm:gap-6"
        >
          <div className="w-full">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Transactions
            </h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">View and manage your subscription payments</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold shadow-lg border border-indigo-200 flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-green-500 animate-pulse shadow-sm"></span>
              <span className="text-indigo-700">
                {transactions.length} of {totalItems || "..."} transactions
              </span>
            </div>
            {/* Admin payments indicator */}
            {transactions.filter(t => t.admin && t.method === "ADMIN").length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold shadow-lg border border-purple-300 flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-purple-500 shadow-sm"></span>
                <span className="text-purple-800">
                  {transactions.filter(t => t.admin && t.method === "ADMIN").length} Admin Payment{transactions.filter(t => t.admin && t.method === "ADMIN").length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-400"></span>
              <span className="text-red-700 font-medium">Error loading transactions</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Try again
            </button>
          </motion.div>
        )}

        <TransactionList transactions={transactions} loading={loading} hasMore={hasMore} onLoadMore={loadMore} />
      </div>
    </div>
  )
}

