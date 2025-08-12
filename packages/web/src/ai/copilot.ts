import { Command } from '@airdraw/core';

// Calls an LLM to parse a natural language prompt into Command objects.
// Falls back to a small rule-based parser when the API is unavailable.
export async function parsePrompt(prompt: string): Promise<Command[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Translate the user request into a JSON array of command objects with id and args fields.',
            },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) return parsed;
          if (Array.isArray(parsed.commands)) return parsed.commands;
        }
      }
    } catch {
      // swallow error and use fallback
    }
  }
  return ruleBasedParser(prompt);
}

function ruleBasedParser(prompt: string): Command[] {
  if (/undo/i.test(prompt)) return [{ id: 'undo', args: {} }];
  if (/red/i.test(prompt)) return [{ id: 'setColor', args: { hex: '#ff0000' } }];
  return [];
}

