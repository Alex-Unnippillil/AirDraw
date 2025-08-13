import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

interface PrivacyContextValue {
  enabled: boolean;
  toggle: () => void;
}

const PrivacyContext = createContext<PrivacyContextValue>({ enabled: false, toggle: () => {} });

let currentEnabled = false;
export function isPrivacyEnabled() {
  return currentEnabled;
}

export interface PrivacyProviderProps {
  children: ReactNode;
}

export function PrivacyProvider({ children }: PrivacyProviderProps) {
  const [enabled, setEnabled] = useState(false);

  const toggle = useCallback(() => setEnabled(e => !e), []);

  useEffect(() => {
    currentEnabled = enabled;
  }, [enabled]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  return (
    <PrivacyContext.Provider value={{ enabled, toggle }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}

export default PrivacyContext;
