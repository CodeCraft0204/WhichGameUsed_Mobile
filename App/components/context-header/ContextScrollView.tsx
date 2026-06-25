import React, { forwardRef, useMemo } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';
import { useContextHeaderScroll } from '@/context/ContextHeaderScrollContext';

type Props = ScrollViewProps;

export const ContextScrollView = forwardRef<ScrollView, Props>(function ContextScrollView(
  { onScroll, scrollEventThrottle = 16, ...rest },
  ref
) {
  const ctx = useContextHeaderScroll();

  const mergedOnScroll = useMemo(() => {
    if (!ctx) return onScroll;
    return ctx.buildScrollHandler(onScroll);
  }, [ctx, onScroll]);

  return (
    <ScrollView
      ref={ref}
      onScroll={mergedOnScroll}
      scrollEventThrottle={scrollEventThrottle}
      {...rest}
    />
  );
});
