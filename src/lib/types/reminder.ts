export interface MyReminder {
  id: string;
  type: 'lead' | 'retention';
  entityId: string | number; // Lead ID or Merchant ID
  entityName: string;
  entityEmail?: string;
  entityPhone?: string;
  date: string; // ISO date string
  note: string;
  createdAt: string;
  completed: boolean;
}

export interface MyReminderFormData {
  date: string;
  note: string;
}
