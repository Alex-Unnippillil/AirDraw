# Storage

The web client persists drawing data using IndexedDB.

- **Database**: `airdraw`
- **Object store**: `state`
- **Key**: `session`
- **Value**: an object of the form:

```ts
interface StoredState {
  strokes: { points: { x: number; y: number }[]; color: string }[];
  color: string;
}
```

This schema stores all drawn strokes along with the current palette color, allowing the application to restore the previous session on startup.
