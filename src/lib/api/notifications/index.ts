// Export notification service and types
export { notificationService, NotificationService } from './notificationService';
export type {
  GetNotificationsRequest,
  ReadAllNotificationsResponse,
  FCMTokenRequest,
  FCMTokenResponse
} from './notificationService';

export type {
  NotificationsResponse,
  NotificationsData,
  NotificationItem,
  FirestoreTimestamp,
  NotificationContent
} from './types';
