import type { AppCommand } from '../commands';

/**
 * Parse a natural language prompt into application commands.
 *
 * If an OpenAI API key is present, the prompt is sent to the Chat Completion
 * API and the JSON response is parsed as `AppCommand[]`. When the key is
 * missing or the request fails, a simple keyword based parser is used.
 */
export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are an AI that outputs JSON.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content === 'string') {
        return JSON.parse(content) as AppCommand[];
      }
    } catch {
      // fall back to keyword parsing below
    }
  }

  const commands: AppCommand[] = [];
  if (/undo/i.test(prompt)) {
    commands.push({ id: 'undo', args: {} });
  }
  if (/red/i.test(prompt)) {
    commands.push({ id: 'setColor', args: { hex: '#ff0000' } });
  }
  if (/black/i.test(prompt)) {
    commands.push({ id: 'setColor', args: { hex: '#000000' } });
  }

  return commands;
}

