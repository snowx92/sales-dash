"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface FunnelStage {
  label: string;
  count: number;
  bgColor: string;
  tab: string;
}

interface ConversionFunnelProps {
  counters?: {
    salesLeadsCount?: number;
    assignedStoresCount?: number;
  } | null;
  leadOverview?: {
    total?: number;
    totalSubscribedLeads?: number;
    totalInterestedLeads?: number;
    totalFollowUpLeads?: number;
    totalNotInterestedLeads?: number;
    totalNewLeads?: number;
  } | null;
}

export default function ConversionFunnel({ counters, leadOverview }: ConversionFunnelProps) {
  const stages: FunnelStage[] = [
    {
      label: "New",
      count: leadOverview?.totalNewLeads || counters?.salesLeadsCount || 0,
      bgColor: "bg-blue-400",
      tab: "new",
    },
    {
      label: "Interested",
      count: leadOverview?.totalInterestedLeads || 0,
      bgColor: "bg-emerald-400",
      tab: "interested",
    },
    {
      label: "Follow Up",
      count: leadOverview?.totalFollowUpLeads || 0,
      bgColor: "bg-amber-400",
      tab: "follow_up",
    },
    {
      label: "Subscribed",
      count: leadOverview?.totalSubscribedLeads || 0,
      bgColor: "bg-indigo-500",
      tab: "subscribed",
    },
  ];

  const maxCount = Math.max(...stages.map((s) => s.count), 1);
  const totalLeads = leadOverview?.total || stages.reduce((sum, s) => sum + s.count, 0);

  const newCount = stages[0].count;
  const subscribedCount = stages[stages.length - 1].count;
  const conversionRate = newCount > 0 ? ((subscribedCount / newCount) * 100).toFixed(1) : "0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-slate-200 p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Lead Pipeline</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {totalLeads} total leads &middot; {conversionRate}% conversion rate
          </p>
        </div>
        <Link
          href="/dashboard/leads"
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          View All <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Funnel Bars */}
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const widthPercent = Math.max((stage.count / maxCount) * 100, 8);

          return (
            <Link
              key={stage.tab}
              href={`/dashboard/leads?tab=${stage.tab}`}
              className="block group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium w-20 text-slate-600">
                  {stage.label}
                </span>
                <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercent}%` }}
                    transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                    className={`h-full ${stage.bgColor} rounded-lg flex items-center justify-end pr-2 group-hover:opacity-80 transition-opacity`}
                  >
                    {widthPercent > 20 && (
                      <span className="text-xs font-medium text-white">{stage.count}</span>
                    )}
                  </motion.div>
                  {widthPercent <= 20 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-600">
                      {stage.count}
                    </span>
                  )}
                </div>
              </div>

              {index < stages.length - 1 && (
                <div className="flex items-center justify-center py-0.5">
                  <div className="w-px h-2 bg-slate-200" />
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Not Interested (separate row) */}
      {(leadOverview?.totalNotInterestedLeads || 0) > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <Link href="/dashboard/leads?tab=not_interested" className="flex items-center gap-3 group">
            <span className="text-xs font-medium w-20 text-slate-500">Lost</span>
            <div className="flex-1 h-5 bg-slate-100 rounded-lg overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.max(
                    ((leadOverview?.totalNotInterestedLeads || 0) / maxCount) * 100,
                    8
                  )}%`,
                }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="h-full bg-slate-300 rounded-lg flex items-center justify-end pr-2 group-hover:opacity-80"
              >
                <span className="text-xs font-medium text-slate-600">
                  {leadOverview?.totalNotInterestedLeads || 0}
                </span>
              </motion.div>
            </div>
          </Link>
        </div>
      )}
    </motion.div>
  );
}
