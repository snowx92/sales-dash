"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/vpay/ui/vpay-tabs"
import { Card } from "@/components/vpay/ui/vpay-card"
import { Input } from "@/components/vpay/ui/vpay-input"
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react"
import CreditCard from "@/components/vpay/credit-card"
import PayoutsList from "@/components/vpay/payouts-list"
import ActiveWallets from "@/components/vpay/active-wallets"
import { Badge } from "@/components/vpay/ui/vpay-badge"
import TransactionsList from "@/components/vpay/transactions-list"
import { VPayService } from "@/lib/api/vpay/VPayService"
import { Balance, Payout, PayoutStatus, StoreWithBalance, Transaction } from "@/lib/api/vpay/types"
import ConfirmToast from "@/components/ui/confirm-toast"
import { Toast } from "@/components/ui/toast"
import { ResponsiveWrapper, ResponsiveCard } from "@/components/layout/ResponsiveWrapper"
import { motion, AnimatePresence } from "framer-motion"

// Mobile filter panel component
const MobileFilterPanel = ({ 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter, 
  activeTab 
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: PayoutStatus;
  setStatusFilter: (value: PayoutStatus) => void;
  activeTab: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="lg:hidden mb-6">
      <ResponsiveCard padding="sm">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-900">Search & Filters</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-4"
            >
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    className="pl-9 bg-white border-gray-200 rounded-lg text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Filters - Only for payouts tab */}
              {activeTab === "payouts" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Badge
                      variant={statusFilter === "Pending" ? "default" : "outline"}
                      className="cursor-pointer px-3 py-2 bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 text-center justify-center"
                      onClick={() => setStatusFilter("Pending")}
                    >
                      Pending
                    </Badge>
                    <Badge
                      variant={statusFilter === "Success" ? "default" : "outline"}
                      className="cursor-pointer px-3 py-2 bg-green-100 text-green-800 hover:bg-green-200 border-green-200 text-center justify-center"
                      onClick={() => setStatusFilter("Success")}
                    >
                      Success
                    </Badge>
                    <Badge
                      variant={statusFilter === "Failed" ? "default" : "outline"}
                      className="cursor-pointer px-3 py-2 bg-red-100 text-red-800 hover:bg-red-200 border-red-200 text-center justify-center"
                      onClick={() => setStatusFilter("Failed")}
                    >
                      Failed
                    </Badge>
                    <Badge
                      variant={statusFilter === "Canceled" ? "default" : "outline"}
                      className="cursor-pointer px-3 py-2 bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200 text-center justify-center"
                      onClick={() => setStatusFilter("Canceled")}
                    >
                      Canceled
                    </Badge>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </ResponsiveCard>
    </div>
  );
};

export default function VPayPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [wallets, setWallets] = useState<StoreWithBalance[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activeTab, setActiveTab] = useState("payouts")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<PayoutStatus>("Pending")
  const [balance, setBalance] = useState<Balance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showConfirmToast, setShowConfirmToast] = useState(false)
  const [selectedPayout, setSelectedPayout] = useState<{ id: string; status: PayoutStatus } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [walletsPage, setWalletsPage] = useState(1)
  const [walletsTotalPages, setWalletsTotalPages] = useState(1)
  const [walletsTotalItems, setWalletsTotalItems] = useState(0)
  const [isWalletsLoading, setIsWalletsLoading] = useState(false)
  const [transactionsPage, setTransactionsPage] = useState(1)
  const [transactionsTotalPages, setTransactionsTotalPages] = useState(1)
  const [transactionsTotalItems, setTransactionsTotalItems] = useState(0)
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false)

  // Define fetchTransactions with useCallback to prevent dependency loops
  const fetchTransactions = useCallback(async () => {
    setIsTransactionsLoading(true)
    try {
      const vpayService = new VPayService()
      const transactionsData = await vpayService.getTransactions(transactionsPage, 5, searchQuery)
      console.log('Fetched transactions data:', transactionsData)
      setTransactions(transactionsData.items)
      setTransactionsTotalPages(transactionsData.totalPages)
      setTransactionsTotalItems(transactionsData.totalItems)
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
      Toast.error({
        message: "Failed to Load Transactions",
        description: "There was an error loading the transactions. Please try again."
      })
    } finally {
      setIsTransactionsLoading(false)
    }
  }, [transactionsPage, searchQuery])

  // Separate useEffect for fetching wallets data
  useEffect(() => {
    const fetchWallets = async () => {
      setIsWalletsLoading(true)
      try {
        const vpayService = new VPayService()
        const walletsData = await vpayService.getStoresWithBalance(walletsPage, 5)
        console.log('Fetched wallets data:', walletsData)
        setWallets(walletsData.items)
        setWalletsTotalPages(walletsData.totalPages)
        setWalletsTotalItems(walletsData.totalItems)
      } catch (error) {
        console.error("Failed to fetch wallets:", error)
        Toast.error({
          message: "Failed to Load Stores",
          description: "There was an error loading the stores. Please try again."
        })
      } finally {
        setIsWalletsLoading(false)
      }
    }

    if (activeTab === "wallets") {
      fetchWallets()
    }
  }, [activeTab, walletsPage]) // Add walletsPage to dependencies

  // Separate useEffect for payouts and balance
  useEffect(() => {
    const fetchPayoutsAndBalance = async () => {
      try {
        const vpayService = new VPayService()
        const [balanceData, payoutsData] = await Promise.all([
          vpayService.getBalance(),
          vpayService.getPayouts(currentPage, 5, statusFilter)
        ])
        setBalance(balanceData)
        setPayouts(payoutsData.items)
        setTotalPages(payoutsData.totalPages)
      } catch (error) {
        console.error("Failed to fetch payouts and balance:", error)
        Toast.error({
          message: "Failed to Load Data",
          description: "There was an error loading the payouts and balance. Please try again."
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (activeTab === "payouts") {
      fetchPayoutsAndBalance()
    }
  }, [currentPage, statusFilter, activeTab]) // Only re-run when these dependencies change

  // Add useEffect for transactions
  useEffect(() => {
    if (activeTab === "transactions") {
      fetchTransactions()
    }
  }, [activeTab, transactionsPage, searchQuery, fetchTransactions])

  // Add debounced search effect for transactions
  useEffect(() => {
    if (activeTab === "transactions") {
      const timer = setTimeout(() => {
        setTransactionsPage(1) // Reset to first page when searching
        fetchTransactions()
      }, 500) // 500ms debounce

      return () => clearTimeout(timer)
    }
  }, [searchQuery, activeTab, fetchTransactions])

  const handlePayoutStatusUpdate = async (id: string, status: PayoutStatus) => {
    try {
      const vpayService = new VPayService()
      await vpayService.updatePayoutStatus(id, { status })
      
      Toast.success({
        message: "Status Updated Successfully",
        description: `Payout status has been updated to ${status}`
      })

      // Refresh the payouts list with current status filter
      const payoutsData = await vpayService.getPayouts(currentPage, 5, statusFilter)
      setPayouts(payoutsData.items)
      setTotalPages(payoutsData.totalPages)
      
      // Refresh balance
      const newBalance = await vpayService.getBalance()
      setBalance(newBalance)
    } catch (error) {
      console.error("Failed to update payout status:", error)
      Toast.error({
        message: "Failed to Update Status",
        description: "There was an error updating the payout status. Please try again."
      })
    } finally {
      setShowConfirmToast(false)
      setSelectedPayout(null)
    }
  }

  const handleStatusChangeClick = (id: string, status: PayoutStatus) => {
    setSelectedPayout({ id, status })
    setShowConfirmToast(true)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setStatusFilter("Pending")
    setCurrentPage(1) // Reset page when changing tabs
  }

  const getActiveTabBalance = () => {
    if (!balance) return 0
    
    switch (activeTab) {
      case "payouts":
        return balance.payouts || 0
      case "wallets":
        return balance.wallets || 0
      case "transactions":
        return balance.balance || 0
      default:
        return 0
    }
  }

  // Filter functions
  const filteredPayouts = payouts.filter((payout) => {
    const searchLower = searchQuery.toLowerCase()
    return !searchQuery || 
      (payout.owner?.store?.name?.toLowerCase().includes(searchLower) || 
       payout.walletNumber?.toLowerCase().includes(searchLower))
  })

  const filteredWallets = wallets.filter((wallet) => {
    const searchLower = searchQuery.toLowerCase()
    return !searchQuery || 
      (wallet.name?.toLowerCase().includes(searchLower) || 
       wallet.merchantId?.toLowerCase().includes(searchLower))
  })

  const handleWalletsPageChange = (page: number) => {
    setWalletsPage(page)
  }

  const handleTransactionsPageChange = (page: number) => {
    setTransactionsPage(page)
  }

  if (isLoading) {
    return (
      <ResponsiveWrapper padding="sm">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </ResponsiveWrapper>
    )
  }

  return (
    <ResponsiveWrapper padding="sm">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">VPay</h1>
            <p className="text-gray-600 mt-1">Manage your payments and transactions</p>
          </div>
        </div>

        {/* Credit Card */}
        <div className="w-full">
          <CreditCard
            balance={getActiveTabBalance()}
            type={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            totalBalance={balance?.balance || 0}
          />
        </div>

        {/* Mobile Filter Panel */}
        <MobileFilterPanel
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          activeTab={activeTab}
        />

        {/* Desktop Search and Filters */}
        <div className="hidden lg:block">
          <ResponsiveCard padding="sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  className="pl-9 bg-white border-gray-200 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {activeTab === "payouts" && (
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={statusFilter === "Pending" ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200"
                    onClick={() => setStatusFilter("Pending")}
                  >
                    Pending
                  </Badge>
                  <Badge
                    variant={statusFilter === "Success" ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                    onClick={() => setStatusFilter("Success")}
                  >
                    Success
                  </Badge>
                  <Badge
                    variant={statusFilter === "Failed" ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
                    onClick={() => setStatusFilter("Failed")}
                  >
                    Failed
                  </Badge>
                  <Badge
                    variant={statusFilter === "Canceled" ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1 bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200"
                    onClick={() => setStatusFilter("Canceled")}
                  >
                    Canceled
                  </Badge>
                </div>
              )}
            </div>
          </ResponsiveCard>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="payouts" className="w-full" onValueChange={handleTabChange}>
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-purple-100/50 p-1 rounded-full min-w-[300px]">
              <TabsTrigger
                value="payouts"
                className="text-sm sm:text-base py-2 rounded-full data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm"
              >
                Payouts
              </TabsTrigger>
              <TabsTrigger
                value="wallets"
                className="text-sm sm:text-base py-2 rounded-full data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm"
              >
                <span className="hidden sm:inline">Active </span>Wallets
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="text-sm sm:text-base py-2 rounded-full data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm"
              >
                <span className="hidden sm:inline">Latest </span>Transactions
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="payouts" className="space-y-4 animate-in fade-in-50">
            <Card className="p-4 sm:p-6 overflow-hidden border-0 shadow-md bg-white rounded-2xl">
              <PayoutsList 
                payouts={filteredPayouts} 
                updateStatus={handleStatusChangeClick}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </Card>
          </TabsContent>

          <TabsContent value="wallets" className="space-y-4 animate-in fade-in-50">
            <Card className="p-4 sm:p-6 overflow-hidden border-0 shadow-md bg-white rounded-2xl">
              <ActiveWallets 
                wallets={filteredWallets}
                currentPage={walletsPage}
                totalPages={walletsTotalPages}
                totalItems={walletsTotalItems}
                onPageChange={handleWalletsPageChange}
                isLoading={isWalletsLoading}
              />
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 animate-in fade-in-50">
            <Card className="p-4 sm:p-6 overflow-hidden border-0 shadow-md bg-white rounded-2xl">
              <TransactionsList 
                transactions={transactions}
                currentPage={transactionsPage}
                totalPages={transactionsTotalPages}
                totalItems={transactionsTotalItems}
                onPageChange={handleTransactionsPageChange}
                isLoading={isTransactionsLoading}
              />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Confirmation Toast */}
        {showConfirmToast && selectedPayout && (
          <ConfirmToast
            message={`Are you sure you want to change the status to ${selectedPayout.status}?`}
            onConfirm={() => handlePayoutStatusUpdate(selectedPayout.id, selectedPayout.status)}
            onCancel={() => {
              setShowConfirmToast(false)
              setSelectedPayout(null)
            }}
          />
        )}
      </div>
    </ResponsiveWrapper>
  )
}  