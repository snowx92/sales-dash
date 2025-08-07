import { useState, useEffect } from 'react';
import { overviewService } from '@/lib/api/overview/overviewService';
import { SidebarCounters } from '@/lib/api/overview/type';

export const useSidebarCounters = () => {
  const [counters, setCounters] = useState<SidebarCounters | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await overviewService.getCounters();
      setCounters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch counters');
      console.error('Error fetching sidebar counters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounters();
  }, []);

  const refreshCounters = () => {
    fetchCounters();
  };

  return {
    counters,
    isLoading,
    error,
    refreshCounters
  };
};
