import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getRoomAndVerifyAdmin } from "./rooms.js";

const router = Router();

// Mount at /api/rooms so routes are /api/rooms/:slug/rounds, etc.

/**
 * POST /api/rooms/:slug/rounds
 * Create round (body: { name }, optional order)
 */
router.post("/:slug/rounds", async (req, res) => {
  const { slug } = req.params;
  const result = await getRoomAndVerifyAdmin(req, slug);
  if (result.error) return res.status(result.status).json({ error: result.error });
  const { room } = result;
  const { name, order } = req.body ?? {};
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "name is required" });
  }
  try {
    const maxOrder = await prisma.round.findFirst({
      where: { roomId: room.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = typeof order === "number" ? order : (maxOrder?.order ?? -1) + 1;
    const round = await prisma.round.create({
      data: { roomId: room.id, name: name.trim(), order: nextOrder },
    });
    res.status(201).json(round);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create round" });
  }
});

/**
 * PATCH /api/rooms/:slug/rounds/:roundId
 * Update round name or order
 */
router.patch("/:slug/rounds/:roundId", async (req, res) => {
  const { slug, roundId } = req.params;
  const result = await getRoomAndVerifyAdmin(req, slug);
  if (result.error) return res.status(result.status).json({ error: result.error });
  const { room } = result;
  const { name, order } = req.body ?? {};
  try {
    const round = await prisma.round.findFirst({
      where: { id: roundId, roomId: room.id },
    });
    if (!round) return res.status(404).json({ error: "Round not found" });
    const data = {};
    if (typeof name === "string") data.name = name.trim();
    if (typeof order === "number") data.order = order;
    const updated = await prisma.round.update({
      where: { id: roundId },
      data,
    });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update round" });
  }
});

/**
 * DELETE /api/rooms/:slug/rounds/:roundId
 * Delete round and its questions
 */
router.delete("/:slug/rounds/:roundId", async (req, res) => {
  const { slug, roundId } = req.params;
  const result = await getRoomAndVerifyAdmin(req, slug);
  if (result.error) return res.status(result.status).json({ error: result.error });
  const { room } = result;
  try {
    const round = await prisma.round.findFirst({
      where: { id: roundId, roomId: room.id },
    });
    if (!round) return res.status(404).json({ error: "Round not found" });
    await prisma.round.delete({ where: { id: roundId } });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete round" });
  }
});

export default router;
