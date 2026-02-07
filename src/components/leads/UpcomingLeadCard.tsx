"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Globe,
  ExternalLink,
  Phone,
  Calendar,
  MessageCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Ban,
  Store
} from "lucide-react";
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp';
import { formatPhoneForDisplay } from '@/lib/utils/phone';
import { UpcomingLead, leadSources, priorities } from './types';

interface UpcomingLeadCardProps {
  lead: UpcomingLead;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAddFeedback: () => void;
  onEditLead?: () => void;
  onDeleteLead?: () => void;
  onAssignStore?: () => void;
  onMarkAsJunk?: () => void;
}

export const UpcomingLeadCard: React.FC<UpcomingLeadCardProps> = ({
  lead,
  isExpanded,
  onToggleExpand,
  onAddFeedback,
  onEditLead,
  onDeleteLead,
  onAssignStore,
  onMarkAsJunk
}) => {
  const source = leadSources.find(s => s.id === lead.leadSource);
  const priority = priorities.find(p => p.id === lead.priority);
  const SourceIcon = source?.icon || Globe;

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
      className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden mb-4"
    >
      {/* Card Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer active:bg-blue-50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between">
          {/* Left: Avatar and Name */}
          <div className="flex items-center min-w-0 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {lead.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-gray-900 truncate">{lead.name}</h3>
                <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-700">
                  NEW
                </span>
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
              <ChevronUp className="h-5 w-5 text-blue-400" /> : 
              <ChevronDown className="h-5 w-5 text-blue-400" />
            }
          </div>
        </div>

        {/* Quick Info Row */}
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

          {/* Date */}
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
            <Calendar className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{formatCreatedDate(lead.createdAtRaw)}</span>
            <span className="sm:hidden">{formatCreatedDate(lead.createdAtRaw)?.split(',')[0]}</span>
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          {/* Divider */}
          <div className="border-t border-blue-100" />

          {/* Contact Details */}
          <div className="p-4 bg-blue-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 min-w-[60px]">Email:</span>
                <span className="text-sm text-gray-900 truncate">{lead.email}</span>
              </div>
              {lead.socialUrls && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 min-w-[60px]">Social:</span>
                  <span className="text-sm text-gray-500 truncate">{lead.socialUrls}</span>
                </div>
              )}
            </div>
          </div>

          {/* Onboarding Feedback */}
          {lead.onboardingFeedback && lead.onboardingFeedback.length > 0 && (
            <>
              <div className="border-t border-blue-100" />
              <div className="p-4">
                <h4 className="font-medium text-blue-900 mb-3">Onboarding Info</h4>
                <div className="space-y-2">
                  {lead.onboardingFeedback.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-blue-100">
                      <p className="text-xs font-medium text-blue-500 uppercase tracking-wide">Question</p>
                      <p className="text-sm text-gray-900">{item.question}</p>
                      <p className="text-xs font-medium text-blue-500 uppercase tracking-wide mt-2">Answer</p>
                      <p className="text-sm text-gray-700">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="border-t border-blue-100 p-4 bg-white">
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
              {onEditLead && (
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
              )}

              {/* Mark as Junk */}
              {onMarkAsJunk && (
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
              )}

              {/* Delete */}
              {onDeleteLead && (
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
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

