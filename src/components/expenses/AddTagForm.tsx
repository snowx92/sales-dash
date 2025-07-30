'use client';

import { useState, useEffect } from 'react';
import { X, Tag, Palette } from 'lucide-react';
import { Toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { getUniqueColor } from '@/helpers/helpers';

interface Tag {
  id: string;
  name: string;
}

interface AddTagFormProps {
  onClose: () => void;
  onSubmit: (name: string) => void;
  tag?: Tag | null;
}

export default function AddTagForm({ onClose, onSubmit, tag }: AddTagFormProps) {
  const [name, setName] = useState(tag?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tag) {
      setName(tag.name);
    }
  }, [tag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      Toast.error({
        message: 'Please enter a tag name',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(name);
      onClose();
    } catch (error) {
      console.error('Error submitting tag:', error);
      Toast.error({
        message: 'Failed to save tag',
        description: 'Please try again later'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get color preview for current name
  const { backgroundColor, textColor } = getUniqueColor(name || 'Preview');

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
                  <Tag className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {tag ? 'Edit Tag' : 'Add New Tag'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {tag ? 'Update tag information' : 'Create a new expense tag'}
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
                {/* Tag Name Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Tag className="w-4 h-4 text-purple-600" />
                    Tag Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter tag name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base transition-all"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500">
                    Choose a descriptive name for your expense category
                  </p>
                </div>

                {/* Color Preview */}
                {name.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Palette className="w-4 h-4 text-orange-600" />
                      Color Preview
                    </label>
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div
                        className="w-12 h-12 rounded-xl shadow-md border-2 border-white"
                        style={{ backgroundColor }}
                      />
                      <div className="flex-1">
                        <span 
                          className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                          style={{ backgroundColor, color: textColor }}
                        >
                          {name}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          This color will be automatically assigned to your tag
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

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
                    disabled={isSubmitting || !name.trim()}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto order-1 sm:order-2"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      tag ? 'Update Tag' : 'Add Tag'
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