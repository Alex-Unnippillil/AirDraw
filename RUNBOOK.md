# Runbook

## Setup

```bash
npm install
```

## Web Workflow

The `@airdraw/web` package is a React app powered by Vite.

```bash
npm run dev           # start the Vite dev server
npm run build         # build the web app for production
```

## Lint

```bash
npm run lint          # run ESLint
```

## Format

```bash
npm run format        # run Prettier
```

## Tests

```bash
npm test              # run vitest
```

## Package (Electron stub)

```bash
npm run package
```

## Continuous Integration

CI should run `npm run lint` and `npm test`.
