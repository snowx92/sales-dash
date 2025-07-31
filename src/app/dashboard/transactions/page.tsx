"use client"

import { useEffect, useState } from "react"
import { TransactionList } from "@/components/transaction/transaction-list"
// import { fetchTransactions } from "@/lib/api/Subscribtions/transactionService"
// import type { Transaction } from "@/lib/api/Subscribtions/types"
import { motion } from "framer-motion"

const ITEMS_PER_PAGE = 5

// Mock Transaction type - matching the component's expected structure
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
  kashierLink?: string
}

// Dummy data for transactions
const mockTransactions: Transaction[] = [
  {
    id: "txn_001",
    amount: 299,
    currency: "EGP",
    status: "completed",
    paymentMethod: "CARD",
    type: "subscription",
    method: "CARD",
    createdAt: {
      seconds: 1705315800,
      _seconds: 1705315800,
      _nanoseconds: 0
    },
    user: {
      name: "Ahmed Hassan",
      phone: "+201234567890",
      email: "ahmed@example.com"
    },
    store: {
      name: "Ahmed Hassan Store",
      country: "Egypt",
      merchantId: "merchant_001",
      link: "https://ahmedstore.vondera.app"
    },
    plan: {
      id: "pro_plan",
      name: "Pro Plan",
      duration: "monthly"
    }
  },
  {
    id: "txn_002",
    amount: 199,
    currency: "EGP",
    status: "completed",
    paymentMethod: "WALLET",
    type: "subscription",
    method: "WALLET",
    createdAt: {
      seconds: 1705229400,
      _seconds: 1705229400,
      _nanoseconds: 0
    },
    user: {
      name: "Sarah Ahmed",
      phone: "+201234567891",
      email: "sarah@example.com"
    },
    store: {
      name: "Sarah Ahmed Shop",
      country: "Egypt",
      merchantId: "merchant_002"
    },
    plan: {
      id: "starter_plan",
      name: "Starter Plan",
      duration: "monthly"
    }
  },
  {
    id: "txn_003",
    amount: 499,
    currency: "EGP",
    status: "pending",
    paymentMethod: "BANK_TRANSFER",
    type: "subscription",
    method: "BANK_TRANSFER",
    createdAt: {
      seconds: 1705143000,
      _seconds: 1705143000,
      _nanoseconds: 0
    },
    user: {
      name: "Mohamed Ali",
      phone: "+201234567892"
    },
    store: {
      name: "Mohamed Ali Store",
      country: "Egypt",
      merchantId: "merchant_003"
    },
    plan: {
      id: "plus_plan",
      name: "Plus Plan",
      duration: "monthly"
    }
  },
  {
    id: "txn_004",
    amount: 150,
    currency: "EGP",
    status: "completed",
    paymentMethod: "ADMIN",
    type: "adjustment",
    method: "ADMIN",
    createdAt: {
      seconds: 1705056600,
      _seconds: 1705056600,
      _nanoseconds: 0
    },
    store: {
      name: "Fatima Omar Boutique",
      country: "Egypt",
      merchantId: "merchant_004"
    },
    plan: {
      id: "starter_plan",
      name: "Starter Plan",
      duration: "monthly"
    },
    admin: {
      name: "Admin User",
      email: "admin@vondera.app"
    }
  },
  {
    id: "txn_005",
    amount: 299,
    currency: "EGP",
    status: "failed",
    paymentMethod: "CARD",
    type: "subscription",
    method: "CARD",
    createdAt: {
      seconds: 1704970200,
      _seconds: 1704970200,
      _nanoseconds: 0
    },
    user: {
      name: "Omar Khalil",
      phone: "+201234567893"
    },
    store: {
      name: "Omar Khalil Electronics",
      country: "Egypt",
      merchantId: "merchant_005"
    },
    plan: {
      id: "pro_plan",
      name: "Pro Plan",
      duration: "monthly"
    }
  },
  {
    id: "txn_006",
    amount: 999,
    currency: "EGP",
    status: "completed",
    paymentMethod: "CARD",
    type: "subscription",
    method: "CARD",
    createdAt: {
      seconds: 1704883800,
      _seconds: 1704883800,
      _nanoseconds: 0
    },
    user: {
      name: "Nour Hassan",
      phone: "+201234567894",
      email: "nour@example.com"
    },
    store: {
      name: "Nour Fashion Store",
      country: "Egypt",
      merchantId: "merchant_006"
    },
    plan: {
      id: "enterprise_plan",
      name: "Enterprise Plan",
      duration: "monthly"
    }
  },
  {
    id: "txn_007",
    amount: 199,
    currency: "EGP",
    status: "completed",
    paymentMethod: "WALLET",
    type: "renewal",
    method: "WALLET",
    createdAt: {
      seconds: 1704797400,
      _seconds: 1704797400,
      _nanoseconds: 0
    },
    user: {
      name: "Ali Mohamed",
      phone: "+201234567895"
    },
    store: {
      name: "Ali Tech Solutions",
      country: "Egypt",
      merchantId: "merchant_007"
    },
    plan: {
      id: "starter_plan",
      name: "Starter Plan",
      duration: "monthly"
    }
  },
  {
    id: "txn_008",
    amount: 299,
    currency: "EGP",
    status: "completed",
    paymentMethod: "CARD",
    type: "subscription",
    method: "CARD",
    createdAt: {
      seconds: 1704711000,
      _seconds: 1704711000,
      _nanoseconds: 0
    },
    user: {
      name: "Layla Ahmed",
      phone: "+201234567896"
    },
    store: {
      name: "Layla Beauty Center",
      country: "Egypt",
      merchantId: "merchant_008"
    },
    plan: {
      id: "pro_plan",
      name: "Pro Plan",
      duration: "monthly"
    }
  },
  {
    id: "txn_009",
    amount: 75,
    currency: "EGP",
    status: "completed",
    paymentMethod: "ADMIN",
    type: "refund",
    method: "ADMIN",
    createdAt: {
      seconds: 1704624600,
      _seconds: 1704624600,
      _nanoseconds: 0
    },
    store: {
      name: "Mahmoud Sports Store",
      country: "Egypt",
      merchantId: "merchant_009"
    },
    plan: {
      id: "starter_plan",
      name: "Starter Plan",
      duration: "monthly"
    },
    admin: {
      name: "Support Team",
      email: "support@vondera.app"
    }
  },
  {
    id: "txn_010",
    amount: 499,
    currency: "EGP",
    status: "completed",
    paymentMethod: "BANK_TRANSFER",
    type: "subscription",
    method: "BANK_TRANSFER",
    createdAt: {
      seconds: 1704538200,
      _seconds: 1704538200,
      _nanoseconds: 0
    },
    user: {
      name: "Rania Omar",
      phone: "+201234567897"
    },
    store: {
      name: "Rania Home Decor",
      country: "Egypt",
      merchantId: "merchant_010"
    },
    plan: {
      id: "plus_plan",
      name: "Plus Plan",
      duration: "monthly"
    }
  },
  {
    id: "txn_011",
    amount: 199,
    currency: "EGP",
    status: "pending",
    paymentMethod: "CARD",
    type: "subscription",
    method: "CARD",
    createdAt: {
      seconds: 1704451800,
      _seconds: 1704451800,
      _nanoseconds: 0
    },
    user: {
      name: "Hassan Ali",
      phone: "+201234567898"
    },
    store: {
      name: "Hassan Auto Parts",
      country: "Egypt",
      merchantId: "merchant_011"
    },
    plan: {
      id: "starter_plan",
      name: "Starter Plan",
      duration: "monthly"
    }
  },
  {
    id: "txn_012",
    amount: 299,
    currency: "EGP",
    status: "completed",
    paymentMethod: "WALLET",
    type: "renewal",
    method: "WALLET",
    createdAt: {
      seconds: 1704365400,
      _seconds: 1704365400,
      _nanoseconds: 0
    },
    user: {
      name: "Dina Mohamed",
      phone: "+201234567899"
    },
    store: {
      name: "Dina Kids Store",
      country: "Egypt",
      merchantId: "merchant_012"
    },
    plan: {
      id: "pro_plan",
      name: "Pro Plan",
      duration: "monthly"
    }
  }
]

