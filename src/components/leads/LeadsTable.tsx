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
  Ban,
  Store,
  UserPlus,
  Calendar
} from "lucide-react";
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp';
import { formatPhoneForDisplay } from '@/lib/utils/phone';
import { calculateLeadScore, getScoreBadgeColor, getScoreIcon } from '@/lib/utils/leadScoring';
import { Lead, leadSources, priorities, statuses } from './types';

interface LeadsTableProps {
  leads: Lead[];
  expandedRows: Set<number>;
  onToggleRowExpansion: (leadId: number) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: number) => void;
  onAddFeedback: (id: number, leadName: string) => void;
  onAssignStore?: (id: number, leadName: string) => void;
  onMarkAsJunk: (id: number) => void;
  onStatusChange?: (id: number, newStatus: string) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  expandedRows,
  onToggleRowExpansion,
  onEditLead,
  onDeleteLead,
  onAddFeedback,
  onAssignStore,
  onMarkAsJunk,
  onStatusChange
}) => {
  // State for tracking which onboarding accordion is expanded
  const [expandedOnboarding, setExpandedOnboarding] = useState<number | null>(null);

  const toggleOnboardingExpansion = (leadId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedOnboarding(prev => prev === leadId ? null : leadId);
  };

  // Helper to format created date from raw timestamp
  const formatCreatedDate = (createdAtRaw?: { _seconds: number; _nanoseconds: number }) => {
    if (!createdAtRaw) return '-';
    return new Date(createdAtRaw._seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper to format datetime
  const formatDateTime = (createdAtRaw?: { _seconds: number; _nanoseconds: number }) => {
    if (!createdAtRaw) return '-';
    return new Date(createdAtRaw._seconds * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div>
        <table className="w-full table-fixed">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Lead</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Contact</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden sm:table-cell">Source</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden sm:table-cell">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">Priority</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">Score</th>
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
              const score = calculateLeadScore(lead);
              const scoreBadgeColor = getScoreBadgeColor(score.total);
              const scoreIcon = getScoreIcon(score.rating);

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
                        {onStatusChange ? (
                          <select
                            value={lead.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              onStatusChange(lead.id, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={`px-2 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-purple-500 ${status?.color}`}
                          >
                            {statuses.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        ) : (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status?.color}`}>
                          {status?.name || lead.status}
                        </span>
                        )}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-3 py-2 whitespace-nowrap hidden md:table-cell">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${priority?.color}`}>
                        {priority?.name || lead.priority}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="px-3 py-2 whitespace-nowrap hidden lg:table-cell">
                      <span
                        className={`px-2 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full border ${scoreBadgeColor.bg} ${scoreBadgeColor.text} ${scoreBadgeColor.border}`}
                        title={`${score.rating.toUpperCase()} - ${score.recommendations[0] || 'No recommendations'}`}
                      >
                        {scoreIcon} {score.total}
                      </span>
                    </td>

                    {/* Attempts + Created Date */}
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col items-start">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium inline-block">
                          {isNaN(lead.attempts) ? 0 : lead.attempts}
                        </span>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500" title={formatDateTime(lead.createdAtRaw)}>
                          <Calendar className="h-3 w-3" />
                          <span>{formatCreatedDate(lead.createdAtRaw)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:${lead.phone}`, '_self');
                          }}
                          className="text-green-600 hover:text-green-900 transition-colors p-1"
                          title="Call"
                        >
                          <Phone className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const url = buildWhatsAppUrl(lead.phone, 'Hello');
                            window.open(url, '_blank');
                          }}
                          className="text-green-600 hover:text-green-900 transition-colors p-1"
                          title="WhatsApp"
                        >
                          <MessageCircle className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddFeedback(lead.id, lead.name);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                          title="Add Feedback"
                        >
                          <MessageSquare className="h-3 w-3" />
                        </button>
                        {onAssignStore && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAssignStore(lead.id, lead.name);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors p-1"
                            title="Assign Store"
                          >
                            <Store className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditLead(lead);
                          }}
                          className="text-purple-600 hover:text-purple-900 transition-colors p-1"
                          title="Edit Lead"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsJunk(lead.id);
                          }}
                          className="text-orange-600 hover:text-orange-900 transition-colors p-1"
                          title="Mark as Junk"
                        >
                          <Ban className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteLead(lead.id);
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors p-1"
                          title="Delete Lead"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <td colSpan={8} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          {/* Onboarding Feedback Accordion */}
                          {lead.onboardingFeedback && lead.onboardingFeedback.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <button
                                onClick={(e) => toggleOnboardingExpansion(lead.id, e)}
                                className="w-full px-4 py-3 flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <UserPlus className="h-4 w-4 text-indigo-600" />
                                  <span className="font-medium text-indigo-900">Onboarding Info</span>
                                </div>
                                {expandedOnboarding === lead.id ? (
                                  <ChevronUp className="h-4 w-4 text-indigo-600" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-indigo-600" />
                                )}
                              </button>
                              <AnimatePresence>
                                {expandedOnboarding === lead.id && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="p-4 space-y-3">
                                      {lead.onboardingFeedback.map((item, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-2">
                                          <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Question</p>
                                            <p className="text-sm text-gray-900">{item.question}</p>
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Answer</p>
                                            <p className="text-sm text-gray-700">{item.answer}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {/* Previous Feedback */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Previous Feedback</h4>
                            {lead.feedbackHistory && lead.feedbackHistory.length > 0 ? (
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
