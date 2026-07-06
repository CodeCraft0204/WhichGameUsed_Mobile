import type { Message } from '@/lib/messages';

export type MessageListItem =
  | { type: 'date'; key: string; label: string }
  | { type: 'message'; key: string; message: Message; showAvatar: boolean };

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function formatInboxWhen(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((startOfDay(now) - startOfDay(date)) / dayMs);

  if (diffDays === 0) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatMessageDayLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((startOfDay(now) - startOfDay(date)) / dayMs);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  }
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
}

export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function buildMessageListItems(messages: Message[]): MessageListItem[] {
  const items: MessageListItem[] = [];
  let lastDay = '';

  for (let i = 0; i < messages.length; i += 1) {
    const message = messages[i];
    const dayKey = new Date(message.createdAt).toDateString();
    if (dayKey !== lastDay) {
      items.push({
        type: 'date',
        key: `date-${dayKey}`,
        label: formatMessageDayLabel(message.createdAt)
      });
      lastDay = dayKey;
    }

    const prevMessage = messages[i - 1];
    const showAvatar =
      !message.isOwn &&
      (!prevMessage || prevMessage.isOwn || prevMessage.senderId !== message.senderId);

    items.push({
      type: 'message',
      key: message.id,
      message,
      showAvatar
    });
  }

  return items;
}
