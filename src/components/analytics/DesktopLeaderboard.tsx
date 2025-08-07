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

interface DesktopLeaderboardProps {
  leaderboardDisplayData: LeaderboardMember[];
  currentUserName: string;
}

export const DesktopLeaderboard = ({ 
  leaderboardDisplayData, 
  currentUserName 
}: DesktopLeaderboardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-white via-yellow-50/30 to-white p-4 rounded-xl shadow-lg border border-yellow-100/50 h-full"
    >
      <div className="flex items-center gap-2 mb-4">
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
      
      {leaderboardDisplayData.length > 0 ? (
        <div className="space-y-3">
          {leaderboardDisplayData.slice(0, 3).map((member, index) => (
            <motion.div 
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`relative p-3 rounded-lg border-2 transition-all duration-300 ${
                member.name === currentUserName 
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
                  
                  <div>
                    <span className="font-medium text-gray-900 text-xs">{member.name}</span>
                    {member.name === currentUserName && (
                      <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-1 py-0.5 rounded-full">You</span>
                    )}
                  </div>
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
                  {member.revenue.toLocaleString()} / {member.target.toLocaleString()} EGP
                </div>
                
                <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(member.percentage, 100)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.2 }}
                    className={`h-2 rounded-full ${
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
      ) : (
        <div className="text-center py-4 text-gray-500">
          <Trophy className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-xs">No data available</p>
        </div>
      )}
    </motion.div>
  );
};
