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

import type { AppCommand } from '../commands';
import { isPrivacyEnabled } from '../context/PrivacyContext';

/**
 * Parse a natural language prompt into a list of application commands.
 *
 * The parser first checks for known keyword mappings. If no keyword matches
 * and privacy mode is disabled with an available OpenAI API key, the prompt
 * is sent to the OpenAI Chat Completion API and the response is parsed as a
 * list of commands. Any network or parsing errors result in an empty list.
 */
export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  const trimmed = prompt.trim();

  // Keyword-based commands
  if (/\bundo\b/i.test(trimmed)) {
    return [{ id: 'undo', args: {} }];
  }
  if (/\bred\b/i.test(trimmed)) {
    return [{ id: 'setColor', args: { hex: '#ff0000' } }];
  }
  if (/\bblack\b/i.test(trimmed)) {
    return [{ id: 'setColor', args: { hex: '#000000' } }];
  }

  // Fallback to OpenAI API if allowed
  if (!isPrivacyEnabled() && process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Respond with a JSON array of {id,args} commands.',
            },
            { role: 'user', content: trimmed },
          ],
          temperature: 0,
        }),
      });

      const data: any = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content === 'string') {
        return JSON.parse(content) as AppCommand[];
      }
    } catch {
      // Ignore and fall through to empty array
    }
  }

  return [];
}

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

