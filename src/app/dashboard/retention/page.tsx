"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveWrapper } from "@/components/layout/ResponsiveWrapper";
import { Pagination } from "@/components/tables/Pagination";
import { 
  Phone, 
  Mail, 
  Edit, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  Target,
  DollarSign,
  Building,
  AlertTriangle,
  XCircle
} from "lucide-react";

// TypeScript interfaces
interface ExpiredMerchant {
  id: number;
  storeName: string;
  website: string;
  previousPlan: string;
  revenueImpact: number;
  expiredDate: string;
  attempts: number;
  priority: 'high' | 'mid' | 'low';
  feedback: Array<{
    id: number;
    message: string;
    date: string;
  }>;
}

interface EditMerchantData {
  priority: 'high' | 'mid' | 'low';
  feedback: string;
}

// Priority options
const priorities = [
  { id: 'high', name: 'High', color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'mid', name: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'low', name: 'Low', color: 'bg-green-100 text-green-700 border-green-200' }
];

// Mock expired merchants data
const mockExpiredMerchants: ExpiredMerchant[] = [
  {
    id: 1,
    storeName: "Tech Gadgets Plus",
    website: "https://techgadgetsplus.com",
    previousPlan: "Pro Plan",
    revenueImpact: 2500,
    expiredDate: "2024-01-10",
    attempts: 3,
    priority: "high",
    feedback: [
      { id: 1, message: "Called customer, no response", date: "2024-01-11" },
      { id: 2, message: "Sent email with renewal offer", date: "2024-01-13" },
      { id: 3, message: "Customer interested but needs budget approval", date: "2024-01-15" }
    ]
  },
  {
    id: 2,
    storeName: "Fashion Forward",
    website: "https://fashionforward.store",
    previousPlan: "Business Plan",
    revenueImpact: 1800,
    expiredDate: "2024-01-08",
    attempts: 1,
    priority: "mid",
    feedback: [
      { id: 1, message: "Initial contact made, scheduling follow-up", date: "2024-01-09" }
    ]
  },
  {
    id: 3,
    storeName: "Home Decor Hub",
    website: "https://homedecorhub.com",
    previousPlan: "Starter Plan",
    revenueImpact: 899,
    expiredDate: "2024-01-05",
    attempts: 5,
    priority: "low",
    feedback: [
      { id: 1, message: "Customer not interested in renewal", date: "2024-01-06" },
      { id: 2, message: "Offered discount, still declined", date: "2024-01-08" },
      { id: 3, message: "Final attempt made", date: "2024-01-12" }
    ]
  }
];

// Edit Merchant Modal Component
const EditMerchantModal = ({ isOpen, onClose, merchant, onUpdate }: {
  isOpen: boolean;
  onClose: () => void;
  merchant: ExpiredMerchant;
  onUpdate: (id: number, updates: Partial<ExpiredMerchant>) => void;
}) => {
  const [formData, setFormData] = useState<EditMerchantData>({
    priority: merchant.priority,
    feedback: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.feedback.trim()) {
      const newFeedback = {
        id: Date.now(),
        message: formData.feedback,
        date: new Date().toISOString().split('T')[0]
      };
      
      onUpdate(merchant.id, {
        priority: formData.priority,
        feedback: [...merchant.feedback, newFeedback],
        attempts: merchant.attempts + 1
      });
    } else {
      onUpdate(merchant.id, {
        priority: formData.priority
      });
    }
    
    setFormData({ priority: merchant.priority, feedback: '' });
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Merchant</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">{merchant.storeName}</h3>
              <p className="text-sm text-gray-600">Previous Plan: {merchant.previousPlan}</p>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Priority
              </label>
              <div className="flex gap-2">
                {priorities.map((priority) => (
                  <button
                    key={priority.id}
                    type="button"
                                         onClick={() => setFormData(prev => ({ ...prev, priority: priority.id as 'high' | 'mid' | 'low' }))}
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

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Feedback
              </label>
              <textarea
                value={formData.feedback}
                onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="Add notes about this merchant..."
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
                Update
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function RetentionPage() {
  const [merchants, setMerchants] = useState<ExpiredMerchant[]>(mockExpiredMerchants);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<ExpiredMerchant | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleEditMerchant = (merchant: ExpiredMerchant) => {
    setEditingMerchant(merchant);
    setIsEditModalOpen(true);
  };

  const handleUpdateMerchant = (id: number, updates: Partial<ExpiredMerchant>) => {
    setMerchants(prev => prev.map(merchant => 
      merchant.id === id ? { ...merchant, ...updates } : merchant
    ));
  };

  const toggleRowExpansion = (merchantId: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(merchantId)) {
        newSet.delete(merchantId);
      } else {
        newSet.add(merchantId);
      }
      return newSet;
    });
  };

  // Calculate pagination
  const totalItems = merchants.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMerchants = merchants.slice(startIndex, endIndex);

  return (
    <ResponsiveWrapper padding="sm">
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Retention</h1>
          <p className="text-gray-600">Monitor and manage merchants with expired plans to improve retention.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Expired Plans</p>
                <p className="text-2xl font-bold text-gray-900">{merchants.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {merchants.filter(m => m.priority === 'high').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenue at Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${merchants.reduce((sum, m) => sum + m.revenueImpact, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {merchants.reduce((sum, m) => sum + m.attempts, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Expired Merchants Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue Impact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expired Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedMerchants.map((merchant) => {
                  const priority = priorities.find(p => p.id === merchant.priority);
                  const isExpanded = expandedRows.has(merchant.id);
                  
                  return (
                    <React.Fragment key={merchant.id}>
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => toggleRowExpansion(merchant.id)}
                      >
                        {/* Store Name & Website */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {merchant.storeName.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{merchant.storeName}</div>
                              <div className="text-sm text-gray-500">
                                <a 
                                  href={merchant.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:underline flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {merchant.website.replace(/^https?:\/\//, '')}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </div>
                            <div className="ml-2">
                              {isExpanded ? 
                                <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              }
                            </div>
                          </div>
                        </td>

                        {/* Previous Plan */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{merchant.previousPlan}</span>
                        </td>

                        {/* Revenue Impact */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">
                              ${merchant.revenueImpact.toLocaleString()}
                            </span>
                          </div>
                        </td>

                        {/* Expired Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-red-400" />
                            <span className="text-sm text-gray-900">
                              {new Date(merchant.expiredDate).toLocaleDateString()}
                            </span>
                          </div>
                        </td>

                        {/* Attempts */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-900">{merchant.attempts}</span>
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${priority?.color}`}>
                            {priority?.name}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`tel:${merchant.storeName}`, '_self');
                              }}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Call"
                            >
                              <Phone className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`mailto:contact@${merchant.website.replace(/^https?:\/\//, '')}`, '_self');
                              }}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Email"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMerchant(merchant);
                              }}
                              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
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
                          <td colSpan={7} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-3">
                              <h4 className="font-medium text-gray-900">Previous Feedback</h4>
                              {merchant.feedback.length > 0 ? (
                                <div className="space-y-2">
                                  {merchant.feedback.map((feedback) => (
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

        {merchants.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expired plans</h3>
            <p className="text-gray-600">Great! All merchants have active subscriptions.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingMerchant && (
        <EditMerchantModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingMerchant(null);
          }}
          merchant={editingMerchant}
          onUpdate={handleUpdateMerchant}
        />
      )}
    </ResponsiveWrapper>
  );
} 