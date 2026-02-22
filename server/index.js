import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import usersRouter from "./routes/users.js";
import roomsRouter from "./routes/rooms.js";
import roundsRouter from "./routes/rounds.js";
import questionsRouter from "./routes/questions.js";
import { registerSocketHandlers } from "./socket/handlers.js";

const PORT = process.env.PORT ?? 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

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

registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
