"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleDot, Loader2, Ticket } from "lucide-react";
import { ticketsService } from "@/lib/api/tickets/ticketsService";
import type { SalesTicket } from "@/lib/api/tickets/types";
import { parseFirestoreDate } from "@/lib/utils/firestoreDate";

const priorityStyles: Record<string, string> = {
  LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  CRITICAL: "bg-red-50 text-red-700 border-red-200",
};

const statusStyles: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
};

const statusLabel = (status: string) => status.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default function TicketsPanel() {
  const [items, setItems] = useState<SalesTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ticketsService.getTickets({ pageNo: 1, limit: 5 });
      setItems(response?.items || []);
    } catch (error) {
      console.error("Failed to load tickets for dashboard panel:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const openCount = items.filter((item) => item.status === "OPEN").length;
  const inProgressCount = items.filter((item) => item.status === "IN_PROGRESS").length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-slate-900">
            <Ticket className="h-4 w-4" />
            <h3 className="text-sm font-semibold">Tickets</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">Open issues and support tasks from CRM backend.</p>
        </div>
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          Open board
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
          <p className="text-[10px] uppercase text-blue-600">Open</p>
          <p className="text-lg font-semibold text-blue-700">{openCount}</p>
        </div>
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
          <p className="text-[10px] uppercase text-indigo-600">In Progress</p>
          <p className="text-lg font-semibold text-indigo-700">{inProgressCount}</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span className="text-sm">Loading tickets...</span>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
          No tickets found.
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-2">
          {items.map((ticket) => {
            const createdAt = parseFirestoreDate(ticket.createdAt);

            return (
              <div key={ticket.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">{ticket.title || "Untitled ticket"}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${priorityStyles[ticket.priority] || priorityStyles.MEDIUM}`}>
                    {ticket.priority}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyles[ticket.status] || statusStyles.OPEN}`}>
                    {statusLabel(ticket.status)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <CircleDot className="h-3 w-3" />
                    {(ticket.tags || []).slice(0, 2).join(", ") || "No tags"}
                  </span>
                  <span>{createdAt ? createdAt.toLocaleDateString() : "-"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
