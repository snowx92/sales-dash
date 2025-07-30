"use client";
import { Metadata } from "next";
import { PAGE_TITLES } from "@/lib/config/page-titles";

export const metadata: Metadata = {
  title: PAGE_TITLES.LEADS,
  description: "Manage and track sales leads",
};



import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pagination } from "@/components/tables/Pagination";
import { 
  Plus, 
  Search, 

  Phone, 
  Mail, 
  Globe, 
  Edit, 
  Trash2, 

  Clock,

  CheckCircle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Facebook,
  Instagram,
  ExternalLink,
  User,
  UserCheck,
  Target,
  TrendingUp,
  Users,
  Building,
  ChevronDown,
  ChevronUp
} from "lucide-react";

// TypeScript interfaces
interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  website: string;
  socialUrls: string;
  leadSource: string;
  priority: string;
  status: string;
  attempts: number;
  lastContact: string;
  feedback: string;
  createdAt: string;
  feedbackHistory: Array<{
    id: number;
    message: string;
    date: string;
  }>;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  website: string;
  socialUrls: string;
  leadSource: string;
  priority: string;
  status: string;
  attempts: number;
  lastContact: string;
  feedback: string;
}

// Lead source options with icons
const leadSources = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
  { id: 'tiktok', name: 'TikTok', icon: TrendingUp, color: 'text-black' },
  { id: 'web_scraping', name: 'Web Scraping', icon: Globe, color: 'text-green-600' },
  { id: 'personal', name: 'Personal', icon: User, color: 'text-purple-600' },
  { id: 'signup', name: 'Signup', icon: CheckCircle, color: 'text-indigo-600' }
];

// Priority options
const priorities = [
  { id: 'high', name: 'High', color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'mid', name: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'low', name: 'Low', color: 'bg-green-100 text-green-700 border-green-200' }
];

