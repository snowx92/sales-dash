"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Phone,
  Mail,
  MessageSquare,
  MessageCircle,
  Bell,
  Store,
  MoreVertical
} from "lucide-react";
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp';
import { formatPhoneForDisplay } from '@/lib/utils/phone';
import { calculateLeadScore, getScoreIcon, getScoreBadgeColor } from '@/lib/utils/leadScoring';
import { Lead, leadSources, priorities, statuses } from './types';

interface LeadsTableProps {
  leads: Lead[];
  expandedRows: Set<number>;
  onToggleRowExpansion: (leadId: number) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: number) => void;
  onAddFeedback: (id: number, leadName: string) => void;
  onAddReminder: (id: number, name: string, email: string, phone: string) => void;
  onAssignStore?: (id: number, leadName: string) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  expandedRows,
  onToggleRowExpansion,
  onEditLead,
  onDeleteLead,
  onAddFeedback,
  onAddReminder,
  onAssignStore
}) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const toggleMenu = (leadId: number) => {
    setOpenMenuId(openMenuId === leadId ? null : leadId);
  };

  const closeMenu = () => {
    setOpenMenuId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div>
        <table className="w-full table-fixed">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Lead</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Score</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Contact</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden sm:table-cell">Source</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden sm:table-cell">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">Priority</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Attempts</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => {
              const source = leadSources.find(s => s.id === lead.leadSource);
              const priority = priorities.find(p => p.id === lead.priority);
              const status = statuses.find(s => s.id === lead.status);
              const SourceIcon = source?.icon || Globe;
              const StatusIcon = status?.icon || HelpCircle;
              const isExpanded = expandedRows.has(lead.id);

              // Calculate lead score
              const leadScore = calculateLeadScore(lead);
              const scoreColors = getScoreBadgeColor(leadScore.total);
              const scoreIcon = getScoreIcon(leadScore.rating);

              return (
                <React.Fragment key={lead.id}>
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onToggleRowExpansion(lead.id)}
                  >
                    {/* Lead Name & Basic Info */}
                    <td className="px-3 py-2 align-top">
                      <div className="flex items-center">
                        <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[12rem]">{lead.name}</div>
                          {lead.website && (
                            <div className="text-sm text-gray-700 truncate max-w-[14rem]">
                              <a 
                                href={lead.website} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline flex items-center gap-1 truncate"
                                onClick={(e) => e.stopPropagation()}
                                title={lead.website.replace(/^https?:\/\//, '')}
                              >
                                {lead.website.replace(/^https?:\/\//, '')}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="ml-2">
                          {isExpanded ? 
                            <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          }
                        </div>
                      </div>
                    </td>

                    {/* Lead Score */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border ${scoreColors.bg} ${scoreColors.text} ${scoreColors.border}`}
                          title={`Recency: ${leadScore.breakdown.recency}/100 | Source: ${leadScore.breakdown.source}/100 | Engagement: ${leadScore.breakdown.engagement}/100 | Priority: ${leadScore.breakdown.priority}/100`}
                        >
                          <span className="text-base">{scoreIcon}</span>
                          <span className="text-sm font-bold">{leadScore.total}</span>
                        </div>
                        {leadScore.recommendations.length > 0 && (
                          <div className="text-xs text-gray-500 max-w-xs">
                            {leadScore.recommendations[0]}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-3 py-2 align-top">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1 mb-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="font-medium text-green-600 truncate max-w-[10rem] block">{formatPhoneForDisplay(lead.phone)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="truncate max-w-[12rem] block">{lead.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="px-3 py-2 whitespace-nowrap hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <SourceIcon className={`h-4 w-4 ${source?.color}`} />
                        <span className="text-sm text-gray-900">{source?.name || lead.leadSource}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2 whitespace-nowrap hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-3 w-3 text-gray-400" />
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status?.color}`}>
                          {status?.name || lead.status}
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-3 py-2 whitespace-nowrap hidden md:table-cell">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${priority?.color}`}>
                        {priority?.name || lead.priority}
                      </span>
                    </td>

                    {/* Attempts + Last Updated Date (date only) */}
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col items-start">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium inline-block">
                          {isNaN(lead.attempts) ? 0 : lead.attempts}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          {lead.lastUpdated || lead.lastContact ? new Date(lead.lastUpdated || lead.lastContact).toLocaleDateString() : '-'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(lead.id);
                        }}
                        className="text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-md"
                        title="Actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {openMenuId === lead.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`tel:${lead.phone}`, '_self');
                                closeMenu();
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                            >
                              <Phone className="h-4 w-4 text-green-600" />
                              Call
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const url = buildWhatsAppUrl(lead.phone, 'Hello');
                                window.open(url, '_blank');
                                closeMenu();
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                            >
                              <MessageCircle className="h-4 w-4 text-green-600" />
                              WhatsApp
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddFeedback(lead.id, lead.name);
                                closeMenu();
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                            >
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                              Add Feedback
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddReminder(lead.id, lead.name, lead.email, lead.phone);
                                closeMenu();
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                            >
                              <Bell className="h-4 w-4 text-orange-600" />
                              Add Reminder
                            </button>
                            {onAssignStore && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAssignStore(lead.id, lead.name);
                                  closeMenu();
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                              >
                                <Store className="h-4 w-4 text-indigo-600" />
                                Assign Store
                              </button>
                            )}
                            <div className="border-t border-gray-200 my-1"></div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditLead(lead);
                                closeMenu();
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                            >
                              <Edit className="h-4 w-4 text-purple-600" />
                              Edit Lead
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteLead(lead.id);
                                closeMenu();
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 flex items-center gap-3 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Lead
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </motion.tr>

                  {/* Expanded Row - Feedback History */}
                  {isExpanded && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <td colSpan={8} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Previous Feedback</h4>
                          {lead.feedbackHistory.length > 0 ? (
                            <div className="space-y-2">
                              {lead.feedbackHistory.map((feedback) => (
                                <div key={feedback.id} className="bg-white p-3 rounded-lg border border-gray-200">
                                  <div className="flex items-start justify-between">
                                    <p className="text-sm text-gray-700">{feedback.message}</p>
                                    <span className="text-xs text-gray-500 ml-4">
                                      {new Date(feedback.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No feedback recorded yet.</p>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
