"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
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
  Calendar,
  Clock
} from "lucide-react";
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp';
import { formatPhoneForDisplay } from '@/lib/utils/phone';
import { calculateLeadScore, getScoreBadgeColor, getScoreIcon } from '@/lib/utils/leadScoring';
import { Lead, leadSources, priorities, statuses } from './types';

interface LeadCardProps {
  lead: Lead;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEditLead: () => void;
  onDeleteLead: () => void;
  onAddFeedback: () => void;
  onAssignStore?: () => void;
  onMarkAsJunk: () => void;
  onStatusChange?: (id: number, newStatus: string) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  isExpanded,
  onToggleExpand,
  onEditLead,
  onDeleteLead,
  onAddFeedback,
  onAssignStore,
  onMarkAsJunk,
  onStatusChange
}) => {
  // State for tracking which onboarding accordion is expanded
  const [expandedOnboarding, setExpandedOnboarding] = useState(false);

  const source = leadSources.find(s => s.id === lead.leadSource);
  const priority = priorities.find(p => p.id === lead.priority);
  const status = statuses.find(s => s.id === lead.status);
  const SourceIcon = source?.icon || Globe;
  const score = calculateLeadScore(lead);
  const scoreBadgeColor = getScoreBadgeColor(score.total);
  const scoreIcon = getScoreIcon(score.rating);

  // Helper to format created date
  const formatCreatedDate = (createdAtRaw?: { _seconds: number; _nanoseconds: number }) => {
    if (!createdAtRaw) return lead.createdAt || '-';
    return new Date(createdAtRaw._seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4"
    >
      {/* Card Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer active:bg-gray-50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between">
          {/* Left: Avatar and Name */}
          <div className="flex items-center min-w-0 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {lead.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-gray-900 truncate">{lead.name}</h3>
                {onStatusChange ? (
                  <select
                    value={lead.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      onStatusChange(lead.id, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-purple-500 ${status?.color}`}
                  >
                    {statuses.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${status?.color}`}>
                    {status?.name || lead.status}
                  </span>
                )}
              </div>
              {lead.website && (
                <a 
                  href={lead.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline flex items-center gap-1 text-sm truncate mt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {lead.website.replace(/^https?:\/\//, '')}
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              )}
            </div>
          </div>

          {/* Right: Expand Icon */}
          <div className="ml-2 flex-shrink-0">
            {isExpanded ? 
              <ChevronUp className="h-5 w-5 text-gray-400" /> : 
              <ChevronDown className="h-5 w-5 text-gray-400" />
            }
          </div>
        </div>

        {/* Quick Info Row - Visible on mobile */}
        <div className="mt-3 flex flex-wrap gap-2">
          {/* Phone */}
          <a
            href={`tel:${lead.phone}`}
            className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="h-3.5 w-3.5" />
            <span className="truncate max-w-[100px]">{formatPhoneForDisplay(lead.phone)}</span>
          </a>

          {/* Source */}
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
            <SourceIcon className={`h-3.5 w-3.5 ${source?.color}`} />
            <span className="hidden xs:inline">{source?.name || lead.leadSource}</span>
          </span>

          {/* Priority */}
          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${priority?.color}`}>
            {priority?.name || lead.priority}
          </span>

          {/* Lead Score */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 ${scoreBadgeColor.bg} ${scoreBadgeColor.text} border ${scoreBadgeColor.border} rounded-lg text-sm font-semibold`}
            title={`Score: ${score.total}/100 (${score.rating})\n${score.recommendations.join('\n')}`}
          >
            {scoreIcon} {score.total}
          </span>

          {/* Attempts */}
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
            <Clock className="h-3.5 w-3.5" />
            {isNaN(lead.attempts) ? 0 : lead.attempts}
          </span>

          {/* Date */}
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
            <Calendar className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{formatCreatedDate(lead.createdAtRaw)}</span>
            <span className="sm:hidden">{formatCreatedDate(lead.createdAtRaw)?.split(',')[0]}</span>
          </span>

          {/* Urgency Indicator for Follow-up / Interested / No Answer leads */}
          {(() => {
            if (!['follow_up', 'interested', 'no_answer'].includes(lead.status)) return null;
            const lastDate = lead.lastContact ? new Date(lead.lastContact) : (lead.createdAtRaw ? new Date(lead.createdAtRaw._seconds * 1000) : new Date(lead.createdAt));
            const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            let urgencyColor = 'bg-green-100 text-green-700';
            let urgencyLabel = 'Today';
            if (daysSince > 7) { urgencyColor = 'bg-red-100 text-red-700'; urgencyLabel = `${daysSince}d overdue`; }
            else if (daysSince > 3) { urgencyColor = 'bg-orange-100 text-orange-700'; urgencyLabel = `${daysSince}d ago`; }
            else if (daysSince > 1) { urgencyColor = 'bg-yellow-100 text-yellow-700'; urgencyLabel = `${daysSince}d ago`; }
            else if (daysSince === 1) { urgencyLabel = '1d ago'; }
            return (
              <span className={`inline-flex items-center gap-1 px-2 py-1 ${urgencyColor} rounded-lg text-xs font-semibold`}>
                {daysSince > 7 ? '!!' : daysSince > 3 ? '!' : ''} {urgencyLabel}
              </span>
            );
          })()}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Contact Details */}
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{lead.email}</span>
                </div>
                {lead.socialUrls && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-500 truncate">{lead.socialUrls}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Onboarding Feedback Accordion */}
            {lead.onboardingFeedback && lead.onboardingFeedback.length > 0 && (
              <>
                <div className="border-t border-gray-100" />
                <div className="bg-indigo-50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedOnboarding(!expandedOnboarding);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between active:bg-indigo-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-indigo-600" />
                      <span className="font-medium text-indigo-900">Onboarding Info</span>
                    </div>
                    {expandedOnboarding ? (
                      <ChevronUp className="h-4 w-4 text-indigo-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-indigo-600" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedOnboarding && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3">
                          {lead.onboardingFeedback.map((item, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 border border-indigo-100">
                              <p className="text-xs font-medium text-indigo-500 uppercase tracking-wide">Question</p>
                              <p className="text-sm text-gray-900">{item.question}</p>
                              <p className="text-xs font-medium text-indigo-500 uppercase tracking-wide mt-2">Answer</p>
                              <p className="text-sm text-gray-700">{item.answer}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* Previous Feedback */}
            {lead.feedbackHistory && lead.feedbackHistory.length > 0 && (
              <>
                <div className="border-t border-gray-100" />
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Previous Feedback</h4>
                  <div className="space-y-2">
                    {lead.feedbackHistory.map((feedback) => (
                      <div key={feedback.id} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <p className="text-sm text-gray-700">{feedback.message}</p>
                          <span className="text-xs text-gray-500 ml-4 flex-shrink-0">
                            {new Date(feedback.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="border-t border-gray-100 p-4 bg-white">
              <div className="flex flex-wrap gap-2">
                {/* Call */}
                <a
                  href={`tel:${lead.phone}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm min-w-[80px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>

                {/* WhatsApp */}
                <a
                  href={buildWhatsAppUrl(lead.phone, 'Hello')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-500 text-white rounded-lg font-medium text-sm min-w-[80px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>

                {/* Add Feedback */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddFeedback();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm min-w-[80px]"
                >
                  <MessageSquare className="h-4 w-4" />
                  Feedback
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {/* Assign Store */}
                {onAssignStore && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignStore();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm min-w-[80px]"
                  >
                    <Store className="h-4 w-4" />
                    Store
                  </button>
                )}

                {/* Edit */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditLead();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-purple-600 text-white rounded-lg font-medium text-sm min-w-[80px]"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>

                {/* Mark as Junk */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsJunk();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-orange-500 text-white rounded-lg font-medium text-sm min-w-[80px]"
                >
                  <Ban className="h-4 w-4" />
                  Junk
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLead();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-600 text-white rounded-lg font-medium text-sm min-w-[80px]"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

