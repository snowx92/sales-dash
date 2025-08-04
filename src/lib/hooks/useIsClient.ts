import { useEffect, useState } from 'react';

/**
 * Hook to check if code is running on the client side
 * This helps avoid hydration mismatches
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
