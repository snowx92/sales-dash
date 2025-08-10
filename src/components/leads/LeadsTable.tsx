"use client";

import React from "react";
import { motion } from "framer-motion";
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
  Clock,
  MessageSquare,
  MessageCircle
} from "lucide-react";
import { Lead, leadSources, priorities, statuses } from './types';

interface LeadsTableProps {
  leads: Lead[];
  expandedRows: Set<number>;
  onToggleRowExpansion: (leadId: number) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: number) => void;
  onAddFeedback: (id: number, leadName: string) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  expandedRows,
  onToggleRowExpansion,
  onEditLead,
  onDeleteLead,
  onAddFeedback
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Lead</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Attempts</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
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

              return (
                <React.Fragment key={lead.id}>
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onToggleRowExpansion(lead.id)}
                  >
                    {/* Lead Name & Basic Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          {lead.website && (
                            <div className="text-sm text-gray-700">
                              <a 
                                href={lead.website} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1 mb-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span>{lead.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <SourceIcon className={`h-4 w-4 ${source?.color}`} />
                        <span className="text-sm text-gray-900">{source?.name || lead.leadSource}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-3 w-3 text-gray-400" />
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status?.color}`}>
                          {status?.name || lead.status}
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${priority?.color}`}>
                        {priority?.name || lead.priority}
                      </span>
                    </td>

                    {/* Attempts */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                        {isNaN(lead.attempts) ? 0 : lead.attempts}
                      </span>
                    </td>

                    {/* Last Updated */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        {new Date(lead.lastUpdated || lead.lastContact).toLocaleString()}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:${lead.phone}`, '_self');
                          }}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Call"
                        >
                          <Phone className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`, '_blank');
                          }}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddFeedback(lead.id, lead.name);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Add Feedback"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditLead(lead);
                          }}
                          className="text-purple-600 hover:text-purple-900 transition-colors"
                          title="Edit Lead"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteLead(lead.id);
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
