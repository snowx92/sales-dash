"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ResponsiveWrapper } from "@/components/layout/ResponsiveWrapper";
import { Pagination } from "@/components/tables/Pagination";
import { useRetention } from "@/lib/hooks/useRetention";
import { useEndingPeriod } from "@/lib/hooks/useEndingPeriod";
import { EndedSubscriptionItem, Priority, Period } from "@/lib/api/retention/types";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Phone,
  Mail,
  Edit,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Calendar,
  Target,
  Building,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  MessageCircle,
  Download,
  Bell,
  TrendingDown,
  Users,
  Ban,
  Clock,
  CalendarDays,
  CalendarRange
} from "lucide-react";
import { retentionService } from "@/lib/api/retention/retentionService";

import { formatPhoneForDisplay } from "@/lib/utils/phone";

import AddReminderModal from "@/components/modals/AddReminderModal";
import { reminderStorage } from "@/lib/utils/reminderStorage";
import type { MyReminderFormData } from "@/lib/types/reminder";
import { RetentionCard } from "@/components/retention/RetentionCard";
// Export modal with date range & page selection
const RetentionExportModal = ({
  open,
  onClose,
  currentItems,
  totalPages,
  pageLimit,
  currentKeyword,
  currentPriority
}: {
  open: boolean;
  onClose: () => void;
  currentItems: EndedSubscriptionItem[];
  totalPages: number;
  pageLimit: number;
  currentKeyword?: string;
  currentPriority?: 'HIGH' | 'MEDIUM' | 'LOW' | 'JUNK';
}) => {
  const [exporting, setExporting] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pageMode, setPageMode] = useState<'current' | 'firstN' | 'all'>('current');
  const [firstN, setFirstN] = useState(3);
  const [progress, setProgress] = useState<{page:number; pages:number; rows:number}>({page:0,pages:0,rows:0});

  const withinRange = (expiredAt: EndedSubscriptionItem['expiredAt']) => {
    if (!fromDate && !toDate) return true;
    let iso = '';
    if (typeof expiredAt === 'string') iso = expiredAt.split('T')[0];
    else if (expiredAt && typeof expiredAt === 'object' && '_seconds' in expiredAt) {
      iso = new Date(expiredAt._seconds * 1000).toISOString().split('T')[0];
    }
    if (!iso) return false;
    if (fromDate && iso < fromDate) return false;
    if (toDate && iso > toDate) return false;
    return true;
  };

  const collectPages = async (): Promise<EndedSubscriptionItem[]> => {
    if (pageMode === 'current') return currentItems;
    const pagesToGet = pageMode === 'all' ? totalPages : Math.min(firstN, totalPages);
    const acc: EndedSubscriptionItem[] = [];
    for (let p = 1; p <= pagesToGet; p++) {
      try {
        const data = await retentionService.getEndedSubscriptions({
          pageNo: p,
          limit: pageLimit,
          ...(currentKeyword && { keyword: currentKeyword }),
          ...(currentPriority && { priority: currentPriority })
        });
        if (data?.items) acc.push(...data.items);
        setProgress({page:p,pages:pagesToGet,rows:acc.length});
      } catch (e) {
        console.error('Export fetch page failed', p, e);
        break;
      }
    }
    return acc;
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      let dataset = await collectPages();
      if (!dataset.length) {
        toast.error('No data to export');
        return;
      }
      dataset = dataset.filter(m => withinRange(m.expiredAt));
      if (!dataset.length) {
        toast.error('No rows match filters');
        return;
      }
      const rows = dataset.map(m => ({
        Store: m.storeName,
        Name: m.name,
        Email: m.email,
        Phone: formatPhoneForDisplay(m.phone),
        ImpactEGP: m.impact,
        Attempts: m.attemps,
        Priority: m.priority,
        ExpiredAt: formatExpiredDate(m.expiredAt),
        RenewCounts: m.renewCounts,
        MerchantId: m.merchantId,
        ID: m.id
      }));
      const xlsx = await import('xlsx');
      const ws = xlsx.utils.json_to_sheet(rows);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Retention');
      const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
      xlsx.writeFile(wb, `retention_export_${stamp}.xlsx`);
      toast.success(`Exported ${rows.length} rows`);
      onClose();
    } catch (e) {
      console.error('Retention export failed', e);
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Export Retention</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expired From</label>
              <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expired To</label>
              <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Pages</label>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" name="pageMode" value="current" checked={pageMode==='current'} onChange={()=>setPageMode('current')} className="accent-purple-600" />
                <span className={pageMode==='current' ? 'text-purple-700 font-medium' : 'text-purple-600'}>Current Page</span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" name="pageMode" value="firstN" checked={pageMode==='firstN'} onChange={()=>setPageMode('firstN')} className="accent-purple-600" />
                <span className={pageMode==='firstN' ? 'text-purple-700 font-medium' : 'text-purple-600'}>First N Pages</span>
                {pageMode==='firstN' && (
                  <input type="number" min={1} max={totalPages} value={firstN} onChange={e=>setFirstN(Number(e.target.value))} className="w-20 px-2 py-1 border rounded" />
                )}
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" name="pageMode" value="all" checked={pageMode==='all'} onChange={()=>setPageMode('all')} className="accent-purple-600" />
                <span className={pageMode==='all' ? 'text-purple-700 font-medium' : 'text-purple-600'}>All Pages ({totalPages})</span>
              </label>
            </div>
          </div>
          <div className="text-xs text-gray-500">Filters applied: keyword search from current view plus optional expiration date and page scope.</div>
          {exporting && (
            <div className="w-full bg-gray-100 rounded h-2 overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all"
                style={{width: progress.pages ? `${(progress.page/ progress.pages)*100}%` : '0%'}}
              />
              <div className="mt-2 text-[10px] text-gray-500 flex justify-between">
                <span>Page {progress.page} / {progress.pages}</span>
                <span>{progress.rows} rows</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-5 border-t flex gap-3">
          <button onClick={onClose} disabled={exporting} className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
          <button onClick={handleExport} disabled={exporting} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
            <Download className={`h-4 w-4 ${exporting ? 'animate-pulse' : ''}`} />
            {exporting ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
      </div>
    </div>
  );
};

// TypeScript interfaces for the edit modal
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp';

interface EditMerchantData {
  priority: Priority;
  feedback: string;
}

// Priority options - mapping API types to UI display
const priorities = [
  { id: 'HIGH' as Priority, name: 'High', color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'MEDIUM' as Priority, name: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'LOW' as Priority, name: 'Low', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'JUNK' as Priority, name: 'Junk', color: 'bg-orange-100 text-orange-700 border-orange-200' }
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
    priority: merchant.priority || 'MEDIUM',
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
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = buildWhatsAppUrl(merchant.phone, 'Hello');
                    window.open(url, '_blank');
                  }}
                  type="button"
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
                <button
                  onClick={onClose}
                  type="button"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Close"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
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
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // View mode: 'expired' for already expired, 'expiring' for expiring soon
  const [viewMode, setViewMode] = useState<'expired' | 'expiring'>('expiring');

  // Tabs for expired view
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'medium' | 'low' | 'junk'>('all');
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    high: 0,
    medium: 0,
    low: 0,
    junk: 0
  });

  // Period tabs for expiring view
  const [activePeriod, setActivePeriod] = useState<Period>('TODAY');
  const [periodCounts, setPeriodCounts] = useState({
    TODAY: 0,
    NEXT_THREE_DAYS: 0,
    THIS_WEEK: 0,
    THIS_MONTH: 0
  });

  // Reminder states
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderMerchantId, setReminderMerchantId] = useState<string | null>(null);
  const [reminderMerchantName, setReminderMerchantName] = useState<string>('');
  const [reminderMerchantEmail, setReminderMerchantEmail] = useState<string>('');
  const [reminderMerchantPhone, setReminderMerchantPhone] = useState<string>('');

  // Use the retention hook for API integration (expired subscriptions)
  const {
    items: merchants,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalItems,
    keyword,
    priority,
    submitFeedback,
    refreshData,
    goToPage,
    searchRetention,
    filterByPriority,
    clearFilters
  } = useRetention({
    initialLimit: 50,
    autoFetch: viewMode === 'expired'
  });

  // Use the ending period hook (expiring subscriptions)
  const {
    items: expiringMerchants,
    isLoading: isLoadingExpiring,
    error: errorExpiring,
    currentPage: currentPageExpiring,
    totalPages: totalPagesExpiring,
    totalItems: totalItemsExpiring,
    keyword: keywordExpiring,
    priority: priorityExpiring,
    submitFeedback: submitFeedbackExpiring,
    refreshData: refreshDataExpiring,
    goToPage: goToPageExpiring,
    searchRetention: searchRetentionExpiring,
    clearFilters: clearFiltersExpiring
  } = useEndingPeriod({
    initialLimit: 100,
    autoFetch: viewMode === 'expiring',
    period: activePeriod
  });

  // Get current data based on view mode
  const currentMerchants = viewMode === 'expired' ? merchants : expiringMerchants;
  const currentIsLoading = viewMode === 'expired' ? isLoading : isLoadingExpiring;
  const currentError = viewMode === 'expired' ? error : errorExpiring;
  const currentCurrentPage = viewMode === 'expired' ? currentPage : currentPageExpiring;
  const currentTotalPages = viewMode === 'expired' ? totalPages : totalPagesExpiring;
  const currentTotalItems = viewMode === 'expired' ? totalItems : totalItemsExpiring;
  const currentKeyword = viewMode === 'expired' ? keyword : keywordExpiring;
  const currentPriority = viewMode === 'expired' ? priority : priorityExpiring;
  const currentSubmitFeedback = viewMode === 'expired' ? submitFeedback : submitFeedbackExpiring;
  const currentRefreshData = viewMode === 'expired' ? refreshData : refreshDataExpiring;
  const currentGoToPage = viewMode === 'expired' ? goToPage : goToPageExpiring;
  const currentSearchRetention = viewMode === 'expired' ? searchRetention : searchRetentionExpiring;
  const currentClearFilters = viewMode === 'expired' ? clearFilters : clearFiltersExpiring;

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

      await currentSubmitFeedback({
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
    currentSearchRetention(value);
  };

  // When tab changes in expired view, fetch data with the priority filter
  useEffect(() => {
    if (viewMode === 'expired') {
      if (activeTab === 'all') {
        filterByPriority(undefined);
      } else {
        filterByPriority(activeTab.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW' | 'JUNK');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, viewMode]);

  // When period changes in expiring view, fetch data
  useEffect(() => {
    if (viewMode === 'expiring') {
      refreshDataExpiring();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePeriod, viewMode]);

  // Use current merchants based on view mode
  const filteredMerchants = currentMerchants;

  // Fetch counts for each priority from a single API call (for expired view)
  useEffect(() => {
    async function fetchTabCounts() {
      try {
        console.log('🔄 Fetching tab counts from single API call...');

        // Single API call that returns all counts
        const response = await retentionService.getEndedSubscriptions({ pageNo: 1, limit: 50 });

        if (response) {
          const counts = {
            all: response.expiredCount || response.totalItems || 0,
            high: response.highPriorityCount || 0,
            medium: response.mediumPriorityCount || 0,
            low: response.lowPriorityCount || 0,
            junk: response.junkPriorityCount || 0
          };

          console.log('📊 Tab Counts from API:', counts);
          setTabCounts(counts);
        }
      } catch (error) {
        console.error('❌ Error fetching tab counts:', error);
        setTabCounts({
          all: merchants.length,
          high: merchants.filter(m => m.priority === 'HIGH').length,
          medium: merchants.filter(m => m.priority === 'MEDIUM').length,
          low: merchants.filter(m => m.priority === 'LOW').length,
          junk: merchants.filter(m => m.priority === 'JUNK').length,
        });
      }
    }
    fetchTabCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch counts for each period by calling the API 4 times (for expiring view)
  useEffect(() => {
    async function fetchPeriodCounts() {
      try {
        console.log('🔄 Fetching period counts - calling API 4 times...');

        const [todayRes, next3DaysRes, thisWeekRes, thisMonthRes] = await Promise.all([
          retentionService.getEndingInPeriod({ pageNo: 1, limit: 1, period: 'TODAY' }),
          retentionService.getEndingInPeriod({ pageNo: 1, limit: 1, period: 'NEXT_THREE_DAYS' }),
          retentionService.getEndingInPeriod({ pageNo: 1, limit: 1, period: 'THIS_WEEK' }),
          retentionService.getEndingInPeriod({ pageNo: 1, limit: 1, period: 'THIS_MONTH' })
        ]);

        const counts = {
          TODAY: todayRes?.totalItems || 0,
          NEXT_THREE_DAYS: next3DaysRes?.totalItems || 0,
          THIS_WEEK: thisWeekRes?.totalItems || 0,
          THIS_MONTH: thisMonthRes?.totalItems || 0
        };

        console.log('📊 Period Counts from API:', counts);
        setPeriodCounts(counts);
      } catch (error) {
        console.error('❌ Error fetching period counts:', error);
      }
    }
    fetchPeriodCounts();
  }, []);

  const handleOpenReminderModal = (id: string, name: string, email: string, phone: string) => {
    setReminderMerchantId(id);
    setReminderMerchantName(name);
    setReminderMerchantEmail(email);
    setReminderMerchantPhone(phone);
    setIsReminderModalOpen(true);
  };

  const handleCloseReminderModal = () => {
    setIsReminderModalOpen(false);
    setReminderMerchantId(null);
    setReminderMerchantName('');
    setReminderMerchantEmail('');
    setReminderMerchantPhone('');
  };

  const handleSaveReminder = (data: MyReminderFormData) => {
    if (reminderMerchantId) {
      reminderStorage.add({
        type: 'retention',
        entityId: reminderMerchantId,
        entityName: reminderMerchantName,
        entityEmail: reminderMerchantEmail,
        entityPhone: reminderMerchantPhone,
        date: data.date,
        note: data.note,
        completed: false,
      });
      console.log('Reminder added for merchant:', reminderMerchantName);
      toast.success('Reminder added successfully');
    }
  };

  // Render table component
  const renderTable = () => (
    <>
      {/* Mobile Cards View - shown only on small screens */}
      <div className="lg:hidden">
        {currentIsLoading ? (
          // Loading skeleton
          [...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 mb-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))
        ) : filteredMerchants.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {viewMode === 'expiring' ? 'expiring' : 'expired'} plans
            </h3>
            <p className="text-gray-600">
              {viewMode === 'expiring' ? 'No subscriptions expiring in this period.' : 'Great! All merchants have active subscriptions.'}
            </p>
          </div>
        ) : (
          filteredMerchants.map((merchant) => (
            <RetentionCard
              key={merchant.id}
              merchant={merchant}
              isExpanded={expandedRows.has(merchant.id)}
              onToggleExpand={() => toggleRowExpansion(merchant.id)}
              onEdit={() => handleEditMerchant(merchant)}
              onAddReminder={() => handleOpenReminderModal(
                merchant.id,
                (merchant.storeName || merchant.name),
                merchant.email,
                merchant.phone
              )}
            />
          ))
        )}
      </div>

      {/* Desktop Table View - shown only on large screens */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Store</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Impact</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Expired</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Attempts</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Priority</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentIsLoading ? (
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
              ) : filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No {viewMode === 'expiring' ? 'expiring' : 'expired'} plans
                    </h3>
                    <p className="text-gray-600">
                      {viewMode === 'expiring' ? 'No subscriptions expiring in this period.' : 'Great! All merchants have active subscriptions.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMerchants.map((merchant) => {
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
                        <td className="px-3 py-2 whitespace-nowrap max-w-[220px]">
                          <div className="flex items-center">
                            {merchant.logo ? (
                              <Image
                                src={merchant.logo}
                                alt={merchant.storeName}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm ${merchant.logo ? 'hidden' : ''}`}>
                              {merchant.storeName.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3 overflow-hidden">
                              <div className="text-sm font-medium text-gray-900 truncate">{merchant.storeName}</div>
                              <div className="text-sm text-gray-500 truncate">
                                {merchant.link ? (
                                  <a
                                    href={merchant.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
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
                        <td className="px-3 py-2 whitespace-nowrap max-w-[200px]">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{merchant.name}</div>
                            <div className="text-sm text-gray-500 truncate">{merchant.email}</div>
                            <div className="text-sm font-medium text-green-600">{formatPhoneForDisplay(merchant.phone)}</div>
                          </div>
                        </td>

                        {/* Impact Score */}
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-900">
                              {merchant.impact.toLocaleString()} EGP
                            </span>
                          </div>
                        </td>

                        {/* Expired Date */}
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-red-400" />
                            <span className="text-sm text-gray-900">
                              {formatExpiredDate(merchant.expiredAt)}
                            </span>
                          </div>
                        </td>

                        {/* Attempts */}
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-900">{merchant.attemps}</span>
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${priority?.color}`}>
                            {priority?.name}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`tel:${merchant.phone}`, '_self');
                              }}
                              className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Call"
                            >
                              <Phone className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const url = buildWhatsAppUrl(merchant.phone, 'Hello');
                                window.open(url, '_blank');
                              }}
                              className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`mailto:${merchant.email}`, '_self');
                              }}
                              className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Email"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenReminderModal(
                                  merchant.id,
                                  (merchant.storeName || merchant.name),
                                  merchant.email,
                                  merchant.phone
                                );
                              }}
                              className="p-1 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Add Reminder"
                            >
                              <Bell className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMerchant(merchant);
                              }}
                              className="p-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
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
      {currentTotalItems > 0 && currentTotalPages > 1 && (
        <Pagination
          totalItems={currentTotalItems}
          itemsPerPage={viewMode === 'expired' ? 50 : 100}
          currentPage={currentCurrentPage}
          onPageChange={currentGoToPage}
        />
      )}
    </>
  );

  if (currentError) {
    return (
      <ResponsiveWrapper padding="sm">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{currentError}</p>
          <button
            onClick={currentRefreshData}
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
    <>
      <ResponsiveWrapper padding="sm">
        <div className="space-y-6 pb-8">
          {/* View Mode Toggle */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setViewMode('expiring')}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  viewMode === 'expiring'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Clock className="h-5 w-5" />
                Expiring Soon
              </button>
              <button
                onClick={() => setViewMode('expired')}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  viewMode === 'expired'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <XCircle className="h-5 w-5" />
                Already Expired
              </button>
            </div>
          </div>

          {/* Expiring Soon View */}
          {viewMode === 'expiring' && (
            <Tabs value={activePeriod} onValueChange={(value) => setActivePeriod(value as Period)} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-orange-50 to-red-50 p-1 rounded-xl border border-orange-200 gap-1">
                <TabsTrigger
                  value="TODAY"
                  className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-3 text-xs font-medium transition-all
                    data-[state=active]:bg-white data-[state=active]:text-orange-900 data-[state=active]:shadow-md
                    data-[state=inactive]:text-orange-700 data-[state=inactive]:hover:text-orange-900"
                >
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Today</span>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-900 rounded-full text-xs font-bold">
                    {periodCounts.TODAY}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="NEXT_THREE_DAYS"
                  className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-3 text-xs font-medium transition-all
                    data-[state=active]:bg-white data-[state=active]:text-orange-900 data-[state=active]:shadow-md
                    data-[state=inactive]:text-orange-700 data-[state=inactive]:hover:text-orange-900"
                >
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">Next 3 Days</span>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-900 rounded-full text-xs font-bold">
                    {periodCounts.NEXT_THREE_DAYS}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="THIS_WEEK"
                  className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-3 text-xs font-medium transition-all
                    data-[state=active]:bg-white data-[state=active]:text-orange-900 data-[state=active]:shadow-md
                    data-[state=inactive]:text-orange-700 data-[state=inactive]:hover:text-orange-900"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">This Week</span>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-900 rounded-full text-xs font-bold">
                    {periodCounts.THIS_WEEK}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="THIS_MONTH"
                  className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-3 text-xs font-medium transition-all
                    data-[state=active]:bg-white data-[state=active]:text-orange-900 data-[state=active]:shadow-md
                    data-[state=inactive]:text-orange-700 data-[state=inactive]:hover:text-orange-900"
                >
                  <CalendarRange className="h-4 w-4" />
                  <span className="hidden sm:inline">This Month</span>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-900 rounded-full text-xs font-bold">
                    {periodCounts.THIS_MONTH}
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activePeriod} className="space-y-6 mt-6">
                {/* Filters + Export */}
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
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <button
                        onClick={currentClearFilters}
                        className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                      >
                        <Filter className="h-4 w-4" />
                        Clear
                      </button>
                      <button
                        onClick={() => setExportModalOpen(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" /> Export
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table for expiring subscriptions */}
                {renderTable()}
              </TabsContent>
            </Tabs>
          )}

          {/* Already Expired View */}
          {viewMode === 'expired' && (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-xl border border-gray-200 gap-1">
              <TabsTrigger
                value="all"
                className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all
                  data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
                  data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
              >
                <Users className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">All</span>
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  {tabCounts.all}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="high"
                className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all
                  data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
                  data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                <span className="hidden sm:inline">High</span>
                <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  {tabCounts.high}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="medium"
                className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all
                  data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
                  data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
              >
                <Target className="h-3.5 w-3.5 text-yellow-600" />
                <span className="hidden sm:inline">Medium</span>
                <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  {tabCounts.medium}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="low"
                className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all
                  data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
                  data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
              >
                <TrendingDown className="h-3.5 w-3.5 text-green-600" />
                <span className="hidden sm:inline">Low</span>
                <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {tabCounts.low}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="junk"
                className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all
                  data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
                  data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
              >
                <Ban className="h-3.5 w-3.5 text-orange-600" />
                <span className="hidden sm:inline">Junk</span>
                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                  {tabCounts.junk}
                </span>
              </TabsTrigger>
            </TabsList>

              <TabsContent value={activeTab} className="space-y-6 mt-6">
                {/* Filters + Export */}
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
                    <div className="flex gap-2 items-start">
                      <button
                        onClick={currentClearFilters}
                        className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                      >
                        <Filter className="h-4 w-4" />
                        Clear
                      </button>
                      <button
                        onClick={() => setExportModalOpen(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" /> Export
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table for expired subscriptions */}
                {renderTable()}
              </TabsContent>
            </Tabs>
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
        <RetentionExportModal
          open={exportModalOpen}
          onClose={()=>setExportModalOpen(false)}
          currentItems={currentMerchants}
          totalPages={currentTotalPages}
          pageLimit={viewMode === 'expired' ? 50 : 100}
          currentKeyword={currentKeyword}
          currentPriority={currentPriority}
        />

        {/* Reminder Modal */}
        <AddReminderModal
          isOpen={isReminderModalOpen}
          onClose={handleCloseReminderModal}
          onSave={handleSaveReminder}
          entityName={reminderMerchantName}
        />
      </ResponsiveWrapper>
    </>
  );
}