
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

