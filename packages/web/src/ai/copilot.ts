import type { AppCommand } from '../commands';
import { isPrivacyEnabled } from '../context/PrivacyContext';

/**
 * Very small keyword based parser used for tests. For unknown prompts we
 * delegate to a mocked OpenAI endpoint when privacy is disabled.
 */
export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  const lower = prompt.toLowerCase();

  if (lower.includes('undo')) {
    return [{ id: 'undo', args: {} }];
  }
  if (lower.includes('red')) {
    return [{ id: 'setColor', args: { hex: '#ff0000' } }];
  }
  if (lower.includes('black')) {
    return [{ id: 'setColor', args: { hex: '#000000' } }];
  }

  if (isPrivacyEnabled()) {
    return [];
  }

  try {
    const res = await fetch('/api/copilot', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    return data as AppCommand[];
  } catch {
    return [];
  }
}

export default parsePrompt;

