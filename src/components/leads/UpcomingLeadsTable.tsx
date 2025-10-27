"use client";

import React from "react";
import {
  User,
  Phone,
  Mail,
  ArrowRight,
  Trash2,
  MessageCircle,
  Bell
} from "lucide-react";
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp';
import { formatPhoneForDisplay } from '@/lib/utils/phone';
import { UpcomingLead, leadSources, priorities } from './types';

interface UpcomingLeadsTableProps {
  leads: UpcomingLead[];
  onConvertToLead: (lead: UpcomingLead) => void | Promise<void>;
  onDeleteLead: (id: number) => void;
  onAddReminder: (id: number, name: string, email: string, phone: string) => void;
}

export const UpcomingLeadsTable: React.FC<UpcomingLeadsTableProps> = ({
  leads,
  onConvertToLead,
  onDeleteLead,
  onAddReminder
}) => {
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    title="Call"
                  >
                    <Phone className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => {
                      const url = buildWhatsAppUrl(lead.phone, 'Hello');
                      window.open(url, '_blank');
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    title="WhatsApp"
                  >
                    <MessageCircle className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onAddReminder(lead.id, lead.name, lead.email, lead.phone)}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                    title="Add Reminder"
                  >
                    <Bell className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onConvertToLead(lead)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <ArrowRight className="h-3 w-3" />
                    Convert
                  </button>
                  <button
                    onClick={() => onDeleteLead(lead.id)}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
