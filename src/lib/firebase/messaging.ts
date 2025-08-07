import { getMessaging, getToken, onMessage, type Messaging, type MessagePayload } from "firebase/messaging";
import { getFirebaseApp } from "../firebase";
import { notificationService } from "../api/notifications";

class FirebaseMessagingService {
  private messaging: Messaging | null = null;
  private vapidKey: string | undefined;

  constructor() {
    this.vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  }

  /**
   * Initialize Firebase Messaging
   * Only call this on the client side
   */
  private async initializeMessaging(): Promise<Messaging | null> {
    try {
      if (typeof window === 'undefined') {
        console.warn("🚫 Firebase Messaging: Cannot initialize on server side");
        return null;
      }

      const app = getFirebaseApp();
      if (!app) {
        console.warn("🚫 Firebase Messaging: Firebase app not initialized");
        return null;
      }

      if (!this.messaging) {
        this.messaging = getMessaging(app);
        console.log("✅ Firebase Messaging: Initialized successfully");
      }

      return this.messaging;
    } catch (error) {
      console.error("🚨 Firebase Messaging: Initialization error:", error);
      return null;
    }
  }

  /**
   * Request notification permission and get FCM token
   * @returns Promise<string | null> - FCM token or null if failed
   */
  async requestPermissionAndGetToken(): Promise<string | null> {
    try {
      if (typeof window === 'undefined') {
        console.warn("🚫 Firebase Messaging: Cannot request permission on server side");
        return null;
      }

      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.warn("🚫 Firebase Messaging: Notifications not supported in this browser");
        return null;
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      console.log("🔔 Firebase Messaging: Permission status:", permission);

      if (permission !== 'granted') {
        console.warn("⚠️ Firebase Messaging: Notification permission denied");
        return null;
      }

      const messaging = await this.initializeMessaging();
      if (!messaging) {
        return null;
      }

      if (!this.vapidKey) {
        console.warn("⚠️ Firebase Messaging: VAPID key not configured");
        return null;
      }

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: this.vapidKey
      });

      if (token) {
        console.log("✅ Firebase Messaging: FCM token obtained:", token.substring(0, 20) + "...");
        
        // Automatically register token with backend
        await this.registerTokenWithBackend(token);
        
        return token;
      } else {
        console.warn("⚠️ Firebase Messaging: No registration token available");
        return null;
      }
    } catch (error) {
      console.error("🚨 Firebase Messaging: Error getting token:", error);
      return null;
    }
  }

  /**
   * Register FCM token with backend
   * @param token - FCM token to register
   */
  private async registerTokenWithBackend(token: string): Promise<void> {
    try {
      console.log("📡 Firebase Messaging: Registering token with backend...");
      await notificationService.registerFCMToken(token);
    } catch (error) {
      console.error("🚨 Firebase Messaging: Error registering token with backend:", error);
    }
  }

  /**
   * Set up foreground message listener
   * @param callback - Function to call when message is received
   */
  setupForegroundMessageListener(callback: (payload: MessagePayload) => void): void {
    this.initializeMessaging().then((messaging) => {
      if (messaging) {
        onMessage(messaging, (payload) => {
          console.log("📨 Firebase Messaging: Foreground message received:", payload);
          callback(payload);
        });
      }
    });
  }

  /**
   * Check and update FCM token periodically
   * Call this method periodically to check for token updates
   */
  async checkAndUpdateToken(): Promise<void> {
    try {
      const messaging = await this.initializeMessaging();
      if (!messaging || !this.vapidKey) {
        return;
      }

      const currentToken = await getToken(messaging, {
        vapidKey: this.vapidKey
      });

      if (currentToken && notificationService.needsTokenUpdate(currentToken)) {
        console.log("🔄 Firebase Messaging: Token needs update, registering new token...");
        await notificationService.updateFCMToken(currentToken);
      }
    } catch (error) {
      console.error("🚨 Firebase Messaging: Error checking token update:", error);
    }
  }

  /**
   * Clear FCM token (useful for logout)
   */
  clearToken(): void {
    console.log("🧹 Firebase Messaging: Clearing FCM token...");
    notificationService.clearFCMToken();
  }
}

// Create and export singleton instance
export const firebaseMessaging = new FirebaseMessagingService();
export default firebaseMessaging;
