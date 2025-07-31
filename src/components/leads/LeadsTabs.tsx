"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Users } from "lucide-react";
import { Lead, UpcomingLead } from './types';
import { LeadFilters } from './LeadFilters';
import { LeadStats } from './LeadStats';
import { LeadsTable } from './LeadsTable';
import { UpcomingLeadsTable } from './UpcomingLeadsTable';
import { EmptyState } from './EmptyState';
import { Pagination } from "@/components/tables/Pagination";

interface LeadsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  
  // Data
  leads: Lead[];
  upcomingLeads: UpcomingLead[];
  
  // Filters
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  
  // Pagination
  currentPage: number;
  onPageChange: (page: number) => void;
  upcomingCurrentPage: number;
  onUpcomingPageChange: (page: number) => void;
  itemsPerPage: number;
  
  // Table interactions
  expandedRows: Set<number>;
  onToggleRowExpansion: (leadId: number) => void;
  
  // Actions
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: number) => void;
  onConvertToLead: (lead: UpcomingLead) => void;
  onDeleteUpcomingLead: (id: number) => void;
  onAddLead: () => void;
}

export const LeadsTabs: React.FC<LeadsTabsProps> = ({
  activeTab,
  onTabChange,
  leads,
  upcomingLeads,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  currentPage,
  onPageChange,
  upcomingCurrentPage,
  onUpcomingPageChange,
  itemsPerPage,
  expandedRows,
  onToggleRowExpansion,
  onEditLead,
  onDeleteLead,
  onConvertToLead,
  onDeleteUpcomingLead,
  onAddLead
}) => {
  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    const matchesDate = !dateFilter || lead.createdAt === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Filter upcoming leads
  const filteredUpcomingLeads = upcomingLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || lead.createdAt === dateFilter;
    
    return matchesSearch && matchesDate;
  });

  // Calculate pagination for leads
  const totalItems = filteredLeads.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // Calculate pagination for upcoming leads
  const totalUpcomingItems = filteredUpcomingLeads.length;
  const upcomingStartIndex = (upcomingCurrentPage - 1) * itemsPerPage;
  const upcomingEndIndex = upcomingStartIndex + itemsPerPage;
  const paginatedUpcomingLeads = filteredUpcomingLeads.slice(upcomingStartIndex, upcomingEndIndex);

  const hasFilters = !!(searchTerm || statusFilter || dateFilter);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl border border-gray-200">
        <TabsTrigger 
          value="upcoming" 
          className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all
            data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
            data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
        >
          <Target className="h-4 w-4" />
          Upcoming Leads
          <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {upcomingLeads.length}
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="leads" 
          className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all
            data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
            data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
        >
          <Users className="h-4 w-4" />
          Leads
          <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            {leads.length}
          </span>
        </TabsTrigger>
      </TabsList>

      {/* Upcoming Leads Tab */}
      <TabsContent value="upcoming" className="space-y-6">
        <LeadFilters
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          statusFilter=""
          onStatusFilterChange={() => {}}
          dateFilter={dateFilter}
          onDateFilterChange={onDateFilterChange}
          showStatusFilter={false}
          placeholder="Search upcoming leads by name, phone, or email..."
        />

        {filteredUpcomingLeads.length > 0 ? (
          <>
            <UpcomingLeadsTable
              leads={paginatedUpcomingLeads}
              onConvertToLead={onConvertToLead}
              onDeleteLead={onDeleteUpcomingLead}
            />
            
            {totalUpcomingItems > 0 && (
              <Pagination
                totalItems={totalUpcomingItems}
                itemsPerPage={itemsPerPage}
                currentPage={upcomingCurrentPage}
                onPageChange={onUpcomingPageChange}
              />
            )}
          </>
        ) : (
          <EmptyState
            type="upcoming"
            hasFilters={hasFilters}
          />
        )}
      </TabsContent>

      {/* Regular Leads Tab */}
      <TabsContent value="leads" className="space-y-6">
        <LeadFilters
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          dateFilter={dateFilter}
          onDateFilterChange={onDateFilterChange}
          showStatusFilter={true}
        />

        <LeadStats leads={leads} />

        {filteredLeads.length > 0 ? (
          <>
            <LeadsTable
              leads={paginatedLeads}
              expandedRows={expandedRows}
              onToggleRowExpansion={onToggleRowExpansion}
              onEditLead={onEditLead}
              onDeleteLead={onDeleteLead}
            />
            
            {totalItems > 0 && (
              <Pagination
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
              />
            )}
          </>
        ) : (
          <EmptyState
            type="leads"
            hasFilters={hasFilters}
            onAddLead={onAddLead}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};
