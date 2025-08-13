import React, { createContext, useContext, useEffect, useState, useCallback, PropsWithChildren } from 'react';

interface PrivacyContextValue {
  enabled: boolean;
  toggle: () => void;
}

const PrivacyContext = createContext<PrivacyContextValue>({
  enabled: false,
  // default no-op so hook works without provider
  toggle: () => {}
});

interface ProviderProps extends PropsWithChildren {
  initialEnabled?: boolean;
}

export function PrivacyProvider({ children, initialEnabled = false }: ProviderProps) {
  const [enabled, setEnabled] = useState(initialEnabled);

  const toggle = useCallback(() => setEnabled(e => !e), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
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

