"use client";

import { motion } from "framer-motion";
import { Calendar, RefreshCw, ShoppingCart, ChevronDown, ChevronUp, Crown, Zap, Rocket, Star, UserCheck, UserX, Copy, Trophy, Target, Flame } from "lucide-react";
import StatCard from "@/components/analytics/StatCard";
import LineChartWithTooltip from "@/components/analytics/LineChartWithTooltip";
import { useState } from "react";
import { ResponsiveWrapper, ResponsiveGrid, ResponsiveCard } from "@/components/layout/ResponsiveWrapper";

// Mock data for plan counts with the requested numbers
const planCounts = {
  starter: 65,
  pro: 57,
  plus: 41,
  onDemand: 8,
  trial: 61,
  free: 9058
};

// Mock data for sales team functionality
const currentUser = {
  name: "Ahmed Hassan",
  avatar: "/placeholder-avatar.jpg",
  currentRevenue: 220500,
  targetRevenue: 840000,
  affiliateLink: "https://vondera.app/ref/ahmed-hassan-123",
  rank: 3
};

const leaderboard = [
  { 
    id: 1, 
    name: "Sarah Ahmed", 
    avatar: "/placeholder-avatar.jpg", 
    revenue: 945000, 
    target: 840000, 
    percentage: 112.5,
    isTop: true 
  },
  { 
    id: 2, 
    name: "Mohamed Ali", 
    avatar: "/placeholder-avatar.jpg", 
    revenue: 798000, 
    target: 840000, 
    percentage: 95.0,
    isTop: false 
  },
  { 
    id: 3, 
    name: "Ahmed Hassan", 
    avatar: "/placeholder-avatar.jpg", 
    revenue: 220500, 
    target: 840000, 
    percentage: 26.3,
    isTop: false 
  },
  { 
    id: 4, 
    name: "Fatima Omar", 
    avatar: "/placeholder-avatar.jpg", 
    revenue: 172200, 
    target: 840000, 
    percentage: 20.5,
    isTop: false 
  },
];



// Mock data for required stats
const mockStatsCards = [
  {
    title: "Total Revenue",
    value: "85,420 EGP",
    change: 12.5,
    icon: ShoppingCart,
    color: "text-green-600"
  },
  {
    title: "Renew Transactions", 
    value: "23,451 EGP",
    change: 8.2,
    icon: RefreshCw,
    color: "text-blue-600",
    transactionCount: "5"
  },
  {
    title: "New Subscriptions",
    value: "245,020 EGP",
    change: 15.7,
    icon: Star,
    color: "text-purple-600",
    transactionCount: "12"
  }
];

// Mock chart data
const mockCharts = {
  sales: {
    values: [12000, 15000, 8000, 22000, 18000, 25000, 30000, 28000, 35000, 40000, 38000, 45000, 42000, 48000, 50000]
  },
  orders: {
    values: [120, 150, 80, 220, 180, 250, 300, 280, 350, 400, 380, 450, 420, 480, 500]
  },
  merchants: {
    values: [10, 15, 8, 22, 18, 25, 30, 28, 35, 40, 38, 45, 42, 48, 50]
  },
  subscriptions: {
    values: [5, 8, 12, 15, 10, 18, 22, 20, 25, 28, 30, 35, 38, 40, 42]
  },
  renewals: {
    values: [20, 25, 18, 30, 28, 35, 40, 38, 45, 42, 48, 50, 55, 52, 58]
  },
  vpay: {
    values: [100, 120, 95, 140, 130, 155, 170, 165, 180, 185, 190, 200, 195, 210, 220]
  },
  conversion: {
    values: [2.5, 3.2, 2.8, 4.1, 3.8, 4.5, 5.2, 4.8, 5.5, 5.8, 6.2, 6.8, 6.5, 7.2, 7.5]
  },
  churn: {
    values: [1.2, 1.5, 1.1, 1.8, 1.6, 2.1, 1.9, 2.3, 2.0, 1.7, 1.4, 1.6, 1.3, 1.1, 0.9]
  }
};

const dateRange = {
  from: "2024-01-01",
  to: "2024-12-31"
};

