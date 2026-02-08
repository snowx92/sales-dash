"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Users,
  RefreshCw,
  Bell,
  ChevronRight,
  ClipboardList,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { leadsService } from "@/lib/api/leads/leadsService";
import { retentionService } from "@/lib/api/retention/retentionService";
import { reminderStorage } from "@/lib/utils/reminderStorage";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";

interface AgendaItem {
  id: string;
  type: "lead" | "retention" | "reminder";
  title: string;
  subtitle: string;
  phone?: string;
  urgency: "critical" | "high" | "medium" | "low";
  daysInfo: string;
}

export default function TodayAgenda() {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetchAgendaItems();
  }, []);

  const fetchAgendaItems = async () => {
    try {
      setLoading(true);
      const agendaItems: AgendaItem[] = [];

      // 1. Get overdue/today reminders from localStorage
      const allReminders = reminderStorage.getAll();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      allReminders
        .filter((r) => !r.completed)
        .forEach((r) => {
          const reminderDate = new Date(r.date);
          reminderDate.setHours(0, 0, 0, 0);
          const isOverdue = reminderDate < today;
          const isToday = reminderDate.getTime() === today.getTime();

          if (isOverdue || isToday) {
            agendaItems.push({
              id: `reminder-${r.id}`,
              type: "reminder",
              title: r.entityName,
              subtitle: r.note || `${r.type} reminder`,
              urgency: isOverdue ? "critical" : "medium",
              daysInfo: isOverdue ? "Overdue" : "Today",
            });
          }
        });

      // 2. Get follow-up leads needing attention
      const [leadsResult, retentionResult] = await Promise.allSettled([
        leadsService.getLeads({ page: 1, limit: 10, status: "FOLLOW_UP" as any }),
        retentionService.getEndedSubscriptions({ limit: 5, pageNo: 1 }),
      ]);

      if (leadsResult.status === "fulfilled" && leadsResult.value?.items) {
        leadsResult.value.items.slice(0, 5).forEach((lead: any) => {
          const lastContact = lead.lastContact
            ? new Date(lead.lastContact)
            : lead.createdAt?._seconds
            ? new Date(lead.createdAt._seconds * 1000)
            : new Date();
          const daysSince = Math.floor(
            (Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
          );

          let urgency: AgendaItem["urgency"] = "low";
          if (daysSince > 7) urgency = "critical";
          else if (daysSince > 3) urgency = "high";
          else if (daysSince > 1) urgency = "medium";

          agendaItems.push({
            id: `lead-${lead.id}`,
            type: "lead",
            title: lead.name || "Unknown Lead",
            subtitle: `Follow-up needed`,
            phone: lead.phone,
            urgency,
            daysInfo: daysSince === 0 ? "Today" : `${daysSince}d ago`,
          });
        });
      }

      // 3. Get expiring subscriptions
      if (retentionResult.status === "fulfilled" && retentionResult.value?.items) {
        retentionResult.value.items.slice(0, 3).forEach((item: any) => {
          agendaItems.push({
            id: `retention-${item.id}`,
            type: "retention",
            title: item.storeName || item.name || "Unknown Store",
            subtitle: `Subscription expired`,
            phone: item.phone,
            urgency: item.priority === "HIGH" ? "high" : "medium",
            daysInfo: "Needs renewal",
          });
        });
      }

      // Sort by urgency
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      agendaItems.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

      setItems(agendaItems.slice(0, 8));
    } catch (err) {
      console.error("Error fetching agenda items:", err);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyStyles = (urgency: AgendaItem["urgency"]) => {
    switch (urgency) {
      case "critical":
        return "border-l-red-500 bg-red-50/50";
      case "high":
        return "border-l-amber-500 bg-amber-50/30";
      case "medium":
        return "border-l-slate-300 bg-white";
      default:
        return "border-l-slate-200 bg-white";
    }
  };

  const getTypeIcon = (type: AgendaItem["type"]) => {
    switch (type) {
      case "lead":
        return <Users className="h-4 w-4 text-indigo-500" />;
      case "retention":
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case "reminder":
        return <Bell className="h-4 w-4 text-amber-500" />;
    }
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
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-800 text-white"
      >
        <div className="flex items-center gap-3">
          <ClipboardList className="h-4 w-4 text-slate-300" />
          <span className="font-semibold text-sm">Today&apos;s Agenda</span>
          <span className="bg-white/15 px-2 py-0.5 rounded text-xs font-medium">
            {items.length} items
          </span>
          {criticalCount > 0 && (
            <span className="bg-red-500/90 px-2 py-0.5 rounded text-xs font-semibold">
              {criticalCount} urgent
            </span>
          )}
          {highCount > 0 && (
            <span className="bg-amber-500/80 px-2 py-0.5 rounded text-xs font-medium">
              {highCount} high
            </span>
          )}
        </div>
        <ChevronRight
          className={`h-4 w-4 text-slate-400 transition-transform ${collapsed ? "" : "rotate-90"}`}
        />
      </button>

      {/* Content */}
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
                {getTypeIcon(item.type)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{item.subtitle}</span>
                    <span className="text-slate-500 font-medium">{item.daysInfo}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
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
                    <a
                      href={buildWhatsAppUrl(item.phone, "Hello")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                  </>
                )}
                <Link
                  href={
                    item.type === "lead"
                      ? "/dashboard/leads"
                      : item.type === "retention"
                      ? "/dashboard/retention"
                      : "/dashboard/reminders"
                  }
                  className="p-1.5 bg-slate-100 text-slate-500 rounded-md hover:bg-slate-200 transition-colors"
                  title="View"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}

          {/* View All Links */}
          <div className="flex gap-4 pt-3 border-t border-slate-100 mt-3">
            <Link
              href="/dashboard/leads"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              All Leads <ChevronRight className="h-3 w-3" />
            </Link>
            <Link
              href="/dashboard/retention"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              All Retention <ChevronRight className="h-3 w-3" />
            </Link>
            <Link
              href="/dashboard/reminders"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              All Reminders <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}
