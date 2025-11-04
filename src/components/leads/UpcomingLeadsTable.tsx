"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  ArrowRight,
  Trash2,
  MessageCircle,
  Bell,
  Store,
  MoreVertical
} from "lucide-react";
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp';
import { formatPhoneForDisplay } from '@/lib/utils/phone';
import { UpcomingLead, leadSources, priorities } from './types';

interface UpcomingLeadsTableProps {
  leads: UpcomingLead[];
  onConvertToLead: (lead: UpcomingLead) => void | Promise<void>;
  onDeleteLead: (id: number) => void;
  onAddReminder: (id: number, name: string, email: string, phone: string) => void;
  onAssignStore?: (id: number, leadName: string) => void;
}

export const UpcomingLeadsTable: React.FC<UpcomingLeadsTableProps> = ({
  leads,
  onConvertToLead,
  onDeleteLead,
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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Website</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-700 flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span className="font-medium text-green-600">{formatPhoneForDisplay(lead.phone)}</span>
                      </div>
                      <div className="text-sm text-gray-700 flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {lead.website ? (
                    <a 
                      href={lead.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      {lead.website.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">No website</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {leadSources.find(source => source.id === lead.leadSource)?.icon && (
                      React.createElement(leadSources.find(source => source.id === lead.leadSource)!.icon, {
                        className: `h-4 w-4 ${leadSources.find(source => source.id === lead.leadSource)!.color}`
                      })
                    )}
                    <span className="text-sm text-gray-900">
                      {leadSources.find(source => source.id === lead.leadSource)?.name || lead.leadSource}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    priorities.find(p => p.id === lead.priority)?.color || 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {priorities.find(p => p.id === lead.priority)?.name || lead.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                  <button
                    onClick={() => toggleMenu(lead.id)}
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
                      >
                        <button
                          onClick={() => {
                            window.open(`tel:${lead.phone}`, '_self');
                            closeMenu();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                        >
                          <Phone className="h-4 w-4 text-green-600" />
                          Call
                        </button>
                        <button
                          onClick={() => {
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
                          onClick={() => {
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
                            onClick={() => {
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
                          onClick={() => {
                            onConvertToLead(lead);
                            closeMenu();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3 text-blue-600"
                        >
                          <ArrowRight className="h-4 w-4" />
                          Convert to Lead
                        </button>
                        <button
                          onClick={() => {
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
