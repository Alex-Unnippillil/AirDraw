import { CommandBus } from '@airdraw/core';
import { isPrivacyEnabled } from '../context/PrivacyContext';
import type { AppCommand, AppCommands } from '../commands';

// keyword mapping used when the LLM is unavailable
const PROMPT_MAP: Record<string, AppCommand[]> = {
  undo: [{ id: 'undo', args: {} }],
  red: [{ id: 'setColor', args: { hex: '#ff0000' } }],
  black: [{ id: 'setColor', args: { hex: '#000000' } }],
};

export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  if (isPrivacyEnabled()) {
    return [];
  }

  const lower = prompt.toLowerCase();
  for (const [key, cmds] of Object.entries(PROMPT_MAP)) {
    if (lower.includes(key)) {
      return cmds;
    }
  }

  if (process.env.OPENAI_API_KEY) {
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
              content: 'Return a JSON array of AppCommand objects.'
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0,
        }),
      });
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) {
        try {
          const cmds = JSON.parse(content);
          if (Array.isArray(cmds)) {
            return cmds as AppCommand[];
          }
        } catch {
          // fall through to return []
        }
      }
    } catch {
      // ignore network errors
    }
  }

  return [];
}

export default parsePrompt;

export interface RunPromptOptions {
  dryRun?: boolean;
}

export async function runPrompt(
  bus: CommandBus<AppCommands>,
  prompt: string,
  opts: RunPromptOptions = {}
): Promise<AppCommand[]> {
  const cmds = await parsePrompt(prompt);
  if (!opts.dryRun) {
    for (const cmd of cmds) {
      await bus.dispatch(cmd);
    }
  }
  return cmds;
}
