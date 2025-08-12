/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { App, bus } from '../src/main';
import { afterEach, describe, it, expect, vi } from 'vitest';

let mockGesture: string = 'idle';
vi.mock('../src/hooks/useHandTracking', () => ({
  useHandTracking: () => ({ videoRef: { current: null }, gesture: mockGesture })
}));

vi.mock('../src/ai/copilot', () => ({
  parsePrompt: vi.fn()
}));
import { parsePrompt } from '../src/ai/copilot';

describe('App', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockGesture = 'idle';
  });
  it('shows palette only when gesture is palette', () => {
    const { rerender } = render(<App />);
    expect(screen.queryByText('Black')).toBeNull();
    mockGesture = 'palette';
    rerender(<App />);
    expect(screen.queryByText('Black')).not.toBeNull();
  });

  it('dispatches commands from prompt', async () => {
    (parsePrompt as any).mockResolvedValue([{ id: 'undo', args: {} }]);
    const dispatchSpy = vi.spyOn(bus, 'dispatch');
    render(<App />);
    const input = screen.getByPlaceholderText('prompt');
    fireEvent.change(input, { target: { value: 'undo' } });
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith({ id: 'undo', args: {} });
    });
  });
});
