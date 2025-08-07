"use client";

import { motion } from "framer-motion";
import { ShoppingCart, RefreshCw } from "lucide-react";
import StatCard from "@/components/analytics/StatCard";
import LineChartWithTooltip from "@/components/analytics/LineChartWithTooltip";
import { useState, useEffect, useCallback } from "react";
import { ResponsiveWrapper, ResponsiveGrid, ResponsiveCard } from "@/components/layout/ResponsiveWrapper";
import { overviewService } from "@/lib/api/overview/overviewService";
import { SalesAccountData, SalesUser } from "@/lib/api/overview/type";
import { Star } from "lucide-react";

// Import our new components
import { SectionDivider } from "@/components/ui/SectionDivider";
import { 
  MobileStatsCollapse,
  MobileLeaderboardAndBonus,
  TargetProgressCard,
  DateRangeHeader,
  DesktopLeaderboard
} from "@/components/analytics";

// Current user defaults
const defaultCurrentUser = {
  name: "Sales Representative",
  avatar: "/placeholder-avatar.jpg",
  currentRevenue: 0,
  targetRevenue: 0,
  targetType: "No Target Set",
  targetPercentage: 0,
  affiliateLink: "https://vondera.app/ref/loading",
  rank: 0
};

// Default date range - current month from start to today
const getCurrentMonthDateRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Format dates properly to avoid timezone issues
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return {
    from: formatDate(startOfMonth),
    to: formatDate(today)
  };
};

const dateRange = getCurrentMonthDateRange();

