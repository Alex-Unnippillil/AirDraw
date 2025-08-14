
import type { AppCommand } from '../commands';
import { isPrivacyEnabled } from '../context/PrivacyContext';

export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  const p = prompt.toLowerCase();
  if (p.includes('undo')) {
    return [{ id: 'undo', args: {} }];
  }
  if (p.includes('red')) {
    return [{ id: 'setColor', args: { hex: '#ff0000' } }];
  }
  if (p.includes('black')) {
    return [{ id: 'setColor', args: { hex: '#000000' } }];
  }
  if (!isPrivacyEnabled()) {
    try {
      await fetch('/api/copilot', {
        method: 'POST',
        body: JSON.stringify({ prompt })
      });
    } catch {
      /* ignore network errors in tests */
    }
  }
  return [];
}

export default parsePrompt;

