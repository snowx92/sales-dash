"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReminderStatus } from "@/lib/api/reminders/types";
import type { FirestoreDateInput } from "@/lib/utils/firestoreDate";
import { parseFirestoreDate } from "@/lib/utils/firestoreDate";

export interface ReminderCalendarItem {
  id: string;
  date: FirestoreDateInput;
  status?: ReminderStatus;
}

interface RemindersCalendarProps {
  reminders: ReminderCalendarItem[];
  selectedDate?: string | null;
  onSelectDate?: (dateKey: string) => void;
  title?: string;
  subtitle?: string;
  className?: string;
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toDateKey = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toTimeMinutes = (value: Date) => (value.getHours() * 60) + value.getMinutes();

const isMeaningfulTime = (value: Date) => !(value.getHours() === 0 && value.getMinutes() === 0);

const formatMinutesAsTime = (totalMinutes: number) => {
  const date = new Date();
  date.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const buildMonthGrid = (month: Date) => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);

  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());

  const gridEnd = new Date(lastDay);
  gridEnd.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  const days: Date[] = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
};

export default function RemindersCalendar({
  reminders,
  selectedDate,
  onSelectDate,
  title = "Reminders Calendar",
  subtitle = "Calendar view of your reminders",
  className = "",
}: RemindersCalendarProps) {
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const reminderCountByDay = useMemo(() => {
    const map = new Map<string, { total: number; opened: number; done: number; times: number[] }>();

    reminders.forEach((item) => {
      const parsed = parseFirestoreDate(item.date);
      if (!parsed) return;

      const key = toDateKey(parsed);
      const current = map.get(key) || { total: 0, opened: 0, done: 0, times: [] };
      const status = item.status || "OPENED";

      current.total += 1;
      if (status === "OPENED") current.opened += 1;
      if (status === "DONE") current.done += 1;
      if (isMeaningfulTime(parsed)) {
        const minutes = toTimeMinutes(parsed);
        if (!current.times.includes(minutes)) {
          current.times.push(minutes);
          current.times.sort((a, b) => a - b);
        }
      }

      map.set(key, current);
    });

    return map;
  }, [reminders]);

  const monthDays = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);

  const todayKey = toDateKey(new Date());

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            className="rounded-md border border-slate-200 p-1 text-slate-600 hover:bg-slate-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            className="rounded-md border border-slate-200 p-1 text-slate-600 hover:bg-slate-100"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-2 text-sm font-semibold text-slate-800">
        {monthCursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEK_DAYS.map((weekDay) => (
          <div key={weekDay} className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {weekDay}
          </div>
        ))}

        {monthDays.map((day) => {
          const dayKey = toDateKey(day);
          const inCurrentMonth = day.getMonth() === monthCursor.getMonth();
          const isToday = dayKey === todayKey;
          const isSelected = !!selectedDate && selectedDate === dayKey;
          const dayCounts = reminderCountByDay.get(dayKey);
          const visibleTimes = dayCounts?.times.slice(0, 2) || [];
          const extraTimes = (dayCounts?.times.length || 0) - visibleTimes.length;

          return (
            <button
              key={dayKey}
              onClick={() => onSelectDate?.(dayKey)}
              className={[
                "min-h-[72px] rounded-lg border p-2 text-left transition-colors",
                inCurrentMonth ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50/40",
                isToday ? "ring-1 ring-indigo-500 bg-indigo-50/60" : "",
                isSelected ? "border-indigo-400 ring-2 ring-indigo-200" : "",
                onSelectDate ? "hover:bg-slate-50" : "cursor-default",
              ].join(" ")}
            >
              <div className="flex items-start justify-between">
                <span className={`text-xs font-semibold ${inCurrentMonth ? "text-slate-700" : "text-slate-300"}`}>
                  {day.getDate()}
                </span>
                {isToday && (
                  <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                    Today
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1">
                {dayCounts && dayCounts.total > 0 && (
                  <>
                    <div className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                      {dayCounts.total} reminder{dayCounts.total > 1 ? "s" : ""}
                    </div>
                    {dayCounts.opened > 0 && (
                      <div className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                        {dayCounts.opened} opened
                      </div>
                    )}
                    {visibleTimes.map((minutes) => (
                      <div key={`${dayKey}-t-${minutes}`} className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
                        {formatMinutesAsTime(minutes)}
                      </div>
                    ))}
                    {extraTimes > 0 && (
                      <div className="text-[10px] font-medium text-violet-600">
                        +{extraTimes} more time{extraTimes > 1 ? "s" : ""}
                      </div>
                    )}
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
