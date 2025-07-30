'use client';

import React, { useState } from 'react';
import { Search, Plus, Tag as TagIcon, Palette } from 'lucide-react';
import { getUniqueColor } from '@/helpers/helpers';
import ActionDropdown from './ActionDropdown';
import AddTagForm from './AddTagForm';
import { Tag } from '@/lib/api/expense/tags/TagService';
import ConfirmToast from '@/components/ui/confirm-toast';
import { ResponsiveCard } from '@/components/layout/ResponsiveWrapper';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface TagsTableProps {
  tags: Tag[];
  isLoading: boolean;
  onAdd: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

// Mobile tag card component
const MobileTagCard = ({ 
  tag, 
  onEdit, 
  onDelete 
}: {
  tag: Tag;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { backgroundColor, textColor } = getUniqueColor(tag.name);
  
  return (
    <ResponsiveCard padding="md" className="hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Color Preview */}
          <div className="relative">
            <div
              className="w-12 h-12 rounded-xl shadow-md border-2 border-white"
              style={{ backgroundColor }}
            />
            <div className="absolute -top-1 -right-1">
              <Palette className="h-4 w-4 text-gray-400 bg-white rounded-full p-0.5" />
            </div>
          </div>
          
          {/* Tag Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <TagIcon className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-500">Tag Name</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 truncate">{tag.name}</h3>
            <div className="mt-2">
              <span 
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor, color: textColor }}
              >
                {tag.name}
              </span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="ml-2">
          <ActionDropdown onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </ResponsiveCard>
  );
};

export default function TagsTable({
  tags,
  isLoading,
  onAdd,
  onUpdate,
  onDelete
}: TagsTableProps) {
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  const handleEditTag = (tag: Tag) => {
    setSelectedTag(tag);
  };

  const handleDeleteTag = (tag: Tag) => {
    setTagToDelete(tag);
  };

  const handleUpdateTag = async (name: string) => {
    if (!selectedTag) return;
    try {
      await onUpdate(selectedTag.id, name);
      setSelectedTag(null);
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  };

  const handleAddTag = async (name: string) => {
    try {
      await onAdd(name);
      setIsAddingTag(false);
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const confirmDelete = async () => {
    if (!tagToDelete) return;
    try {
      await onDelete(tagToDelete.id);
      setTagToDelete(null);
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* Header with Search and Add Button */}
      <ResponsiveCard padding="md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tags..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base transition-all"
            />
          </div>
          <Button
            onClick={() => setIsAddingTag(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Tag
          </Button>
        </div>
      </ResponsiveCard>

      {/* Mobile View */}
      <div className="lg:hidden">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <ResponsiveCard key={i} padding="md" className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </div>
                </div>
              </ResponsiveCard>
            ))}
          </div>
        ) : filteredTags.length === 0 ? (
          <ResponsiveCard padding="md" className="text-center">
            <div className="py-8">
              <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No tags found' : 'No tags yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search term' : 'Get started by creating your first tag'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setIsAddingTag(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Tag
                </Button>
              )}
            </div>
          </ResponsiveCard>
        ) : (
          <div className="space-y-4">
            {filteredTags.map((tag, index) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MobileTagCard
                  tag={tag}
                  onEdit={() => handleEditTag(tag)}
                  onDelete={() => handleDeleteTag(tag)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <ResponsiveCard padding="none" className="overflow-hidden">
          <div className="grid grid-cols-[2fr,1fr,auto] px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="text-sm font-semibold text-gray-700">Name</div>
            <div className="text-sm font-semibold text-gray-700">Color Preview</div>
            <div className="w-10"></div>
          </div>

          {isLoading ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <span>Loading tags...</span>
              </div>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              {searchTerm ? 'No tags found matching your search' : 'No tags found'}
            </div>
          ) : (
            filteredTags.map((tag) => {
              const { backgroundColor, textColor } = getUniqueColor(tag.name);
              return (
                <div
                  key={tag.id}
                  className="grid grid-cols-[2fr,1fr,auto] px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="text-sm text-gray-900 font-medium">{tag.name}</div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg shadow-sm border border-gray-200"
                      style={{ backgroundColor }}
                    />
                    <span 
                      className="text-sm font-medium px-3 py-1 rounded-full"
                      style={{ backgroundColor, color: textColor }}
                    >
                      {tag.name}
                    </span>
                  </div>
                  <div>
                    <ActionDropdown
                      onEdit={() => handleEditTag(tag)}
                      onDelete={() => handleDeleteTag(tag)}
                    />
                  </div>
                </div>
              );
            })
          )}
        </ResponsiveCard>
      </div>

      {/* Modals and Dialogs */}
      {tagToDelete && (
        <ConfirmToast
          message={`Are you sure you want to delete the tag "${tagToDelete.name}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setTagToDelete(null)}
        />
      )}

      {(isAddingTag || selectedTag) && (
        <AddTagForm
          onClose={() => {
            setIsAddingTag(false);
            setSelectedTag(null);
          }}
          onSubmit={selectedTag ? handleUpdateTag : handleAddTag}
          tag={selectedTag}
        />
      )}
    </div>
  );
} 