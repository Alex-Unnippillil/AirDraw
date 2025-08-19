import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

interface PrivacyContextValue {
  enabled: boolean;
  toggle: () => void;
}

const PrivacyContext = createContext<PrivacyContextValue>({
  enabled: false,
  toggle: () => {},
});

let currentEnabled = false;
export function isPrivacyEnabled() {
  return currentEnabled;
}

export interface PrivacyProviderProps {
  children: ReactNode;
  initialEnabled?: boolean;
}

export function PrivacyProvider({ children, initialEnabled = false }: PrivacyProviderProps) {
  const [enabled, setEnabled] = useState(initialEnabled);

  const toggle = useCallback(() => setEnabled(e => !e), []);

  useEffect(() => {
    currentEnabled = enabled;
  }, [enabled]);

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
