/**
 * Offline Queue - saves pending actions to localStorage when offline,
 * syncs them when the browser comes back online.
 */

const QUEUE_KEY = 'nutrivision-offline-queue';

interface QueuedAction {
  id: string;
  type: 'add_entry' | 'add_water' | 'add_weight' | 'add_exercise';
  data: any;
  timestamp: string;
}

export function getQueue(): QueuedAction[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addToQueue(action: Omit<QueuedAction, 'id' | 'timestamp'>): void {
  const queue = getQueue();
  queue.push({
    ...action,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function removeFromQueue(id: string): void {
  const queue = getQueue().filter((a) => a.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function clearQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
}

export function isOnline(): boolean {
  return navigator.onLine;
}
