import { useState, useEffect, useCallback } from 'react';
import { retentionService } from '@/lib/api/retention/retentionService';
import { EndedSubscriptionsData, EndedSubscriptionItem, Period, FeedbackRequest } from '@/lib/api/retention/types';

export interface UseEndingPeriodOptions {
  initialPage?: number;
  initialLimit?: number;
  autoFetch?: boolean;
  period: Period;
}

export const useEndingPeriod = (options: UseEndingPeriodOptions) => {
  const {
    initialPage = 1,
    initialLimit = 100,
    autoFetch = true,
    period
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
  const [keyword, setKeyword] = useState<string>('');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW' | 'JUNK' | undefined>(undefined);

  // Fetch retention data
  const fetchEndingPeriodData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        period,
        pageNo: currentPage,
        limit,
        ...(keyword && { keyword }),
        ...(priority && { priority })
      };

      const response = await retentionService.getEndingInPeriod(params);

      if (response) {
        setData(response);
        setItems(response.items);
      } else {
        setData(null);
        setItems([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ending period data';
      setError(errorMessage);
      console.error('Error fetching ending period data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [period, currentPage, limit, keyword, priority]);

  // Submit feedback
  const submitFeedback = async (feedbackData: FeedbackRequest) => {
    try {
      setIsSubmittingFeedback(true);
      setError(null);

      const response = await retentionService.submitFeedback(feedbackData);

      await fetchEndingPeriodData();
      return response;
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
  const searchRetention = (searchQuery: string) => {
    setKeyword(searchQuery);
    setCurrentPage(1);
  };

  const filterByPriority = (newPriority: 'HIGH' | 'MEDIUM' | 'LOW' | 'JUNK' | undefined) => {
    setPriority(newPriority);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setKeyword('');
    setPriority(undefined);
    setCurrentPage(1);
  };

  const refreshData = () => {
    fetchEndingPeriodData();
  };

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchEndingPeriodData();
    }
  }, [fetchEndingPeriodData, autoFetch]);

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
    keyword,
    priority,
    limit,

    // Actions
    submitFeedback,
    fetchEndingPeriodData,
    refreshData,

    // Navigation
    goToPage,
    nextPage,
    previousPage,

    // Filtering
    searchRetention,
    filterByPriority,
    clearFilters,

    // Settings
    setLimit,
  };
};
