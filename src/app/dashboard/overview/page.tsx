"use client";

import { motion } from "framer-motion";
import { ShoppingCart, RefreshCw, Plus, AlertTriangle, Users, Bell, AlertCircle, Star } from "lucide-react";
import StatCard from "@/components/analytics/StatCard";
import LineChartWithTooltip from "@/components/analytics/LineChartWithTooltip";
import { useState, useEffect, useCallback } from "react";
import { ResponsiveWrapper, ResponsiveGrid } from "@/components/layout/ResponsiveWrapper";
import { overviewService } from "@/lib/api/overview/overviewService";
import { leadsService } from "@/lib/api/leads/leadsService";
import { SalesAccountData, SalesUser } from "@/lib/api/overview/type";
import Link from "next/link";

import { SectionDivider } from "@/components/ui/SectionDivider";
import {
  MobileStatsCollapse,
  MobileLeaderboardAndBonus,
  TargetProgressCard,
  DateRangeHeader,
  DesktopLeaderboard
} from "@/components/analytics";
import TodayAgenda from "@/components/dashboard/TodayAgenda";
import ConversionFunnel from "@/components/dashboard/ConversionFunnel";

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
  const [leadOverview, setLeadOverview] = useState<any>(null);

  // Fetch data from API
  const fetchData = useCallback(async (dateRange?: { from: string; to: string }) => {
    try {
      setApiLoading(true);
      setError(null);

      const [overviewResponse, leaderboardResponse, leadOverviewResponse] = await Promise.allSettled([
        dateRange ?
          overviewService.getDateRangeOverview(dateRange.from, dateRange.to) :
          overviewService.getOverview(),
        overviewService.getLeaderboard(),
        leadsService.getLeadsOverview()
      ]);

      if (overviewResponse.status === 'fulfilled' && overviewResponse.value) {
        const data = overviewResponse.value;
        if (data && (data.user || data.counters || data.totalRevenue)) {
          setOverviewData(data);
        }
      }

      if (leaderboardResponse.status === 'fulfilled' && leaderboardResponse.value) {
        const data = leaderboardResponse.value;
        if (Array.isArray(data) && data.length > 0) {
          setLeaderboardData(data);
        }
      }

      if (leadOverviewResponse.status === 'fulfilled' && leadOverviewResponse.value) {
        setLeadOverview(leadOverviewResponse.value);
      }

    } catch (err) {
      setError(`Failed to load dashboard data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper functions
  const getTargetData = () => {
    if (!overviewData) {
      return { current: 0, target: 100000, percentage: 0, type: 'No Data' };
    }

    const totalTarget = overviewData.totalTarget;
    const newSubTarget = overviewData.newSubscriptionTarget;
    const renewalsTarget = overviewData.renewalsTarget;

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
      rank: 0
    };
  };

  const getStatsCardsData = () => {
    if (!overviewData) {
      return [
        { title: "Period Revenue", value: "0 EGP", change: 0, icon: ShoppingCart, color: "text-slate-600", transactionCount: "0" },
        { title: "New Subscriptions", value: "0 EGP", change: 0, icon: Star, color: "text-slate-600", transactionCount: "0" },
        { title: "Renewals Revenue", value: "0 EGP", change: 0, icon: RefreshCw, color: "text-slate-600", transactionCount: "0" }
      ];
    }

    return [
      {
        title: "Period Revenue",
        value: `${(overviewData.periodRevenue?.total || 0).toLocaleString()} EGP`,
        change: overviewData.charts?.merchants?.overallChangePercentage || 0,
        icon: ShoppingCart,
        color: "text-slate-600",
        transactionCount: (overviewData.periodTransactionsCount?.all || 0).toString()
      },
      {
        title: "New Subscriptions",
        value: `${(overviewData.periodRevenue?.new || 0).toLocaleString()} EGP`,
        change: overviewData.charts?.newSubscribtion?.overallChangePercentage || 0,
        icon: Star,
        color: "text-slate-600",
        transactionCount: (overviewData.periodTransactionsCount?.new || 0).toString()
      },
      {
        title: "Renewals Revenue",
        value: `${(overviewData.periodRevenue?.renew || 0).toLocaleString()} EGP`,
        change: overviewData.charts?.renewSubscribtions?.overallChangePercentage || 0,
        icon: RefreshCw,
        color: "text-slate-600",
        transactionCount: (overviewData.periodTransactionsCount?.renew || 0).toString()
      }
    ];
  };

  const getChartData = (chartType: 'merchants' | 'newSubscribtion' | 'renewSubscribtions') => {
    if (!overviewData?.charts?.[chartType]) {
      return { current: [], previous: [], dates: [] };
    }

    const chartData = overviewData.charts[chartType];
    const dates = chartData.currentDurationData?.map(point => point.date) || [];

    return {
      current: chartData.currentDurationData?.map(point => point.value) || [],
      previous: chartData.prevDurationData?.map(point => point.value) || [],
      dates: dates
    };
  };

  const getPlanCountsData = () => {
    if (!overviewData) {
      return { starter: 0, pro: 0, plus: 0, onDemand: 0, trial: 0, free: 0 };
    }

    return {
      starter: overviewData.counters?.starter || 0,
      pro: overviewData.counters?.pro || 0,
      plus: overviewData.counters?.plus || 0,
      onDemand: 0,
      trial: overviewData.salesLeadsCount || 0,
      free: overviewData.assignedStoresCount || 0
    };
  };

  const getLeaderboardDisplayData = () => {
    if (leaderboardData.length === 0) return [];

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

  // Loading state
  if (apiLoading) {
    return (
      <ResponsiveWrapper padding="sm">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-3 border-slate-200 border-t-indigo-600 rounded-full mx-auto mb-4"
              style={{ borderWidth: '3px' }}
            />
            <p className="text-slate-500 text-sm">Loading dashboard...</p>
          </div>
        </div>
      </ResponsiveWrapper>
    );
  }

  // Error state
  if (error) {
    return (
      <ResponsiveWrapper padding="sm">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => fetchData()}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
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
    await fetchData(tempDateRange);
    setLoading(false);
  };

  return (
    <ResponsiveWrapper padding="sm">
      <div className="space-y-6 pb-8 sm:pb-12">

        {/* 1. Today's Agenda */}
        <TodayAgenda />

        {/* 2. Date Range Header + Quick Actions */}
        <div className="space-y-3">
          <DateRangeHeader
            tempDateRange={tempDateRange}
            planCountsData={planCountsData}
            loading={loading}
            onDateChange={handleDateChange}
            onRefresh={handleRefresh}
          />

          {/* Quick Actions - Subtle link-style buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Link
              href="/dashboard/leads"
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Lead
            </Link>
            <Link
              href="/dashboard/retention"
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              View Expiring
            </Link>
            <Link
              href="/dashboard/leads?tab=follow_up"
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <Users className="h-3.5 w-3.5" />
              Follow-ups
            </Link>
            <Link
              href="/dashboard/reminders"
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <Bell className="h-3.5 w-3.5" />
              Reminders
            </Link>
          </div>
        </div>

        {/* Mobile Live Stats */}
        <MobileStatsCollapse planCounts={planCountsData} />

        {/* 3. Stats Cards */}
        <ResponsiveGrid cols={{ base: 1, sm: 2, md: 3 }} gap={4}>
          {statsCardsData.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </ResponsiveGrid>

        {/* 4. Target Progress + Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <TargetProgressCard
              currentUserData={currentUserData}
              overviewData={overviewData ? {
                totalTarget: overviewData.totalTarget,
                newSubscriptionTarget: overviewData.newSubscriptionTarget,
                renewalsTarget: overviewData.renewalsTarget
              } : null}
            />
          </div>
          <div className="hidden lg:block lg:col-span-1">
            <DesktopLeaderboard
              leaderboardDisplayData={leaderboardDisplayData}
              currentUserName={currentUserData.name}
            />
          </div>
        </div>

        {/* Mobile Leaderboard */}
        <MobileLeaderboardAndBonus
          leaderboardData={leaderboardDisplayData}
          currentUserName={currentUserData.name}
        />

        {/* 5. Pipeline */}
        <SectionDivider title="Pipeline" />

        <ConversionFunnel
          counters={overviewData ? {
            salesLeadsCount: overviewData.salesLeadsCount,
            assignedStoresCount: overviewData.assignedStoresCount,
          } : null}
          leadOverview={leadOverview}
        />

        {/* 6. Performance */}
        <SectionDivider title="Performance" />

        <div className="space-y-4">
          {/* First Row - 2 charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LineChartWithTooltip
              title="New Subscriptions"
              datasets={[
                {
                  label: "Current Period",
                  data: getChartData('newSubscribtion').current,
                  borderColor: "rgb(79, 70, 229)",
                  backgroundColor: "rgba(79, 70, 229, 0.5)",
                },
                {
                  label: "Previous Period",
                  data: getChartData('newSubscribtion').previous,
                  borderColor: "rgba(79, 70, 229, 0.3)",
                  backgroundColor: "rgba(79, 70, 229, 0.2)",
                  borderDash: [5, 5]
                }
              ]}
              dateRange={tempDateRange}
              dates={getChartData('newSubscribtion').dates}
              showPercentage={false}
            />

            <LineChartWithTooltip
              title="Renewals"
              datasets={[
                {
                  label: "Current Period",
                  data: getChartData('renewSubscribtions').current,
                  borderColor: "rgb(16, 185, 129)",
                  backgroundColor: "rgba(16, 185, 129, 0.5)",
                },
                {
                  label: "Previous Period",
                  data: getChartData('renewSubscribtions').previous,
                  borderColor: "rgba(16, 185, 129, 0.3)",
                  backgroundColor: "rgba(16, 185, 129, 0.2)",
                  borderDash: [5, 5]
                }
              ]}
              dateRange={tempDateRange}
              dates={getChartData('renewSubscribtions').dates}
              showPercentage={false}
            />
          </div>

          {/* Second Row - Full width */}
          <LineChartWithTooltip
            title="New Merchants"
            datasets={[
              {
                label: "Current Period",
                data: getChartData('merchants').current,
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.5)",
              },
              {
                label: "Previous Period",
                data: getChartData('merchants').previous,
                borderColor: "rgba(59, 130, 246, 0.3)",
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                borderDash: [5, 5]
              }
            ]}
            dateRange={tempDateRange}
            dates={getChartData('merchants').dates}
            showPercentage={false}
          />
        </div>
      </div>
    </ResponsiveWrapper>
  );
}
