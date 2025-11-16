"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Upload, Download } from "lucide-react";
import {
  Lead,
  UpcomingLead,
  AddLeadModal,
  EditLeadModal,
  LeadsTabs,
  BulkUploadModal,
  LeadExportModal
} from "@/components/leads";
import { SimpleFeedbackModal } from "@/components/leads/SimpleFeedbackModal";
import { leadsService } from "@/lib/api/leads/leadsService";
import { mapApiLeadToLead, mapApiLeadToUpcomingLead, getApiId } from "@/lib/api/leads/utils";
import type { LeadStatus, LeadSource, LeadPriority, ApiLead } from "@/lib/api/leads/types";
import FloatingSalesTips from "@/components/dashboard/FloatingSalesTips";
import SmartReminders from "@/components/dashboard/SmartReminders";
import ActivityTracker from "@/components/dashboard/ActivityTracker";
import WhatsAppTemplates from "@/components/dashboard/WhatsAppTemplates";
import AddReminderModal from "@/components/modals/AddReminderModal";
import { reminderStorage } from "@/lib/utils/reminderStorage";
import type { MyReminderFormData } from "@/lib/types/reminder";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [upcomingLeads, setUpcomingLeads] = useState<UpcomingLead[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // regular leads page
  const [upcomingCurrentPage, setUpcomingCurrentPage] = useState(1); // upcoming leads page
  const itemsPerPage = 10;
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackLeadId, setFeedbackLeadId] = useState<number | null>(null);
  const [feedbackLeadName, setFeedbackLeadName] = useState<string>('');
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [leadsOverview, setLeadsOverview] = useState<{
    total: number;
    totalSubscribedLeads: number;
    totalInterestedLeads: number;
    totalFollowUpLeads: number;
    totalNotInterestedLeads: number;
  } | null>(null);

  // Reminder states
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderLeadId, setReminderLeadId] = useState<number | null>(null);
  const [reminderLeadName, setReminderLeadName] = useState<string>('');
  const [reminderLeadEmail, setReminderLeadEmail] = useState<string>('');
  const [reminderLeadPhone, setReminderLeadPhone] = useState<string>('');

  // Filter state to hide subscribed/not interested leads
  const [hideCompletedLeads, setHideCompletedLeads] = useState(false);

  const loadLeadsOverview = useCallback(async () => {
    try {
      console.log("📊 Loading leads overview...");
      const overview = await leadsService.getLeadsOverview();
      if (overview) {
        setLeadsOverview(overview);
        console.log("📊 Leads overview loaded:", overview);
      }
    } catch (err) {
      console.error('Error loading leads overview:', err);
      // Don't set error state for overview failure, it's not critical
    }
  }, []);

  // Client-side pagination counts derived in component; keep placeholders for future server usage if needed

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare filter parameters
      const params: {
        page: number;
        limit: number;
        searchQuery?: string;
        status?: LeadStatus;
        from?: string;
        to?: string;
      } = {
        page: 1, // fetch first page only
        limit: 500 // large batch for client-side pagination
      };

      if (debouncedSearch) {
        params.searchQuery = debouncedSearch;
      }

      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      
  const response = await leadsService.getLeads(params);
      
  if (response?.items) {
        // Separate leads by status - NEW status goes to upcoming, others to leads
        const upcomingApiLeads = response.items.filter((lead: ApiLead) => lead.status === 'NEW');
        const regularApiLeads = response.items.filter((lead: ApiLead) => lead.status !== 'NEW');
        
        // Convert to component format
        const convertedLeads = regularApiLeads.map(mapApiLeadToLead);
        const convertedUpcomingLeads = upcomingApiLeads.map(mapApiLeadToUpcomingLead);
        
        setLeads(convertedLeads);
        setUpcomingLeads(convertedUpcomingLeads);
    // Set counts based on fetched arrays
  // counts handled client-side in tabs
      }
    } catch (err) {
      console.error('Error loading leads:', err);
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, fromDate, toDate]);

  // Load leads on component mount and when filters change
  useEffect(() => {
    loadLeads();
    loadLeadsOverview(); // Load overview data
  }, [loadLeads, loadLeadsOverview]);

  // Reload when filters change
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    loadLeads();
  }, [debouncedSearch, fromDate, toDate, loadLeads]);

  const handleAddLead = async (newLead: Lead) => {
    try {
      setLoading(true);
      
      // Map component status to API status
      const statusMap: Record<string, Exclude<LeadStatus, "NEW"> | "NEW"> = {
        'new': 'NEW',
        'interested': 'INTERSTED',
        'subscribed': 'SUBSCRIBED', 
        'not_interested': 'NOT_INTERSTED',
        'no_answer': 'NO_ANSWER',
        'follow_up': 'FOLLOW_UP',
        'junk': 'JUNK'
      };
      
      // Map component priority to API priority
      const priorityMap: Record<string, LeadPriority> = {
        'high': 'HIGH',
        'mid': 'MEDIUM',
        'low': 'LOW'
      };
      
      // Convert component Lead format to API CreateLeadRequest format
      const createRequest = {
        name: newLead.name,
        email: newLead.email,
        phone: newLead.phone,
        websiteUrl: newLead.website || undefined,
        socialMediaUrls: newLead.socialUrls ? newLead.socialUrls.split(',').map(url => url.trim()).filter(Boolean) : undefined,
        leadSource: newLead.leadSource.toUpperCase() as LeadSource,
        priority: (priorityMap[newLead.priority] || newLead.priority.toUpperCase()) as LeadPriority,
        status: (statusMap[newLead.status] || 'FOLLOW_UP') as LeadStatus,
        feedback: newLead.feedback || undefined
      };
      
      await leadsService.createLead(createRequest);
      await loadLeads(); // Reload all leads after creating
      await loadLeadsOverview(); // Reload overview after creating
      setIsAddModalOpen(false); // Close the modal on success
    } catch (err) {
      console.error('Error creating lead:', err);
      setError('Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLead = async (id: number, updates: Lead) => {
    try {
      setLoading(true);
      setError(null);

      // Get the original API ID
      const apiId = getApiId(id);
      if (!apiId) {
        throw new Error('API ID not found for this lead');
      }

      // Determine if the feedback entered should be treated as a new feedback entry
      // We treat any non-empty feedback text that differs from the currently stored feedback
      // as an appended feedback item (so it shows in feedbackHistory) instead of overwriting.
      const existingLead = leads.find(lead => lead.id === id);
      const hasNewFeedback = !!(updates.feedback && updates.feedback.trim() && updates.feedback !== existingLead?.feedback);

      // Convert component Lead format to API UpdateLeadRequest format
      const statusMap: Record<string, LeadStatus> = {
        'new': 'NEW',
        'interested': 'INTERSTED',
        'subscribed': 'SUBSCRIBED', 
        'not_interested': 'NOT_INTERSTED',
        'no_answer': 'NO_ANSWER',
        'follow_up': 'FOLLOW_UP',
        'junk': 'JUNK'
      };
      
      const priorityMap: Record<string, LeadPriority> = {
        'high': 'HIGH',
        'mid': 'MEDIUM',
        'low': 'LOW'
      };

      // If we're going to add feedback separately, omit it from the update request
      const updateRequest = {
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        websiteUrl: updates.website || undefined,
        socialMediaUrls: updates.socialUrls ? updates.socialUrls.split(',').map(url => url.trim()).filter(Boolean) : undefined,
        leadSource: updates.leadSource.toUpperCase() as LeadSource,
        priority: (priorityMap[updates.priority] || updates.priority.toUpperCase()) as LeadPriority,
        status: (statusMap[updates.status] || updates.status.toUpperCase()) as LeadStatus,
        // Only include feedback if it's NOT a new feedback we want appended
        ...(hasNewFeedback ? {} : { feedback: updates.feedback || undefined })
      };

      await leadsService.updateLead(apiId, updateRequest);

      // If there is new feedback to append, call addFeedback endpoint so it becomes part of history
      if (hasNewFeedback) {
        try {
          await leadsService.addFeedback(apiId, updates.feedback.trim());
        } catch (fbErr) {
          console.error('Error appending feedback after update:', fbErr);
          // Non-fatal; continue
        }
      }
      
      // After update + possible feedback append, reload leads to refresh feedbackHistory & status
      await loadLeads();

      // Close modal
      setIsEditModalOpen(false);
      setEditingLead(null);
      
      // Reload overview after updating
      await loadLeadsOverview();
      
    } catch (err) {
      console.error('Error updating lead:', err);
      setError('Failed to update lead');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get the original API ID
      const apiId = getApiId(id);
      if (!apiId) {
        throw new Error('API ID not found for this lead');
      }
      
      await leadsService.deleteLead(apiId);
      
      // Update local state
      setLeads(prev => prev.filter(lead => lead.id !== id));
      
      // Reload overview after deleting
      await loadLeadsOverview();
      
    } catch (err) {
      console.error('Error deleting lead:', err);
      setError('Failed to delete lead');
    } finally {
      setLoading(false);
    }
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsEditModalOpen(true);
  };

  const handleDeleteUpcomingLead = async (id: number) => {
    if (!confirm('Are you sure you want to delete this upcoming lead?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get the original API ID
      const apiId = getApiId(id);
      if (!apiId) {
        throw new Error('API ID not found for this lead');
      }
      
      await leadsService.deleteLead(apiId);
      
      // Update local state
      setUpcomingLeads(prev => prev.filter(lead => lead.id !== id));
      
      // Reload overview after deleting
      await loadLeadsOverview();
      
    } catch (err) {
      console.error('Error deleting upcoming lead:', err);
      setError('Failed to delete upcoming lead');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeedback = async (id: number, feedback: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get the original API ID
      const apiId = getApiId(id);
      if (!apiId) {
        throw new Error('API ID not found for this lead');
      }
      
      await leadsService.addFeedback(apiId, feedback);
      
      // Reload leads to get updated feedback
      await loadLeads();
      
      // Reload overview after adding feedback
      await loadLeadsOverview();
      
    } catch (err) {
      console.error('Error adding feedback:', err);
      setError('Failed to add feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFeedbackModal = (id: number, leadName: string) => {
    console.log('Opening feedback modal for:', leadName, 'ID:', id);
    setFeedbackLeadId(id);
    setFeedbackLeadName(leadName);
    setIsFeedbackModalOpen(true);
  };

  const handleCloseFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setFeedbackLeadId(null);
    setFeedbackLeadName('');
  };

  const handleOpenReminderModal = (id: number, name: string, email: string, phone: string) => {
    setReminderLeadId(id);
    setReminderLeadName(name);
    setReminderLeadEmail(email);
    setReminderLeadPhone(phone);
    setIsReminderModalOpen(true);
  };

  const handleCloseReminderModal = () => {
    setIsReminderModalOpen(false);
    setReminderLeadId(null);
    setReminderLeadName('');
    setReminderLeadEmail('');
    setReminderLeadPhone('');
  };

  const handleSaveReminder = (data: MyReminderFormData) => {
    if (reminderLeadId) {
      reminderStorage.add({
        type: 'lead',
        entityId: reminderLeadId,
        entityName: reminderLeadName,
        entityEmail: reminderLeadEmail,
        entityPhone: reminderLeadPhone,
        date: data.date,
        note: data.note,
        completed: false,
      });
      console.log('Reminder added for lead:', reminderLeadName);
    }
  };

  const handleMarkAsJunk = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      // Get the original API ID
      const apiId = getApiId(id);
      if (!apiId) {
        throw new Error('API ID not found for this lead');
      }

      // Update lead status to junk
      await leadsService.updateLead(apiId, { status: 'JUNK' });

      // Reload leads to get updated status
      await loadLeads();
      await loadLeadsOverview();

    } catch (err) {
      console.error('Error marking lead as junk:', err);
      setError('Failed to mark lead as junk');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUploadSuccess = async () => {
    // Reload leads after successful bulk upload
    await loadLeads();
    // Reload overview after bulk upload
    await loadLeadsOverview();
  };

  const handleSubmitFeedback = async (feedback: string) => {
    if (feedbackLeadId) {
      await handleAddFeedback(feedbackLeadId, feedback);
    }
  };

  const handleConvertToLead = async (upcomingLead: UpcomingLead) => {
    try {
      setLoading(true);
      setError(null);

      // Get API ID for the upcoming lead
      const apiId = getApiId(upcomingLead.id);
      if (!apiId) {
        throw new Error('API ID not found for this upcoming lead');
      }

      // Update status immediately to FOLLOW_UP so it moves to regular leads list
      await leadsService.updateLead(apiId, { status: 'FOLLOW_UP' });

      // Reload leads so we get the full mapped lead (with timestamps & history)
      await loadLeads();
      await loadLeadsOverview();

      // Find the freshly loaded lead in the leads array (after reload)
      // Slight delay may be needed if state not yet updated; use functional set after next tick
      setTimeout(() => {
        setLeads(current => {
          const leadMatch = current.find(l => l.id === upcomingLead.id);
          if (leadMatch) {
            setEditingLead(leadMatch);
            setIsEditModalOpen(true);
          }
          return current;
        });
      }, 0);

      // Remove from upcoming leads locally (will already be excluded on next render after reload)
      setUpcomingLeads(prev => prev.filter(l => l.id !== upcomingLead.id));
    } catch (err) {
      console.error('Error converting upcoming lead:', err);
      setError('Failed to convert lead');
    } finally {
      setLoading(false);
    }
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setUpcomingCurrentPage(1);
  }, [searchTerm, fromDate, toDate]);

  return (
    <>
      {/* Floating Sales Tips */}
      <FloatingSalesTips />

      {/* Smart Reminders */}
      <SmartReminders leads={leads} />

      {/* Activity Tracker */}
      <ActivityTracker />

      {/* WhatsApp Templates */}
      <WhatsAppTemplates />

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
            <p className="text-gray-600 mt-1">Manage and track your sales leads</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setIsExportModalOpen(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            
            <button
              onClick={() => setIsBulkUploadModalOpen(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </button>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Add New Lead
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button 
              onClick={loadLeads}
              className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !leads.length && !upcomingLeads.length ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading leads...</div>
          </div>
        ) : (
          /* Tabs */
          <LeadsTabs
            activeTab={activeTab}
            onTabChange={(tab) => { setActiveTab(tab); /* reset pages on tab change */ if(tab==='leads'){setCurrentPage(1);} else {setUpcomingCurrentPage(1);} }}
            leads={leads}
            upcomingLeads={upcomingLeads}
            overviewData={leadsOverview}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            fromDate={fromDate}
            toDate={toDate}
            onFromDateChange={(v) => { setFromDate(v); setCurrentPage(1); setUpcomingCurrentPage(1); }}
            onToDateChange={(v) => { setToDate(v); setCurrentPage(1); setUpcomingCurrentPage(1); }}
            hideCompletedLeads={hideCompletedLeads}
            onHideCompletedLeadsChange={setHideCompletedLeads}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            upcomingCurrentPage={upcomingCurrentPage}
            onUpcomingPageChange={setUpcomingCurrentPage}
            itemsPerPage={itemsPerPage}
            expandedRows={expandedRows}
            onToggleRowExpansion={toggleRowExpansion}
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onAddFeedback={handleOpenFeedbackModal}
            onAddReminder={handleOpenReminderModal}
            onMarkAsJunk={handleMarkAsJunk}
            onConvertToLead={handleConvertToLead}
            onDeleteUpcomingLead={handleDeleteUpcomingLead}
            onAddLead={() => setIsAddModalOpen(true)}
          />
        )}

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

        <SimpleFeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={handleCloseFeedbackModal}
          onAdd={handleSubmitFeedback}
          leadName={feedbackLeadName}
          loading={loading}
        />

        <BulkUploadModal
          isOpen={isBulkUploadModalOpen}
          onClose={() => setIsBulkUploadModalOpen(false)}
          onSuccess={handleBulkUploadSuccess}
        />

        <LeadExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          currentStatusFilter=""
          leads={leads.map(l => ({
            name: l.name,
            email: l.email,
            phone: l.phone,
            website: l.website,
            status: l.status,
            priority: l.priority,
            leadSource: l.leadSource,
            attempts: l.attempts,
            createdAt: l.createdAt,
            lastUpdated: l.lastUpdated,
            lastContact: l.lastContact,
            feedback: l.feedback
          }))}
          upcomingLeads={upcomingLeads.map(u => ({
            name: u.name,
            email: u.email,
            phone: u.phone,
            website: u.website,
            status: 'new',
            priority: u.priority,
            leadSource: u.leadSource,
            attempts: 0,
            createdAt: u.createdAt
          }))}
        />

        <AddReminderModal
          isOpen={isReminderModalOpen}
          onClose={handleCloseReminderModal}
          onSave={handleSaveReminder}
          entityName={reminderLeadName}
        />
      </div>
      </div>
    </>
  );
}
