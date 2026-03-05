"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import RemindersCalendar from "@/components/reminders/RemindersCalendar";
import { remindersService } from "@/lib/api/reminders/remindersService";
import type { SalesReminder } from "@/lib/api/reminders/types";

export default function HomeRemindersCalendar() {
  const [reminders, setReminders] = useState<SalesReminder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReminders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await remindersService.getReminders();
      setReminders(data);
    } catch (error) {
      console.error("Failed to load home reminders calendar:", error);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span className="text-sm">Loading calendar...</span>
        </div>
      </div>
    );
  }

  return (
    <RemindersCalendar
      reminders={reminders}
      title="Home Calendar"
      subtitle="API reminders calendar"
      className="w-full"
    />
  );
}
