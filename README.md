# AirDraw

AirDraw is a pro-grade webcam drawing tool that lets artists sketch in mid-air using hand gestures. An on-device vision module tracks hand keypoints in real time and maps them to expressive brush strokes on a hardware-accelerated canvas. A built-in AI copilot converts natural language prompts into deterministic editor commands while keeping camera data on device by default.

## Workspace structure

This repository is a monorepo managed with npm workspaces. The packages are:

- `packages/core` – shared logic and data models.
- `packages/server` – an Express-based backend for features that require a server.
- `packages/web` – the React/Vite web client for drawing in the browser.

## Commands

All commands are run from the repository root.

- `npm install` – install dependencies for all workspaces.
- `npm run dev` – start the web client in development mode.
- `npm run build` – build all packages.
- `npm test` – run unit tests with Vitest.
- `npm run lint` – lint the codebase with ESLint.
- `npm run format` – format files with Prettier.

## Documentation

Additional design notes and plans can be found in the [docs](./docs) directory.

## Requirements

- Node.js 20 or later

