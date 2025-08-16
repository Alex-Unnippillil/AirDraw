import { isPrivacyEnabled } from '../context/PrivacyContext';
import type { AppCommand } from '../commands';


  }
  return [];
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

          { role: 'user', content: prompt },
        ],
        temperature: 0,
      }),
    });

  }
}

export default parsePrompt;
