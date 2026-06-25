import React, { createContext, useContext, useMemo, useRef } from 'react';
import {
  Animated,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps
} from 'react-native';

export type ContextHeaderScrollContextValue = {
  scrollY: Animated.Value;
  buildScrollHandler: (
    existing?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
  ) => (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

const ContextHeaderScrollContext = createContext<ContextHeaderScrollContextValue | null>(null);

export function ContextHeaderScrollProvider({ children }: { children: React.ReactNode }) {
  const scrollY = useRef(new Animated.Value(0)).current;

  const buildScrollHandler = useMemo(() => {
    return (existing?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void) =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: false,
        listener: existing
      });
  }, [scrollY]);

  const value = useMemo<ContextHeaderScrollContextValue>(
    () => ({ scrollY, buildScrollHandler }),
    [scrollY, buildScrollHandler]
  );

  return (
    <ContextHeaderScrollContext.Provider value={value}>{children}</ContextHeaderScrollContext.Provider>
  );
}

export function useContextHeaderScroll(): ContextHeaderScrollContextValue | null {
  return useContext(ContextHeaderScrollContext);
}

/** Merge scroll-tracking into FigmaScreen scrollProps for single-scroll pages. */
export function useContextHeaderScrollProps(scrollProps?: ScrollViewProps): ScrollViewProps {
  const ctx = useContextHeaderScroll();
  if (!ctx) return scrollProps ?? {};

  return {
    ...scrollProps,
    onScroll: ctx.buildScrollHandler(scrollProps?.onScroll),
    scrollEventThrottle: scrollProps?.scrollEventThrottle ?? 16
  };
}
