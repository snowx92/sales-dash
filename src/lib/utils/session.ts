import AUTH_CONFIG from "@/lib/config/auth";

export enum SessionKeys {
  AUTH_TOKEN = 'vondera_auth_token',
  AUTH_EMAIL = 'vondera_auth_email',
  AUTH_REFRESH_TOKEN = 'vondera_auth_refresh_token',
  FIREBASE_REFRESH_TOKEN = 'vondera_firebase_refresh_token',
  USER_DATA = 'vondera_user_data',
  DEVICE_ID = 'vondera_device_id',
  ACCOUNT_TYPE = 'vondera_account_type'
}

// Safe localStorage operations that won't cause hydration issues
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  }
};

export class SessionManager {
  private static instance: SessionManager;

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private constructor() {}

  setToken(token: string): void {
    console.log("💾 SessionManager: Storing token...");
    safeLocalStorage.setItem(SessionKeys.AUTH_TOKEN, token);
    console.log("💾 SessionManager: Token stored successfully");
  }

  getToken(): string | null {
    const token = safeLocalStorage.getItem(SessionKeys.AUTH_TOKEN);
    console.log("💾 SessionManager: Getting token:", token ? "TOKEN_EXISTS" : "NO_TOKEN");
    return token;
  }

  setFirebaseRefreshToken(refreshToken: string): void {
    safeLocalStorage.setItem(SessionKeys.FIREBASE_REFRESH_TOKEN, refreshToken);
  }

  getFirebaseRefreshToken(): string | null {
    return safeLocalStorage.getItem(SessionKeys.FIREBASE_REFRESH_TOKEN);
  }

  setEmail(email: string): void {
    safeLocalStorage.setItem(SessionKeys.AUTH_EMAIL, email);
  }

  getEmail(): string | null {
    return safeLocalStorage.getItem(SessionKeys.AUTH_EMAIL);
  }

  setAccountType(accountType: string): void {
    safeLocalStorage.setItem(SessionKeys.ACCOUNT_TYPE, accountType);
  }

  getAccountType(): string | null {
    return safeLocalStorage.getItem(SessionKeys.ACCOUNT_TYPE);
  }

  async getCurrentToken(): Promise<string | null> {
    return this.getToken();
  }

  removeToken(): void {
    safeLocalStorage.removeItem(SessionKeys.AUTH_TOKEN);
    safeLocalStorage.removeItem(SessionKeys.AUTH_EMAIL);
    safeLocalStorage.removeItem(SessionKeys.AUTH_REFRESH_TOKEN);
    safeLocalStorage.removeItem(SessionKeys.FIREBASE_REFRESH_TOKEN);
    safeLocalStorage.removeItem(SessionKeys.USER_DATA);
    safeLocalStorage.removeItem(SessionKeys.ACCOUNT_TYPE);
  }

  setUserData(userData: unknown): void {
    safeLocalStorage.setItem(SessionKeys.USER_DATA, JSON.stringify(userData));
  }

  getUserData(): unknown | null {
    const userData = safeLocalStorage.getItem(SessionKeys.USER_DATA);
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  clearSession(): void {
    this.removeToken();
  }

  // Device ID management
  getDeviceId(): string {
    let deviceId = safeLocalStorage.getItem(SessionKeys.DEVICE_ID);
    if (!deviceId) {
      // Generate a random device ID and store it
      deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      safeLocalStorage.setItem(SessionKeys.DEVICE_ID, deviceId);
    }
    return deviceId;
  }

  // Browser detection utility
  getBrowserInfo(): string {
    if (typeof window === 'undefined') return 'Unknown Browser';
    
    const userAgent = window.navigator.userAgent;
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      return 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      return 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'Safari';
    } else if (userAgent.includes('Edg')) {
      return 'Edge';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      return 'Opera';
    }
    
    return 'Unknown Browser';
  }
}
