"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle,
  Clock3,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Table2,
  Trash2,
} from "lucide-react";
import AddReminderModal from "@/components/modals/AddReminderModal";
import RemindersCalendar from "@/components/reminders/RemindersCalendar";
import { remindersService } from "@/lib/api/reminders/remindersService";
import type { ReminderSourceType, ReminderStatus, SalesReminder } from "@/lib/api/reminders/types";
import type { MyReminderFormData } from "@/lib/types/reminder";
import { formatDateTimeForApi, parseFirestoreDate, type FirestoreDateInput } from "@/lib/utils/firestoreDate";
import { formatPhoneForDisplay } from "@/lib/utils/phone";
import { profileService } from "@/lib/api/stores/profile/ProfileService";
import { useWhatsAppTemplatePicker } from "@/components/providers/WhatsAppTemplateProvider";
import { toast } from "sonner";

type SourceFilter = "all" | ReminderSourceType;
type StatusFilter = "all" | ReminderStatus;
type DisplayMode = "table" | "calendar";

const getReminderSourceLabel = (sourceType: ReminderSourceType) => {
  if (sourceType === "lead") return "Lead";
  if (sourceType === "retention") return "Retention";
  return "Other";
};

const getReminderStatusLabel = (status: ReminderStatus) => {
  if (status === "OPENED") return "Opened";
  if (status === "DONE") return "Done";
  return "Discarded";
};

const getReminderStatusStyles = (status: ReminderStatus) => {
  if (status === "DONE") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "DISCARDED") return "bg-slate-100 text-slate-600 border-slate-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
};

const getSourceStyles = (source: ReminderSourceType) => {
  if (source === "lead") return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (source === "retention") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
};

const toDateKey = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateKey = (dateKey: string) => {
  const [yearText, monthText, dayText] = dateKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!year || !month || !day) return dateKey;

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return dateKey;

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const buildDateTimeInputFromDateKey = (dateKey: string) => {
  const [yearText, monthText, dayText] = dateKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!year || !month || !day) return "";

  const candidate = new Date(year, month - 1, day, 9, 0, 0, 0);
  const now = new Date();

  if (toDateKey(now) === dateKey && candidate < now) {
    candidate.setTime(now.getTime() + 5 * 60 * 1000);
    candidate.setSeconds(0, 0);
  }

  const pad = (value: number) => String(value).padStart(2, "0");
  return `${candidate.getFullYear()}-${pad(candidate.getMonth() + 1)}-${pad(candidate.getDate())}T${pad(candidate.getHours())}:${pad(candidate.getMinutes())}`;
};

const isReminderOnDate = (value: FirestoreDateInput, dateKey: string) => {
  const parsed = parseFirestoreDate(value);
  if (!parsed) return false;
  return toDateKey(parsed) === dateKey;
};

const extractReminderContact = (
  reminder: SalesReminder,
  cache?: Map<string, { name: string; phone: string }>
) => {
  const parent = reminder.parentData && typeof reminder.parentData === "object"
    ? (reminder.parentData as Record<string, unknown>)
    : {};

  // Try parentData first
  let name =
    (typeof parent.storeName === "string" && parent.storeName) ||
    (typeof parent.name === "string" && parent.name) ||
    "";
  let phone = typeof parent.phone === "string" ? parent.phone : "";
  const email = typeof parent.email === "string" ? parent.email : "";

  // If no name from parentData, check the store cache
  if (!name && reminder.parentId && cache?.has(reminder.parentId)) {
    const cached = cache.get(reminder.parentId)!;
    name = cached.name || `#${reminder.parentId}`;
    phone = phone || cached.phone;
  }

  // Final fallback
  if (!name) {
    name = reminder.parentId ? `#${reminder.parentId}` : "General Reminder";
  }

  return { name, email, phone };
};

