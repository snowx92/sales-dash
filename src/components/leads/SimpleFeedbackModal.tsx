"use client";

import React, { useState } from "react";
import { X, MessageSquare } from "lucide-react";

interface SimpleFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (feedback: string) => void;
  leadName: string;
  loading?: boolean;
}

export const SimpleFeedbackModal: React.FC<SimpleFeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  leadName,
  loading = false 
}) => {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      onAdd(feedback.trim());
      setFeedback('');
      onClose();
    }
  };

  const handleClose = () => {
    setFeedback('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <MessageSquare className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Add Feedback</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Add feedback for <span className="font-medium">{leadName}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            rows={4}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            placeholder="Enter your feedback about this lead..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
            disabled={loading}
          />

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!feedback.trim() || loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
