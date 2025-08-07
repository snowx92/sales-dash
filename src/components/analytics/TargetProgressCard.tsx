"use client";

import { motion } from "framer-motion";
import { Trophy, RefreshCw, Star } from "lucide-react";

interface TargetProgressCardProps {
  currentUserData: {
    targetType: string;
    currentRevenue: number;
    targetRevenue: number;
    targetPercentage: number;
  };
  overviewData?: {
    totalTarget?: { current: number; total: number; percentage: number | null };
    newSubscriptionTarget?: { current: number; total: number; percentage: number | null };
    renewalsTarget?: { current: number; total: number; percentage: number | null };
  } | null;
}

export const TargetProgressCard = ({ currentUserData, overviewData }: TargetProgressCardProps) => {
  // Helper function to render individual target progress
  const renderTargetProgress = (
    title: string,
    icon: React.ReactNode,
    target: { current: number; total: number; percentage: number | null } | undefined,
    color: string
  ) => {
    if (!target || target.total === 0) {
      return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <span className="text-sm font-medium text-gray-700">{title}</span>
          </div>
          <p className="text-xs text-gray-500">You don&apos;t have {title.toLowerCase()} this month</p>
        </div>
      );
    }

    const percentage = target.percentage ?? ((target.current / target.total) * 100);
    const progressColor = color;

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">{target.current.toLocaleString()} EGP</span>
            <span className="text-gray-600">{target.total.toLocaleString()} EGP</span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentage, 100)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`h-2 rounded-full ${progressColor}`}
              />
            </div>
          </div>
          
          <div className="text-right">
            <span className={`text-xs font-medium ${progressColor.includes('green') ? 'text-green-600' : progressColor.includes('blue') ? 'text-blue-600' : 'text-purple-600'}`}>
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-white via-purple-50/30 to-white p-6 rounded-xl shadow-lg border border-purple-100/50 h-full">
      <div className="flex items-center gap-3 mb-6">
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
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            Sales Targets Progress
          </h3>
          <p className="text-sm text-gray-600">Track your progress across all target types</p>
        </div>
      </div>

      {/* Main Target Display */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg border border-purple-200">
        <div className="text-center space-y-2">
          <h4 className="text-lg font-semibold text-gray-700">{currentUserData.targetType}</h4>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="relative"
          >
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              {currentUserData.currentRevenue.toLocaleString()} EGP
            </div>
          </motion.div>
          <div className="text-sm text-gray-600 font-medium">
            of {currentUserData.targetRevenue.toLocaleString()} EGP target
          </div>
          
          <div className="relative mt-3">
            <div className="w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full h-3 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(currentUserData.targetPercentage || 0, 100)}%` }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                className="relative h-3 rounded-full overflow-hidden shadow-lg"
                style={{
                  background: 'linear-gradient(90deg, #8B5CF6, #EC4899, #F59E0B, #10B981)',
                  backgroundSize: '300% 300%'
                }}
              >
                <motion.div
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  style={{ backgroundSize: '200% 100%' }}
                />
              </motion.div>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent"
              >
                {(currentUserData.targetPercentage || 0).toFixed(1)}% Complete
              </motion.div>
              
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xs text-gray-500 flex items-center gap-1"
              >
                🎯 Keep pushing!
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Target Progress */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Individual Target Progress</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {renderTargetProgress(
            "New Subscriptions",
            <Star className="h-4 w-4 text-blue-500" />,
            overviewData?.newSubscriptionTarget,
            "bg-gradient-to-r from-blue-500 to-blue-600"
          )}
          
          {renderTargetProgress(
            "Renewals Target",
            <RefreshCw className="h-4 w-4 text-green-500" />,
            overviewData?.renewalsTarget,
            "bg-gradient-to-r from-green-500 to-green-600"
          )}
        </div>
      </div>
    </div>
  );
};
