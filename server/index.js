import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import cookieParser from "cookie-parser";
import cors from "cors";
import usersRouter from "./routes/users.js";
import roomsRouter from "./routes/rooms.js";
import roundsRouter from "./routes/rounds.js";
import questionsRouter from "./routes/questions.js";
import { registerSocketHandlers } from "./socket/handlers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ?? 3001;
// Normalize: browser sends Origin without trailing slash; env might have one
const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173").replace(/\/$/, "");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"] },
});

app.use(cookieParser());
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/users", usersRouter);
app.use("/api", roomsRouter);
app.use("/api/rooms", roundsRouter);
app.use("/api/rooms", questionsRouter);

// Option A (single-app): serve built React app when client/dist exists
const clientDist = path.join(__dirname, "..", "client", "dist");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res) => {
    res.sendFile("index.html", { root: clientDist });
  });
}

registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
