import { MyReminder } from '@/lib/types/reminder';

const STORAGE_KEY = 'myReminders';

export const reminderStorage = {
  // Get all reminders from session storage
  getAll(): MyReminder[] {
    if (typeof window === 'undefined') return [];

    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading reminders from session storage:', error);
      return [];
    }
  },

  // Add a new reminder
  add(reminder: Omit<MyReminder, 'id' | 'createdAt'>): MyReminder {
    const newReminder: MyReminder = {
      ...reminder,
      id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    const reminders = this.getAll();
    reminders.push(newReminder);
    this.save(reminders);

    return newReminder;
  },

  // Update a reminder
  update(id: string, updates: Partial<MyReminder>): void {
    const reminders = this.getAll();
    const index = reminders.findIndex(r => r.id === id);

    if (index !== -1) {
      reminders[index] = { ...reminders[index], ...updates };
      this.save(reminders);
    }
  },

  // Delete a reminder
  delete(id: string): void {
    const reminders = this.getAll();
    const filtered = reminders.filter(r => r.id !== id);
    this.save(filtered);
  },

  // Mark as completed/incomplete
  toggleComplete(id: string): void {
    const reminders = this.getAll();
    const reminder = reminders.find(r => r.id === id);

    if (reminder) {
      reminder.completed = !reminder.completed;
      this.save(reminders);
    }
  },

  // Get reminders for a specific entity
  getByEntity(type: 'lead' | 'retention', entityId: string | number): MyReminder[] {
    return this.getAll().filter(
      r => r.type === type && r.entityId.toString() === entityId.toString()
    );
  },

  // Get upcoming reminders (not completed and date is in the future or today)
  getUpcoming(): MyReminder[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return this.getAll()
      .filter(r => !r.completed && new Date(r.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  // Get overdue reminders (not completed and date is in the past)
  getOverdue(): MyReminder[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return this.getAll()
      .filter(r => !r.completed && new Date(r.date) < now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  // Save reminders to session storage
  save(reminders: MyReminder[]): void {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    } catch (error) {
      console.error('Error saving reminders to session storage:', error);
    }
  },

  // Clear all reminders
  clear(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEY);
  }
};
