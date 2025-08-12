# Runbook

## Setup

```bash
npm install
```

## Development

```bash
npm run dev           # start web dev server (Vite) in @airdraw/web
```

## Lint

```bash
npm run lint          # run ESLint across all packages
```

## Format

```bash
npm run format        # format with Prettier across all packages
```

## Tests

```bash
npm test              # run vitest
```

## Build

```bash
npm run build         # build @airdraw/web
```

## Package (Electron stub)

```bash
npm run package
```

## Continuous Integration

CI should run `npm run lint` and `npm test`.
