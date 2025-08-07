import { useState, useEffect, useCallback } from 'react';
import { retentionService } from '@/lib/api/retention/retentionService';
import { EndedSubscriptionsData, EndedSubscriptionItem, Priority, FeedbackRequest } from '@/lib/api/retention/types';

export interface UseRetentionOptions {
  initialPage?: number;
  initialLimit?: number;
  initialPriority?: Priority;
  autoFetch?: boolean;
}

export const useRetention = (options: UseRetentionOptions = {}) => {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialPriority,
    autoFetch = true
  } = options;

  // State
  const [data, setData] = useState<EndedSubscriptionsData | null>(null);
  const [items, setItems] = useState<EndedSubscriptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [priority, setPriority] = useState<Priority | undefined>(initialPriority);
  const [search, setSearch] = useState<string>('');

  // Fetch retention data
  const fetchRetentionData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        pageNo: currentPage,
        limit,
        ...(priority && { priority }),
        ...(search && { search })
      };

      const response = await retentionService.getEndedSubscriptions(params);
      
      if (response) {
        setData(response);
        setItems(response.items);
      } else {
        setData(null);
        setItems([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch retention data';
      setError(errorMessage);
      console.error('Error fetching retention data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, priority, search]);

  // Submit feedback
  const submitFeedback = async (feedbackData: FeedbackRequest) => {
    try {
      setIsSubmittingFeedback(true);
      setError(null);

      const response = await retentionService.submitFeedback(feedbackData);
      
      if (response) {
        // Refresh data after successful feedback submission
        await fetchRetentionData();
        return response;
      }
      
      throw new Error('Failed to submit feedback');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit feedback';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Navigation functions
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    if (data && !data.isLastPage) {
      setCurrentPage(data.nextPageNumber);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Filter functions
  const filterByPriority = (newPriority: Priority | undefined) => {
    setPriority(newPriority);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const searchRetention = (searchQuery: string) => {
    setSearch(searchQuery);
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearFilters = () => {
    setPriority(undefined);
    setSearch('');
    setCurrentPage(1);
  };

  const refreshData = () => {
    fetchRetentionData();
  };

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchRetentionData();
    }
  }, [fetchRetentionData, autoFetch]);

  return {
    // Data
    data,
    items,
    isLoading,
    error,
    isSubmittingFeedback,

    // Pagination info
    currentPage,
    totalPages: data?.totalPages || 0,
    totalItems: data?.totalItems || 0,
    isLastPage: data?.isLastPage || true,
    hasNextPage: !data?.isLastPage,
    hasPreviousPage: currentPage > 1,

    // Current filters
    priority,
    search,
    limit,

    // Actions
    submitFeedback,
    fetchRetentionData,
    refreshData,

    // Navigation
    goToPage,
    nextPage,
    previousPage,

    // Filtering
    filterByPriority,
    searchRetention,
    clearFilters,

    // Settings
    setLimit,
  };
};
