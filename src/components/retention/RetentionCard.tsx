"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Phone,
  Mail,
  Edit,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Calendar,
  Target,
  MessageCircle,
  Bell,
  Building,
  Clock
} from "lucide-react";
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp';
import { formatPhoneForDisplay } from '@/lib/utils/phone';
import { EndedSubscriptionItem } from "@/lib/api/retention/types";

// Priority colors
const priorities = [
  { id: 'HIGH' as const, name: 'High', color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'MEDIUM' as const, name: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'LOW' as const, name: 'Low', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'JUNK' as const, name: 'Junk', color: 'bg-orange-100 text-orange-700 border-orange-200' }
];

interface RetentionCardProps {
  merchant: EndedSubscriptionItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onAddReminder: () => void;
}

export const RetentionCard: React.FC<RetentionCardProps> = ({
  merchant,
  isExpanded,
  onToggleExpand,
  onEdit,
  onAddReminder
}) => {
  const [expandedFeedback, setExpandedFeedback] = useState(false);

  const priority = priorities.find(p => p.id === merchant.priority);

  // Helper function to format expired date
  const formatExpiredDate = (expiredAt: string | null | { _seconds: number; _nanoseconds: number }): string => {
    if (!expiredAt) return 'N/A';
    
    // Handle Firebase timestamp format
    if (typeof expiredAt === 'object' && expiredAt._seconds) {
      const date = new Date(expiredAt._seconds * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    // Handle string format
    if (typeof expiredAt === 'string') {
      return new Date(expiredAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    return 'N/A';
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
          {/* Left: Logo/Avatar and Store Name */}
          <div className="flex items-center min-w-0 flex-1">
            {merchant.logo ? (
              <Image
                src={merchant.logo}
                alt={merchant.storeName}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      ${merchant.storeName.charAt(0).toUpperCase()}
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {merchant.storeName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="ml-3 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-gray-900 truncate">{merchant.storeName}</h3>
                <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${priority?.color}`}>
                  {priority?.name || merchant.priority}
                </span>
              </div>
              {merchant.link && (
                <a 
                  href={merchant.link}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline flex items-center gap-1 text-sm truncate mt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Store
                  <ExternalLink className="h-3 w-3" />
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

        {/* Quick Info Row */}
        <div className="mt-3 flex flex-wrap gap-2">
          {/* Customer Name */}
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
            <Building className="h-3.5 w-3.5" />
            <span className="truncate max-w-[80px]">{merchant.name}</span>
          </span>

          {/* Impact */}
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-sm font-semibold">
            <Target className="h-3.5 w-3.5" />
            {merchant.impact.toLocaleString()} EGP
          </span>

          {/* Expired Date */}
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-lg text-sm">
            <Calendar className="h-3.5 w-3.5" />
            {formatExpiredDate(merchant.expiredAt)}
          </span>

          {/* Attempts */}
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
            <Clock className="h-3.5 w-3.5" />
            {merchant.attemps}
          </span>
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
                  <Phone className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <a 
                    href={`tel:${merchant.phone}`}
                    className="text-sm text-green-700 font-medium hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {formatPhoneForDisplay(merchant.phone)}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <a 
                    href={`mailto:${merchant.email}`}
                    className="text-sm text-blue-600 hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {merchant.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Feedback Accordion */}
            {merchant.feedbacks && merchant.feedbacks.length > 0 && (
              <>
                <div className="border-t border-gray-100" />
                <div className="bg-orange-50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedFeedback(!expandedFeedback);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between active:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-900">Feedback History ({merchant.feedbacks.length})</span>
                    </div>
                    {expandedFeedback ? (
                      <ChevronUp className="h-4 w-4 text-orange-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-orange-600" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedFeedback && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-2">
                          {merchant.feedbacks.map((feedback, index) => (
                            <div key={index} className="bg-white p-3 rounded-lg border border-orange-100">
                              <p className="text-sm text-gray-700">{feedback}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* Additional Info */}
            <div className="border-t border-gray-100 p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div>
                  <span className="font-medium">ID:</span> {merchant.id}
                </div>
                <div>
                  <span className="font-medium">Merchant ID:</span> {merchant.merchantId}
                </div>
                <div>
                  <span className="font-medium">Renew Count:</span> {merchant.renewCounts}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-100 p-4 bg-white">
              <div className="flex flex-wrap gap-2">
                {/* Call */}
                <a
                  href={`tel:${merchant.phone}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm min-w-[70px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>

                {/* WhatsApp */}
                <a
                  href={buildWhatsAppUrl(merchant.phone, 'Hello')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-500 text-white rounded-lg font-medium text-sm min-w-[70px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>

                {/* Email */}
                <a
                  href={`mailto:${merchant.email}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm min-w-[70px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {/* Add Reminder */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddReminder();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-orange-500 text-white rounded-lg font-medium text-sm min-w-[70px]"
                >
                  <Bell className="h-4 w-4" />
                  Reminder
                </button>

                {/* Edit */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-purple-600 text-white rounded-lg font-medium text-sm min-w-[70px]"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