// Status options
const statuses = [
  { id: 'interested', name: 'Interested', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  { id: 'subscribed', name: 'Subscribed', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: UserCheck },
  { id: 'not_interested', name: 'Not Interested', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  { id: 'no_answer', name: 'No Answer', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: HelpCircle },
  { id: 'follow_up', name: 'Follow Up', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: RefreshCw }
];

// Auto-fill feedback suggestions
const feedbackSuggestions = [
  "Already has another website solution",
  "Budget constraints - needs cheaper option",
  "Not ready to commit yet",
  "Wants to see more features",
  "Needs to discuss with team",
  "Interested but timing is wrong"
];

// Mock leads data
const mockLeads = [
  {
    id: 1,
    name: "Ahmed Hassan",
    phone: "+20 123 456 7890",
    email: "ahmed@example.com",
    website: "https://ahmedstore.com",
    socialUrls: "https://instagram.com/ahmedstore",
    leadSource: "instagram",
    priority: "high",
    status: "interested",
    attempts: 3,
    lastContact: "2024-01-15",
    feedback: "Interested in Pro plan",
    createdAt: "2024-01-10",
    feedbackHistory: [
      { id: 1, message: 'Initial call made, very interested', date: '2024-01-10' },
      { id: 2, message: 'Sent Pro plan details', date: '2024-01-12' },
      { id: 3, message: 'Demo scheduled for next week', date: '2024-01-15' }
    ]
  },
  {
    id: 2,
    name: "Sarah Mohamed",
    phone: "+20 987 654 3210",
    email: "sarah@business.com",
    website: "https://sarahfashion.com",
    socialUrls: "https://facebook.com/sarahfashion",
    leadSource: "facebook",
    priority: "mid",
    status: "follow_up",
    attempts: 1,
    lastContact: "2024-01-14",
    feedback: "Needs to discuss with team",
    createdAt: "2024-01-12",
    feedbackHistory: [
      { id: 1, message: 'First contact, needs team approval', date: '2024-01-12' },
      { id: 2, message: 'Follow up scheduled for next week', date: '2024-01-14' }
    ]
  },
  {
    id: 3,
    name: "Omar Ali",
    phone: "+20 555 123 4567",
    email: "omar@tech.com",
    website: "https://omartech.com",
    socialUrls: "https://tiktok.com/@omartech",
    leadSource: "tiktok",
    priority: "low",
    status: "not_interested",
    attempts: 2,
    lastContact: "2024-01-13",
    feedback: "Already has another website solution",
    createdAt: "2024-01-11",
    feedbackHistory: [
      { id: 1, message: 'Called, has existing solution', date: '2024-01-11' },
      { id: 2, message: 'Sent comparison features', date: '2024-01-13' }
    ]
  }
];

// Add Lead Modal Component
const AddLeadModal = ({ isOpen, onClose, onAdd }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (lead: Lead) => void; 
}) => {
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

// Edit Lead Modal Component
const EditLeadModal = ({ isOpen, onClose, lead, onUpdate }: {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onUpdate: (id: number, updates: Lead) => void;
}) => {
  const [formData, setFormData] = useState<Lead>(lead);
  const [newAttempt, setNewAttempt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If there's feedback in the main feedback field, add it to history and clear the field
    let updatedLead = { ...formData };
    if (formData.feedback.trim() && formData.feedback !== lead.feedback) {
      const newFeedback = {
        id: Date.now(),
        message: formData.feedback,
        date: new Date().toISOString().split('T')[0]
      };
      
      updatedLead = {
        ...formData,
        feedback: '', // Clear the feedback field after adding to history
        feedbackHistory: [...formData.feedbackHistory, newFeedback],
        attempts: formData.attempts + 1,
        lastContact: new Date().toISOString().split('T')[0]
      };
    }
    
    onUpdate(lead.id, updatedLead);
    onClose();
  };

  const addAttempt = () => {
    if (newAttempt.trim()) {
      const newFeedback = {
        id: Date.now(),
        message: newAttempt,
        date: new Date().toISOString().split('T')[0]
      };
      
      setFormData((prev: Lead) => ({
        ...prev,
        attempts: prev.attempts + 1,
        lastContact: new Date().toISOString().split('T')[0],
        feedbackHistory: [...prev.feedbackHistory, newFeedback]
      }));
      setNewAttempt('');
    }
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

            {/* Contact Attempts */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Contact Attempts: {formData.attempts}</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev: Lead) => ({ ...prev, attempts: prev.attempts + 1 }))}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
                  >
                    +1 Attempt
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev: Lead) => ({ ...prev, attempts: Math.max(0, prev.attempts - 1) }))}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition-colors"
                  >
                    -1 Attempt
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAttempt}
                  onChange={(e) => setNewAttempt(e.target.value)}
                  placeholder="Add quick feedback note..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
                <button
                  type="button"
                  onClick={addAttempt}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Feedback History */}
            {formData.feedbackHistory.length > 0 && (
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

            {/* Current Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Feedback
              </label>
              <textarea
                value={formData.feedback}
                onChange={(e) => setFormData((prev: Lead) => ({ ...prev, feedback: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="Add new feedback about this lead... (This will increase attempts by 1)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Submitting new feedback will automatically increase attempts by 1 and add to feedback history.
              </p>
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



export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const handleAddLead = (newLead: Lead) => {
    setLeads(prev => [newLead, ...prev]);
  };

  const handleUpdateLead = (id: number, updates: Lead) => {
    setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, ...updates } : lead));
  };

  const handleDeleteLead = (id: number) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      setLeads(prev => prev.filter(lead => lead.id !== id));
    }
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsEditModalOpen(true);
  };

  const toggleRowExpansion = (leadId: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    
    const matchesDate = !dateFilter || lead.createdAt === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  // Calculate pagination
  const totalItems = filteredLeads.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
            <p className="text-gray-600 mt-1">Manage and track your sales leads</p>
          </div>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            Add New Lead
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="Search leads by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>
        </div>

                 {/* Stats */}
         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
           <div className="bg-white rounded-xl border border-gray-200 p-6">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                 <Users className="h-5 w-5 text-blue-600" />
               </div>
               <div>
                 <p className="text-sm text-gray-600">Total Leads</p>
                 <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
               </div>
             </div>
           </div>

           <div className="bg-white rounded-xl border border-gray-200 p-6">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                 <UserCheck className="h-5 w-5 text-purple-600" />
               </div>
               <div>
                 <p className="text-sm text-gray-600">Subscribed</p>
                 <p className="text-2xl font-bold text-gray-900">
                   {leads.filter(lead => lead.status === 'subscribed').length}
                 </p>
               </div>
             </div>
           </div>

           <div className="bg-white rounded-xl border border-gray-200 p-6">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                 <CheckCircle className="h-5 w-5 text-green-600" />
               </div>
               <div>
                 <p className="text-sm text-gray-600">Interested</p>
                 <p className="text-2xl font-bold text-gray-900">
                   {leads.filter(lead => lead.status === 'interested').length}
                 </p>
               </div>
             </div>
           </div>

           <div className="bg-white rounded-xl border border-gray-200 p-6">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                 <RefreshCw className="h-5 w-5 text-blue-600" />
               </div>
               <div>
                 <p className="text-sm text-gray-600">Follow Up</p>
                 <p className="text-2xl font-bold text-gray-900">
                   {leads.filter(lead => lead.status === 'follow_up').length}
                 </p>
               </div>
             </div>
           </div>

           <div className="bg-white rounded-xl border border-gray-200 p-6">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                 <XCircle className="h-5 w-5 text-red-600" />
               </div>
               <div>
                 <p className="text-sm text-gray-600">Not Interested</p>
                 <p className="text-2xl font-bold text-gray-900">
                   {leads.filter(lead => lead.status === 'not_interested').length}
                 </p>
               </div>
             </div>
           </div>
         </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedLeads.map((lead) => {
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
                        onClick={() => toggleRowExpansion(lead.id)}
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
                                <div className="text-sm text-gray-500">
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
                            {lead.phone}
                          </div>
                          {lead.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{lead.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Source */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <SourceIcon className={`h-4 w-4 ${source?.color}`} />
                          <span className="text-sm text-gray-900">{source?.name}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-3 w-3 text-gray-400" />
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status?.color}`}>
                            {status?.name}
                          </span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${priority?.color}`}>
                          {priority?.name}
                        </span>
                      </td>

                      {/* Attempts */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-gray-400" />
                          {lead.attempts}
                        </div>
                      </td>

                      {/* Last Contact */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          {new Date(lead.lastContact).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                  <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditLead(lead);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Lead"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLead(lead.id);
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

        {/* Pagination */}
        {totalItems > 0 && (
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
                            <Building className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter || dateFilter 
                ? "Try adjusting your filters or search terms."
                : "Get started by adding your first lead."
              }
            </p>
            {!searchTerm && !statusFilter && !dateFilter && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Your First Lead
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddLead}
      />

      {editingLead && (
        <EditLeadModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingLead(null);
          }}
          lead={editingLead}
          onUpdate={handleUpdateLead}
        />
      )}
    </div>
  );
} 

