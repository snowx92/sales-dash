"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ResponsiveWrapper } from "@/components/layout/ResponsiveWrapper";
import { Pagination } from "@/components/tables/Pagination";
import { useRetention } from "@/lib/hooks/useRetention";
import { EndedSubscriptionItem, Priority } from "@/lib/api/retention/types";
import { toast } from "sonner";
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
  XCircle,
  Search,
  Filter,
  RefreshCw,
  MessageCircle
} from "lucide-react";

// TypeScript interfaces for the edit modal
interface EditMerchantData {
  priority: Priority;
  feedback: string;
}

// Priority options - mapping API types to UI display
const priorities = [
  { id: 'HIGH' as Priority, name: 'High', color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'MEDIUM' as Priority, name: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'LOW' as Priority, name: 'Low', color: 'bg-green-100 text-green-700 border-green-200' }
];

// Helper function to format expired date
const formatExpiredDate = (expiredAt: string | null | { _seconds: number; _nanoseconds: number }): string => {
  if (!expiredAt) return 'N/A';
  
  // Handle Firebase timestamp format
  if (typeof expiredAt === 'object' && expiredAt._seconds) {
    const date = new Date(expiredAt._seconds * 1000);
    return date.toLocaleDateString();
  }
  
  // Handle string format
  if (typeof expiredAt === 'string') {
    return new Date(expiredAt).toLocaleDateString();
  }
  
  return 'N/A';
};

