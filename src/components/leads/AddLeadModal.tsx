"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle } from "lucide-react";
import { Lead, FormData, leadSources, priorities, statuses, feedbackSuggestions } from './types';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (lead: Lead) => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    website: '',
    socialUrls: '',
    leadSource: '',
    priority: 'mid',
    status: 'follow_up',
    attempts: 0,
    lastContact: '',
    feedback: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: Lead = {
      id: Date.now(),
      ...formData,
      attempts: 0,
      lastContact: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(), // set lastUpdated to now
      createdAt: new Date().toISOString().split('T')[0],
      feedbackHistory: []
    };
    onAdd(newLead);
    setFormData({
      name: '',
      phone: '',
      email: '',
      website: '',
      socialUrls: '',
      leadSource: '',
      priority: 'mid',
      status: 'follow_up',
      attempts: 0,
      lastContact: '',
      feedback: ''
    });
    onClose();
  };

  const handleFeedbackSuggestion = (suggestion: string) => {
    setFormData((prev: FormData) => ({ ...prev, feedback: suggestion }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add New Lead</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev: FormData) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="Enter lead name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData((prev: FormData) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="+20 123 456 7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev: FormData) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="lead@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData((prev: FormData) => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Media URLs
              </label>
              <input
                type="text"
                value={formData.socialUrls}
                onChange={(e) => setFormData((prev: FormData) => ({ ...prev, socialUrls: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="Facebook, Instagram, TikTok URLs"
              />
            </div>

            {/* Lead Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Lead Source *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {leadSources.map((source) => {
                  const IconComponent = source.icon;
                  return (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => setFormData((prev: FormData) => ({ ...prev, leadSource: source.id }))}
                      className={`p-3 border-2 rounded-lg flex items-center gap-2 transition-all ${
                        formData.leadSource === source.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <IconComponent className={`h-4 w-4 ${source.color}`} />
                      <span className="text-sm font-medium text-gray-900">{source.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Priority
                </label>
                <div className="flex gap-2">
                  {priorities.map((priority) => (
                    <button
                      key={priority.id}
                      type="button"
                      onClick={() => setFormData((prev: FormData) => ({ ...prev, priority: priority.id }))}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        formData.priority === priority.id
                          ? priority.color
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {priority.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Status
                </label>
                <div className="flex gap-2 flex-wrap">
                  {statuses.map((status) => {
                    const IconComponent = status.icon;
                    return (
                      <button
                        key={status.id}
                        type="button"
                        onClick={() => setFormData((prev: FormData) => ({ ...prev, status: status.id }))}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium flex items-center gap-1 transition-all ${
                          formData.status === status.id
                            ? status.color
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <IconComponent className="h-3 w-3" />
                        {status.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback
              </label>
              <textarea
                value={formData.feedback}
                onChange={(e) => setFormData((prev: FormData) => ({ ...prev, feedback: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="Add feedback about this lead..."
              />
              
              {/* Feedback Suggestions */}
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">Quick suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {feedbackSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleFeedbackSuggestion(suggestion)}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Add Lead
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
