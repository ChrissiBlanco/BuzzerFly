FROM node:22-bookworm-slim

RUN apt-get update -y \
  && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/
COPY client/package.json client/

COPY server ./server

RUN npm ci --workspace=server --omit=dev

WORKDIR /app/server
RUN npx prisma generate

ENV NODE_ENV=production

EXPOSE 8080

# Migrations run in Fly `release_command` (see fly.toml) so the HTTP server can boot before health checks.
CMD ["node", "index.js"]
