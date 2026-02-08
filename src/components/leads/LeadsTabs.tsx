"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Users, UserCheck, XCircle, HelpCircle, RefreshCw, CheckCircle, Ban } from "lucide-react";
import { Lead, UpcomingLead } from './types';
import { LeadsTable } from './LeadsTable';
import { LeadCard } from './LeadCard';
import { UpcomingLeadCard } from './UpcomingLeadCard';
import { EmptyState } from './EmptyState';
import { Pagination } from "@/components/tables/Pagination";

interface LeadsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  leads: Lead[];
  upcomingLeads: UpcomingLead[];
  // Pagination
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  // Table interactions
  expandedRows: Set<number>;
  onToggleRowExpansion: (leadId: number) => void;
  // Actions
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: number) => void;
  onAddFeedback: (id: number, leadName: string) => void;
  onAssignStore?: (id: number, leadName: string) => void;
  onMarkAsJunk: (id: number) => void;
  onAddLead: () => void;
  onStatusChange?: (id: number, newStatus: string) => void;
}

export const LeadsTabs: React.FC<LeadsTabsProps> = ({
  activeTab,
  onTabChange,
  leads,
  upcomingLeads,
  currentPage,
  onPageChange,
  itemsPerPage,
  expandedRows,
  onToggleRowExpansion,
  onEditLead,
  onDeleteLead,
  onAddFeedback,
  onAssignStore,
  onMarkAsJunk,
  onAddLead,
  onStatusChange,
}) => {
  // Filter leads by active tab status
  const getFilteredLeads = (): Lead[] => {
    if (activeTab === 'all') {
      return leads;
    }
    if (activeTab === 'new') {
      return upcomingLeads as Lead[];
    }
    // Map tab value to lead status
    const statusMap: { [key: string]: string } = {
      'interested': 'interested',
      'subscribed': 'subscribed',
      'follow_up': 'follow_up',
      'not_interested': 'not_interested',
      'no_answer': 'no_answer',
      'junk': 'junk'
    };
    
    const targetStatus = statusMap[activeTab];
    return leads.filter(lead => lead.status === targetStatus);
  };

  const filteredLeads = getFilteredLeads();
  
  // Calculate counts for each status
  const statusCounts = {
    new: upcomingLeads.length,
    all: leads.length,
    interested: leads.filter(l => l.status === 'interested').length,
    subscribed: leads.filter(l => l.status === 'subscribed').length,
    follow_up: leads.filter(l => l.status === 'follow_up').length,
    not_interested: leads.filter(l => l.status === 'not_interested').length,
    no_answer: leads.filter(l => l.status === 'no_answer').length,
    junk: leads.filter(l => l.status === 'junk').length,
  };

  const totalItems = filteredLeads.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <div className="overflow-x-auto">
        <TabsList className="inline-flex w-auto min-w-full bg-gray-100 p-1 rounded-xl border border-gray-200 gap-1">
          <TabsTrigger 
            value="new" 
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap
              data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
              data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
          >
            <Target className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New</span>
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {statusCounts.new}
            </span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="all" 
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap
              data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
              data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
          >
            <Users className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">All</span>
            <span className="px-1.5 py-0.5 bg-gray-200 text-gray-800 rounded-full text-xs font-medium">
              {statusCounts.all}
            </span>
          </TabsTrigger>

          <TabsTrigger 
            value="interested" 
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap
              data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
              data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Interested</span>
            <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              {statusCounts.interested}
            </span>
          </TabsTrigger>

          <TabsTrigger 
            value="subscribed" 
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap
              data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
              data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Subscribed</span>
            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
              {statusCounts.subscribed}
            </span>
          </TabsTrigger>

          <TabsTrigger 
            value="follow_up" 
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap
              data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
              data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Follow Up</span>
            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              {statusCounts.follow_up}
            </span>
          </TabsTrigger>

          <TabsTrigger 
            value="not_interested" 
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap
              data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
              data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Not Interested</span>
            <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">
              {statusCounts.not_interested}
            </span>
          </TabsTrigger>

          <TabsTrigger 
            value="no_answer" 
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap
              data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
              data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">No Answer</span>
            <span className="px-1.5 py-0.5 bg-gray-300 text-gray-800 rounded-full text-xs font-medium">
              {statusCounts.no_answer}
            </span>
          </TabsTrigger>

          <TabsTrigger 
            value="junk" 
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap
              data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
              data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
          >
            <Ban className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Junk</span>
            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
              {statusCounts.junk}
            </span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Tab Content - All tabs show cards on mobile, table on desktop */}
      {['new', 'all', 'interested', 'subscribed', 'follow_up', 'not_interested', 'no_answer', 'junk'].map((tabValue) => {
        const isNewTab = tabValue === 'new';
        const displayLeads = paginatedLeads;
        
        return (
          <TabsContent key={tabValue} value={tabValue} className="mt-6">
            {displayLeads.length > 0 ? (
              <>
                {/* Mobile Cards View - shown only on small screens */}
                <div className="lg:hidden">
                  {isNewTab ? (
                    // New leads use UpcomingLeadCard
                    displayLeads.map((lead) => (
                      <UpcomingLeadCard
                        key={lead.id}
                        lead={lead as import('./types').UpcomingLead}
                        isExpanded={expandedRows.has(lead.id)}
                        onToggleExpand={() => onToggleRowExpansion(lead.id)}
                        onAddFeedback={() => onAddFeedback(lead.id, lead.name)}
                        onEditLead={() => onEditLead(lead)}
                        onDeleteLead={() => onDeleteLead(lead.id)}
                        onAssignStore={onAssignStore ? () => onAssignStore(lead.id, lead.name) : undefined}
                        onMarkAsJunk={() => onMarkAsJunk(lead.id)}
                      />
                    ))
                  ) : (
                    // Other leads use LeadCard
                    displayLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        isExpanded={expandedRows.has(lead.id)}
                        onToggleExpand={() => onToggleRowExpansion(lead.id)}
                        onEditLead={() => onEditLead(lead)}
                        onDeleteLead={() => onDeleteLead(lead.id)}
                        onAddFeedback={() => onAddFeedback(lead.id, lead.name)}
                        onAssignStore={onAssignStore ? () => onAssignStore(lead.id, lead.name) : undefined}
                        onMarkAsJunk={() => onMarkAsJunk(lead.id)}
                        onStatusChange={onStatusChange}
                      />
                    ))
                  )}
                </div>

                {/* Desktop Table View - shown only on large screens */}
                <div className="hidden lg:block">
                  <LeadsTable
                    leads={displayLeads}
                    expandedRows={expandedRows}
                    onToggleRowExpansion={onToggleRowExpansion}
                    onEditLead={onEditLead}
                    onDeleteLead={onDeleteLead}
                    onAddFeedback={onAddFeedback}
                    onAssignStore={onAssignStore}
                    onMarkAsJunk={onMarkAsJunk}
                    onStatusChange={onStatusChange}
                  />
                </div>
                
                {totalItems > itemsPerPage && (
                  <div className="mt-6">
                    <Pagination
                      totalItems={totalItems}
                      itemsPerPage={itemsPerPage}
                      currentPage={currentPage}
                      onPageChange={onPageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                type={isNewTab ? 'upcoming' : 'leads'}
                hasFilters={false}
                onAddLead={onAddLead}
              />
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
};
