# Copilot Prompts

The web client includes a small **AI copilot** that turns natural language into drawing commands. By default it calls an LLM (such as OpenAI) which returns structured `Command` objects.

Set the `OPENAI_API_KEY` environment variable to enable the LLM parser.

## Examples

Prompt:

> undo the last action

Returns:

```json
[{ "id": "undo", "args": {} }]
```

Prompt:

> make it red

Returns:

```json
[{ "id": "setColor", "args": { "hex": "#ff0000" } }]
```

If the LLM is unreachable, a lightweight rule-based fallback handles a few simple prompts like the ones above.
