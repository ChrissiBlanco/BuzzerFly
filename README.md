# Buzzer

A web app for room-based quiz rounds: an admin creates rooms with named rounds and question cards, shares a link, and participants join to see the round name until the admin reveals a question—then the buzzer activates.

## Stack

- **Frontend**: React (Vite) + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Socket.io
- **Database**: PostgreSQL with Prisma

## Setup

### 1. PostgreSQL

Create a database and set `DATABASE_URL` in `server/.env` (copy from `server/.env.example`):

```
DATABASE_URL="postgresql://user:password@localhost:5432/buzzer?schema=public"
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

### 2. Install and migrate

From the project root:

```bash
npm install
cd server && npx prisma migrate dev --name init && cd ..
```

### 3. Run

**Terminal 1 – server**

```bash
cd server && npm run dev
```

**Terminal 2 – client**

```bash
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Create a room, add rounds and questions, share the room link, and join as a participant to use the buzzer.
