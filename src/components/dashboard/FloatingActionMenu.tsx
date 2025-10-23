"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  TrendingUp,
  Bell,
  Lightbulb,
  Plus,
  X
} from "lucide-react";

interface FloatingActionMenuProps {
  onOpenWhatsApp?: () => void;
  onOpenActivity?: () => void;
  onOpenReminders?: () => void;
  onOpenTips?: () => void;
  remindersCount?: number;
  activitiesCount?: number;
}

export default function FloatingActionMenu({
  onOpenWhatsApp,
  onOpenActivity,
  onOpenReminders,
  onOpenTips,
  remindersCount = 0,
  activitiesCount = 0
}: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      id: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp Templates',
      color: 'from-green-500 to-green-700',
      hoverColor: 'hover:from-green-600 hover:to-green-800',
      onClick: onOpenWhatsApp
    },
    {
      id: 'activity',
      icon: TrendingUp,
      label: 'Activity Tracker',
      color: 'from-blue-500 to-purple-600',
      hoverColor: 'hover:from-blue-600 hover:to-purple-700',
      badge: activitiesCount,
      onClick: onOpenActivity
    },
    {
      id: 'reminders',
      icon: Bell,
      label: 'Smart Reminders',
      color: 'from-orange-500 to-red-600',
      hoverColor: 'hover:from-orange-600 hover:to-red-700',
      badge: remindersCount,
      onClick: onOpenReminders
    },
    {
      id: 'tips',
      icon: Lightbulb,
      label: 'Sales Tips',
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'hover:from-purple-600 hover:to-pink-600',
      onClick: onOpenTips
    }
  ];

  return (
    // Main container for grouped floating actions (anchored bottom-right)
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            // show smaller action buttons stacked above/to-left of the main button
            className="absolute bottom-14 right-14 flex flex-col gap-3 mb-2"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: 20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 20, y: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  if (action.onClick) action.onClick();
                  setIsOpen(false);
                }}
                // Keep action buttons small and consistent
                className={`w-10 h-10 bg-gradient-to-br ${action.color} ${action.hoverColor} rounded-full shadow-lg transition-all duration-300 flex items-center justify-center group relative`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <action.icon className="w-5 h-5 text-white" />

                {/* Badge */}
                {action.badge !== undefined && action.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {action.badge > 9 ? '9+' : action.badge}
                  </span>
                )}

                {/* Tooltip */}
                <div className="absolute right-14 whitespace-nowrap bg-gray-900 text-white text-xs py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {action.label}
                  <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 bg-gradient-to-br ${
          isOpen ? 'from-red-500 to-red-700' : 'from-purple-600 to-pink-600'
        } rounded-full shadow-xl flex items-center justify-center transition-all duration-300`}
        aria-label="Open floating actions"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Total Badge */}
        {!isOpen && (remindersCount > 0 || activitiesCount > 0) && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {remindersCount + activitiesCount > 9 ? '9+' : remindersCount + activitiesCount}
          </span>
        )}
      </motion.button>
    </div>
  );
}
