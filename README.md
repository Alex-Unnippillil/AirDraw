# AirDraw

AirDraw is a multi-package project for drawing in mid-air using hand-tracking and the web. The repository is managed with npm workspaces and includes the core logic, a backend server, and a web client.

## Prerequisites
- Node.js 20
- npm

## Getting Started
Install dependencies:
```bash
npm ci
```

Start the development server:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

## Packages
- **core** – shared logic and types for gesture processing.
- **server** – Express-based backend services.
- **web** – React client built with Vite.

## Contributing
Continuous integration runs on every push via [GitHub Actions](.github/workflows/ci.yml). Ensure `npm run lint` and `npm test` pass before opening a pull request.
