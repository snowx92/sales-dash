"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

interface TargetProgressCardProps {
  currentUserData: {
    targetType: string;
    currentRevenue: number;
    targetRevenue: number;
    targetPercentage: number;
  };
}

export const TargetProgressCard = ({ currentUserData }: TargetProgressCardProps) => {
  return (
    <div className="bg-gradient-to-br from-white via-purple-50/30 to-white p-6 rounded-xl shadow-lg border border-purple-100/50 h-full">
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
          {currentUserData.targetType}
        </h3>
        {currentUserData.targetType !== 'No Target Set' && currentUserData.targetType !== 'Revenue Progress' && (
          <p className="text-sm text-gray-600 mt-1">Track your progress towards your {currentUserData.targetType.toLowerCase()}</p>
        )}
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
              {currentUserData.currentRevenue.toLocaleString()} EGP
            </div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-2 bg-gradient-to-r from-purple-400/20 to-orange-400/20 rounded-lg blur-lg -z-10"
            />
          </motion.div>
          <div className="text-sm text-gray-600 font-medium">
            of {currentUserData.targetRevenue.toLocaleString()} EGP target
          </div>
        </div>
        
        <div className="sm:col-span-2 space-y-3">
          <div className="relative">
            {/* Progress bar background */}
            <div className="w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full h-4 shadow-inner">
              {/* Animated progress bar */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(currentUserData.targetPercentage || 0, 100)}%` }}
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
              {(currentUserData.targetPercentage || 0).toFixed(1)}% Complete
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
  );
};
