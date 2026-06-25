import type { ContextHeaderPageKey } from '@/constants/contextHeaderContent';

const dismissed = new Set<ContextHeaderPageKey>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function isContextHeaderDismissed(key: ContextHeaderPageKey): boolean {
  return dismissed.has(key);
}

export function dismissContextHeader(key: ContextHeaderPageKey): void {
  if (dismissed.has(key)) return;
  dismissed.add(key);
  notify();
}

export function resetContextHeaders(): void {
  if (dismissed.size === 0) return;
  dismissed.clear();
  notify();
}

export function subscribeContextHeaderSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
