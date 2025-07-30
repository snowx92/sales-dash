"use client"

import { useCallback, useEffect, useState } from "react"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { PAGE_TITLES } from "@/lib/config/page-titles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, TrendingUp, CreditCard, Package, Eye, RefreshCw, Wallet, ShoppingBag, LogIn, BarChart, RotateCcw, Key, Trash2, EyeOff, Copy } from "lucide-react"
import LineChartWithTooltip from "@/components/analytics/LineChartWithTooltip"
import StatCard from "@/components/analytics/StatCard"
import StoreInfoPanel, { StoreInfoPanelProps } from "@/components/store/StoreInfoPanel"
// import { profileService } from "@/lib/api/stores/profile/ProfileService"
import { motion } from "framer-motion"
import { useParams } from "next/navigation"
// import { ChartsData, StoreAnalyticsResponse, PaymentHistoryResponse, VPayTransactionsResponse, OrdersResponse } from "@/lib/api/stores/profile/types"
import { format } from "date-fns"
// import { useChartData } from "@/lib/api/statistics/chartDataUtils"
import { Button } from "@/components/ui/button"
import { TransactionCard } from "@/components/transaction/transaction-card"
import TransactionsList from "@/components/vpay/transactions-list"
import PayoutsList from "@/components/vpay/payouts-list"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { VPayService } from "@/lib/api/vpay/VPayService"
// import type { Payout, PayoutStatus } from "@/lib/api/vpay/types"
// import { PaginatedResponse } from "@/lib/api/services/commonTypes"
import { ActionDropdown } from "@/components/ui/ActionDropdown"
import { toast } from "sonner"

// Local type definitions for static data
interface Timestamp {
  _seconds: number;
}

type PayoutStatus = "Pending" | "Success" | "Failed" | "Canceled";

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  createdAt: Timestamp;
  merchantId: string;
  description: string;
  method: string;
  walletNumber: string;
  owner: {
    store: {
      name: string;
      logo: string;
    };
  };
}

interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

interface ChartsData {
  charts: {
    ordersChart: Array<{ date: string; value: number }>;
    vPayTransactionsChart: Array<{ date: string; value: number }>;
  };
  counters: {
    totalSales: string;
    totalVPayTransactions: string;
    totalOrders: number;
    totalWebsiteVisits: number;
  };
}

interface StoreAnalyticsResponse {
  store: {
    name: string;
    logo: string;
    enabled: boolean;
    finishedSetup: boolean;
    merchantId: string;
    defaultCountry: string;
    defaultCurrency: string;
    domains: string[];
    localMarkets: string[];
    category: {
      id: string;
      name: string;
      icon: string;
    };
    plan: {
      planName: string;
      isTrial: boolean;
      renewEnabled: boolean;
      subscribeDate: Timestamp;
      expireDate: Timestamp;
      maxOrders: number;
      currentOrders: number;
      usagePercent: number;
    };
    counters: {
      hiddenOrders: number;
    };
  };
  owner: {
    name: string;
    email: string;
    phone: string;
    profilePic: string;
    isOnline: boolean;
  };
  counters: {
    products: number;
    employees: number;
    couriers: number;
    storeFronts: number;
    clients: number;
  };
}