// Responsive section divider component
const SectionDivider = ({ title }: { title: string }) => (
  <div className="flex items-center w-full my-6 sm:my-8">
    <div className="h-0.5 flex-grow bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
    <h2 className="mx-2 sm:mx-4 text-lg sm:text-xl font-bold text-purple-800 px-3 sm:px-6 py-1.5 sm:py-2 bg-purple-50 rounded-full border border-purple-100 shadow-sm text-center">
      {title}
    </h2>
    <div className="h-0.5 flex-grow bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
  </div>
);

// Interface for MobileStatsCollapse props
interface MobileStatsCollapseProps {
  planCounts: typeof planCounts;
}

// Mobile collapsible stats component
const MobileStatsCollapse = ({ planCounts }: MobileStatsCollapseProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="lg:hidden bg-white rounded-lg border border-gray-200 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-medium text-gray-900">Live Stats</span>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 pb-4 space-y-3"
        >

          
          {/* Paid Plans Group */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-2">Paid Plans</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center space-y-1 bg-purple-50 rounded-lg px-2 py-2 border border-purple-100">
                <Star className="h-4 w-4 text-purple-600" />
                <div className="text-xs text-purple-600 text-center">Starter</div>
                <div className="text-sm font-medium text-purple-700">{planCounts.starter}</div>
              </div>
              
              <div className="flex flex-col items-center space-y-1 bg-indigo-50 rounded-lg px-2 py-2 border border-indigo-100">
                <Crown className="h-4 w-4 text-indigo-600" />
                <div className="text-xs text-indigo-600 text-center">Pro</div>
                <div className="text-sm font-medium text-indigo-700">{planCounts.pro}</div>
              </div>
              
              <div className="flex flex-col items-center space-y-1 bg-pink-50 rounded-lg px-2 py-2 border border-pink-100">
                <Rocket className="h-4 w-4 text-pink-600" />
                <div className="text-xs text-pink-600 text-center">Plus</div>
                <div className="text-sm font-medium text-pink-700">{planCounts.plus}</div>
              </div>
              
              <div className="flex flex-col items-center space-y-1 bg-orange-50 rounded-lg px-2 py-2 border border-orange-100">
                <Zap className="h-4 w-4 text-orange-600" />
                <div className="text-xs text-orange-600 text-center">On Demand</div>
                <div className="text-sm font-medium text-orange-700">{planCounts.onDemand}</div>
              </div>
            </div>
          </div>

          {/* User Categories Group */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-2">User Categories</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center space-y-1 bg-green-50 rounded-lg px-2 py-2 border border-green-100">
                <UserCheck className="h-4 w-4 text-green-600" />
                <div className="text-xs text-green-600 text-center">Trial</div>
                <div className="text-sm font-medium text-green-700">{planCounts.trial}</div>
              </div>
              
              <div className="flex flex-col items-center space-y-1 bg-gray-50 rounded-lg px-2 py-2 border border-gray-100">
                <UserX className="h-4 w-4 text-gray-600" />
                <div className="text-xs text-gray-600 text-center">Free</div>
                <div className="text-sm font-medium text-gray-700">{planCounts.free}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Mobile Leaderboard and Bonus Components
const MobileLeaderboardAndBonus = () => {
  return (
    <div className="lg:hidden space-y-4 mb-4">
      {/* Mobile Compact Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-white via-yellow-50/30 to-white p-4 rounded-xl shadow-lg border border-yellow-100/50"
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <Trophy className="h-5 w-5 text-yellow-600" />
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-1 bg-yellow-400/20 rounded-full blur-sm"
            />
          </motion.div>
          <h3 className="text-sm font-bold bg-gradient-to-r from-yellow-600 to-orange-500 bg-clip-text text-transparent">
            🏆 Top Performers
          </h3>
        </div>
        
        <div className="space-y-3">
          {leaderboard.slice(0, 3).map((member, index) => (
            <motion.div 
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${
                member.name === currentUser.name 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 shadow-lg' 
                  : 'bg-gradient-to-r from-gray-50 to-white border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <motion.div 
                    animate={index === 0 ? { 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`relative w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800' :
                      'bg-gradient-to-r from-orange-300 to-orange-400 text-white'
                    }`}
                  >
                    {index + 1}
                  </motion.div>
                  
                  {member.isTop && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Flame className="h-4 w-4 text-red-500" />
                    </motion.div>
                  )}
                  
                  <span className="font-medium text-gray-900 text-xs">{member.name}</span>
                  
                  {member.name === currentUser.name && (
                    <motion.span
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium"
                    >
                      You
                    </motion.span>
                  )}
                </div>
                
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    member.percentage >= 100 ? 'bg-green-100 text-green-700' : 
                    member.percentage >= 75 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {member.percentage.toFixed(0)}%
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs text-gray-600 font-medium">
                  {member.revenue.toLocaleString()} EGP / {member.target.toLocaleString()} EGP
                </div>
                
                <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(member.percentage, 100)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.2 }}
                    className={`h-2 rounded-full relative overflow-hidden ${
                      member.percentage >= 100 ? 'bg-gradient-to-r from-green-400 to-green-500' : 
                      member.percentage >= 75 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                      'bg-gradient-to-r from-red-400 to-red-500'
                    }`}
                  >
                    <motion.div
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/3"
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Mobile Bonus Incentives Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-4 rounded-xl shadow-lg border-2 border-emerald-200/50 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-300 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-4 -left-4 w-12 h-12 bg-emerald-400 rounded-full"
          />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎁
            </motion.div>
            <h3 className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              Daily Bonus Challenge
            </h3>
          </div>
          
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-emerald-200/50 mb-3"
          >
            <div className="text-center space-y-2">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-lg font-bold text-emerald-700"
              >
                🔥 TODAY&apos;S BONUS
              </motion.div>
              
              <div className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold text-emerald-600">Reach 2,000 EGP</span> today
                <br />
                <span className="text-gray-500">and unlock</span>
                <br />
                <motion.span
                  animate={{ color: ['#059669', '#10b981', '#059669'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-lg font-bold"
                >
                  +500 EGP BONUS! 💰
                </motion.span>
              </div>
            </div>
          </motion.div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Today&apos;s Progress</span>
              <span className="font-semibold text-emerald-600">750 / 2,000 EGP</span>
            </div>
            
            <div className="relative w-full bg-emerald-100 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '37.5%' }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full relative overflow-hidden"
              >
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-1/2"
                />
              </motion.div>
            </div>
            
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center text-xs text-emerald-600 font-medium"
            >
              1,250 EGP to go! 🚀
            </motion.div>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="mt-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg p-2 text-center cursor-pointer"
          >
            <div className="text-xs font-bold flex items-center justify-center gap-1">
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ⚡
              </motion.span>
              Beat Sarah&apos;s record: 1,850 EGP
              <motion.span
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ⚡
              </motion.span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default function ReportsPage() {
  const [tempDateRange, setTempDateRange] = useState(dateRange);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    const newRange = { ...tempDateRange, [field]: value };
    setTempDateRange(newRange);
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <ResponsiveWrapper padding="sm">
      <div className="space-y-4 sm:space-y-6 pb-8 sm:pb-12">
              {/* Top Section - Target Progress & Affiliate Link */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Target Progress */}
          <div className="lg:col-span-2 bg-gradient-to-br from-white via-purple-50/30 to-white p-6 rounded-xl shadow-lg border border-purple-100/50">
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <Trophy className="h-6 w-6 text-orange-500" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-1 bg-orange-400/20 rounded-full blur-sm"
                />
              </motion.div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                Sales Target Progress
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <div className="text-center sm:text-left space-y-2">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "backOut" }}
                  className="relative"
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                    {currentUser.currentRevenue.toLocaleString()} EGP
                  </div>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -inset-2 bg-gradient-to-r from-purple-400/20 to-orange-400/20 rounded-lg blur-lg -z-10"
                  />
                </motion.div>
                <div className="text-sm text-gray-600 font-medium">
                  of {currentUser.targetRevenue.toLocaleString()} EGP target
                </div>
              </div>
              
              <div className="sm:col-span-2 space-y-3">
                <div className="relative">
                  {/* Progress bar background */}
                  <div className="w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full h-4 shadow-inner">
                    {/* Animated progress bar */}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((currentUser.currentRevenue / currentUser.targetRevenue) * 100, 100)}%` }}
                      transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                      className="relative h-4 rounded-full overflow-hidden shadow-lg"
                      style={{
                        background: 'linear-gradient(90deg, #8B5CF6, #EC4899, #F59E0B, #10B981)',
                        backgroundSize: '300% 300%'
                      }}
                    >
                      {/* Flowing animation */}
                      <motion.div
                        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        style={{ backgroundSize: '200% 100%' }}
                      />
                      
                      {/* Shimmer effect */}
                      <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/3"
                      />
                    </motion.div>
          </div>

                  {/* Glowing dots for milestones */}
                  <div className="absolute -top-1 w-full h-6 pointer-events-none">
                    {[25, 50, 75].map((milestone) => (
                      <motion.div
                        key={milestone}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, delay: milestone / 100 }}
                        className="absolute w-2 h-2 bg-white rounded-full shadow-lg border-2 border-purple-400"
                        style={{ left: `${milestone}%`, transform: 'translateX(-50%)' }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent"
                  >
                    {((currentUser.currentRevenue / currentUser.targetRevenue) * 100).toFixed(1)}% Complete
                  </motion.div>
                  
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-xs text-gray-500 flex items-center gap-1"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      🎯
                    </motion.div>
                    Keep pushing to reach your goal!
                  </motion.div>
                </div>
              </div>
            </div>
                </div>
                
          {/* Affiliate Link */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-purple-900">Your Affiliate Link</h3>
                </div>
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <code className="text-xs text-purple-700 break-all block mb-2">{currentUser.affiliateLink}</code>
              <button className="w-full h-8 rounded-md px-3 text-xs bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors inline-flex items-center justify-center gap-2">
                <Copy className="h-3 w-3" />
                Copy Link
              </button>
                </div>
              </div>
            </div>
            
        {/* Mobile Leaderboard and Bonus - Show on small devices */}
        <MobileLeaderboardAndBonus />

        {/* Compact Header Section */}
        <div className="bg-white p-3 rounded-xl shadow-sm">
          {/* Mobile Header */}
          <div className="block lg:hidden space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border flex-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  value={tempDateRange.from}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                  className="border-none focus:outline-none bg-transparent text-sm w-full"
                />
                <span className="text-gray-500 text-xs">to</span>
                <input
                  type="date"
                  value={tempDateRange.to}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                  className="border-none focus:outline-none bg-transparent text-sm w-full"
                />
              </div>
              <button 
                onClick={handleRefresh} 
                disabled={loading}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-md transition-colors"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-between">
              {/* Plan Counters - Compact */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center space-x-1 bg-purple-50 rounded-full px-2 py-1 border border-purple-100">
                  <Star className="h-3 w-3 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">Starter: {planCounts.starter}</span>
                </div>
                <div className="flex items-center space-x-1 bg-indigo-50 rounded-full px-2 py-1 border border-indigo-100">
                  <Crown className="h-3 w-3 text-indigo-600" />
                  <span className="text-xs font-medium text-indigo-700">Pro: {planCounts.pro}</span>
                </div>
                <div className="flex items-center space-x-1 bg-pink-50 rounded-full px-2 py-1 border border-pink-100">
                  <Rocket className="h-3 w-3 text-pink-600" />
                  <span className="text-xs font-medium text-pink-700">Plus: {planCounts.plus}</span>
                </div>
                <div className="flex items-center space-x-1 bg-orange-50 rounded-full px-2 py-1 border border-orange-100">
                  <Zap className="h-3 w-3 text-orange-600" />
                  <span className="text-xs font-medium text-orange-700">On Demand: {planCounts.onDemand}</span>
                </div>
                <div className="flex items-center space-x-1 bg-green-50 rounded-full px-2 py-1 border border-green-100">
                  <UserCheck className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Trial: {planCounts.trial}</span>
                </div>
                <div className="flex items-center space-x-1 bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
                  <UserX className="h-3 w-3 text-gray-600" />
                  <span className="text-xs font-medium text-gray-700">Free: {planCounts.free}</span>
                </div>
              </div>
              
              {/* Date Picker - Compact */}
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2 bg-gray-50 rounded-md p-2 border">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <input
                    type="date"
                    value={tempDateRange.from}
                    onChange={(e) => handleDateChange('from', e.target.value)}
                    className="border-none focus:outline-none bg-transparent text-xs text-gray-700"
                  />
                  <span className="text-gray-500 text-xs">to</span>
                  <input
                    type="date"
                    value={tempDateRange.to}
                    onChange={(e) => handleDateChange('to', e.target.value)}
                    className="border-none focus:outline-none bg-transparent text-xs text-gray-700"
                  />
                </div>
                <button 
                  onClick={handleRefresh} 
                  disabled={loading}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-md transition-colors"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Live Stats */}
        <MobileStatsCollapse planCounts={planCounts} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-6">
            {/* Stats Cards Section - 2 rows of cards */}
                         {/* Stats Cards Section - Single row of 3 cards */}
             <ResponsiveGrid cols={{ base: 1, sm: 2, md: 3 }} gap={4}>
               {mockStatsCards.map((stat, index) => (
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

      {/* Charts Section */}
             <ResponsiveGrid cols={{ base: 1, md: 2 }} gap={4}>
          <ResponsiveCard padding="sm" className="overflow-hidden">
        <LineChartWithTooltip
          title="New Merchants"
          datasets={[{
            label: "New Merchants",
                     data: mockCharts.merchants.values,
            borderColor: "rgb(54, 162, 235)",
            backgroundColor: "rgba(54, 162, 235, 0.5)",
          }]}
          dateRange={dateRange}
          showPercentage={true}
            />
          </ResponsiveCard>
         
          <ResponsiveCard padding="sm" className="overflow-hidden">
        <LineChartWithTooltip
          title="Subscriptions and Transactions"
          datasets={[
            {
              label: "New Subscriptions",
                      data: mockCharts.subscriptions.values,
              borderColor: "rgb(54, 162, 235)",
              backgroundColor: "rgba(54, 162, 235, 0.5)",
            },
            {
              label: "Renewals",
                      data: mockCharts.renewals.values,
              borderColor: "rgb(153, 102, 255)",
              backgroundColor: "rgba(153, 102, 255, 0.5)",
            }
          ]}
          dateRange={dateRange}
          showPercentage={true}
        />
          </ResponsiveCard>
        </ResponsiveGrid>

        {/* Full Width Conversion & Churn Chart */}
        <ResponsiveCard padding="sm" className="overflow-hidden">
          <LineChartWithTooltip
            title="Conversion Rate & Churn Rate"
            datasets={[
              {
                label: "Conversion Rate (%)",
                    data: mockCharts.conversion.values,
                borderColor: "rgb(16, 185, 129)",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
              },
              {
                label: "Churn Rate (%)",
                    data: mockCharts.churn.values,
                borderColor: "rgb(239, 68, 68)",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
              }
            ]}
            dateRange={dateRange}
            showPercentage={true}
          />
        </ResponsiveCard>
          </div>

          {/* Right Sidebar - Desktop Leaderboard and Bonus */}
          <div className="hidden lg:block lg:col-span-1 xl:col-span-2 space-y-6">
            {/* Desktop Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-white via-yellow-50/30 to-white p-6 lg:p-8 rounded-xl shadow-lg border border-yellow-100/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <Trophy className="h-6 w-6 lg:h-7 lg:w-7 text-yellow-600" />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -inset-1 bg-yellow-400/20 rounded-full blur-sm"
                  />
                </motion.div>
                <h3 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-500 bg-clip-text text-transparent">
                  🏆 Team Leaderboard
                </h3>
              </div>
              
              <div className="space-y-4 lg:space-y-5">
                {leaderboard.map((member, index) => (
                  <motion.div 
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`relative p-4 lg:p-5 rounded-xl border-2 transition-all duration-300 ${
                      member.name === currentUser.name 
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 shadow-lg' 
                        : 'bg-gradient-to-r from-gray-50 to-white border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                      <div className="flex items-center gap-3 lg:gap-4">
                        <motion.div 
                          animate={index === 0 ? { 
                            scale: [1, 1.2, 1],
                            rotate: [0, 5, -5, 0]
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`relative w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm lg:text-base font-bold ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg' :
                            index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800' :
                            'bg-gradient-to-r from-orange-300 to-orange-400 text-white'
                          }`}
                        >
                          {index + 1}
                        </motion.div>
                        
                        <div>
                          <span className="font-medium text-gray-900 text-sm lg:text-base">{member.name}</span>
                          {member.name === currentUser.name && (
                            <span className="ml-2 text-xs lg:text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">You</span>
                          )}
                        </div>
                      </div>
                      
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className={`text-sm lg:text-base font-bold px-3 py-1 lg:px-4 lg:py-2 rounded-full ${
                          member.percentage >= 100 ? 'bg-green-100 text-green-700' : 
                          member.percentage >= 75 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {member.percentage.toFixed(0)}%
                      </motion.div>
                    </div>
                    
                    <div className="space-y-2 lg:space-y-3">
                      <div className="text-sm lg:text-base text-gray-600 font-medium">
                        {member.revenue.toLocaleString()} EGP / {member.target.toLocaleString()} EGP
                      </div>
                      
                      <div className="relative w-full bg-gray-200 rounded-full h-2 lg:h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(member.percentage, 100)}%` }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.2 }}
                          className={`h-2 lg:h-3 rounded-full ${
                            member.percentage >= 100 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                            member.percentage >= 75 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                            'bg-gradient-to-r from-red-400 to-red-500'
                          }`}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Desktop Bonus Incentives Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-6 lg:p-8 rounded-xl shadow-lg border-2 border-emerald-200/50 overflow-hidden"
            >
              <div className="absolute inset-0 opacity-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-4 -right-4 w-16 h-16 lg:w-20 lg:h-20 bg-emerald-300 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-4 -left-4 w-12 h-12 lg:w-16 lg:h-16 bg-emerald-400 rounded-full"
                />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-xl lg:text-2xl"
                  >
                    🎁
                  </motion.div>
                  <h3 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                    Daily Bonus Challenge
                  </h3>
                </div>
                
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="bg-white/80 backdrop-blur-sm rounded-lg p-4 lg:p-6 border border-emerald-200/50 mb-4 lg:mb-6"
                >
                  <div className="text-center space-y-3 lg:space-y-4">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-xl lg:text-2xl font-bold text-emerald-700"
                    >
                      🔥 TODAY&apos;S BONUS
                    </motion.div>
                    
                    <div className="text-sm lg:text-base text-gray-600 leading-relaxed">
                      <span className="font-semibold text-emerald-600">Reach 2,000 EGP</span> today
                      <br />
                      <span className="text-gray-500">and unlock</span>
                      <br />
                      <motion.span
                        animate={{ color: ['#059669', '#10b981', '#059669'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-xl lg:text-2xl font-bold"
                      >
                        +500 EGP BONUS! 💰
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
                
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex justify-between items-center text-sm lg:text-base">
                    <span className="text-gray-600">Today&apos;s Progress</span>
                    <span className="font-semibold text-emerald-600">750 / 2,000 EGP</span>
                  </div>
                  
                  <div className="relative w-full bg-emerald-100 rounded-full h-3 lg:h-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '37.5%' }}
                      transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                      className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-3 lg:h-4 rounded-full relative overflow-hidden"
                    >
                      <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-1/2"
                      />
                    </motion.div>
                  </div>
                  
                  <motion.div
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-center text-sm lg:text-base text-emerald-600 font-medium"
                  >
                    1,250 EGP to go! 🚀
                  </motion.div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="mt-4 lg:mt-6 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg p-3 lg:p-4 text-center cursor-pointer"
                >
                  <div className="text-sm lg:text-base font-bold flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="text-base lg:text-lg"
                    >
                      ⚡
                    </motion.span>
                    Beat Sarah&apos;s record: 1,850 EGP
                    <motion.span
                      animate={{ rotate: [0, -360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="text-base lg:text-lg"
                    >
                      ⚡
                    </motion.span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </ResponsiveWrapper>
  );
}
