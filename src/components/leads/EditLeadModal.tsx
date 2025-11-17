"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle } from "lucide-react";
import { Lead, statuses, priorities } from './types';

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onUpdate: (id: number, updates: Lead) => void;
}

export const EditLeadModal: React.FC<EditLeadModalProps> = ({ isOpen, onClose, lead, onUpdate }) => {
  const [formData, setFormData] = useState<Lead>(lead);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update the lead with current form data
    const updatedLead = {
      ...formData,
      lastContact: new Date().toISOString().split('T')[0]
    };
    
    onUpdate(lead.id, updatedLead);
    onClose();
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
              <h2 className="text-xl font-bold text-gray-900">Edit Lead</h2>
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
                  Lead Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev: Lead) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev: Lead) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev: Lead) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData((prev: Lead) => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            {/* Feedback History */}
            {formData.feedbackHistory && formData.feedbackHistory.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Previous Feedback</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {formData.feedbackHistory.map((feedback) => (
                    <div key={feedback.id} className="bg-white p-2 rounded border border-gray-200">
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-gray-700">{feedback.message}</p>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(feedback.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        onClick={() => setFormData((prev: Lead) => ({ ...prev, status: status.id }))}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Priority
                </label>
                <div className="flex gap-2">
                  {priorities.map((priority) => (
                    <button
                      key={priority.id}
                      type="button"
                      onClick={() => setFormData((prev: Lead) => ({ ...prev, priority: priority.id }))}
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
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback
              </label>
              <textarea
                value={formData.feedback}
                onChange={(e) => setFormData((prev: Lead) => ({ ...prev, feedback: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="Add feedback about this lead..."
              />
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
                Update Lead
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
