"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Users, CheckCircle, UserCheck, RefreshCw, XCircle, HelpCircle, Ban } from "lucide-react";
import { Lead, UpcomingLead } from './types';
import { LeadFilters } from './LeadFilters';
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
  onMarkAsJunk: (id: number) => void;
  onConvertToLead: (lead: UpcomingLead) => void | Promise<void>;
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
  onMarkAsJunk,
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
      const created = lead.createdAt;
      const matchesFrom = !fromDate || created >= fromDate;
      const matchesTo = !toDate || created <= toDate;
      return matchesSearch && matchesFrom && matchesTo;
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
    const hasFilters = !!(searchTerm || fromDate || toDate);

  // Calculate counts for each status
  const statusCounts = {
    upcoming: totalUpcomingItems,
    all: totalItems,
    interested: filteredLeads.filter(l => l.status === 'interested').length,
    subscribed: filteredLeads.filter(l => l.status === 'subscribed').length,
    follow_up: filteredLeads.filter(l => l.status === 'follow_up').length,
    not_interested: filteredLeads.filter(l => l.status === 'not_interested').length,
    no_answer: filteredLeads.filter(l => l.status === 'no_answer').length,
    junk: filteredLeads.filter(l => l.status === 'junk').length
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 bg-gray-100 p-1 rounded-xl border border-gray-200 gap-1">
        <TabsTrigger 
          value="upcoming" 
          className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all
            data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
            data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
        >
          <Target className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New</span>
          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {statusCounts.upcoming}
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="leads" 
          className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all
            data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
            data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
        >
          <Users className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">All</span>
          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {statusCounts.all}
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="interested" 
          className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all
            data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
            data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
        >
          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
          <span className="hidden sm:inline">Interested</span>
          <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            {statusCounts.interested}
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="subscribed" 
          className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all
            data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
            data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
        >
          <UserCheck className="h-3.5 w-3.5 text-purple-600" />
          <span className="hidden sm:inline">Subscribed</span>
          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            {statusCounts.subscribed}
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="follow_up" 
          className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all
            data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
            data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
        >
          <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
          <span className="hidden sm:inline">Follow Up</span>
          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {statusCounts.follow_up}
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="not_interested" 
          className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all
            data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
            data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
        >
          <XCircle className="h-3.5 w-3.5 text-red-600" />
          <span className="hidden sm:inline">Not Int.</span>
          <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            {statusCounts.not_interested}
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="no_answer" 
          className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all
            data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
            data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
        >
          <HelpCircle className="h-3.5 w-3.5 text-gray-600" />
          <span className="hidden sm:inline">No Answer</span>
          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {statusCounts.no_answer}
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
            {statusCounts.junk}
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

      {/* Regular Leads Tab - All */}
      <TabsContent value="leads" className="space-y-6">
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
          hideCompletedLeads={hideCompletedLeads}
          onHideCompletedLeadsChange={onHideCompletedLeadsChange}
        />

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
              onMarkAsJunk={onMarkAsJunk}
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

      {/* Interested Tab */}
      <TabsContent value="interested" className="space-y-6">
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
          placeholder="Search interested leads..."
        />
        {filteredLeads.filter(l => l.status === 'interested').slice(startIndex, startIndex + itemsPerPage).length > 0 ? (
          <>
            <LeadsTable
              leads={filteredLeads.filter(l => l.status === 'interested').slice(startIndex, startIndex + itemsPerPage)}
              expandedRows={expandedRows}
              onToggleRowExpansion={onToggleRowExpansion}
              onEditLead={onEditLead}
              onDeleteLead={onDeleteLead}
              onAddFeedback={onAddFeedback}
              onAddReminder={onAddReminder}
              onMarkAsJunk={onMarkAsJunk}
            />
            {statusCounts.interested > itemsPerPage && (
              <Pagination
                totalItems={statusCounts.interested}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
              />
            )}
          </>
        ) : (
          <EmptyState type="leads" hasFilters={hasFilters} onAddLead={onAddLead} />
        )}
      </TabsContent>

      {/* Subscribed Tab */}
      <TabsContent value="subscribed" className="space-y-6">
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
          placeholder="Search subscribed leads..."
        />
        {filteredLeads.filter(l => l.status === 'subscribed').slice(startIndex, startIndex + itemsPerPage).length > 0 ? (
          <>
            <LeadsTable
              leads={filteredLeads.filter(l => l.status === 'subscribed').slice(startIndex, startIndex + itemsPerPage)}
              expandedRows={expandedRows}
              onToggleRowExpansion={onToggleRowExpansion}
              onEditLead={onEditLead}
              onDeleteLead={onDeleteLead}
              onAddFeedback={onAddFeedback}
              onAddReminder={onAddReminder}
              onMarkAsJunk={onMarkAsJunk}
            />
            {statusCounts.subscribed > itemsPerPage && (
              <Pagination
                totalItems={statusCounts.subscribed}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
              />
            )}
          </>
        ) : (
          <EmptyState type="leads" hasFilters={hasFilters} onAddLead={onAddLead} />
        )}
      </TabsContent>

      {/* Follow Up Tab */}
      <TabsContent value="follow_up" className="space-y-6">
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
          placeholder="Search follow-up leads..."
        />
        {filteredLeads.filter(l => l.status === 'follow_up').slice(startIndex, startIndex + itemsPerPage).length > 0 ? (
          <>
            <LeadsTable
              leads={filteredLeads.filter(l => l.status === 'follow_up').slice(startIndex, startIndex + itemsPerPage)}
              expandedRows={expandedRows}
              onToggleRowExpansion={onToggleRowExpansion}
              onEditLead={onEditLead}
              onDeleteLead={onDeleteLead}
              onAddFeedback={onAddFeedback}
              onAddReminder={onAddReminder}
              onMarkAsJunk={onMarkAsJunk}
            />
            {statusCounts.follow_up > itemsPerPage && (
              <Pagination
                totalItems={statusCounts.follow_up}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
              />
            )}
          </>
        ) : (
          <EmptyState type="leads" hasFilters={hasFilters} onAddLead={onAddLead} />
        )}
      </TabsContent>

      {/* Not Interested Tab */}
      <TabsContent value="not_interested" className="space-y-6">
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
          placeholder="Search not interested leads..."
        />
        {filteredLeads.filter(l => l.status === 'not_interested').slice(startIndex, startIndex + itemsPerPage).length > 0 ? (
          <>
            <LeadsTable
              leads={filteredLeads.filter(l => l.status === 'not_interested').slice(startIndex, startIndex + itemsPerPage)}
              expandedRows={expandedRows}
              onToggleRowExpansion={onToggleRowExpansion}
              onEditLead={onEditLead}
              onDeleteLead={onDeleteLead}
              onAddFeedback={onAddFeedback}
              onAddReminder={onAddReminder}
              onMarkAsJunk={onMarkAsJunk}
            />
            {statusCounts.not_interested > itemsPerPage && (
              <Pagination
                totalItems={statusCounts.not_interested}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
              />
            )}
          </>
        ) : (
          <EmptyState type="leads" hasFilters={hasFilters} onAddLead={onAddLead} />
        )}
      </TabsContent>

      {/* No Answer Tab */}
      <TabsContent value="no_answer" className="space-y-6">
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
          placeholder="Search no answer leads..."
        />
        {filteredLeads.filter(l => l.status === 'no_answer').slice(startIndex, startIndex + itemsPerPage).length > 0 ? (
          <>
            <LeadsTable
              leads={filteredLeads.filter(l => l.status === 'no_answer').slice(startIndex, startIndex + itemsPerPage)}
              expandedRows={expandedRows}
              onToggleRowExpansion={onToggleRowExpansion}
              onEditLead={onEditLead}
              onDeleteLead={onDeleteLead}
              onAddFeedback={onAddFeedback}
              onAddReminder={onAddReminder}
              onMarkAsJunk={onMarkAsJunk}
            />
            {statusCounts.no_answer > itemsPerPage && (
              <Pagination
                totalItems={statusCounts.no_answer}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
              />
            )}
          </>
        ) : (
          <EmptyState type="leads" hasFilters={hasFilters} onAddLead={onAddLead} />
        )}
      </TabsContent>

      {/* Junk Tab */}
      <TabsContent value="junk" className="space-y-6">
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
          placeholder="Search junk leads..."
        />
        {filteredLeads.filter(l => l.status === 'junk').slice(startIndex, startIndex + itemsPerPage).length > 0 ? (
          <>
            <LeadsTable
              leads={filteredLeads.filter(l => l.status === 'junk').slice(startIndex, startIndex + itemsPerPage)}
              expandedRows={expandedRows}
              onToggleRowExpansion={onToggleRowExpansion}
              onEditLead={onEditLead}
              onDeleteLead={onDeleteLead}
              onAddFeedback={onAddFeedback}
              onAddReminder={onAddReminder}
              onMarkAsJunk={onMarkAsJunk}
            />
            {statusCounts.junk > itemsPerPage && (
              <Pagination
                totalItems={statusCounts.junk}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
              />
            )}
          </>
        ) : (
          <EmptyState type="leads" hasFilters={hasFilters} onAddLead={onAddLead} />
        )}
      </TabsContent>
    </Tabs>
  );
};
