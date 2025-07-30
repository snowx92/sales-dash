export enum SessionKeys {
  AUTH_TOKEN = 'vondera_auth_token',
  AUTH_EMAIL = 'vondera_auth_email',
  AUTH_REFRESH_TOKEN = 'vondera_auth_refresh_token',
  USER_DATA = 'vondera_user_data'
}

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
    if (typeof window !== 'undefined') {
      localStorage.setItem(SessionKeys.AUTH_TOKEN, token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SessionKeys.AUTH_TOKEN);
    }
    return null;
  }

  async getCurrentToken(): Promise<string | null> {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(SessionKeys.AUTH_TOKEN);
      return token;
    }
    return null;
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SessionKeys.AUTH_TOKEN);
      localStorage.removeItem(SessionKeys.AUTH_EMAIL);
      localStorage.removeItem(SessionKeys.AUTH_REFRESH_TOKEN);
      localStorage.removeItem(SessionKeys.USER_DATA);
    }
  }

  setUserData(userData: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SessionKeys.USER_DATA, JSON.stringify(userData));
    }
  }

  getUserData(): any | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(SessionKeys.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  clearSession(): void {
    this.removeToken();
  }
} 