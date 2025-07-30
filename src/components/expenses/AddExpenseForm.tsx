'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, DollarSign, FileText, Tag, Calendar } from 'lucide-react';
import { Toast } from '@/components/ui/toast';
import { Expense } from '@/lib/api/expense/ExpenseService';
import { Tag as TagType, TagService } from '@/lib/api/expense/tags/TagService';
import ColoredSelect from '@/components/ui/colored-select';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface AddExpenseFormProps {
  onClose: () => void;
  onSubmit: (data: { amount: number; description: string; tagId: string; date: string }) => Promise<void>;
  expense?: Expense;
}

export default function AddExpenseForm({ onClose, onSubmit, expense }: AddExpenseFormProps) {
  const [amount, setAmount] = useState(expense?.amount || '');
  const [description, setDescription] = useState(expense?.info || '');
  const [tagId, setTagId] = useState(expense?.tag?.id || '');
  const [date, setDate] = useState(expense ? new Date(expense.date._seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<TagType[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);

  const tagService = useMemo(() => new TagService(), []);

  useEffect(() => {
    const loadTags = async () => {
      try {
        setIsLoadingTags(true);
        const response = await tagService.getTags();
        setTags(response);
        
        // If editing and we have a tagId but no matching tag, try to fetch it
        if (expense?.tag?.id && !response.find(t => t.id === expense.tag.id)) {
          const tag = await tagService.getTagById(expense.tag.id);
          setTags(prev => [...prev, tag]);
        }
      } catch (error) {
        console.error('Error loading tags:', error);
        Toast.error({
          message: 'Failed to load tags',
          description: 'Please try again later'
        });
      } finally {
        setIsLoadingTags(false);
      }
    };

    loadTags();
  }, [expense?.tag?.id, tagService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !tagId || !date) {
      Toast.error({
        message: 'Please fill in all fields',
        description: 'Amount, description, tag, and date are required'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        amount: Number(amount),
        description,
        tagId,
        date
      });
      onClose();
    } catch (error) {
      console.error('Error submitting expense:', error);
      Toast.error({
        message: 'Failed to save expense',
        description: 'Please try again later'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        {/* Mobile: Full screen modal, Desktop: Centered modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-xl w-full h-full sm:h-auto sm:max-w-md sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {expense ? 'Edit Expense' : 'Add New Expense'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {expense ? 'Update expense details' : 'Enter expense information'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Form Content */}
            <div className="flex-1 p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    Amount
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base transition-all"
                    placeholder="Enter amount"
                    step="0.01"
                    min="0"
                    disabled={!!expense}
                  />
                  {expense && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                      Amount cannot be edited in existing expenses
                    </p>
                  )}
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base transition-all"
                    placeholder="Enter description"
                    disabled={!!expense}
                  />
                  {expense && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                      Description cannot be edited in existing expenses
                    </p>
                  )}
                </div>

                {/* Date Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4 text-green-600" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base transition-all"
                    disabled={!!expense}
                  />
                  {expense && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                      Date cannot be edited in existing expenses
                    </p>
                  )}
                </div>

                {/* Tag Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Tag className="w-4 h-4 text-orange-600" />
                    Tag
                  </label>
                  <ColoredSelect
                    value={tagId}
                    onChange={setTagId}
                    options={tags}
                    placeholder="Select a tag"
                    disabled={isLoadingTags}
                  />
                  {isLoadingTags && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      <span>Loading tags...</span>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="border-gray-200 hover:bg-gray-50 w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoadingTags}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto order-1 sm:order-2"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      expense ? 'Update Expense' : 'Add Expense'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 