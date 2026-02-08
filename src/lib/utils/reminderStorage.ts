import { MyReminder } from '@/lib/types/reminder';

const STORAGE_KEY = 'myReminders';
const MIGRATION_KEY = 'myReminders_migrated';

export const reminderStorage = {
  // Migrate existing sessionStorage data to localStorage (one-time)
  migrate(): void {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(MIGRATION_KEY)) return;

    try {
      const sessionData = sessionStorage.getItem(STORAGE_KEY);
      if (sessionData) {
        const existing = localStorage.getItem(STORAGE_KEY);
        if (!existing) {
          localStorage.setItem(STORAGE_KEY, sessionData);
        }
        sessionStorage.removeItem(STORAGE_KEY);
      }
      localStorage.setItem(MIGRATION_KEY, 'true');
    } catch {
      // Ignore migration errors
    }
  },

  // Get all reminders from localStorage
  getAll(): MyReminder[] {
    if (typeof window === 'undefined') return [];
    this.migrate();

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading reminders from storage:', error);
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

  // Save reminders to localStorage
  save(reminders: MyReminder[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    } catch (error) {
      console.error('Error saving reminders to storage:', error);
    }
  },

  // Clear all reminders
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
};