// Mock API response structure
interface MockResponse {
  items: Transaction[]
  nextPageNumber: number
  isLastPage: boolean
  totalItems: number
}

// Mock fetch function
const mockFetchTransactions = async (page: number, itemsPerPage: number): Promise<MockResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const items = mockTransactions.slice(startIndex, endIndex)
  
  return {
    items,
    nextPageNumber: page + 1,
    isLastPage: endIndex >= mockTransactions.length,
    totalItems: mockTransactions.length
  }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([]))

  // Load more transactions
  const loadMore = async () => {
    if (loading || !hasMore || loadedPages.has(currentPage)) return

    try {
      setLoading(true)
      const response = await mockFetchTransactions(currentPage, ITEMS_PER_PAGE)
      
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
        return [...prev, ...newTransactions]
      })
      
      setCurrentPage(response.nextPageNumber)
      setHasMore(!response.isLastPage)
      setTotalItems(response.totalItems)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    const initialFetch = async () => {
      try {
        setLoading(true)
        const response = await mockFetchTransactions(1, ITEMS_PER_PAGE)
        
        if (!response) {
          throw new Error('Failed to fetch transactions')
        }

        setLoadedPages(new Set([1]))
        setTransactions(response.items)
        setCurrentPage(response.nextPageNumber)
        setHasMore(!response.isLastPage)
        setTotalItems(response.totalItems)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching transactions:", error)
        setLoading(false)
      }
    }

    initialFetch()
  }, [])

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
            <div className="bg-white rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium shadow-lg border border-indigo-100 flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-green-400 animate-pulse"></span>
              <span>
                {transactions.length} of {totalItems || "..."} transactions
              </span>
            </div>
            {/* Admin payments indicator */}
            {transactions.filter(t => t.admin && t.method === "ADMIN").length > 0 && (
              <div className="bg-purple-50 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium shadow-lg border border-purple-200 flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-purple-400"></span>
                <span className="text-purple-700">
                  {transactions.filter(t => t.admin && t.method === "ADMIN").length} Admin Payment{transactions.filter(t => t.admin && t.method === "ADMIN").length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        <TransactionList transactions={transactions} loading={loading} hasMore={hasMore} onLoadMore={loadMore} />
      </div>
    </div>
  )
}

