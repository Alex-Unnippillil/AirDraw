# AirDraw

AirDraw is an AI-assisted webcam drawing tool that lets users draw in mid-air using hand gestures. This repository contains a TypeScript monorepo with packages for core algorithms, the web client, optional server, and more. See `docs/` for product brief, design, and build plan.

## Running the server

Start the server from the repository root:

```bash
npm start --workspace=@airdraw/server
```

The server listens on port 3000 and exposes a `/health` endpoint.