export default function ReportsPage() {
  const [tempDateRange, setTempDateRange] = useState(dateRange);
  const [loading, setLoading] = useState(false);
  
  // API state management
  const [overviewData, setOverviewData] = useState<SalesAccountData | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<SalesUser[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  const fetchData = useCallback(async (dateRange?: { from: string; to: string }) => {
    try {
      setApiLoading(true);
      setError(null);

      console.log('🔄 Fetching data with date range:', dateRange || 'Using service defaults (current month)');

      // Fetch overview and leaderboard data concurrently
      // If no dateRange provided, service will use current month by default
      const [overviewResponse, leaderboardResponse] = await Promise.allSettled([
        dateRange ? 
          overviewService.getDateRangeOverview(dateRange.from, dateRange.to) :
          overviewService.getOverview(), // Uses current month by default
        overviewService.getLeaderboard()
      ]);

      // Handle overview response
      if (overviewResponse.status === 'fulfilled' && overviewResponse.value) {
        const data = overviewResponse.value;
        // Check if we have valid overview data
        if (data && (data.user || data.counters || data.totalRevenue)) {
          console.log('✅ Overview data received:', data);
          setOverviewData(data);
        } else {
          console.log('⚠️ Overview API returned empty data');
        }
      } else {
        console.log('⚠️ Overview API failed:', overviewResponse.status === 'rejected' ? overviewResponse.reason : 'No response');
      }

      // Handle leaderboard response  
      if (leaderboardResponse.status === 'fulfilled' && leaderboardResponse.value) {
        const data = leaderboardResponse.value;
        // The leaderboard response is now a direct array
        if (Array.isArray(data) && data.length > 0) {
          console.log('✅ Leaderboard data received:', data);
          setLeaderboardData(data);
        } else {
          console.log('⚠️ Leaderboard API returned empty array');
        }
      } else {
        console.log('⚠️ Leaderboard API failed:', leaderboardResponse.status === 'rejected' ? leaderboardResponse.reason : 'No response');
      }

    } catch (err) {
      console.error('🚨 Error fetching dashboard data:', err);
      setError(`Failed to load dashboard data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setApiLoading(false);
    }
  }, []); // Removed tempDateRange dependency since it's not used directly

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper functions to get data with proper fallbacks
  // Helper function to get the best target data to display
  const getTargetData = () => {
    if (!overviewData) {
      return {
        current: 0,
        target: 100000,
        percentage: 0,
        type: 'No Data'
      };
    }

    // Check which targets have data (total > 0)
    const totalTarget = overviewData.totalTarget;
    const newSubTarget = overviewData.newSubscriptionTarget;
    const renewalsTarget = overviewData.renewalsTarget;

    // Priority: totalTarget > newSubscriptionTarget > renewalsTarget
    if (totalTarget && totalTarget.total > 0) {
      const calculatedPercentage = totalTarget.total > 0 ? ((totalTarget.current || 0) / totalTarget.total) * 100 : 0;
      return {
        current: totalTarget.current || 0,
        target: totalTarget.total,
        percentage: totalTarget.percentage || calculatedPercentage,
        type: 'Total Target'
      };
    } else if (newSubTarget && newSubTarget.total > 0) {
      const calculatedPercentage = newSubTarget.total > 0 ? ((newSubTarget.current || 0) / newSubTarget.total) * 100 : 0;
      return {
        current: newSubTarget.current || 0,
        target: newSubTarget.total,
        percentage: newSubTarget.percentage || calculatedPercentage,
        type: 'New Subscriptions Target'
      };
    } else if (renewalsTarget && renewalsTarget.total > 0) {
      const calculatedPercentage = renewalsTarget.total > 0 ? ((renewalsTarget.current || 0) / renewalsTarget.total) * 100 : 0;
      return {
        current: renewalsTarget.current || 0,
        target: renewalsTarget.total,
        percentage: renewalsTarget.percentage || calculatedPercentage,
        type: 'Renewals Target'
      };
    }

    // Default fallback using total revenue
    const totalRevenue = overviewData.totalRevenue?.total || 0;
    return {
      current: totalRevenue,
      target: 100000,
      percentage: (totalRevenue / 100000) * 100,
      type: 'Revenue Progress'
    };
  };

  const getCurrentUserData = () => {
    const targetData = getTargetData();
    
    if (!overviewData?.user) {
      return {
        ...defaultCurrentUser,
        currentRevenue: targetData.current,
        targetRevenue: targetData.target,
        targetType: targetData.type,
        targetPercentage: targetData.percentage
      };
    }
    
    return {
      name: overviewData.user.name || "Sales Representative",
      avatar: overviewData.user.profilePic || "/placeholder-avatar.jpg",
      currentRevenue: targetData.current,
      targetRevenue: targetData.target,
      targetType: targetData.type,
      targetPercentage: targetData.percentage,
      affiliateLink: overviewData.user.refferLink || "https://vondera.app/ref/loading",
      rank: 0 // Would need to calculate from leaderboard
    };
  };

  const getStatsCardsData = () => {
    if (!overviewData) {
      return [
        {
          title: "Period Revenue",
          value: "0 EGP",
          change: 0,
          icon: ShoppingCart,
          color: "text-green-600",
          transactionCount: "0"
        },
        {
          title: "New Subscriptions Revenue", 
          value: "0 EGP",
          change: 0,
          icon: Star,
          color: "text-purple-600",
          transactionCount: "0"
        },
        {
          title: "Renew Subscriptions Revenue",
          value: "0 EGP",
          change: 0,
          icon: RefreshCw,
          color: "text-blue-600",
          transactionCount: "0"
        }
      ];
    }

    return [
      {
        title: "Period Revenue",
        value: `${(overviewData.periodRevenue?.total || 0).toLocaleString()} EGP`,
        change: overviewData.charts?.merchants?.overallChangePercentage || 0,
        icon: ShoppingCart,
        color: "text-green-600",
        transactionCount: (overviewData.periodTransactionsCount?.all || 0).toString()
      },
      {
        title: "New Subscriptions Revenue",
        value: `${(overviewData.periodRevenue?.new || 0).toLocaleString()} EGP`,
        change: overviewData.charts?.newSubscribtion?.overallChangePercentage || 0,
        icon: Star,
        color: "text-purple-600",
        transactionCount: (overviewData.periodTransactionsCount?.new || 0).toString()
      },
      {
        title: "Renew Subscriptions Revenue", 
        value: `${(overviewData.periodRevenue?.renew || 0).toLocaleString()} EGP`,
        change: overviewData.charts?.renewSubscribtions?.overallChangePercentage || 0,
        icon: RefreshCw,
        color: "text-blue-600",
        transactionCount: (overviewData.periodTransactionsCount?.renew || 0).toString()
      }
    ];
  };

  const getChartData = (chartType: 'merchants' | 'newSubscribtion' | 'renewSubscribtions') => {
    if (!overviewData?.charts?.[chartType]) {
      return {
        current: [],
        previous: []
      };
    }
    
    const chartData = overviewData.charts[chartType];
    
    return {
      current: chartData.currentDurationData?.map(point => point.value) || [],
      previous: chartData.prevDurationData?.map(point => point.value) || []
    };
  };

  const getPlanCountsData = () => {
    if (!overviewData) {
      return {
        starter: 0,
        pro: 0,
        plus: 0,
        onDemand: 0,
        trial: 0,
        free: 0
      };
    }
    
    return {
      starter: overviewData.counters?.starter || 0,
      pro: overviewData.counters?.pro || 0,
      plus: overviewData.counters?.plus || 0,
      onDemand: 0, // Not available in current API
      trial: overviewData.salesLeadsCount || 0, // Using salesLeadsCount as trial
      free: overviewData.assignedStoresCount || 0 // Using assignedStoresCount as free
    };
  };

  const getLeaderboardDisplayData = () => {
    if (leaderboardData.length === 0) {
      return [];
    }

    return leaderboardData.map((user, index) => ({
      id: user.id,
      name: user.name,
      avatar: user.profilePic || "/placeholder-avatar.jpg",
      revenue: user.tierSales || 0,
      target: user.targets?.totalTarget?.total || 100000,
      percentage: user.targets?.totalTarget?.percentage || 0,
      isTop: index === 0
    }));
  };



  // Get transformed data
  const currentUserData = getCurrentUserData();
  const statsCardsData = getStatsCardsData();
  const planCountsData = getPlanCountsData();
  const leaderboardDisplayData = getLeaderboardDisplayData();

  // Loading and error states
  if (apiLoading) {
    return (
      <ResponsiveWrapper padding="sm">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600">Loading sales dashboard...</p>
          </div>
        </div>
      </ResponsiveWrapper>
    );
  }

  if (error) {
    return (
      <ResponsiveWrapper padding="sm">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => fetchData()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </ResponsiveWrapper>
    );
  }

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    const newRange = { ...tempDateRange, [field]: value };
    setTempDateRange(newRange);
  };

  const handleRefresh = async () => {
    setLoading(true);
    // Pass the current tempDateRange to fetchData for refresh
    await fetchData(tempDateRange);
    setLoading(false);
  };

  return (
    <ResponsiveWrapper padding="sm">
      <div className="space-y-4 sm:space-y-6 pb-8 sm:pb-12">
        {/* Top Section - Target Progress & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Target Progress - Takes 2 columns */}
          <div className="lg:col-span-2">
            <TargetProgressCard currentUserData={currentUserData} />
          </div>
          
          {/* Desktop Leaderboard - Takes 1 column, hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <DesktopLeaderboard 
              leaderboardDisplayData={leaderboardDisplayData}
              currentUserName={currentUserData.name}
            />
          </div>
        </div>
            
        {/* Mobile Leaderboard and Bonus - Show on small devices */}
        <MobileLeaderboardAndBonus 
          leaderboardData={leaderboardDisplayData} 
          currentUserName={currentUserData.name} 
        />

        {/* Compact Header Section */}
        <DateRangeHeader 
          tempDateRange={tempDateRange}
          planCountsData={planCountsData}
          loading={loading}
          onDateChange={handleDateChange}
          onRefresh={handleRefresh}
        />

        {/* Mobile Live Stats */}
        <MobileStatsCollapse planCounts={planCountsData} />

        {/* Main Content - Full Width */}
        <div className="space-y-6">
          {/* Stats Cards Section - Full width, single row of 3 cards */}
          <ResponsiveGrid cols={{ base: 1, sm: 2, md: 3 }} gap={4}>
            {statsCardsData.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <StatCard {...stat} />
              </motion.div>
            ))}
          </ResponsiveGrid>

          <SectionDivider title="Performance Trends" />

          {/* Charts Section - New Layout: 2 charts in first row, 1 chart in second row */}
          <div className="space-y-4">
            {/* First Row - New Subscriptions and Renewals */}
            <ResponsiveGrid cols={{ base: 1, md: 2 }} gap={4}>
              <ResponsiveCard padding="sm" className="overflow-hidden">
                <LineChartWithTooltip
                  title="New Subscriptions"
                  datasets={[
                    {
                      label: "Current Period",
                      data: getChartData('newSubscribtion').current,
                      borderColor: "rgb(139, 69, 195)",
                      backgroundColor: "rgba(139, 69, 195, 0.5)",
                    },
                    {
                      label: "Previous Period",
                      data: getChartData('newSubscribtion').previous,
                      borderColor: "rgba(139, 69, 195, 0.4)",
                      backgroundColor: "rgba(139, 69, 195, 0.2)",
                      borderDash: [5, 5]
                    }
                  ]}
                  dateRange={tempDateRange}
                  showPercentage={false}
                />
              </ResponsiveCard>

              <ResponsiveCard padding="sm" className="overflow-hidden">
                <LineChartWithTooltip
                  title="Renewals"
                  datasets={[
                    {
                      label: "Current Period",
                      data: getChartData('renewSubscribtions').current,
                      borderColor: "rgb(34, 197, 94)",
                      backgroundColor: "rgba(34, 197, 94, 0.5)",
                    },
                    {
                      label: "Previous Period",
                      data: getChartData('renewSubscribtions').previous,
                      borderColor: "rgba(34, 197, 94, 0.4)",
                      backgroundColor: "rgba(34, 197, 94, 0.2)",
                      borderDash: [5, 5]
                    }
                  ]}
                  dateRange={tempDateRange}
                  showPercentage={false}
                />
              </ResponsiveCard>
            </ResponsiveGrid>

            {/* Second Row - Merchants (Full Width) */}
            <ResponsiveGrid cols={{ base: 1, md: 1 }} gap={4}>
              <ResponsiveCard padding="sm" className="overflow-hidden">
                <LineChartWithTooltip
                  title="New Merchants"
                  datasets={[
                    {
                      label: "Current Period",
                      data: getChartData('merchants').current,
                      borderColor: "rgb(54, 162, 235)",
                      backgroundColor: "rgba(54, 162, 235, 0.5)",
                    },
                    {
                      label: "Previous Period",
                      data: getChartData('merchants').previous,
                      borderColor: "rgba(54, 162, 235, 0.4)",
                      backgroundColor: "rgba(54, 162, 235, 0.2)",
                      borderDash: [5, 5]
                    }
                  ]}
                  dateRange={tempDateRange}
                  showPercentage={false}
                />
              </ResponsiveCard>
            </ResponsiveGrid>
          </div>
        </div>
      </div>
    </ResponsiveWrapper>
  );
}