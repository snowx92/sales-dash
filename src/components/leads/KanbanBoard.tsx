"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Phone, MessageCircle, GripVertical, ExternalLink } from "lucide-react";
import { Lead, statuses } from "./types";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { formatPhoneForDisplay } from "@/lib/utils/phone";
import { calculateLeadScore, getScoreBadgeColor, getScoreIcon } from "@/lib/utils/leadScoring";

interface KanbanBoardProps {
  leads: Lead[];
  onStatusChange?: (id: number, newStatus: string) => void;
  onEditLead: (lead: Lead) => void;
  onAddFeedback: (id: number, leadName: string) => void;
}

// Kanban columns we want to show (ordered pipeline stages)
const KANBAN_COLUMNS = [
  { id: "interested", name: "Interested", color: "border-green-400", bgHeader: "bg-green-50", textColor: "text-green-700" },
  { id: "follow_up", name: "Follow Up", color: "border-yellow-400", bgHeader: "bg-yellow-50", textColor: "text-yellow-700" },
  { id: "no_answer", name: "No Answer", color: "border-gray-400", bgHeader: "bg-gray-50", textColor: "text-gray-700" },
  { id: "subscribed", name: "Subscribed", color: "border-purple-400", bgHeader: "bg-purple-50", textColor: "text-purple-700" },
  { id: "not_interested", name: "Not Interested", color: "border-red-400", bgHeader: "bg-red-50", textColor: "text-red-700" },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  onStatusChange,
  onEditLead,
  onAddFeedback,
}) => {
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Group leads by status
  const groupedLeads = useMemo(() => {
    const groups: Record<string, Lead[]> = {};
    KANBAN_COLUMNS.forEach((col) => {
      groups[col.id] = leads.filter((l) => l.status === col.id);
    });
    return groups;
  }, [leads]);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", lead.id.toString());
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedLead && draggedLead.status !== targetStatus && onStatusChange) {
      onStatusChange(draggedLead.id, targetStatus);
    }
    setDraggedLead(null);
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {KANBAN_COLUMNS.map((column) => {
          const columnLeads = groupedLeads[column.id] || [];
          const isDragOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              className={`w-72 flex-shrink-0 rounded-xl border-2 transition-colors ${
                isDragOver
                  ? `${column.color} bg-opacity-50 shadow-lg`
                  : "border-gray-200"
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className={`${column.bgHeader} px-4 py-3 rounded-t-xl border-b border-gray-200`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold text-sm ${column.textColor}`}>
                    {column.name}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${column.bgHeader} ${column.textColor} border ${column.color}`}>
                    {columnLeads.length}
                  </span>
                </div>
              </div>

              {/* Column Body */}
              <div className="p-2 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto bg-gray-50/50 min-h-[100px]">
                {columnLeads.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    Drop leads here
                  </div>
                ) : (
                  columnLeads.map((lead) => {
                    const score = calculateLeadScore(lead);
                    const scoreBadgeColor = getScoreBadgeColor(score.total);
                    const scoreIcon = getScoreIcon(score.rating);

                    return (
                      <motion.div
                        key={lead.id}
                        draggable
                        onDragStart={(e: any) => handleDragStart(e, lead)}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
                          draggedLead?.id === lead.id ? "opacity-50" : ""
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <GripVertical className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {lead.name}
                              </p>
                              {lead.website && (
                                <a
                                  href={lead.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 hover:underline truncate block"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {lead.website.replace(/^https?:\/\//, "")}
                                </a>
                              )}
                            </div>
                          </div>
                          {/* Score Badge */}
                          <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${scoreBadgeColor.bg} ${scoreBadgeColor.text}`}
                            title={`${score.rating}: ${score.total}/100`}
                          >
                            {scoreIcon} {score.total}
                          </span>
                        </div>

                        {/* Contact */}
                        {lead.phone && (
                          <p className="text-xs text-gray-500 mb-2 truncate">
                            {formatPhoneForDisplay(lead.phone)}
                          </p>
                        )}

                        {/* Urgency indicator */}
                        {(() => {
                          const lastDate = lead.lastContact
                            ? new Date(lead.lastContact)
                            : lead.createdAtRaw
                            ? new Date(lead.createdAtRaw._seconds * 1000)
                            : new Date(lead.createdAt);
                          const days = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                          if (days <= 1) return null;
                          const urgencyColor = days > 7 ? "text-red-600 bg-red-50" : days > 3 ? "text-orange-600 bg-orange-50" : "text-yellow-600 bg-yellow-50";
                          return (
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${urgencyColor} mb-2 inline-block`}>
                              {days}d since contact
                            </span>
                          );
                        })()}

                        {/* Quick Actions */}
                        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
                          {lead.phone && (
                            <>
                              <a
                                href={`tel:${lead.phone}`}
                                className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                title="Call"
                              >
                                <Phone className="h-3 w-3" />
                              </a>
                              <a
                                href={buildWhatsAppUrl(lead.phone, "Hello")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                title="WhatsApp"
                              >
                                <MessageCircle className="h-3 w-3" />
                              </a>
                            </>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddFeedback(lead.id, lead.name);
                            }}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-xs font-medium"
                            title="Add Feedback"
                          >
                            +Note
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditLead(lead);
                            }}
                            className="p-1.5 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors ml-auto"
                            title="Edit"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
