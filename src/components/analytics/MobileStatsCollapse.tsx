"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Star, Crown, Rocket, Zap, UserCheck, UserX } from "lucide-react";

interface MobileStatsCollapseProps {
  planCounts: {
    starter: number;
    pro: number;
    plus: number;
    onDemand: number;
    trial: number;
    free: number;
  };
}

export const MobileStatsCollapse = ({ planCounts }: MobileStatsCollapseProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="lg:hidden bg-white rounded-xl border border-slate-200 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-medium text-slate-800 text-sm">Plan Stats</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
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
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Paid Plans</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center space-y-1 bg-slate-50 rounded-lg px-2 py-2.5 border border-slate-200">
                <Star className="h-4 w-4 text-slate-500" />
                <div className="text-xs text-slate-600">Starter</div>
                <div className="text-sm font-semibold text-slate-800">{planCounts.starter}</div>
              </div>

              <div className="flex flex-col items-center space-y-1 bg-slate-50 rounded-lg px-2 py-2.5 border border-slate-200">
                <Crown className="h-4 w-4 text-slate-500" />
                <div className="text-xs text-slate-600">Pro</div>
                <div className="text-sm font-semibold text-slate-800">{planCounts.pro}</div>
              </div>

              <div className="flex flex-col items-center space-y-1 bg-slate-50 rounded-lg px-2 py-2.5 border border-slate-200">
                <Rocket className="h-4 w-4 text-slate-500" />
                <div className="text-xs text-slate-600">Plus</div>
                <div className="text-sm font-semibold text-slate-800">{planCounts.plus}</div>
              </div>

              <div className="flex flex-col items-center space-y-1 bg-slate-50 rounded-lg px-2 py-2.5 border border-slate-200">
                <Zap className="h-4 w-4 text-slate-500" />
                <div className="text-xs text-slate-600">On Demand</div>
                <div className="text-sm font-semibold text-slate-800">{planCounts.onDemand}</div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Additional</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center space-y-1 bg-slate-50 rounded-lg px-2 py-2.5 border border-slate-200">
                <UserCheck className="h-4 w-4 text-slate-500" />
                <div className="text-xs text-slate-600">Sales Leads</div>
                <div className="text-sm font-semibold text-slate-800">{planCounts.trial}</div>
              </div>

              <div className="flex flex-col items-center space-y-1 bg-slate-50 rounded-lg px-2 py-2.5 border border-slate-200">
                <UserX className="h-4 w-4 text-slate-500" />
                <div className="text-xs text-slate-600">Assigned</div>
                <div className="text-sm font-semibold text-slate-800">{planCounts.free}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
