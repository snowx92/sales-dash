import { useEffect } from 'react';
import type { PageTitle } from '../config/page-titles';

export function usePageTitle(title: PageTitle) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = title;
    }
  }, [title]);
} 