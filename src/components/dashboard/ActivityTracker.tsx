"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, Calendar, Plus, TrendingUp, Target, Award, X } from "lucide-react";

interface DailyActivity {
  date: string; // YYYY-MM-DD
  calls: number;
  emails: number;
  meetings: number;
}

interface ActivityStats {
  today: DailyActivity;
  thisWeek: {
    calls: number;
    emails: number;
    meetings: number;
  };
  goal: {
    calls: number;
    emails: number;
    meetings: number;
  };
}

export default function ActivityTracker() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<ActivityStats>({
    today: { date: getTodayString(), calls: 0, emails: 0, meetings: 0 },
    thisWeek: { calls: 0, emails: 0, meetings: 0 },
    goal: { calls: 10, emails: 15, meetings: 3 }
  });

  const loadActivities = useCallback(() => {
    const stored = localStorage.getItem('salesActivities');
    if (!stored) return;

    try {
      const activities: DailyActivity[] = JSON.parse(stored);
      const today = getTodayString();
      const weekStart = getWeekStart();

      // Get today's activity
      const todayActivity = activities.find(a => a.date === today) || {
        date: today,
        calls: 0,
        emails: 0,
        meetings: 0
      };

      // Calculate this week's totals
      const weekActivities = activities.filter(a => a.date >= weekStart);
      const thisWeek = weekActivities.reduce(
        (acc, curr) => ({
          calls: acc.calls + curr.calls,
          emails: acc.emails + curr.emails,
          meetings: acc.meetings + curr.meetings
        }),
        { calls: 0, emails: 0, meetings: 0 }
      );

      // Load goals (default if not set)
      const storedGoals = localStorage.getItem('activityGoals');
      const goal = storedGoals ? JSON.parse(storedGoals) : { calls: 10, emails: 15, meetings: 3 };

      setStats({
        today: todayActivity,
        thisWeek,
        goal
      });
    } catch (err) {
      console.warn('Failed to parse activities:', err);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  function getTodayString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  function getWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  // loadActivities is defined above as a stable callback

  function saveActivity(type: 'calls' | 'emails' | 'meetings', increment: number = 1) {
    const stored = localStorage.getItem('salesActivities');
    let activities: DailyActivity[] = stored ? JSON.parse(stored) : [];
    const today = getTodayString();

    // Find or create today's activity
    const todayIndex = activities.findIndex(a => a.date === today);
    if (todayIndex >= 0) {
      activities[todayIndex][type] += increment;
    } else {
      activities.push({
        date: today,
        calls: type === 'calls' ? increment : 0,
        emails: type === 'emails' ? increment : 0,
        meetings: type === 'meetings' ? increment : 0
      });
    }

    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
    activities = activities.filter(a => a.date >= cutoffDate);

    localStorage.setItem('salesActivities', JSON.stringify(activities));
    loadActivities(); // Refresh stats
  }

  function getProgressPercentage(current: number, goal: number): number {
    return Math.min(100, Math.round((current / goal) * 100));
  }

  function getProgressColor(percentage: number): string {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  const activities = [
    {
      type: 'calls' as const,
      icon: Phone,
      label: 'Calls',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      type: 'emails' as const,
      icon: Mail,
      label: 'Emails',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      type: 'meetings' as const,
      icon: Calendar,
      label: 'Meetings',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <>
      {/* Floating Activity Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(!isOpen)}
        // Compact floating button to align with the other floating controls
        className="fixed bottom-32 right-6 z-40 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center"
        aria-label="Activity tracker"
      >
        <TrendingUp className="w-6 h-6" />
        {stats.today.calls + stats.today.emails + stats.today.meetings > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
            {stats.today.calls + stats.today.emails + stats.today.meetings}
          </span>
        )}
      </motion.button>

      {/* Activity Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-32 right-20 z-40 w-80"
          >
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6" />
                    <h3 className="font-bold text-lg">Activity Tracker</h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-blue-100 mt-1">Track your daily sales activities</p>
              </div>

              {/* Today's Activities */}
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-gray-700" />
                  <h4 className="font-semibold text-gray-900">Today&apos;s Progress</h4>
                </div>

                <div className="space-y-4">
                  {activities.map(({ type, icon: Icon, label, color, bgColor, borderColor }) => {
                    const current = stats.today[type];
                    const goal = stats.goal[type];
                    const percentage = getProgressPercentage(current, goal);
                    const progressColor = getProgressColor(percentage);

                    return (
                      <div key={type} className={`p-3 rounded-lg border ${borderColor} ${bgColor}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${color}`} />
                            <span className="text-sm font-medium text-gray-900">{label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${color}`}>
                              {current}/{goal}
                            </span>
                            <button
                              onClick={() => saveActivity(type)}
                              className={`p-1.5 ${bgColor} hover:bg-opacity-80 rounded-full transition-colors`}
                              title={`Add ${label}`}
                            >
                              <Plus className={`w-4 h-4 ${color}`} />
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className={`h-full ${progressColor}`}
                          />
                        </div>
                        <div className="text-xs text-gray-600 mt-1 text-right">
                          {percentage}% of goal
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* This Week Summary */}
              <div className="p-5 bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">This Week&apos;s Total</h4>
                <div className="grid grid-cols-3 gap-3">
                  {activities.map(({ type, icon: Icon, label, color }) => (
                    <div key={type} className="text-center">
                      <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
                      <div className={`text-2xl font-bold ${color}`}>
                        {stats.thisWeek[type]}
                      </div>
                      <div className="text-xs text-gray-600">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Tip */}
              <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-200">
                <p className="text-xs text-gray-700 text-center">
                  💪 Stay consistent! Track activities daily for better results
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
