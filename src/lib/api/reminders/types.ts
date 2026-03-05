import type { FirestoreDateInput } from "@/lib/utils/firestoreDate";

export type ReminderSourceType = "lead" | "retention" | "other";
export type ReminderStatus = "OPENED" | "DONE" | "DISCARDED";

export interface ReminderParentData {
  id?: string;
  name?: string;
  storeName?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

export interface SalesReminder {
  id: string;
  parentId: string;
  sourceType: ReminderSourceType;
  date: FirestoreDateInput;
  note: string;
  uid?: string;
  status?: ReminderStatus;
  createdAt?: FirestoreDateInput;
  updatedAt?: FirestoreDateInput;
  parentData?: ReminderParentData | null;
}

export interface ReminderQueryParams {
  parentId?: string;
  sourceType?: ReminderSourceType;
  from?: string;
  to?: string;
  status?: ReminderStatus;
}

export interface CreateReminderRequest extends Record<string, unknown> {
  sourceType: ReminderSourceType;
  parentId?: string;
  date: string;
  note: string;
}

export interface UpdateReminderRequest extends Record<string, unknown> {
  sourceType?: ReminderSourceType;
  parentId?: string;
  date?: string;
  note?: string;
}
