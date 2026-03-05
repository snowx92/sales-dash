"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Bell,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  AlertTriangle,
  Clock3,
} from "lucide-react";
import Link from "next/link";
import { remindersService } from "@/lib/api/reminders/remindersService";
import { parseFirestoreDate } from "@/lib/utils/firestoreDate";
import { useWhatsAppTemplatePicker } from "@/components/providers/WhatsAppTemplateProvider";

interface ReminderAgendaItem {
  id: string;
  title: string;
  subtitle: string;
  phone?: string;
  sourceType: "lead" | "retention";
  urgency: "critical" | "high" | "medium" | "low";
  daysInfo: string;
  timeLabel?: string;
}

const getParentInfo = (reminder: {
  parentId: string;
  parentData?: unknown;
}) => {
  const parentData = reminder.parentData && typeof reminder.parentData === "object"
    ? (reminder.parentData as Record<string, unknown>)
    : {};

  const phone = typeof parentData.phone === "string" ? parentData.phone : undefined;

  const title =
    (typeof parentData.storeName === "string" && parentData.storeName) ||
    (typeof parentData.name === "string" && parentData.name) ||
    (reminder.parentId ? `#${reminder.parentId}` : "General Reminder");

  return { title, phone };
};

export default function TodayAgenda() {
  const { openTemplatePicker } = useWhatsAppTemplatePicker();
  const [items, setItems] = useState<ReminderAgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const fetchAgendaItems = async () => {
      try {
        setLoading(true);

        const allReminders = await remindersService.getReminders({ status: "OPENED" });
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const agendaItems: ReminderAgendaItem[] = [];

        allReminders.forEach((reminder) => {
          const reminderDate = parseFirestoreDate(reminder.date);
          if (!reminderDate) return;

          const reminderDay = new Date(reminderDate);
          reminderDay.setHours(0, 0, 0, 0);

          const dayDiff = Math.round((reminderDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          let urgency: ReminderAgendaItem["urgency"] = "low";
          let daysInfo = "Upcoming";

          if (dayDiff < 0) {
            urgency = "critical";
            daysInfo = `Overdue ${Math.abs(dayDiff)}d`;
          } else if (dayDiff === 0) {
            urgency = "high";
            daysInfo = "Today";
          } else if (dayDiff <= 2) {
            urgency = "medium";
            daysInfo = dayDiff === 1 ? "Tomorrow" : `In ${dayDiff} days`;
          } else {
            urgency = "low";
            daysInfo = `In ${dayDiff} days`;
          }

          const parent = getParentInfo({
            parentId: reminder.parentId,
            parentData: reminder.parentData,
          });

          const timeLabel =
            reminderDate.getHours() === 0 && reminderDate.getMinutes() === 0
              ? undefined
              : reminderDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          agendaItems.push({
            id: `reminder-${reminder.id}`,
            title: parent.title,
            subtitle: reminder.note || `${reminder.sourceType} reminder`,
            phone: parent.phone,
            sourceType: reminder.sourceType === "lead" ? "lead" : "retention",
            urgency,
            daysInfo,
            timeLabel,
          });
        });

        agendaItems.sort((a, b) => {
          const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        });

        setItems(agendaItems.slice(0, 10));
      } catch (err) {
        console.error("Error fetching API reminders agenda:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendaItems();
  }, []);

  const getUrgencyStyles = (urgency: ReminderAgendaItem["urgency"]) => {
    switch (urgency) {
      case "critical":
        return "border-l-red-500 bg-red-50/50";
      case "high":
        return "border-l-amber-500 bg-amber-50/30";
      case "medium":
        return "border-l-blue-300 bg-blue-50/30";
      default:
        return "border-l-slate-200 bg-white";
    }
  };

  const getUrgencyBadge = (urgency: ReminderAgendaItem["urgency"]) => {
    if (urgency === "critical") {
      return <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-700">Overdue</span>;
    }

    if (urgency === "high") {
      return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700">Today</span>;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-40 mb-4" />
        <div className="space-y-3">
          <div className="h-14 bg-slate-100 rounded" />
          <div className="h-14 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  const criticalCount = items.filter((i) => i.urgency === "critical").length;
  const highCount = items.filter((i) => i.urgency === "high").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-800 text-white"
      >
        <div className="flex items-center gap-3">
          <ClipboardList className="h-4 w-4 text-slate-300" />
          <span className="font-semibold text-sm">API Reminders</span>
          <span className="bg-white/15 px-2 py-0.5 rounded text-xs font-medium">
            {items.length} items
          </span>
          {criticalCount > 0 && (
            <span className="bg-red-500/90 px-2 py-0.5 rounded text-xs font-semibold">
              {criticalCount} overdue
            </span>
          )}
          {highCount > 0 && (
            <span className="bg-amber-500/80 px-2 py-0.5 rounded text-xs font-medium">
              {highCount} today
            </span>
          )}
        </div>
        <ChevronRight
          className={`h-4 w-4 text-slate-400 transition-transform ${collapsed ? "" : "rotate-90"}`}
        />
      </button>

      {!collapsed && (
        <div className="p-4 space-y-1.5 max-h-[360px] overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className={`border-l-4 rounded-lg p-3 flex items-center justify-between gap-3 ${getUrgencyStyles(
                item.urgency
              )}`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Bell className="h-4 w-4 text-amber-500" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
                    {getUrgencyBadge(item.urgency)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="truncate">{item.subtitle}</span>
                    <span className="text-slate-500 font-medium whitespace-nowrap">{item.daysInfo}</span>
                    {item.timeLabel && <span className="text-indigo-600 font-medium whitespace-nowrap">{item.timeLabel}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {item.phone && (
                  <>
                    <a
                      href={`tel:${item.phone}`}
                      className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors"
                      title="Call"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        openTemplatePicker({
                          type: item.sourceType,
                          phone: item.phone ?? "",
                          title: item.title,
                          variables: {
                            name: item.title,
                            storeName: item.title,
                            ownerName: item.title,
                            phone: item.phone ?? "",
                          },
                        })
                      }
                      className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
                <Link
                  href="/dashboard/reminders"
                  className="p-1.5 bg-slate-100 text-slate-500 rounded-md hover:bg-slate-200 transition-colors"
                  title="View"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-4 pt-3 border-t border-slate-100 mt-3">
            <Link
              href="/dashboard/reminders"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              All Reminders <ChevronRight className="h-3 w-3" />
            </Link>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock3 className="h-3 w-3" />
              Live from reminders API
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Sorted by urgency
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