interface PaymentHistoryResponse {
  items: Array<{
    id: string;
    amount: number;
    currency: string;
    type: string;
    plan: string;
    createdAt: Timestamp;
  }>;
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

interface VPayTransactionsResponse {
  items: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: Timestamp;
    customer: {
      name: string;
      email: string;
      avatar?: string;
    };
    method: string;
    totalAmount: number;
    amountAfterFees: number;
    commission: number;
    orderId: string;
    owner: {
      store: {
        name: string;
        logo: string;
      };
    };
  }>;
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

interface OrdersResponse {
  items: Array<{
    id: string;
    productsCount: number;
    customer: {
      name: string;
      gov: string;
    };
    payment: {
      totalPrice: number;
      currency: string;
      paymentStatus: string;
    };
    date: Timestamp;
    status: string;
  }>;
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
// import { storesActionsApi } from "@/lib/api/stores/actions/storesActions"

// const vPayService = new VPayService()

// Static data - Replace API calls with mock data
const staticChartsData: ChartsData = {
  charts: {
    ordersChart: [
      { date: "2024-01-01", value: 150 },
      { date: "2024-01-02", value: 180 },
      { date: "2024-01-03", value: 220 },
      { date: "2024-01-04", value: 195 },
      { date: "2024-01-05", value: 240 },
      { date: "2024-01-06", value: 280 },
      { date: "2024-01-07", value: 320 },
    ],
    vPayTransactionsChart: [
      { date: "2024-01-01", value: 75 },
      { date: "2024-01-02", value: 85 },
      { date: "2024-01-03", value: 95 },
      { date: "2024-01-04", value: 110 },
      { date: "2024-01-05", value: 125 },
      { date: "2024-01-06", value: 140 },
      { date: "2024-01-07", value: 160 },
    ]
  },
  counters: {
    totalSales: "$45,230",
    totalVPayTransactions: "$12,450",
    totalOrders: 1250,
    totalWebsiteVisits: 8500
  }
}

const staticStoreData: StoreAnalyticsResponse = {
  store: {
    name: "Demo Electronics Store",
    logo: "/placeholder.svg",
    enabled: true,
    finishedSetup: true,
    merchantId: "demo_store_123",
    defaultCountry: "United States",
    defaultCurrency: "USD",
    domains: ["demo-electronics.com"],
    localMarkets: ["New York", "California"],
    category: {
      id: "1",
      name: "Electronics",
      icon: "/placeholder.svg"
    },
    plan: {
      planName: "pro",
      isTrial: false,
      renewEnabled: true,
      subscribeDate: { _seconds: 1704067200 }, // Jan 1, 2024
      expireDate: { _seconds: 1735689600 }, // Jan 1, 2025
      maxOrders: 10000,
      currentOrders: 1250,
      usagePercent: 85
    },
    counters: {
      hiddenOrders: 0
    }
  },
  owner: {
    name: "John Doe",
    email: "john@demo-electronics.com",
    phone: "+1-555-0123",
    profilePic: "/placeholder.svg",
    isOnline: true
  },
  counters: {
    products: 450,
    employees: 8,
    couriers: 12,
    storeFronts: 2,
    clients: 3200
  }
}

const staticPaymentHistory: PaymentHistoryResponse = {
  items: [
    {
      id: "pay_001",
      amount: 99.99,
      currency: "USD",
      type: "subscription",
      plan: "pro",
      createdAt: { _seconds: 1704067200 }
    },
    {
      id: "pay_002", 
      amount: 149.99,
      currency: "USD",
      type: "subscription",
      plan: "pro",
      createdAt: { _seconds: 1703980800 }
    }
  ],
  totalItems: 2,
  totalPages: 1,
  currentPage: 1
}

const staticVPayTransactions: VPayTransactionsResponse = {
  items: [
    {
      id: "vpay_001",
      amount: 250.50,
      currency: "USD",
      status: "completed",
      createdAt: { _seconds: 1704067200 },
      customer: {
        name: "Alice Johnson",
        email: "alice@example.com",
        avatar: "/placeholder.svg"
      },
      method: "CARD",
      totalAmount: 250.50,
      amountAfterFees: 240.50,
      commission: 10.00,
      orderId: "ORD_001",
      owner: {
        store: {
          name: "Demo Electronics Store",
          logo: "/placeholder.svg"
        }
      }
    },
    {
      id: "vpay_002",
      amount: 180.75,
      currency: "USD", 
      status: "pending",
      createdAt: { _seconds: 1703980800 },
      customer: {
        name: "Bob Smith",
        email: "bob@example.com",
        avatar: "/placeholder.svg"
      },
      method: "WALLET",
      totalAmount: 180.75,
      amountAfterFees: 173.50,
      commission: 7.25,
      orderId: "ORD_002",
      owner: {
        store: {
          name: "Demo Electronics Store",
          logo: "/placeholder.svg"
        }
      }
    }
  ],
  totalItems: 2,
  totalPages: 1,
  currentPage: 1
}

const staticOrders: OrdersResponse = {
  items: [
    {
      id: "ORD_001",
      productsCount: 3,
      customer: {
        name: "Sarah Wilson",
        gov: "New York"
      },
      payment: {
        totalPrice: 299.99,
        currency: "USD",
        paymentStatus: "PAID"
      },
      date: { _seconds: 1704067200 },
      status: "delivered"
    },
    {
      id: "ORD_002",
      productsCount: 1,
      customer: {
        name: "Mike Davis",
        gov: "California"
      },
      payment: {
        totalPrice: 149.99,
        currency: "USD",
        paymentStatus: "PAID"
      },
      date: { _seconds: 1703980800 },
      status: "processing"
    },
    {
      id: "ORD_003",
      productsCount: 2,
      customer: {
        name: "Emma Thompson",
        gov: "Texas"
      },
      payment: {
        totalPrice: 89.99,
        currency: "USD",
        paymentStatus: "PENDING"
      },
      date: { _seconds: 1703894400 },
      status: "pending"
    }
  ],
  totalItems: 3,
  totalPages: 1,
  currentPage: 1
}

const staticPayouts: PaginatedResponse<Payout> = {
  items: [
    {
      id: "payout_001",
      amount: 1250.00,
      currency: "USD",
      status: "Success" as PayoutStatus,
      createdAt: { _seconds: 1704067200 },
      merchantId: "demo_store_123",
      description: "Weekly payout",
      method: "InstaPay",
      walletNumber: "01234567890",
      owner: {
        store: {
          name: "Demo Electronics Store",
          logo: "/placeholder.svg"
        }
      }
    },
    {
      id: "payout_002",
      amount: 890.50,
      currency: "USD",
      status: "Pending" as PayoutStatus,
      createdAt: { _seconds: 1703980800 },
      merchantId: "demo_store_123",
      description: "Weekly payout",
      method: "Wallet",
      walletNumber: "01987654321",
      owner: {
        store: {
          name: "Demo Electronics Store",
          logo: "/placeholder.svg"
        }
      }
    }
  ],
  totalItems: 2,
  totalPages: 1,
  currentPage: 1
}

export default function MerchantAnalyticsPage() {
  usePageTitle(PAGE_TITLES.MERCHANT_ANALYTICS);
  
  const params = useParams()
  const merchantId = params.merchantId as string
  
  // Date range state
  const [dateRange, setDateRange] = useState({ 
    from: format(new Date().setMonth(new Date().getMonth() - 1), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  })
  
  // Loading and error states
  const [loading, setLoading] = useState(false) // Set to false since we're using static data
  const [error, setError] = useState<string | null>(null)
  const [vPayLoading, setVPayLoading] = useState(false)
  const [payoutsLoading, setPayoutsLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  
  // Data states - Initialize with static data
  const [analyticsData] = useState<ChartsData | null>(staticChartsData)
  const [storeData] = useState<StoreAnalyticsResponse | null>(staticStoreData)
  const [paymentHistory] = useState<PaymentHistoryResponse | null>(staticPaymentHistory)
  const [vPayTransactions] = useState<VPayTransactionsResponse | null>(staticVPayTransactions)
  const [orders] = useState<OrdersResponse | null>(staticOrders)
  const [payouts] = useState<PaginatedResponse<Payout> | null>(staticPayouts)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [payoutsCurrentPage, setPayoutsCurrentPage] = useState(1)
  const [payoutsStatus, setPayoutsStatus] = useState<PayoutStatus>("Success")
  
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

  // Process chart data using static data (useChartData commented out)
  // const ordersChart = useChartData(
  //   analyticsData?.charts.ordersChart || [],
  //   dateRange.from,
  //   dateRange.to,
  //   { showPercentageChange: true }
  // )

  // const vPayChart = useChartData(
  //   analyticsData?.charts.vPayTransactionsChart || [],
  //   dateRange.from,
  //   dateRange.to,
  //   { showPercentageChange: true }
  // )

  // Static chart data for demo - transform data for Chart.js
  const ordersChart = {
    values: analyticsData?.charts.ordersChart?.map(item => item.value) || [],
    labels: analyticsData?.charts.ordersChart?.map(item => item.date) || [],
    percentageChanges: [12.5, 8.3, 15.2, -2.1, 18.7, 22.4, 14.6] // Static percentage changes
  }

  const vPayChart = {
    values: analyticsData?.charts.vPayTransactionsChart?.map(item => item.value) || [],
    labels: analyticsData?.charts.vPayTransactionsChart?.map(item => item.date) || [],
    percentageChanges: [8.2, 12.1, 6.7, 15.3, 11.8, 9.4, 17.2] // Static percentage changes
  }

  // Fetch payouts for the specific merchant (using static data)
  const fetchPayouts = useCallback(async () => {
    try {
      setPayoutsLoading(true)
      // const response = await vPayService.getPayouts(
      //   payoutsCurrentPage,
      //   5,
      //   payoutsStatus,
      //   merchantId
      // )
      // setPayouts(response)
      
      // Using static data instead
      console.log('Using static payouts data')
    } catch (err) {
      console.error('Error fetching payouts:', err)
    } finally {
      setPayoutsLoading(false)
    }
  }, [payoutsCurrentPage, payoutsStatus, merchantId])

  // Update payout status (using static data)
  const updatePayoutStatus = async (payoutId: string, status: PayoutStatus) => {
    try {
      // await vPayService.updatePayoutStatus(payoutId, { status })
      // // Refresh payouts after status update
      // fetchPayouts()
      
      // Using static data - just log the update
      console.log(`Mock: Updated payout ${payoutId} to status ${status}`)
    } catch (err) {
      console.error('Error updating payout status:', err)
      throw err // Re-throw to handle in component
    }
  }

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      // const [analyticsResponse, storeResponse, paymentResponse, vPayResponse, ordersResponse] = await Promise.all([
      //   profileService.getCharts(merchantId, {
      //     from: dateRange.from,
      //     to: dateRange.to
      //   }),
      //   profileService.getStoreAnalytics(merchantId),
      //   profileService.getPaymentHistory(merchantId, { pageNo: 1, limit: 5 }),
      //   profileService.getVPayTransactions(merchantId, { pageNo: 1, limit: 5 }),
      //   profileService.getStoreOrders(merchantId, { pageNo: 1, limit: 5 })
      // ])
      
      // setAnalyticsData(analyticsResponse)
      // setStoreData(storeResponse)
      // setPaymentHistory(paymentResponse)
      // setVPayTransactions(vPayResponse)
      // setOrders(ordersResponse)
      
      // Using static data - no API calls needed
      console.log('Using static data for merchant:', merchantId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [merchantId, dateRange.from, dateRange.to])

  const refreshCharts = async () => {
    try {
      setLoading(true)
      // const analyticsResponse = await profileService.getCharts(merchantId, {
      //   from: dateRange.from,
      //   to: dateRange.to
      // })
      // setAnalyticsData(analyticsResponse)
      
      // Using static data - just simulate refresh
      console.log('Mock: Refreshing charts with static data')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh charts')
    } finally {
      setLoading(false)
    }
  }

  const handleVPayPageChange = async (page: number) => {
    try {
      setVPayLoading(true)
      // const response = await profileService.getVPayTransactions(merchantId, { 
      //   pageNo: page, 
      //   limit: 5 
      // })
      // setVPayTransactions(response)
      
      // Using static data
      console.log('Mock: Changing to VPay page', page)
      setCurrentPage(page)
    } catch (err) {
      console.error('Error fetching VPay transactions:', err)
    } finally {
      setVPayLoading(false)
    }
  }

  const handlePayoutsPageChange = (page: number) => {
    setPayoutsCurrentPage(page)
  }

  const handlePayoutsStatusChange = (status: PayoutStatus) => {
    setPayoutsStatus(status)
    setPayoutsCurrentPage(1) // Reset to first page when changing status
  }

  useEffect(() => {
    if (merchantId) {
      // fetchData()
      // fetchPayouts()
      // Using static data, no need to fetch
    }
  }, [merchantId, fetchData, fetchPayouts])

  // Refetch payouts when page or status changes
  useEffect(() => {
    if (merchantId) {
      // fetchPayouts()
      // Using static data, no need to fetch
    }
  }, [payoutsCurrentPage, payoutsStatus, fetchPayouts, merchantId])

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
      totalCategories: 1, // Convert category id to number
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
  const groupedTransactions = paymentHistory?.items.reduce((acc, payment) => {
    const date = format(new Date(payment.createdAt._seconds * 1000), 'MMM dd, yyyy')
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(payment)
    return acc
  }, {} as Record<string, typeof paymentHistory.items>) || {}

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
      // if (actionType === "delete") {
      //   await storesActionsApi.deleteStore(merchantId, password)
      //   toast.success("Store deleted successfully")
      //   window.location.href = "/dashboard/merchants"
      // } else if (actionType === "reset") {
      //   await storesActionsApi.resetStore(merchantId, password)
      //   toast.success("Store data reset successfully")
      //   fetchData()
      // }
      
      // Using static data - simulate the action
      if (actionType === "delete") {
        toast.success("Store deletion simulated (static data)")
        console.log("Mock: Store deletion for merchantId:", merchantId)
      } else if (actionType === "reset") {
        toast.success("Store data reset simulated (static data)")
        console.log("Mock: Store reset for merchantId:", merchantId)
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
      // await storesActionsApi.forcePasswordReset(merchantId, newPassword)
      
      // Using static data - simulate password reset
      console.log("Mock: Password reset for merchantId:", merchantId)
      toast.success("Password reset simulated successfully (static data)")
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
      // const response = await storesActionsApi.getStoreCredentials(merchantId)
      // if (response && typeof response === 'string') {
      //   window.open(`https://dashboard.vondera.app/auth/login?token=${response}`, "_blank")
      // } else {
      //   toast.error("Failed to get store login token")
      // }
      
      // Using static data - simulate login
      console.log("Mock: Login to store for merchantId:", merchantId)
      toast.success("Store login simulated (static data)")
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
            <Calendar className="h-5 w-5 text-gray-600" />  
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => {
                setDateRange({ ...dateRange, from: e.target.value })
                refreshCharts()
              }}
              className="border-none text-sm focus:outline-none text-gray-900"
            />
            <span className="text-gray-800">to</span>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => {
                setDateRange({ ...dateRange, to: e.target.value })
                refreshCharts()
              }}
              className="border-none text-sm focus:outline-none text-gray-900"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshCharts}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2 text-gray-600" />
              Refresh
            </Button>
          </div>
          <Select defaultValue="USD">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
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
            <CardTitle className="text-purple-600">Orders Over Time</CardTitle>
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
            <CardTitle className="text-purple-600">VPay Transactions</CardTitle>
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
            <CardTitle className="text-purple-600">Last 5 Subscription Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(groupedTransactions)
              .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
              .slice(0, 5)
              .map(([date, payments]) => (
                <div key={date} className="mb-6">
                  <div className="text-sm font-medium text-gray-800 mb-3">{date}</div>
                  {payments.map((payment) => (
                    <TransactionCard
                      key={payment.id}
                      transaction={{
                        id: payment.id,
                        amount: payment.amount,
                        currency: payment.currency,
                        createdAt: {
                          seconds: payment.createdAt._seconds,
                          _nanoseconds: 0
                        },
                        type: payment.type,
                        plan: {
                          id: payment.plan,
                          name: payment.plan,
                          duration: "N/A"
                        },
                        method: "credit_card",
                        kashierLink: undefined,
                        store: {
                          merchantId: storeData?.store.merchantId || "",
                          name: storeData?.store.name || "",
                          logo: storeData?.store.logo || "",
                          country: storeData?.store.defaultCountry || "",
                          link: ""
                        },
                        admin: undefined,
                        status: "completed",
                        paymentMethod: "credit_card"
                      }}
                    />
                  ))}
                </div>
              ))}
            {!paymentHistory?.items.length && (
              <div className="text-center py-4 text-gray-700">
                No payment history available
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-purple-600"> VPay </CardTitle>
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
          </CardContent>
        </Card>
      </div>

      {/* New Payouts Section */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-purple-600" />
              Merchant Payouts
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={payoutsStatus}
                onValueChange={(value: PayoutStatus) => handlePayoutsStatusChange(value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchPayouts}
                disabled={payoutsLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 text-gray-600 ${payoutsLoading ? 'animate-spin' : ''}`} />
                {payoutsLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {payouts && (
              <PayoutsList
                payouts={payouts.items}
                updateStatus={updatePayoutStatus}
                currentPage={payoutsCurrentPage}
                totalPages={payouts.totalPages}
                onPageChange={handlePayoutsPageChange}
              />
            )}
            {payoutsLoading && (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-purple-600" />
                <span className="ml-2 text-gray-800">Loading payouts...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-purple-600">Latest Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-800">Order ID</TableHead>
                    <TableHead className="font-semibold text-gray-800">Products Count</TableHead>
                    <TableHead className="font-semibold text-gray-800">Customer Name</TableHead>
                    <TableHead className="font-semibold text-gray-800">Total Price</TableHead>
                    <TableHead className="font-semibold text-gray-800">Date</TableHead>
                    <TableHead className="font-semibold text-gray-800">Governorate</TableHead>
                    <TableHead className="font-semibold text-gray-800">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.items.map((order, index) => (
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
                          <span className="text-gray-700 ml-1">{order.payment.currency}</span>
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
            {!orders?.items.length && (
              <div className="text-center py-8 text-gray-700">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                <p className="text-gray-800 font-medium">No orders available</p>
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
              className="mb-6 text-base text-gray-900"
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
                  className="w-full pr-10 text-base text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4 text-gray-600" /> : <Eye className="h-4 w-4 text-gray-600" />}
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pr-10 text-base text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-600" /> : <Eye className="h-4 w-4 text-gray-600" />}
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