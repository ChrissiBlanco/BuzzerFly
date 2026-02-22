import { Router } from "express";
import { nanoid } from "nanoid";
import { prisma } from "../lib/prisma.js";

const router = Router();
const USER_COOKIE = "buzzer_user_id";
const ADMIN_TOKEN_PREFIX = "buzzer_admin_";

// Mount this router at /api so: GET /api/me/rooms, POST /api/rooms, GET /api/rooms/:slug

/**
 * GET /api/me/rooms
 * List rooms for current user (creatorId from cookie)
 */
router.get("/me/rooms", async (req, res) => {
  const userId = req.cookies?.[USER_COOKIE];
  if (!userId) {
    return res.status(200).json({ rooms: [] });
  }
  try {
    const rooms = await prisma.room.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: "desc" },
      include: { rounds: { include: { _count: { select: { questions: true } } } } },
    });
    res.json({ rooms });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list rooms" });
  }
});

/**
 * POST /api/rooms
 * Create room for current user; optional body.name. Return slug, adminToken, room
 */
router.post("/rooms", async (req, res) => {
  const userId = req.cookies?.[USER_COOKIE];
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated; create user first via POST /api/users" });
  }
  try {
    const slug = nanoid(8);
    const name = req.body?.name != null ? String(req.body.name).trim() || null : null;
    const room = await prisma.room.create({
      data: { slug, creatorId: userId, name },
    });
    const adminToken = `${ADMIN_TOKEN_PREFIX}${room.id}`;
    res.status(201).json({ slug, adminToken, roomId: room.id, room });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create room" });
  }
});

/**
 * PATCH /api/rooms/:slug
 * Update room name (admin only).
 */
router.patch("/rooms/:slug", async (req, res) => {
  const { slug } = req.params;
  const result = await getRoomAndVerifyAdmin(req, slug);
  if (result.error) return res.status(result.status).json({ error: result.error });
  const { room } = result;
  const name = req.body?.name != null ? String(req.body.name).trim() || null : null;
  try {
    const updated = await prisma.room.update({
      where: { id: room.id },
      data: { name },
    });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update room" });
  }
});

/**
 * GET /api/rooms/:slug
 * Get room + rounds + questions (nested). Join validation, admin UI.
 */
router.get("/rooms/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const room = await prisma.room.findUnique({
      where: { slug },
      include: {
        rounds: {
          orderBy: { order: "asc" },
          include: {
            questions: { orderBy: { order: "asc" } },
          },
        },
      },
    });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.json(room);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get room" });
  }
});

/**
 * Helper: get room and verify admin (by cookie creatorId or adminToken in body/query)
 */
export async function getRoomAndVerifyAdmin(req, slug) {
  const room = await prisma.room.findUnique({
    where: { slug },
    include: {
      rounds: { orderBy: { order: "asc" }, include: { questions: { orderBy: { order: "asc" } } } },
    },
  });
  if (!room) return { error: "Room not found", status: 404 };
  const userId = req.cookies?.[USER_COOKIE];
  const adminToken = req.body?.adminToken ?? req.query?.adminToken;
  const isAdmin =
    room.creatorId === userId ||
    (adminToken && adminToken === `${ADMIN_TOKEN_PREFIX}${room.id}`);
  if (!isAdmin) return { error: "Forbidden", status: 403 };
  return { room };
}

export const ADMIN_TOKEN_PREFIX_EXPORT = ADMIN_TOKEN_PREFIX;
export default router;
