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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [upcomingLeads, setUpcomingLeads] = useState<UpcomingLead[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [upcomingCurrentPage, setUpcomingCurrentPage] = useState(1);
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
        page: 1,
        limit: 100 // Get more items to handle local pagination
      };

      if (searchTerm) {
        params.searchQuery = searchTerm;
      }

      if (statusFilter) {
        // Map component status to API status
        const statusApiMap: Record<string, LeadStatus> = {
          'interested': 'INTERSTED',
          'subscribed': 'SUBSCRIBED', 
          'not_interested': 'NOT_INTERSTED',
          'no_answer': 'NO_ANSWER',
          'follow_up': 'FOLLOW_UP',
          'new': 'NEW'
        };
        params.status = statusApiMap[statusFilter] || 'NEW';
      }

      if (dateFilter) {
        // Assuming dateFilter is in format 'YYYY-MM-DD'
        params.from = dateFilter;
        params.to = dateFilter;
      }
      
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
      }
    } catch (err) {
      console.error('Error loading leads:', err);
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, dateFilter]);

  // Load leads on component mount and when filters change
  useEffect(() => {
    loadLeads();
    loadLeadsOverview(); // Load overview data
  }, [loadLeads, loadLeadsOverview]);

  // Reload when filters change
  useEffect(() => {
    if (searchTerm || statusFilter || dateFilter) {
      loadLeads();
    }
  }, [searchTerm, statusFilter, dateFilter, loadLeads]);

  const handleAddLead = async (newLead: Lead) => {
    try {
      setLoading(true);
      
      // Map component status to API status
      const statusMap: Record<string, Exclude<LeadStatus, "NEW">> = {
        'interested': 'INTERSTED',
        'subscribed': 'SUBSCRIBED', 
        'not_interested': 'NOT_INTERSTED',
        'no_answer': 'NO_ANSWER',
        'follow_up': 'FOLLOW_UP'
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
        status: (statusMap[newLead.status] || 'FOLLOW_UP') as Exclude<LeadStatus, "NEW">,
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

      // Convert component Lead format to API UpdateLeadRequest format
      const statusMap: Record<string, LeadStatus> = {
        'interested': 'INTERSTED',
        'subscribed': 'SUBSCRIBED', 
        'not_interested': 'NOT_INTERSTED',
        'no_answer': 'NO_ANSWER',
        'follow_up': 'FOLLOW_UP'
      };
      
      const priorityMap: Record<string, LeadPriority> = {
        'high': 'HIGH',
        'mid': 'MEDIUM',
        'low': 'LOW'
      };

      const updateRequest = {
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        websiteUrl: updates.website || undefined,
        socialMediaUrls: updates.socialUrls ? updates.socialUrls.split(',').map(url => url.trim()).filter(Boolean) : undefined,
        leadSource: updates.leadSource.toUpperCase() as LeadSource,
        priority: (priorityMap[updates.priority] || updates.priority.toUpperCase()) as LeadPriority,
        status: (statusMap[updates.status] || updates.status.toUpperCase()) as LeadStatus,
        feedback: updates.feedback || undefined
      };

      await leadsService.updateLead(apiId, updateRequest);
      
      // Update local state
      const existingLead = leads.find(lead => lead.id === id);
      
      if (existingLead) {
        // Update existing lead
        setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, ...updates } : lead));
      } else {
        // Add as new lead (conversion from upcoming lead)
        setLeads(prev => [{ ...updates, id }, ...prev]);
        // Remove from upcoming leads if it was there
        setUpcomingLeads(prev => prev.filter(lead => lead.id !== id));
      }

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

  const handleConvertToLead = (upcomingLead: UpcomingLead) => {
    // Convert upcoming lead to regular lead format for editing
    const convertedLead: Lead = {
      ...upcomingLead,
      status: 'follow_up',
      attempts: 0,
      lastContact: new Date().toISOString().split('T')[0],
      feedback: '',
      feedbackHistory: []
    };
    
    // Set the converted lead for editing and open the modal
    setEditingLead(convertedLead);
    setIsEditModalOpen(true);
    
    // Remove from upcoming leads since we're converting it
    setUpcomingLeads(prev => prev.filter(lead => lead.id !== upcomingLead.id));
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
  }, [searchTerm, statusFilter, dateFilter]);

  return (
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
              Export{statusFilter ? ` (${statusFilter})` : ''}
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
            onTabChange={setActiveTab}
            leads={leads}
            upcomingLeads={upcomingLeads}
            overviewData={leadsOverview}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
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
          currentStatusFilter={statusFilter}
        />
      </div>
    </div>
  );
}
