"use client";

import React from "react";
import { motion } from "framer-motion";
import { DollarSign, AlertTriangle, TrendingDown, Users } from "lucide-react";

interface RetentionSummaryBarProps {
  merchants: Array<{
    impact?: number;
    priority?: string;
  }>;
}

export const RetentionSummaryBar: React.FC<RetentionSummaryBarProps> = ({ merchants }) => {
  if (!merchants || merchants.length === 0) return null;

  const totalImpact = merchants.reduce((sum, m) => sum + (m.impact || 0), 0);
  const highImpact = merchants
    .filter((m) => m.priority === "HIGH")
    .reduce((sum, m) => sum + (m.impact || 0), 0);
  const medImpact = merchants
    .filter((m) => m.priority === "MEDIUM")
    .reduce((sum, m) => sum + (m.impact || 0), 0);
  const lowImpact = merchants
    .filter((m) => m.priority === "LOW" || !m.priority || m.priority === "JUNK")
    .reduce((sum, m) => sum + (m.impact || 0), 0);

  const highCount = merchants.filter((m) => m.priority === "HIGH").length;
  const medCount = merchants.filter((m) => m.priority === "MEDIUM").length;

  const stats = [
    {
      label: "Revenue at Risk",
      value: `${totalImpact.toLocaleString()} EGP`,
      icon: DollarSign,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      label: "High Priority",
      value: `${highImpact.toLocaleString()} EGP`,
      subtitle: `${highCount} merchants`,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      label: "Medium Priority",
      value: `${medImpact.toLocaleString()} EGP`,
      subtitle: `${medCount} merchants`,
      icon: TrendingDown,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      label: "Total Merchants",
      value: merchants.length.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} border ${stat.borderColor} rounded-xl p-4`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs font-medium text-gray-600">{stat.label}</span>
            </div>
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            {stat.subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{stat.subtitle}</p>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
};
