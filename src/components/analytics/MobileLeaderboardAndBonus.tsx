"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

interface LeaderboardMember {
  id: string | number;
  name: string;
  avatar: string;
  revenue: number;
  target: number;
  percentage: number;
  isTop: boolean;
}

interface MobileLeaderboardAndBonusProps {
  leaderboardData: LeaderboardMember[];
  currentUserName: string;
}

export const MobileLeaderboardAndBonus = ({
  leaderboardData,
  currentUserName
}: MobileLeaderboardAndBonusProps) => {
  const getRankStyle = (index: number) => {
    if (index === 0) return 'bg-amber-100 text-amber-700';
    if (index === 1) return 'bg-slate-200 text-slate-600';
    if (index === 2) return 'bg-orange-100 text-orange-700';
    return 'bg-slate-100 text-slate-600';
  };

  const getPercentageStyle = (percentage: number) => {
    if (percentage >= 100) return 'bg-emerald-50 text-emerald-700';
    if (percentage >= 75) return 'bg-amber-50 text-amber-700';
    return 'bg-red-50 text-red-700';
  };

  return (
    <div className="lg:hidden mb-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-slate-200 rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-4 w-4 text-slate-400" />
          <h3 className="text-base font-semibold text-slate-800">Leaderboard</h3>
        </div>

        <div className="space-y-2.5">
          {leaderboardData.slice(0, 3).map((member, index) => (
            <div
              key={member.id}
              className={`p-3 rounded-lg border transition-colors ${
                member.name === currentUserName
                  ? 'bg-indigo-50/50 border-indigo-200'
                  : 'border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankStyle(index)}`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-slate-800 text-xs">{member.name}</span>
                  {member.name === currentUserName && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">You</span>
                  )}
                </div>

                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPercentageStyle(member.percentage)}`}>
                  {member.percentage.toFixed(0)}%
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs text-slate-500">
                  {member.revenue.toLocaleString()} EGP / {member.target.toLocaleString()} EGP
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(member.percentage, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: index * 0.15 }}
                    className="h-1.5 rounded-full bg-indigo-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
