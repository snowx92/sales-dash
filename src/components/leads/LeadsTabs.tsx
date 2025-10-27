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

interface LeadsOverviewData {
  total: number;
  totalSubscribedLeads: number;
  totalInterestedLeads: number;
  totalFollowUpLeads: number;
  totalNotInterestedLeads: number;
}

interface LeadsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  leads: Lead[];
  upcomingLeads: UpcomingLead[];
  overviewData?: LeadsOverviewData | null;
  // Filters
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  hideCompletedLeads: boolean;
  onHideCompletedLeadsChange: (value: boolean) => void;
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
  onAddFeedback: (id: number, leadName: string) => void;
  onAddReminder: (id: number, name: string, email: string, phone: string) => void;
  onConvertToLead: (lead: UpcomingLead) => void | Promise<void>;
  onDeleteUpcomingLead: (id: number) => void;
  onAddLead: () => void;
}

export const LeadsTabs: React.FC<LeadsTabsProps> = ({
  activeTab,
  onTabChange,
  leads,
  upcomingLeads,
  overviewData,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  currentPage,
  onPageChange,
  upcomingCurrentPage,
  onUpcomingPageChange,
  itemsPerPage,
  expandedRows,
  onToggleRowExpansion,
  onEditLead,
  onDeleteLead,
  onAddFeedback,
  onAddReminder,
  onConvertToLead,
  onDeleteUpcomingLead,
  onAddLead,
  hideCompletedLeads,
  onHideCompletedLeadsChange
}) => {
  // Server already applied filters & pagination; just display lists
    // Client-side filtering (server returned bulk set)
    const filteredLeads = leads.filter(lead => {
      // Hide subscribed and not interested if toggle is enabled
      if (hideCompletedLeads && (lead.status === 'subscribed' || lead.status === 'not_interested')) {
        return false;
      }

      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || lead.phone.includes(searchTerm) || lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || lead.status === statusFilter;
      const created = lead.createdAt;
      const matchesFrom = !fromDate || created >= fromDate;
      const matchesTo = !toDate || created <= toDate;
      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
    const filteredUpcoming = upcomingLeads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || lead.phone.includes(searchTerm) || lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const created = lead.createdAt;
      const matchesFrom = !fromDate || created >= fromDate;
      const matchesTo = !toDate || created <= toDate;
      return matchesSearch && matchesFrom && matchesTo;
    });

    const totalItems = filteredLeads.length;
    const totalUpcomingItems = filteredUpcoming.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const upcomingStartIndex = (upcomingCurrentPage - 1) * itemsPerPage;
    const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);
    const paginatedUpcomingLeads = filteredUpcoming.slice(upcomingStartIndex, upcomingStartIndex + itemsPerPage);
    const hasFilters = !!(searchTerm || statusFilter || fromDate || toDate);

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
            {totalUpcomingItems}
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
            {totalItems}
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
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={onFromDateChange}
          onToDateChange={onToDateChange}
          showStatusFilter={false}
          placeholder="Search upcoming leads by name, phone, or email..."
        />

        {paginatedUpcomingLeads.length > 0 ? (
          <>
            <UpcomingLeadsTable
              leads={paginatedUpcomingLeads}
              onConvertToLead={onConvertToLead}
              onDeleteLead={onDeleteUpcomingLead}
              onAddReminder={onAddReminder}
            />
            
            {totalUpcomingItems > itemsPerPage && (
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
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={onFromDateChange}
          onToDateChange={onToDateChange}
          showStatusFilter={true}
          hideCompletedLeads={hideCompletedLeads}
          onHideCompletedLeadsChange={onHideCompletedLeadsChange}
        />

        <LeadStats leads={leads} overviewData={overviewData} />

    {paginatedLeads.length > 0 ? (
          <>
            <LeadsTable
              leads={paginatedLeads}
              expandedRows={expandedRows}
              onToggleRowExpansion={onToggleRowExpansion}
              onEditLead={onEditLead}
              onDeleteLead={onDeleteLead}
              onAddFeedback={onAddFeedback}
              onAddReminder={onAddReminder}
            />
            
            {totalItems > itemsPerPage && (
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
