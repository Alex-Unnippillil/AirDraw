import React, { createContext, useContext, useRef, type ReactNode } from 'react';
import { CommandBus } from '@airdraw/core';
import type { AppCommands } from '../commands';

export const CommandBusContext = createContext<CommandBus<AppCommands> | null>(null);

export interface CommandBusProviderProps {
  bus?: CommandBus<AppCommands>;
  children: ReactNode;
}

export function CommandBusProvider({ bus, children }: CommandBusProviderProps) {
  const busRef = useRef(bus ?? new CommandBus<AppCommands>());
  return (
    <CommandBusContext.Provider value={busRef.current}>
      {children}
    </CommandBusContext.Provider>
  );
}

export function useCommandBus() {
  const ctx = useContext(CommandBusContext);
  if (!ctx) throw new Error('useCommandBus must be used within a CommandBusProvider');
  return ctx;
}
