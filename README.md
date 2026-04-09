# BuzzerFly

BuzzerFly is a full-stack web app for hosting live quiz sessions: a game master creates rooms with rounds and question cards, shares a link, and participants join in the browser. State is synchronized in real time over WebSockets so buzzes and reveal events propagate immediately. Rooms, rounds, and questions are stored in PostgreSQL so a session can be prepared ahead of time and resumed across restarts.

## Screenshots

Images are sized for comfortable viewing on typical laptop widths (~560px); they remain readable in the GitHub viewer and on smaller screens.

### Home

<p align="center">
  <img src="docs/screenshots/home.png" alt="Home screen with Create room, join field, and My rooms" width="560" />
</p>

### Host — edit room

<p align="center">
  <img src="docs/screenshots/editor.png" alt="Room editor with rounds and questions" width="560" />
</p>

### Host — before reveal

<p align="center">
  <img src="docs/screenshots/host-reveal.png" alt="Host view with reveal control for the next question" width="560" />
</p>

### Host — live room (question revealed, buzzer state)

<p align="center">
  <img src="docs/screenshots/host-room.png" alt="Host view with question, round tabs, and first buzz" width="560" />
</p>

### Player — waiting for question

<p align="center">
  <img src="docs/screenshots/player-waiting.png" alt="Player buzzer while waiting for the question to be revealed" width="560" />
</p>

### Player — question visible

<p align="center">
  <img src="docs/screenshots/player-buzz.png" alt="Player buzzer with revealed question text" width="560" />
</p>

## Architecture

The repository is an **npm workspace** with two packages: `client` (Vite + React) and `server` (Express). In development, the Vite dev server proxies `/api` and `/socket.io` to the backend so the browser talks to a single origin; production can serve the built SPA from the same Node process or split static hosting from the API.

**HTTP:** REST endpoints under `/api` handle CRUD for rooms, rounds, and questions. The server validates input, persists via Prisma, and returns JSON.

**Real time:** Socket.io runs on the same Node host as Express. Clients connect with credentials aligned to `CLIENT_ORIGIN` (CORS and Socket.io configuration). Game events—room joins, question reveal, buzz attempts, and ordering—are emitted as Socket.io events so all connected clients update without polling. The server remains the source of truth for buzz order and round visibility.

**Data:** Prisma maps the schema to PostgreSQL and generates a type-safe client used only on the server. Migrations live under `server/prisma/migrations`. Hosted Postgres (e.g. Neon) typically uses a **pooled** `DATABASE_URL` for runtime queries and a **direct** `DIRECT_URL` for migrations; both are referenced from `server/.env`.

## Tech stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React | UI components and client-side state |
| TypeScript | Static typing across the client codebase |
| Vite | Dev server, HMR, and production bundling |
| Tailwind CSS | Utility-first styling |
| React Router | Client-side routing for the SPA |

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime for the API and Socket.io server |
| Express | HTTP server and `/api` route handlers |
| Socket.io | Bidirectional WebSocket channel for live room and buzzer updates |

### Database

| Technology | Purpose |
|------------|---------|
| PostgreSQL | Relational storage for rooms, rounds, questions, and session-related data |
| Prisma | Schema definition, migrations, and type-safe database access from Node |

## Getting started

### Prerequisites

- Node.js (version compatible with the lockfile / engines if specified)
- PostgreSQL (local or hosted; Neon-style pooled + direct URLs are supported)

### Environment variables

Copy `server/.env.example` to `server/.env` and adjust:

| Variable | Role |
|----------|------|
| `DATABASE_URL` | Pooled PostgreSQL URL for the running app (Prisma datasource) |
| `DIRECT_URL` | Direct PostgreSQL URL for migrations when the pooler does not support them |
| `PORT` | API listen port (default `3001` locally; on Fly.io, align with `fly.toml` / platform expectations) |
| `HOST` | Bind address (e.g. `0.0.0.0` when exposing outside localhost) |
| `CLIENT_ORIGIN` | Browser origin of the SPA (CORS and Socket.io); must match the URL users open; the server may accept related `www` / non-`www` variants when they differ |

See comments in `server/.env.example` for Neon pooling, SSL, and Fly.io port notes.

### Install and database migrate

From the repository root:

```bash
npm install
cd server && npm run db:migrate -- --name init
```

For schema tweaks later: `cd server && npm run db:migrate` (Prisma prompts) or `npm run db:push` for prototyping. After schema changes, `npm run db:generate` in `server` refreshes the Prisma client.

### Run (development)

**Terminal 1 — API and WebSockets**

```bash
cd server && npm run dev
```

**Terminal 2 — Vite**

```bash
cd client && npm run dev
```

Open `http://localhost:5173`. With the default Vite proxy, you do not need a client `.env` for local API and Socket.io traffic.

### Production (single host)

1. Set production `DATABASE_URL`, `PORT`, and `CLIENT_ORIGIN` on the server.
2. Build the client: `cd client && npm run build`.
3. Start the server: `cd server && npm start`.

If `client/dist` exists beside `server`, the server can serve the SPA and handle SPA routing. If the static site is hosted separately, build the client with `VITE_BACKEND_URL` set to the API origin (no trailing slash), e.g. `VITE_BACKEND_URL=https://api.example.com npm run build`.

Health check: `GET /api/health`.

## Design decisions

- **Socket.io instead of HTTP polling:** Buzz order and reveal state are time-sensitive. Push-based events reduce latency and avoid thundering herds of poll requests; the server can broadcast one authoritative update to every client in a room.

- **Prisma instead of handwritten SQL:** The schema is versioned with migrations, and the generated client matches TypeScript types used in Express handlers. That lowers foot-guns when evolving rooms, rounds, and questions and keeps refactors grep-friendly.

- **PostgreSQL instead of an embedded or key-value store:** Quiz content is relational (rooms, rounds, cards) and benefits from constraints and durable ACID semantics. A managed Postgres tier is a straightforward fit for multi-room persistence and backups.

- **Vite for the frontend:** Fast cold start and HMR improve iteration on UI flows; the production build outputs static assets the Node server—or any CDN—can serve without coupling to a specific React CLIserv configuration.
