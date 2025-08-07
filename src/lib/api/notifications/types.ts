// Root response
export interface NotificationsResponse {
  status: number;
  message: string;
  data: NotificationsData;
}

// Main notifications data object
export interface NotificationsData {
  newNotifications: number;
  items: NotificationItem[];
  pageItems: number;
  totalItems: number;
  isLastPage: boolean;
  nextPageNumber: number;
  currentPage: number;
  totalPages: number;
}

// Individual notification item
export interface NotificationItem {
  id: string;
  relatedId: string;
  route: string;
  date: FirestoreTimestamp;
  icon: string;
  isNew: boolean;
  content: NotificationContent;
}

// Firestore timestamp format
export interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

// Notification content
export interface NotificationContent {
  title: string;
  body: string;
}
