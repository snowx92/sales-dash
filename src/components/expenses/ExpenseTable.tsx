'use client';

import React, { useState, useEffect } from 'react';
import { getUniqueColor } from '@/helpers/helpers';
import ActionDropdown from './ActionDropdown';
import EditExpenseTagForm from './EditExpenseTagForm';
import { Expense } from '@/lib/api/expense/ExpenseService';
import { Tag, TagService } from '@/lib/api/expense/tags/TagService';
import ColoredSelect from '@/components/ui/colored-select';
import { useToast } from '@/components/ui/use-toast';
import ConfirmToast from '../ui/confirm-toast';
import { ResponsiveCard } from '@/components/layout/ResponsiveWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, ChevronUp, Calendar, Tag as TagIcon, DollarSign, User, FileText } from 'lucide-react';

interface ExpenseTableProps {
  expenses: Expense[];
  tags: Tag[];
  isLoading: boolean;
  onUpdate: (id: string, data: { tagId: string, amount: number, description: string, date: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

// Mobile filter component
const MobileFilters = ({ 
  selectedTag, 
  setSelectedTag, 
  startDate, 
  setStartDate, 
  endDate, 
  setEndDate,
  tags,
  isLoadingTags 
}: {
  selectedTag: string;
  setSelectedTag: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  tags: Tag[];
  isLoadingTags: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="lg:hidden mb-6">
      <ResponsiveCard padding="sm">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-900">Filters & Date Range</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tag</label>
                <ColoredSelect
                  value={selectedTag}
                  onChange={setSelectedTag}
                  options={[
                    { 
                      id: 'all', 
                      name: 'All Tags', 
                      date: { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 },
                      count: 0 
                    } as Tag,
                    ...tags
                  ]}
                  placeholder="All Tags"
                  disabled={isLoadingTags}
                />
                {isLoadingTags && (
                  <p className="mt-1 text-sm text-gray-500">Loading tags...</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ResponsiveCard>
    </div>
  );
};

// Mobile expense card component
const MobileExpenseCard = ({ 
  expense, 
  onEdit, 
  onDelete 
}: {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { backgroundColor, textColor } = getUniqueColor(expense.tag.name);
  
  return (
    <ResponsiveCard padding="md" className="hover:shadow-lg transition-all duration-200">
      <div className="space-y-3">
        {/* Header with description and action */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-500">Description</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">{expense.info}</h3>
          </div>
          <ActionDropdown onEdit={onEdit} onDelete={onDelete} />
        </div>
        
        {/* Amount */}
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-gray-500">Amount:</span>
          <span className="text-lg font-bold text-green-600">{expense.amount} {expense.currency}</span>
        </div>
        
        {/* Tag */}
        <div className="flex items-center space-x-2">
          <TagIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-500">Tag:</span>
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor, color: textColor }}
          >
            {expense.tag.name}
          </span>
        </div>
        
        {/* Date and User */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <div>
              <span className="text-xs font-medium text-gray-500 block">Date</span>
              <span className="text-sm text-gray-900">{new Date(expense.date._seconds * 1000).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-orange-600" />
            <div>
              <span className="text-xs font-medium text-gray-500 block">User</span>
              <span className="text-sm text-gray-900">{expense.user.name}</span>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveCard>
  );
};

export default function ExpenseTable({
  expenses,
  tags: initialTags,
  isLoading,
  onUpdate,
  onDelete,
  currentPage,
  totalPages,
  totalItems,
  onPageChange
}: ExpenseTableProps) {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedTag, setSelectedTag] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const tagService = new TagService();
    const loadTags = async () => {
      try {
        setIsLoadingTags(true);
        const response = await tagService.getTags();
        setTags(response);
      } catch (error) {
        console.error('Error loading tags:', error);
        toast({
          title: 'Failed to load tags',
          description: 'Please try again later',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingTags(false);
      }
    };

    loadTags();
  }, [toast]);

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
  };

  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const handleDeleteExpense = (expense: Expense) => {
    setExpenseToDelete(expense);
  };

  const handleUpdateExpense = async (data: { tagId: string, amount: number, description: string, date: string }) => {
    if (!selectedExpense) return;
    try {
      await onUpdate(selectedExpense.id, data);
      setSelectedExpense(null);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date._seconds * 1000);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    const matchesDate = (!start || expenseDate >= start) && (!end || expenseDate <= end);
    const matchesTag = selectedTag === 'all' || expense.tag.id === selectedTag;
    
    return matchesDate && matchesTag;
  });

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const currency = expenses[0]?.currency || 'USD';

  return (
    <div className="w-full space-y-6">
      {/* Mobile Filters */}
      <MobileFilters
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        tags={tags}
        isLoadingTags={isLoadingTags}
      />

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <ResponsiveCard padding="md">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="w-full sm:w-[200px]">
                <ColoredSelect
                  value={selectedTag}
                  onChange={setSelectedTag}
                  options={[
                    { 
                      id: 'all', 
                      name: 'All Tags', 
                      date: { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 },
                      count: 0 
                    } as Tag,
                    ...tags
                  ]}
                  placeholder="All Tags"
                  disabled={isLoadingTags}
                />
                {isLoadingTags && (
                  <p className="mt-1 text-sm text-gray-500">Loading tags...</p>
                )}
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const { backgroundColor } = getUniqueColor(tag.name);
                return (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor }}
                    />
                    <span>{tag.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </ResponsiveCard>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {/* Total Summary */}
        <ResponsiveCard padding="sm" className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total Amount:</span>
            <span className="text-lg font-bold text-purple-700">{totalAmount.toFixed(2)} {currency}</span>
          </div>
        </ResponsiveCard>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <ResponsiveCard key={i} padding="md" className="animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </ResponsiveCard>
            ))}
          </div>
        ) : filteredExpenses.length === 0 ? (
          <ResponsiveCard padding="md" className="text-center">
            <div className="py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
              <p className="text-gray-500">Try adjusting your filters or date range</p>
            </div>
          </ResponsiveCard>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MobileExpenseCard
                  expense={expense}
                  onEdit={() => handleEditExpense(expense)}
                  onDelete={() => handleDeleteExpense(expense)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <ResponsiveCard padding="none" className="overflow-hidden">
          <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,auto] px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="text-sm font-semibold text-gray-700">Description</div>
            <div className="text-sm font-semibold text-gray-700">Amount</div>
            <div className="text-sm font-semibold text-gray-700">Tag</div>
            <div className="text-sm font-semibold text-gray-700">Date</div>
            <div className="text-sm font-semibold text-gray-700">User</div>
            <div className="w-10"></div>
          </div>

          {isLoading ? (
            <div className="px-6 py-8 text-center text-gray-500">Loading...</div>
          ) : filteredExpenses.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">No expenses found</div>
          ) : (
            <>
              {filteredExpenses.map((expense) => {
                const { backgroundColor, textColor } = getUniqueColor(expense.tag.name);
                return (
                  <div
                    key={expense.id}
                    className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,auto] px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-sm text-gray-900 font-medium">{expense.info}</div>
                    <div className="text-sm text-gray-900 font-medium">{expense.amount} {expense.currency}</div>
                    <div>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor, color: textColor }}
                      >
                        {expense.tag.name}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">{new Date(expense.date._seconds * 1000).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">{expense.user.name}</div>
                    <div>
                      <ActionDropdown
                        onEdit={() => handleEditExpense(expense)}
                        onDelete={() => handleDeleteExpense(expense)}
                      />
                    </div>
                  </div>
                );
              })}
              
              {/* Desktop Total and Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-gray-700">
                    Total: {totalAmount.toFixed(2)} {currency}
                  </div>
                </div>
              </div>
            </>
          )}
        </ResponsiveCard>
      </div>

      {/* Responsive Pagination */}
      {totalPages > 1 && (
        <ResponsiveCard padding="sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 text-center sm:text-left">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
              >
                Next
              </button>
            </div>
          </div>
        </ResponsiveCard>
      )}
      
      {expenseToDelete && (
        <ConfirmToast
          message={`Are you sure you want to delete the expense "${expenseToDelete.info}"?`}
          onConfirm={async () => {
            try {
              await onDelete(expenseToDelete.id);
              setExpenseToDelete(null);
            } catch (error) {
              console.error('Error deleting expense:', error);
            }
          }}
          onCancel={() => setExpenseToDelete(null)}
        />
      )}
      {selectedExpense && (
        <EditExpenseTagForm
          onClose={() => setSelectedExpense(null)}
          onSubmit={handleUpdateExpense}
          expense={selectedExpense}
        />
      )}
    </div>
  );
} 