const getDateTag = (value: FirestoreDateInput) => {
  const date = parseFirestoreDate(value);
  if (!date) return { label: "No date", color: "text-slate-500" };

  const reminderDay = new Date(date);
  reminderDay.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = reminderDay.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `Overdue (${Math.abs(diffDays)}d)`, color: "text-red-600" };
  }

  if (diffDays === 0) {
    return { label: "Today", color: "text-orange-600" };
  }

  if (diffDays === 1) {
    return { label: "Tomorrow", color: "text-amber-600" };
  }

  return { label: date.toLocaleDateString(), color: "text-slate-600" };
};

const getReminderTimeLabel = (value: FirestoreDateInput) => {
  const parsed = parseFirestoreDate(value);
  if (!parsed) return null;

  if (parsed.getHours() === 0 && parsed.getMinutes() === 0) {
    return null;
  }

  return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function RemindersPage() {
  const { openTemplatePicker } = useWhatsAppTemplatePicker();
  const [reminders, setReminders] = useState<SalesReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("calendar");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createDefaultDateTime, setCreateDefaultDateTime] = useState<string | undefined>(undefined);

  // Cache for resolved store names/phones (parentId → { name, phone })
  const [storeCache, setStoreCache] = useState<Map<string, { name: string; phone: string }>>(new Map());

  const loadReminders = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await remindersService.getReminders({
        ...(sourceFilter !== "all" ? { sourceType: sourceFilter } : {}),
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(fromDate ? { from: fromDate } : {}),
        ...(toDate ? { to: toDate } : {}),
      });

      const ordered = [...data].sort((a, b) => {
        const first = parseFirestoreDate(a.date)?.getTime() || 0;
        const second = parseFirestoreDate(b.date)?.getTime() || 0;
        return first - second;
      });

      setReminders(ordered);
    } catch (error) {
      console.error("Failed to load reminders:", error);
      toast.error("Failed to load reminders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fromDate, sourceFilter, statusFilter, toDate]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  // Resolve store names for reminders with missing parentData
  useEffect(() => {
    if (reminders.length === 0) return;

    const unresolvedIds = reminders
      .filter((r) => {
        if (!r.parentId) return false;
        if (r.sourceType === "lead") return false;
        // Already cached
        if (storeCache.has(r.parentId)) return false;
        // Has parentData with name — no need to resolve
        const parent = r.parentData && typeof r.parentData === "object"
          ? (r.parentData as Record<string, unknown>)
          : {};
        if (typeof parent.storeName === "string" && parent.storeName) return false;
        if (typeof parent.name === "string" && parent.name) return false;
        return true;
      })
      .map((r) => r.parentId!)
      // Deduplicate
      .filter((id, idx, arr) => arr.indexOf(id) === idx);

    if (unresolvedIds.length === 0) return;

    const resolveStores = async () => {
      // Batch resolve — max 10 at a time
      const batches: string[][] = [];
      for (let i = 0; i < unresolvedIds.length; i += 10) {
        batches.push(unresolvedIds.slice(i, i + 10));
      }

      const newEntries = new Map<string, { name: string; phone: string }>();

      for (const batch of batches) {
        const results = await Promise.allSettled(
          batch.map((id) => profileService.getStoreAnalytics(id))
        );

        results.forEach((result, idx) => {
          if (result.status === "fulfilled" && result.value) {
            const storeName = result.value.store?.name || "";
            const ownerPhone = result.value.owner?.phone || "";
            if (storeName || ownerPhone) {
              newEntries.set(batch[idx], { name: storeName, phone: ownerPhone });
            }
          }
        });
      }

      if (newEntries.size > 0) {
        setStoreCache((prev) => {
          const updated = new Map(prev);
          newEntries.forEach((value, key) => updated.set(key, value));
          return updated;
        });
      }
    };

    void resolveStores();
  }, [reminders, storeCache]);

  const filteredReminders = useMemo(() => {
    if (!searchTerm.trim()) return reminders;

    const lowerTerm = searchTerm.toLowerCase();

    return reminders.filter((reminder) => {
      const contact = extractReminderContact(reminder, storeCache);
      return (
        contact.name.toLowerCase().includes(lowerTerm) ||
        contact.email.toLowerCase().includes(lowerTerm) ||
        contact.phone.includes(searchTerm) ||
        (reminder.note || "").toLowerCase().includes(lowerTerm) ||
        (reminder.parentId || "").toLowerCase().includes(lowerTerm)
      );
    });
  }, [reminders, searchTerm, storeCache]);

  const selectedDayReminders = useMemo(() => {
    if (!selectedDate) return [];
    return filteredReminders.filter((reminder) => isReminderOnDate(reminder.date, selectedDate));
  }, [filteredReminders, selectedDate]);

  const visibleReminders = useMemo(() => {
    if (!selectedDate) return filteredReminders;
    return selectedDayReminders;
  }, [filteredReminders, selectedDate, selectedDayReminders]);

  const stats = useMemo(() => {
    const opened = reminders.filter((r) => (r.status || "OPENED") === "OPENED").length;
    const done = reminders.filter((r) => (r.status || "OPENED") === "DONE").length;
    const discarded = reminders.filter((r) => (r.status || "OPENED") === "DISCARDED").length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = reminders.filter((r) => {
      if ((r.status || "OPENED") !== "OPENED") return false;
      const date = parseFirestoreDate(r.date);
      if (!date) return false;
      date.setHours(0, 0, 0, 0);
      return date < today;
    }).length;

    const dueToday = reminders.filter((r) => {
      if ((r.status || "OPENED") !== "OPENED") return false;
      const date = parseFirestoreDate(r.date);
      if (!date) return false;
      date.setHours(0, 0, 0, 0);
      return date.getTime() === today.getTime();
    }).length;

    return {
      total: reminders.length,
      opened,
      done,
      discarded,
      overdue,
      dueToday,
    };
  }, [reminders]);

  const openCreateModal = (dateKey?: string | null) => {
    if (dateKey) {
      setCreateDefaultDateTime(buildDateTimeInputFromDateKey(dateKey));
    } else {
      setCreateDefaultDateTime(undefined);
    }
    setIsCreateOpen(true);
  };

  const handleCreateReminder = async (data: MyReminderFormData) => {
    try {
      setIsCreating(true);
      await remindersService.createReminder({
        sourceType: "other",
        parentId: "",
        date: formatDateTimeForApi(data.date),
        note: data.note,
      });
      toast.success("Reminder created");
      setIsCreateOpen(false);
      await loadReminders(true);
    } catch (error) {
      console.error("Failed to create reminder:", error);
      toast.error("Failed to create reminder");
    } finally {
      setIsCreating(false);
    }
  };

  const handleChangeStatus = async (reminderId: string, status: ReminderStatus) => {
    try {
      await remindersService.updateReminderStatus(reminderId, status);
      toast.success("Reminder status updated");
      await loadReminders(true);
    } catch (error) {
      console.error("Failed to update reminder status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (reminderId: string) => {
    try {
      await remindersService.deleteReminder(reminderId);
      toast.success("Reminder deleted");
      await loadReminders(true);
    } catch (error) {
      console.error("Failed to delete reminder:", error);
      toast.error("Failed to delete reminder");
    }
  };

  const selectedDateLabel = selectedDate ? formatDateKey(selectedDate) : "";

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sales Reminders</h1>
            <p className="mt-1 text-sm text-slate-600">API-powered reminders for leads, retention, and custom follow-ups.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1">
              <button
                onClick={() => setDisplayMode("calendar")}
                className={`rounded-md px-2 py-1 text-xs font-medium ${displayMode === "calendar" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <CalendarDays className="mr-1 inline h-3.5 w-3.5" />
                Calendar
              </button>
              <button
                onClick={() => setDisplayMode("table")}
                className={`rounded-md px-2 py-1 text-xs font-medium ${displayMode === "table" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <Table2 className="mr-1 inline h-3.5 w-3.5" />
                Table
              </button>
            </div>

            <button
              onClick={() => loadReminders(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => openCreateModal()}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              New Reminder
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-slate-500">Total</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-blue-600">Opened</p>
            <p className="mt-2 text-2xl font-bold text-blue-700">{stats.opened}</p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-orange-600">Today</p>
            <p className="mt-2 text-2xl font-bold text-orange-700">{stats.dueToday}</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-red-600">Overdue</p>
            <p className="mt-2 text-2xl font-bold text-red-700">{stats.overdue}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-emerald-600">Done</p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">{stats.done}</p>
          </div>
          <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-slate-500">Discarded</p>
            <p className="mt-2 text-2xl font-bold text-slate-700">{stats.discarded}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by note, name, phone, parent id..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value as SourceFilter)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500"
            >
              <option value="all">All sources</option>
              <option value="lead">Lead</option>
              <option value="retention">Retention</option>
              <option value="other">Other</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500"
            >
              <option value="all">All statuses</option>
              <option value="OPENED">Opened</option>
              <option value="DONE">Done</option>
              <option value="DISCARDED">Discarded</option>
            </select>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
              />
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
            <p className="text-sm text-slate-500">Loading reminders...</p>
          </div>
        )}

        {!loading && displayMode === "calendar" && (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            <RemindersCalendar
              className="xl:col-span-3"
              reminders={filteredReminders}
              selectedDate={selectedDate}
              onSelectDate={(dateKey) => setSelectedDate(dateKey)}
              title="Calendar View"
              subtitle="Click a day to review reminders and create a reminder for that date"
            />

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-1">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Day Menu</h3>
                  <p className="text-xs text-slate-500">Reminders on selected day</p>
                </div>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Clear
                  </button>
                )}
              </div>

              {!selectedDate && (
                <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  Click a day in the calendar to show that day reminders and create a new one quickly.
                </div>
              )}

              {selectedDate && (
                <>
                  <div className="mb-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                    <p className="text-xs font-semibold uppercase text-indigo-600">Selected Day</p>
                    <p className="mt-1 text-sm font-semibold text-indigo-900">{selectedDateLabel}</p>
                    <p className="mt-1 text-xs text-indigo-700">{selectedDayReminders.length} reminder{selectedDayReminders.length === 1 ? "" : "s"}</p>
                    <button
                      onClick={() => openCreateModal(selectedDate)}
                      className="mt-3 inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add On This Day
                    </button>
                  </div>

                  <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1">
                    {selectedDayReminders.length === 0 && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                        No reminders on this day.
                      </div>
                    )}

                    {selectedDayReminders.map((reminder) => {
                      const status = reminder.status || "OPENED";
                      const contact = extractReminderContact(reminder, storeCache);
                      const reminderTime = getReminderTimeLabel(reminder.date);

                      return (
                        <div key={reminder.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-slate-900">{contact.name}</p>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getReminderStatusStyles(status)}`}>
                              {getReminderStatusLabel(status)}
                            </span>
                          </div>

                          <p className="line-clamp-2 text-xs text-slate-600">{reminder.note || "No note"}</p>

                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getSourceStyles(reminder.sourceType)}`}>
                              {getReminderSourceLabel(reminder.sourceType)}
                            </span>
                            {reminderTime && (
                              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                {reminderTime}
                              </span>
                            )}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <button
                              onClick={() => handleChangeStatus(reminder.id, "OPENED")}
                              className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100"
                            >
                              <Clock3 className="h-3 w-3" />
                              Open
                            </button>
                            <button
                              onClick={() => handleChangeStatus(reminder.id, "DONE")}
                              className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Done
                            </button>
                            <button
                              onClick={() => handleChangeStatus(reminder.id, "DISCARDED")}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                            >
                              <AlertTriangle className="h-3 w-3" />
                              Discard
                            </button>

                            {contact.phone && (
                              <button
                                onClick={() => {
                                  const templateType = reminder.sourceType === "lead" ? "lead" : "retention";
                                  openTemplatePicker({
                                    type: templateType,
                                    phone: contact.phone,
                                    title: contact.name,
                                    variables: {
                                      name: contact.name,
                                      storeName: contact.name,
                                      ownerName: contact.name,
                                      phone: contact.phone,
                                    },
                                  });
                                }}
                                className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-white px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50"
                              >
                                <MessageCircle className="h-3 w-3" />
                                WhatsApp
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(reminder.id)}
                              className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {!loading && displayMode === "table" && (
          <>
            {selectedDate && (
              <div className="flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
                <span>
                  Showing reminders for <strong>{selectedDateLabel}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openCreateModal(selectedDate)}
                    className="rounded-md border border-indigo-300 px-2 py-1 text-xs font-medium hover:bg-indigo-100"
                  >
                    Add On This Day
                  </button>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="rounded-md border border-indigo-300 px-2 py-1 text-xs font-medium hover:bg-indigo-100"
                  >
                    Clear Date Filter
                  </button>
                </div>
              </div>
            )}

            {visibleReminders.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                <Bell className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-900">No reminders found</h3>
                <p className="mt-1 text-sm text-slate-500">Adjust filters or create a new reminder.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Due</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Source</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Note</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Channels</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {visibleReminders.map((reminder) => {
                        const status = reminder.status || "OPENED";
                        const contact = extractReminderContact(reminder, storeCache);
                        const dueDate = parseFirestoreDate(reminder.date);
                        const dateTag = getDateTag(reminder.date);
                        const reminderTime = getReminderTimeLabel(reminder.date);

                        return (
                          <tr key={reminder.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 align-top">
                              <p className="text-sm font-medium text-slate-900">{dueDate ? dueDate.toLocaleDateString() : "-"}</p>
                              {reminderTime && <p className="text-xs text-slate-500">{reminderTime}</p>}
                              <p className={`mt-0.5 text-xs ${dateTag.color}`}>{dateTag.label}</p>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <p className="max-w-[200px] truncate text-sm font-semibold text-slate-900">{contact.name}</p>
                              {contact.phone && <p className="text-xs text-slate-500">{formatPhoneForDisplay(contact.phone)}</p>}
                              {contact.email && <p className="max-w-[200px] truncate text-xs text-slate-500">{contact.email}</p>}
                            </td>
                            <td className="px-4 py-3 align-top">
                              <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getSourceStyles(reminder.sourceType)}`}>
                                {getReminderSourceLabel(reminder.sourceType)}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <p className="max-w-[280px] text-sm text-slate-700 line-clamp-2">{reminder.note || "No note"}</p>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <select
                                value={status}
                                onChange={(event) => handleChangeStatus(reminder.id, event.target.value as ReminderStatus)}
                                className={`rounded-lg border px-2 py-1 text-xs font-medium outline-none ${getReminderStatusStyles(status)}`}
                              >
                                <option value="OPENED">Opened</option>
                                <option value="DONE">Done</option>
                                <option value="DISCARDED">Discarded</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                                {contact.phone && (
                                  <button
                                    onClick={() => {
                                      const templateType = reminder.sourceType === "lead" ? "lead" : "retention";
                                      openTemplatePicker({
                                        type: templateType,
                                        phone: contact.phone,
                                        title: contact.name,
                                        variables: {
                                          name: contact.name,
                                          storeName: contact.name,
                                          ownerName: contact.name,
                                          phone: contact.phone,
                                        },
                                      });
                                    }}
                                    className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-white px-2 py-1 font-medium text-emerald-700 hover:bg-emerald-50"
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                    WhatsApp
                                  </button>
                                )}
                                {!contact.phone && <span className="text-slate-400">-</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <button
                                onClick={() => handleDelete(reminder.id)}
                                className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AddReminderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreateReminder}
        entityName="General Reminder"
        defaultDateTime={createDefaultDateTime}
        loading={isCreating}
      />
    </div>
  );
}
