"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, TrendingUp, CreditCard, Package, Eye, RefreshCw, ShoppingBag, LogIn, BarChart, RotateCcw, Key, Trash2, EyeOff, Copy } from "lucide-react"
import LineChartWithTooltip from "@/components/analytics/LineChartWithTooltip"
import StatCard from "@/components/analytics/StatCard"
import StoreInfoPanel, { StoreInfoPanelProps } from "@/components/store/StoreInfoPanel"
import { profileService } from "@/lib/api/stores/profile/ProfileService"
import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import { ChartsData, StoreAnalyticsResponse, PaymentHistoryResponse, VPayTransactionsResponse, OrdersResponse, Order } from "@/lib/api/stores/profile/types"
import { Transaction } from "@/lib/api/transactions/types"
import { format } from "date-fns"
import { useChartData } from "@/lib/api/statistics/chartDataUtils"
import { Button } from "@/components/ui/button"
import { TransactionCard } from "@/components/transaction/transaction-card"
import TransactionsList from "@/components/vpay/transactions-list"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ActionDropdown } from "@/components/ui/ActionDropdown"
import { storesActionsApi } from "@/lib/api/stores/actions/storesActions"
import { toast } from "sonner"

export default function MerchantAnalyticsPage() {
  const params = useParams()
  const merchantId = params.merchantId as string
  
  // Date range state
  const [dateRange, setDateRange] = useState({ 
    from: format(new Date().setMonth(new Date().getMonth() - 1), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  })
  
  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vPayLoading, setVPayLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  
  // Data states
  const [analyticsData, setAnalyticsData] = useState<ChartsData | null>(null)
  const [storeData, setStoreData] = useState<StoreAnalyticsResponse | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryResponse | null>(null)
  const [vPayTransactions, setVPayTransactions] = useState<VPayTransactionsResponse | null>(null)
  const [orders, setOrders] = useState<OrdersResponse | null>(null)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  
  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Form states
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [actionType, setActionType] = useState<"delete" | "reset" | null>(null)

  // Process chart data using chartDataUtils
  const ordersChart = useChartData(
    analyticsData?.charts.ordersChart || [],
    dateRange.from,
    dateRange.to,
    { showPercentageChange: true }
  )

  const vPayChart = useChartData(
    analyticsData?.charts.vPayTransactionsChart || [],
    dateRange.from,
    dateRange.to,
    { showPercentageChange: true }
  )

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [analyticsResponse, storeResponse, paymentResponse, vPayResponse, ordersResponse] = await Promise.all([
        profileService.getCharts(merchantId, {
          from: dateRange.from,
          to: dateRange.to
        }),
        profileService.getStoreAnalytics(merchantId),
        profileService.getPaymentHistory(merchantId, { pageNo: 1, limit: 5 }),
        profileService.getVPayTransactions(merchantId, { pageNo: 1, limit: 5 }),
        profileService.getStoreOrders(merchantId, { pageNo: 1, limit: 5 })
      ])
      
      setAnalyticsData(analyticsResponse)
      setStoreData(storeResponse)
      setPaymentHistory(paymentResponse)
      setVPayTransactions(vPayResponse)
      setOrders(ordersResponse)
      
      // Add debugging logs
      console.log('📊 Analytics Data received:', {
        analyticsData: analyticsResponse,
        storeData: storeResponse,
        paymentHistory: paymentResponse,
        vPayTransactions: vPayResponse,
        orders: ordersResponse
      })
      
      // Specific debugging for data display
      console.log('📊 Payment History Full Response:', paymentResponse)
      console.log('📊 VPay Transactions Full Response:', vPayResponse)
      console.log('📊 Orders Full Response:', ordersResponse)
      console.log('📊 Payment History Items:', paymentResponse?.items)
      console.log('📊 VPay Transactions Items:', vPayResponse?.items)
      console.log('📊 Orders Items:', ordersResponse?.items)
      console.log('📊 Data structure check:', {
        hasPaymentHistory: !!paymentResponse?.items?.length,
        hasVPayTransactions: !!vPayResponse?.items?.length,
        hasOrders: !!ordersResponse?.items?.length,
        paymentHistoryStructure: paymentResponse ? Object.keys(paymentResponse) : 'No payment response',
        vPayStructure: vPayResponse ? Object.keys(vPayResponse) : 'No vpay response',
        ordersStructure: ordersResponse ? Object.keys(ordersResponse) : 'No orders response'
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      console.error('📊 Analytics: Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }, [merchantId, dateRange.from, dateRange.to])

  const refreshCharts = async () => {
    try {
      setLoading(true)
      const analyticsResponse = await profileService.getCharts(merchantId, {
        from: dateRange.from,
        to: dateRange.to
      })
      setAnalyticsData(analyticsResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh charts')
    } finally {
      setLoading(false)
    }
  }

  const handleVPayPageChange = async (page: number) => {
    try {
      setVPayLoading(true)
      const response = await profileService.getVPayTransactions(merchantId, { 
        pageNo: page, 
        limit: 5 
      })
      setVPayTransactions(response)
      setCurrentPage(page)
    } catch (err) {
      console.error('Error fetching VPay transactions:', err)
    } finally {
      setVPayLoading(false)
    }
  }

  useEffect(() => {
    if (merchantId) {
      fetchData()
    }
  }, [merchantId, fetchData])

  if (loading && !storeData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>
  }

  if (!storeData || !analyticsData) {
    return <div className="flex items-center justify-center min-h-screen">No data available</div>
  }

  // Transform store data for StoreInfoPanel
  const transformedStoreData: StoreInfoPanelProps['storeData'] = {
    id: merchantId,
    name: storeData.store.name,
    logo: storeData.store.logo || '',
    isActive: storeData.store.enabled,
    finishedSetup: storeData.store.finishedSetup || false,
    createDate: format(new Date(storeData.store.plan.subscribeDate._seconds * 1000), 'MMM dd, yyyy'),
    lastActiveTime: format(new Date(), 'MMM dd, yyyy HH:mm'),
    planName: storeData.store.plan.planName,
    isTrial: storeData.store.plan.isTrial,
    renewEnabled: storeData.store.plan.renewEnabled,
    connectedvisa: storeData.store.plan.renewEnabled,
    hiddenOrders: storeData.store.counters.hiddenOrders > 0,
    lastSubscriptionDate: format(new Date(storeData.store.plan.subscribeDate._seconds * 1000), 'MMM dd, yyyy'),
    expirePlanDate: format(new Date(storeData.store.plan.expireDate._seconds * 1000), 'MMM dd, yyyy'),
    createdFrom: storeData.store.domains.length > 0 ? 'web' : 'mobile',
    mainCountry: storeData.store.defaultCountry,
    currency: storeData.store.defaultCurrency,
    businessPhone: storeData.store.merchantId || '',
    businessAddress: storeData.store.localMarkets.join(', ') || '',
    storeCategory: {
      name: storeData.store.category.name,
      icon: storeData.store.category.icon
    },
    owner: {
      name: storeData.owner?.name || storeData.store.merchantId || 'Not Available',
      phone: storeData.owner?.phone || storeData.store.merchantId || 'Not Available',
      email: storeData.owner?.email || 'Not Available',
      profilePic: storeData.owner?.profilePic || storeData.store.logo || '',
      isOnline: storeData.owner?.isOnline || false
    },
    metrics: {
      totalProducts: storeData.counters.products,
      totalCategories: storeData.store.category.id,
      totalEmployees: storeData.counters.employees,
      totalCouriers: storeData.counters.couriers,
      totalStorefronts: storeData.counters.storeFronts,
      totalCustomer: storeData.counters.clients,
      activePaymentGateway: storeData.store.defaultCurrency,
      Courier: storeData.store.localMarkets.length > 0 ? 'Local' : 'Not Available'
    },
    achievements: {
      streak: storeData.store.plan.usagePercent,
      totalSpent: storeData.store.plan.currentOrders.toString(),
      isTop50: storeData.store.plan.planName === 'pro',
      isHot: storeData.store.plan.usagePercent > 80
    }
  }

  const stats = [
    {
      title: "Total Sales",
      value: analyticsData.counters.totalSales,
      change: ordersChart.percentageChanges[ordersChart.percentageChanges.length - 1] || 0,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-600",
      transactionCount: analyticsData.counters.totalOrders.toString()
    },
    {
      title: "VPay Transactions",
      value: analyticsData.counters.totalVPayTransactions,
      change: vPayChart.percentageChanges[vPayChart.percentageChanges.length - 1] || 0,
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-600"
    },
    {
      title: "Total Orders",
      value: analyticsData.counters.totalOrders,
      change: ordersChart.percentageChanges[ordersChart.percentageChanges.length - 1] || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-600"
    },
    {
      title: "Website Visits",
      value: analyticsData.counters.totalWebsiteVisits,
      change: 20,
      icon: Eye,
      color: "text-yellow-600",
      bgColor: "bg-yellow-600"
    }
  ]

  // Group transactions by date
  const groupedTransactions = paymentHistory?.items?.reduce((acc: Record<string, Transaction[]>, payment: Transaction) => {
    const date = format(new Date(payment.createdAt._seconds * 1000), 'MMM dd, yyyy')
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(payment)
    return acc
  }, {} as Record<string, Transaction[]>) || {}

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'delivered':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border-green-200 shadow-green-100 shadow-sm border">
            {status}
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100 shadow-sm border">
            {status}
          </span>
        );
      case 'processing':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100 shadow-sm border">
            {status}
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border-red-200 shadow-red-100 shadow-sm border">
            {status}
          </span>
        );
      case 'returned':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border-purple-200 shadow-purple-100 shadow-sm border">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border-gray-200 shadow-gray-100 shadow-sm border">
            {status}
          </span>
        );
    }
  }

  const handleDelete = () => {
    setActionType("delete")
    setShowPasswordModal(true)
  }

  const handleReset = () => {
    setActionType("reset")
    setShowPasswordModal(true)
  }

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      toast.error("Please enter your password")
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement delete and reset store methods
      if (actionType === "delete") {
        // await storesActionsApi.deleteStore(merchantId, password)
        toast.error("Delete store functionality not yet implemented")
        return
      } else if (actionType === "reset") {
        // await storesActionsApi.resetStore(merchantId, password)
        toast.error("Reset store functionality not yet implemented")
        return
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
      setShowPasswordModal(false)
      setPassword("")
      setActionType(null)
    }
  }

  const handleForcePasswordReset = () => {
    setShowPasswordResetModal(true)
  }

  const handlePasswordResetSubmit = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Please enter and confirm the new password")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsResettingPassword(true)
    try {
      await storesActionsApi.forcePasswordReset(merchantId, newPassword)
      toast.success("Password reset successfully")
      setShowPasswordResetModal(false)
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset password")
    } finally {
      setIsResettingPassword(false)
    }
  }

  const handleLoginWithCredentials = async () => {
    try {
      const response = await storesActionsApi.getStoreCredentials(merchantId)
      if (response && typeof response === 'string') {
        window.open(`https://dashboard.vondera.app/auth/login?token=${response}`, "_blank")
      } else {
        toast.error("Failed to get store login token")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to get store credentials")
    }
  }
  
  const handleCopyStoreId = async () => {
    try {
      await navigator.clipboard.writeText(merchantId);
      toast.success("Store ID copied to clipboard");
    } catch {
      toast.error("Failed to copy Store ID");
    }
  }

  const actions = [
    { icon: ShoppingBag, label: "Subscribe", onClick: () => window.open(`/dashboard/merchants/${merchantId}/subscribe`, "_blank"), color: "blue" },
    { icon: LogIn, label: "Login to Store", onClick: handleLoginWithCredentials, color: "green" },
    { icon: BarChart, label: "Analytics", onClick: () => window.open(`/dashboard/merchants/analytics/${merchantId}`, "_blank"), color: "purple" },
    { icon: Copy, label: "Copy Store ID", onClick: handleCopyStoreId, color: "gray" },
    { icon: RotateCcw, label: "Reset Data", onClick: handleReset, color: "yellow" },
    { icon: Key, label: "Reset Password", onClick: handleForcePasswordReset, color: "indigo" },
    { icon: Trash2, label: "Delete", onClick: handleDelete, color: "red" },
  ]

  return (
    <div>
      <StoreInfoPanel storeData={transformedStoreData} />

      <div className="mb-6 mt-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white rounded-md p-2 shadow-sm">
            <Calendar className="h-5 w-5 text-gray-500" />  
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => {
                setDateRange({ ...dateRange, from: e.target.value })
                refreshCharts()
              }}
              className="border-none text-sm focus:outline-none"
            />
            <span className="text-gray-500">to</span>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => {
                setDateRange({ ...dateRange, to: e.target.value })
                refreshCharts()
              }}
              className="border-none text-sm focus:outline-none"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshCharts}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <Select defaultValue="EGP">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EGP">EGP</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ActionDropdown actions={actions} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <StatCard {...stat} transactionCount={stat.transactionCount?.toString()} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Orders Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartWithTooltip 
              title="Orders Over Time"
              datasets={[{
                label: 'Orders',
                data: ordersChart.values,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
              }]}
              dateRange={dateRange}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">VPay Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartWithTooltip 
              title="VPay Transactions"
              datasets={[{
                label: 'VPay Transactions',
                data: vPayChart.values,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
              }]}
              dateRange={dateRange}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Last 5 Subscription Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(groupedTransactions)
              .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
              .slice(0, 5)
              .map(([date, payments]) => (
                <div key={date} className="mb-6">
                  <div className="text-sm font-medium text-gray-500 mb-3">{date}</div>
                  {(payments as Transaction[]).map((payment) => (
                    <TransactionCard
                      key={payment.id}
                      transaction={{
                        id: payment.id,
                        amount: payment.amount,
                        currency: "EGP",
                        status: "completed", // Default status
                        paymentMethod: payment.method,
                        createdAt: {
                          seconds: payment.createdAt._seconds,
                          _nanoseconds: payment.createdAt._nanoseconds || 0
                        },
                        type: payment.method || "payment",
                        plan: payment.plan,
                        method: payment.method,
                        kashierLink: undefined,
                        store: {
                          merchantId: storeData?.store.merchantId || "",
                          name: storeData?.store.name || "",
                          logo: storeData?.store.logo || "",
                          country: storeData?.store.defaultCountry || "",
                          link: ""
                        },
                        admin: payment.admin || undefined
                      }}
                    />
                  ))}
                </div>
              ))}
            {!paymentHistory?.items?.length && (
              <div className="text-center py-4 text-gray-700">
                No payment history available
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">VPay Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionsList
              transactions={vPayTransactions?.items || []}
              currentPage={currentPage}
              totalPages={vPayTransactions?.totalPages || 1}
              totalItems={vPayTransactions?.totalItems || 0}
              onPageChange={handleVPayPageChange}
              isLoading={vPayLoading}
            />
            {!vPayLoading && (!vPayTransactions?.items || vPayTransactions.items.length === 0) && (
              <div className="text-center py-8 text-gray-700">
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-700 font-medium">No VPay transactions available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Latest Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-600">Order ID</TableHead>
                    <TableHead className="font-semibold text-gray-600">Products Count</TableHead>
                    <TableHead className="font-semibold text-gray-600">Customer Name</TableHead>
                    <TableHead className="font-semibold text-gray-600">Total Price</TableHead>
                    <TableHead className="font-semibold text-gray-600">Date</TableHead>
                    <TableHead className="font-semibold text-gray-600">Governorate</TableHead>
                    <TableHead className="font-semibold text-gray-600">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.items?.map((order: Order, index: number) => (
                    <TableRow 
                      key={order.id}
                      className={`
                        transition-colors hover:bg-gray-50/50
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                      `}
                    >
                      <TableCell className="font-medium text-blue-600">{order.id}</TableCell>
                      <TableCell>
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                          {order.productsCount}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">{order.customer.name}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">
                          {order.payment.totalPrice.toLocaleString()} 
                          <span className="text-gray-500 ml-1">EGP</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-gray-900">{format(new Date(order.date._seconds * 1000), 'MMM dd, yyyy')}</span>
                          <span className={`text-xs mt-0.5 ${
                            order.payment.paymentStatus === 'PAID' 
                              ? 'text-green-600' 
                              : 'text-amber-600'
                          }`}>
                            {order.payment.paymentStatus === 'PAID' ? 'Paid' : 'Not Paid'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                          {order.customer.gov}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {!orders?.items?.length && (
              <div className="text-center py-8 text-gray-700">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-700 font-medium">No orders available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add modals */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200"
          >
            <h3 className="text-xl font-bold mb-2 text-gray-900">
              {actionType === "delete" ? "Delete Store" : "Reset Store Data"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Please enter your admin password to confirm this action.
            </p>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mb-6 text-base"
            />
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordModal(false)
                  setPassword("")
                  setActionType(null)
                }}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordSubmit}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                {isLoading ? "Processing..." : actionType === "delete" ? "Delete" : "Reset"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {showPasswordResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200"
          >
            <h3 className="text-xl font-bold mb-2 text-gray-900">Reset Store Password</h3>
            <p className="text-sm text-gray-600 mb-6">
              Enter a new password for this store. The merchant will need to use this password to log in.
            </p>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full pr-10 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pr-10 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordResetModal(false)
                  setNewPassword("")
                  setConfirmPassword("")
                }}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordResetSubmit}
                disabled={isResettingPassword}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6"
              >
                {isResettingPassword ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}