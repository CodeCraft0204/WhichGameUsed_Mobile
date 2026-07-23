import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode
} from 'react';

type Handler = () => void;

type UtilitySearchContextValue = {
  registerSearchHandler: (handler: Handler) => () => void;
  triggerSearch: () => boolean;
};

const UtilitySearchContext = createContext<UtilitySearchContextValue | null>(null);

export { UtilitySearchContext };

export function UtilitySearchProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<Handler | null>(null);

  const registerSearchHandler = useCallback((handler: Handler) => {
    handlerRef.current = handler;
    return () => {
      if (handlerRef.current === handler) handlerRef.current = null;
    };
  }, []);

  const triggerSearch = useCallback(() => {
    if (!handlerRef.current) return false;
    handlerRef.current();
    return true;
  }, []);

  const value = useMemo(
    () => ({ registerSearchHandler, triggerSearch }),
    [registerSearchHandler, triggerSearch]
  );

  return (
    <UtilitySearchContext.Provider value={value}>{children}</UtilitySearchContext.Provider>
  );
}

export function useUtilitySearch(): UtilitySearchContextValue {
  const ctx = useContext(UtilitySearchContext);
  if (!ctx) {
    throw new Error('useUtilitySearch must be used within UtilitySearchProvider');
  }
  return ctx;
}

/** Register the page's search focus / open-search action while mounted. */
export function useRegisterUtilitySearch(handler: Handler | null) {
  const { registerSearchHandler } = useUtilitySearch();
  useEffect(() => {
    if (!handler) return;
    return registerSearchHandler(handler);
  }, [handler, registerSearchHandler]);
}
