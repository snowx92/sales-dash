"use client";

import { motion } from "framer-motion";
import { Target, RefreshCw, Star } from "lucide-react";

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
  const renderTargetProgress = (
    title: string,
    icon: React.ReactNode,
    target: { current: number; total: number; percentage: number | null } | undefined,
    barColor: string
  ) => {
    if (!target || target.total === 0) {
      return (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <span className="text-sm font-medium text-slate-600">{title}</span>
          </div>
          <p className="text-xs text-slate-400">No {title.toLowerCase()} target this month</p>
        </div>
      );
    }

    const percentage = target.percentage ?? ((target.current / target.total) * 100);

    return (
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <span className="text-sm font-medium text-slate-600">{title}</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">{target.current.toLocaleString()} EGP</span>
            <span className="text-slate-500">{target.total.toLocaleString()} EGP</span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-2 rounded-full ${barColor}`}
            />
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-600">
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-slate-200 rounded-xl p-6 h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Target className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Sales Target Progress
          </h3>
          <p className="text-sm text-slate-500">Track your progress across all target types</p>
        </div>
      </div>

      {/* Main Target Display */}
      <div className="mb-6 p-5 bg-slate-50 rounded-lg border border-slate-200">
        <div className="text-center space-y-3">
          <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{currentUserData.targetType}</h4>
          <div className="text-2xl font-bold text-slate-900">
            {currentUserData.currentRevenue.toLocaleString()} EGP
          </div>
          <div className="text-sm text-slate-500">
            of {currentUserData.targetRevenue.toLocaleString()} EGP target
          </div>

          <div className="mt-3">
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(currentUserData.targetPercentage || 0, 100)}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                className="h-2.5 rounded-full bg-indigo-500"
              />
            </div>

            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-semibold text-indigo-600">
                {(currentUserData.targetPercentage || 0).toFixed(1)}% Complete
              </span>
              <span className="text-xs text-slate-400">
                {Math.max(0, currentUserData.targetRevenue - currentUserData.currentRevenue).toLocaleString()} EGP remaining
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Target Progress */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-600">Individual Targets</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {renderTargetProgress(
            "New Subscriptions",
            <Star className="h-4 w-4 text-blue-500" />,
            overviewData?.newSubscriptionTarget,
            "bg-blue-500"
          )}

          {renderTargetProgress(
            "Renewals Target",
            <RefreshCw className="h-4 w-4 text-emerald-500" />,
            overviewData?.renewalsTarget,
            "bg-emerald-500"
          )}
        </div>
      </div>
    </motion.div>
  );
};
