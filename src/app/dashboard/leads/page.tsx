"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { 
  Lead, 
  UpcomingLead, 
  mockLeads, 
  mockUpcomingLeads,
  AddLeadModal,
  EditLeadModal,
  LeadsTabs
} from "@/components/leads";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [upcomingLeads, setUpcomingLeads] = useState<UpcomingLead[]>(mockUpcomingLeads);
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

  const handleAddLead = (newLead: Lead) => {
    setLeads(prev => [newLead, ...prev]);
  };

  const handleUpdateLead = (id: number, updates: Lead) => {
    // Check if this is a new lead being converted from upcoming leads
    const existingLead = leads.find(lead => lead.id === id);
    
    if (existingLead) {
      // Update existing lead
      setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, ...updates } : lead));
    } else {
      // Add as new lead (conversion from upcoming lead)
      setLeads(prev => [{ ...updates, id }, ...prev]);
    }
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

  const handleDeleteUpcomingLead = (id: number) => {
    if (confirm('Are you sure you want to delete this upcoming lead?')) {
      setUpcomingLeads(prev => prev.filter(lead => lead.id !== id));
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
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            Add New Lead
          </button>
        </div>

        {/* Tabs */}
        <LeadsTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          leads={leads}
          upcomingLeads={upcomingLeads}
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
          onConvertToLead={handleConvertToLead}
          onDeleteUpcomingLead={handleDeleteUpcomingLead}
          onAddLead={() => setIsAddModalOpen(true)}
        />

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
    </div>
  );
}
