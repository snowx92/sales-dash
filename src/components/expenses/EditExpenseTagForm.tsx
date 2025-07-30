'use client';

import { useState, useEffect } from 'react';
import { X, DollarSign, FileText, Tag, Calendar, Edit } from 'lucide-react';
import { Toast } from '@/components/ui/toast';
import { Expense } from '@/lib/api/expense/ExpenseService';
import { Tag as TagType, TagService } from '@/lib/api/expense/tags/TagService';
import ColoredSelect from '@/components/ui/colored-select';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface EditExpenseTagFormProps {
  onClose: () => void;
  onSubmit: (data: { tagId: string, amount: number, description: string, date: string }) => Promise<void>;
  expense: Expense;
}

const tagService = new TagService();

export default function EditExpenseTagForm({ onClose, onSubmit, expense }: EditExpenseTagFormProps) {
  const [tagId, setTagId] = useState(expense.tag.id);
  const [amount, setAmount] = useState(expense.amount);
  const [description, setDescription] = useState(expense.info);
  const [date, setDate] = useState(new Date(expense.date._seconds * 1000).toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<TagType[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);

  useEffect(() => {
    const loadTags = async () => {
      try {
        setIsLoadingTags(true);
        const response = await tagService.getTags();
        setTags(response);
        
        // If we have a tagId but no matching tag, try to fetch it
        if (expense.tag.id && !response.find(t => t.id === expense.tag.id)) {
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
  }, [expense.tag.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tagId || !date) {
      Toast.error({
        message: 'Please fill in all fields',
        description: 'Tag and date are required'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({ tagId, amount, description, date });
      onClose();
    } catch (error) {
      console.error('Error updating expense tag:', error);
      Toast.error({
        message: 'Failed to update expense tag',
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
          className="bg-white rounded-xl w-full h-full sm:h-auto sm:max-w-lg sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Edit className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Update Expense
                  </h2>
                  <p className="text-sm text-gray-500">
                    Modify expense details and category
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
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Amount
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base transition-all"
                    placeholder="Enter amount"
                    step="0.01"
                    min="0"
                  />
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base transition-all"
                    placeholder="Enter description"
                  />
                </div>

                {/* Date Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base transition-all"
                  />
                </div>

                {/* Tag Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Tag className="w-4 h-4 text-orange-600" />
                    Category Tag
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                      <span>Loading tags...</span>
                    </div>
                  )}
                </div>

                {/* Current vs New Info */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Current Expense Details</h4>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p><span className="font-medium">Original:</span> {expense.amount} {expense.currency} • {expense.info}</p>
                    <p><span className="font-medium">Tag:</span> {expense.tag.name}</p>
                    <p><span className="font-medium">Date:</span> {new Date(expense.date._seconds * 1000).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="border-gray-200 hover:bg-gray-50 w-full sm:w-auto order-2 sm:order-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoadingTags}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto order-1 sm:order-2"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </div>
                    ) : (
                      'Update Expense'
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