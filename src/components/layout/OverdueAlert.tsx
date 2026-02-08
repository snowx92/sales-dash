"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { reminderStorage } from "@/lib/utils/reminderStorage";

export default function OverdueAlert() {
  const [overdueCount, setOverdueCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check for overdue items
    const reminders = reminderStorage.getAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = reminders.filter((r) => {
      if (r.completed) return false;
      const reminderDate = new Date(r.date);
      reminderDate.setHours(0, 0, 0, 0);
      return reminderDate < today;
    });

    setOverdueCount(overdue.length);

    // Check if already dismissed this session
    const sessionDismissed = sessionStorage.getItem("overdueAlertDismissed");
    if (sessionDismissed) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("overdueAlertDismissed", "true");
  };

  if (overdueCount === 0 || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        className="mx-4 mt-2 mb-0"
      >
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                You have {overdueCount} overdue follow-up{overdueCount > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-white/80">
                Don&apos;t lose momentum — follow up with your leads today
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/reminders"
              className="px-3 py-1.5 bg-white text-red-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            >
              View <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