// Edit Merchant Modal Component
const EditMerchantModal = ({ isOpen, onClose, merchant, onUpdate }: {
  isOpen: boolean;
  onClose: () => void;
  merchant: EndedSubscriptionItem;
  onUpdate: (id: string, updates: { priority: Priority; feedback: string }) => void;
}) => {
  const [formData, setFormData] = useState<EditMerchantData>({
    priority: merchant.priority,
    feedback: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.feedback.trim()) {
      try {
        setIsSubmitting(true);
        await onUpdate(merchant.id, {
          priority: formData.priority,
          feedback: formData.feedback
        });
        toast.success('Feedback submitted successfully');
        setFormData({ priority: merchant.priority, feedback: '' });
        onClose();
      } catch {
        toast.error('Failed to submit feedback');
      } finally {
        setIsSubmitting(false);
      }
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
              <p className="text-sm text-gray-600">ID: {merchant.id}</p>
              <p className="text-sm text-gray-600">Merchant ID: {merchant.merchantId}</p>
              <p className="text-sm text-gray-600">Email: {merchant.email}</p>
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
                    onClick={() => setFormData(prev => ({ ...prev, priority: priority.id }))}
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
                Add Feedback <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.feedback}
                onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="Add notes about this merchant..."
              />
              {!formData.feedback.trim() && (
                <p className="text-xs text-gray-500 mt-1">Feedback is required to update the merchant record.</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.feedback.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Update'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function RetentionPage() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<EndedSubscriptionItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority | undefined>(undefined);

  // Use the retention hook for API integration
  const {
    items: merchants,
    isLoading,
    error,
    // isSubmittingFeedback, // Available if needed for loading states
    currentPage,
    totalPages,
    totalItems,
    // hasNextPage, // Available for custom pagination
    // hasPreviousPage, // Available for custom pagination
    // priority, // Current filter value, available if needed
    // search, // Current search term, available if needed
    
    // Actions
    submitFeedback,
    refreshData,
    
    // Navigation
    goToPage,
    // nextPage, // Available for next/previous buttons
    // previousPage, // Available for next/previous buttons
    
    // Filtering
    filterByPriority,
    searchRetention,
    clearFilters
  } = useRetention({
    initialLimit: 10,
    autoFetch: true
  });

  const handleEditMerchant = (merchant: EndedSubscriptionItem) => {
    console.log('Editing merchant:', merchant);
    console.log('ID:', merchant.id);
    console.log('Merchant ID:', merchant.merchantId);
    setEditingMerchant(merchant);
    setIsEditModalOpen(true);
  };

  const handleUpdateMerchant = async (id: string, updates: { priority: Priority; feedback: string }) => {
    try {
      console.log('Submitting feedback for ID:', id);
      console.log('Updates:', updates);
      console.log('Feedback data will be:', {
        id: id,
        feedback: updates.feedback,
        priority: updates.priority
      });
      
      // Validate before sending
      if (!id) {
        toast.error('ID is missing. Cannot submit feedback.');
        return;
      }
      if (!updates.feedback?.trim()) {
        toast.error('Feedback text is required.');
        return;
      }
      if (!updates.priority) {
        toast.error('Priority is required.');
        return;
      }
      
      await submitFeedback({
        id: id,
        feedback: updates.feedback,
        priority: updates.priority
      });
      // Data will be refreshed automatically by the hook
    } catch (error) {
      console.error('Failed to update merchant:', error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    searchRetention(value);
  };

  const handlePriorityFilter = (priority: Priority | undefined) => {
    setSelectedPriority(priority);
    filterByPriority(priority);
  };

  // Calculate stats from API data
  const stats = {
    totalExpired: totalItems,
    highPriority: merchants.filter(m => m.priority === 'HIGH').length,
    revenueAtRisk: merchants.reduce((sum, m) => sum + m.impact, 0),
    totalAttempts: merchants.reduce((sum, m) => sum + m.attemps, 0)
  };

  if (error) {
    return (
      <ResponsiveWrapper padding="sm">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
            Retry
          </button>
        </div>
      </ResponsiveWrapper>
    );
  }

  return (
    <ResponsiveWrapper padding="sm">
      <div className="space-y-6 pb-8">


        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, or store..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedPriority || ''}
                onChange={(e) => handlePriorityFilter(e.target.value as Priority || undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="" className="text-gray-900">All Priorities</option>
                <option value="HIGH" className="text-gray-900">High Priority</option>
                <option value="MEDIUM" className="text-gray-900">Medium Priority</option>
                <option value="LOW" className="text-gray-900">Low Priority</option>
              </select>
              <button
                onClick={clearFilters}
                className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
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
                <p className="text-2xl font-bold text-gray-900">{stats.totalExpired}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.highPriority}</p>
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
                  {stats.revenueAtRisk.toLocaleString()} EGP
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
                <p className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expired Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  // Loading skeleton
                  [...Array(5)].map((_, index) => (
                    <tr key={index}>
                      <td colSpan={7} className="px-6 py-4">
                        <div className="animate-pulse flex space-x-4">
                          <div className="rounded-full bg-gray-200 h-8 w-8"></div>
                          <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : merchants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No expired plans</h3>
                      <p className="text-gray-600">Great! All merchants have active subscriptions.</p>
                    </td>
                  </tr>
                ) : (
                  merchants.map((merchant) => {
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
                          {/* Store Name & Link */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {merchant.logo ? (
                                <Image 
                                  src={merchant.logo} 
                                  alt={merchant.storeName}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 rounded-full object-cover"
                                  onError={(e) => {
                                    // Fallback to initial if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm ${merchant.logo ? 'hidden' : ''}`}>
                                {merchant.storeName.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{merchant.storeName}</div>
                                <div className="text-sm text-gray-500">
                                  {merchant.link ? (
                                    <a 
                                      href={merchant.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-blue-600 hover:underline flex items-center gap-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      View Store
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  ) : (
                                    <span className="text-gray-400">No link available</span>
                                  )}
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

                          {/* Customer Info */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{merchant.name}</div>
                              <div className="text-sm text-gray-500">{merchant.email}</div>
                              <div className="text-sm text-gray-500">{merchant.phone}</div>
                            </div>
                          </td>

                          {/* Impact Score */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-gray-900">
                                {merchant.impact.toLocaleString()} EGP
                              </span>
                            </div>
                          </td>

                          {/* Expired Date */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-red-400" />
                              <span className="text-sm text-gray-900">
                                {formatExpiredDate(merchant.expiredAt)}
                              </span>
                            </div>
                          </td>

                          {/* Attempts */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-900">{merchant.attemps}</span>
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
                                  window.open(`tel:${merchant.phone}`, '_self');
                                }}
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Call"
                              >
                                <Phone className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`https://wa.me/${merchant.phone.replace(/[^0-9]/g, '')}`, '_blank');
                                }}
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="WhatsApp"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`mailto:${merchant.email}`, '_self');
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
                                {merchant.feedbacks.length > 0 ? (
                                  <div className="space-y-2">
                                    {merchant.feedbacks.map((feedback, index) => (
                                      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                                        <p className="text-sm text-gray-700">{feedback}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">No feedback recorded yet.</p>
                                )}
                                <div className="mt-3 text-xs text-gray-500">
                                  <p>ID: {merchant.id}</p>
                                  <p>Merchant ID: {merchant.merchantId}</p>
                                  <p>Renew Count: {merchant.renewCounts}</p>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalItems > 0 && totalPages > 1 && (
          <Pagination
            totalItems={totalItems}
            itemsPerPage={10} // Using the hook's default limit
            currentPage={currentPage}
            onPageChange={goToPage}
          />
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