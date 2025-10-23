"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Clock, Phone, X, AlertTriangle } from "lucide-react";
import { Lead } from "@/components/leads/types";

interface SmartRemindersProps {
  leads: Lead[];
}

interface Reminder {
  lead: Lead;
  daysSinceContact: number;
  urgency: 'critical' | 'high' | 'medium';
  message: string;
}

export default function SmartReminders({ leads }: SmartRemindersProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Load dismissed reminders from localStorage
    const stored = localStorage.getItem('dismissedReminders');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDismissedIds(new Set(parsed));
      } catch (err) {
        console.warn('Failed to parse dismissed reminders', err);
      }
    }
  }, []);

  useEffect(() => {
    // Calculate reminders for leads that need follow-up
    const now = new Date();
    const newReminders: Reminder[] = [];

    leads.forEach(lead => {
      // Skip if dismissed or already not interested
      if (dismissedIds.has(lead.id) || lead.status === 'not_interested' || lead.status === 'subscribed') {
        return;
      }

      const lastContact = lead.lastContact ? new Date(lead.lastContact) : new Date(lead.createdAt);
      const daysSinceContact = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));

      // Critical: No contact in 14+ days
      if (daysSinceContact >= 14) {
        newReminders.push({
          lead,
          daysSinceContact,
          urgency: 'critical',
          message: `No contact in ${daysSinceContact} days - Risk of losing this lead!`
        });
      }
      // High: No contact in 7-13 days
      else if (daysSinceContact >= 7) {
        newReminders.push({
          lead,
          daysSinceContact,
          urgency: 'high',
          message: `Follow up needed - ${daysSinceContact} days since last contact`
        });
      }
      // Medium: Interested status but no recent contact (3-6 days)
      else if (lead.status === 'interested' && daysSinceContact >= 3) {
        newReminders.push({
          lead,
          daysSinceContact,
          urgency: 'medium',
          message: `Interested lead - Strike while hot! (${daysSinceContact} days ago)`
        });
      }
      // Medium: Follow-up status with no recent contact (5+ days)
      else if (lead.status === 'follow_up' && daysSinceContact >= 5) {
        newReminders.push({
          lead,
          daysSinceContact,
          urgency: 'medium',
          message: `Scheduled follow-up overdue by ${daysSinceContact - 3} days`
        });
      }
    });

    // Sort by urgency and days
    newReminders.sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, medium: 2 };
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      return b.daysSinceContact - a.daysSinceContact;
    });

    setReminders(newReminders);
  }, [leads, dismissedIds]);

  const handleDismiss = (leadId: number) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(leadId);
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissedReminders', JSON.stringify([...newDismissed]));
  };

  const getUrgencyColor = (urgency: Reminder['urgency']) => {
    switch (urgency) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-300',
          dot: 'bg-red-500'
        };
      case 'high':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-300',
          dot: 'bg-orange-500'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-300',
          dot: 'bg-yellow-500'
        };
    }
  };

  if (reminders.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Bell Icon */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(!isOpen)}
        // Smaller compact floating button to stack with others
        className="fixed bottom-20 right-6 z-40 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center"
        aria-label="View reminders"
      >
        <Bell className="w-6 h-6" />
        {reminders.length > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
            {reminders.length > 9 ? '9+' : reminders.length}
          </span>
        )}
        <span className="absolute inset-0 rounded-full bg-red-500 opacity-75 animate-ping"></span>
      </motion.button>

      {/* Reminders Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            // Panel placed to the left of the stack; slightly narrower on small screens
            className="fixed bottom-20 right-20 z-40 w-80 max-h-[500px] overflow-hidden"
          >
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-2xl">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-gray-900">Smart Reminders</h3>
                    <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                      {reminders.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Reminders List */}
              <div className="overflow-y-auto max-h-[400px]">
                {reminders.map((reminder, index) => {
                  const colors = getUrgencyColor(reminder.urgency);
                  return (
                    <motion.div
                      key={reminder.lead.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${colors.bg}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full ${colors.dot} animate-pulse`}></span>
                            <h4 className="font-semibold text-gray-900">{reminder.lead.name}</h4>
                          </div>
                          <p className={`text-sm ${colors.text} mb-2`}>
                            {reminder.message}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                Last: {new Date(reminder.lead.lastContact || reminder.lead.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{reminder.lead.phone}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDismiss(reminder.lead.id)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          title="Dismiss reminder"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  💡 Tip: Follow up within 24 hours for best conversion rates
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
