import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import {
  forumEmojiTextStyle,
  forumUserTextStyle,
  isForumEmojiOnly
} from '@/constants/discussionContent';

type Props = TextProps & {
  children: string;
  variant?: 'body' | 'comment';
  t: (n: number) => number;
};

export function ForumUserText({ children, variant = 'body', t, style, ...rest }: Props) {
  const emojiOnly = isForumEmojiOnly(children);
  const base: TextStyle = emojiOnly
    ? forumEmojiTextStyle(t, variant === 'comment' ? 28 : 30)
    : variant === 'comment'
      ? forumUserTextStyle(t, 15, 20)
      : forumUserTextStyle(t, 16, 22);

  return (
    <Text {...rest} style={[base, emojiOnly && styles.emojiOnly, style]}>
      {children}
    </Text>
  );
}

const styles = {
  emojiOnly: {
    letterSpacing: 1
  } as TextStyle
};
