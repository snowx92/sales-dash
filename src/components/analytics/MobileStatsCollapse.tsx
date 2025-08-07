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
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-2">Additional Stats</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center space-y-1 bg-green-50 rounded-lg px-2 py-2 border border-green-100">
                <UserCheck className="h-4 w-4 text-green-600" />
                <div className="text-xs text-green-600 text-center">Sales Leads</div>
                <div className="text-sm font-medium text-green-700">{planCounts.trial}</div>
              </div>
              
              <div className="flex flex-col items-center space-y-1 bg-gray-50 rounded-lg px-2 py-2 border border-gray-100">
                <UserX className="h-4 w-4 text-gray-600" />
                <div className="text-xs text-gray-600 text-center">Assigned Stores</div>
                <div className="text-sm font-medium text-gray-700">{planCounts.free}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
