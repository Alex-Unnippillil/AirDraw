

const KEYWORDS: { pattern: RegExp; command: AppCommand }[] = [
  { pattern: /undo/i, command: { id: 'undo', args: {} } },
  { pattern: /redo/i, command: { id: 'redo', args: {} } },
  { pattern: /red/i, command: { id: 'setColor', args: { hex: '#ff0000' } } },
  { pattern: /black/i, command: { id: 'setColor', args: { hex: '#000000' } } },
];

function parseKeywords(prompt: string): AppCommand[] {
  for (const { pattern, command } of KEYWORDS) {
    if (pattern.test(prompt)) {
      return [command];
    }
  }
  return [];
}

function validateCommands(data: unknown): AppCommand[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const result: AppCommand[] = [];

  for (const item of data) {
    if (!item || typeof item !== 'object') {
      return [];
    }

    const { id, args } = item as { id: unknown; args: unknown };
    if (typeof id !== 'string' || typeof args !== 'object' || args === null) {
      return [];
    }

    switch (id) {
      case 'undo':
      case 'redo':
        result.push({ id, args: {} });
        break;
      case 'setColor':
        if (typeof (args as any).hex === 'string') {
          result.push({ id: 'setColor', args: { hex: (args as any).hex } });
        } else {
          return [];
        }
        break;
      default:
        return [];
    }
  }

  return result;
}

export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  if (isPrivacyEnabled() || !process.env.OPENAI_API_KEY) {
    return parseKeywords(prompt);
  }

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
            content:
              'You are a command parser for a drawing app. Respond with a JSON array of {"id","args"} objects.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0,
      }),
    });

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      return [];
    }

    const parsed = JSON.parse(content);
    return validateCommands(parsed);
  } catch {
    return [];
  }
}

export default parsePrompt;
