import { useEffect, useState } from 'react';
import { firebaseMessaging } from '../firebase/messaging';
import type { MessagePayload } from 'firebase/messaging';

export interface UseFirebaseMessagingOptions {
  autoRequestPermission?: boolean;
  enableForegroundListener?: boolean;
  onForegroundMessage?: (payload: MessagePayload) => void;
}

export interface UseFirebaseMessagingReturn {
  token: string | null;
  permission: NotificationPermission | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
  clearToken: () => void;
}

export function useFirebaseMessaging(options: UseFirebaseMessagingOptions = {}): UseFirebaseMessagingReturn {
  const {
    autoRequestPermission = false,
    enableForegroundListener = true,
    onForegroundMessage
  } = options;

  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get current permission status
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request permission and get token
  const requestPermission = async () => {
    try {
      setLoading(true);
      setError(null);

      const fcmToken = await firebaseMessaging.requestPermissionAndGetToken();
      
      if (fcmToken) {
        setToken(fcmToken);
        setPermission('granted');
      } else {
        setError('Failed to get FCM token');
      }
    } catch (err) {
      console.error('Error requesting FCM permission:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Clear token
  const clearToken = () => {
    firebaseMessaging.clearToken();
    setToken(null);
  };

  // Auto request permission if enabled
  useEffect(() => {
    if (autoRequestPermission && permission !== 'granted') {
      requestPermission();
    }
  }, [autoRequestPermission, permission]);

  // Set up foreground message listener
  useEffect(() => {
    if (enableForegroundListener) {
      const handleForegroundMessage = (payload: MessagePayload) => {
        console.log('📨 Foreground message received:', payload);
        
        // Call custom handler if provided
        onForegroundMessage?.(payload);
        
        // Show browser notification if permission is granted
        if (Notification.permission === 'granted' && payload.notification) {
          new Notification(
            payload.notification.title || 'New Notification',
            {
              body: payload.notification.body,
              icon: payload.notification.icon || '/favicon.png'
            }
          );
        }
      };

      firebaseMessaging.setupForegroundMessageListener(handleForegroundMessage);
    }
  }, [enableForegroundListener, onForegroundMessage]);

  // Periodically check for token updates
  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        firebaseMessaging.checkAndUpdateToken();
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [token]);

  return {
    token,
    permission,
    loading,
    error,
    requestPermission,
    clearToken
  };
}

export default useFirebaseMessaging;
