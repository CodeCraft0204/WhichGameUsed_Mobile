import { Redirect, useLocalSearchParams } from 'expo-router';
import { messageConversationHref, messagesInboxHref } from '@/constants/navigation';

/** Legacy route — redirects to /messages/[conversationId]. */
export default function LegacyMessageThreadRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return <Redirect href={messagesInboxHref()} />;
  return <Redirect href={messageConversationHref(id)} />;
}
