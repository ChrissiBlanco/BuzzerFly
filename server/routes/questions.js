import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getRoomAndVerifyAdmin } from "./rooms.js";

const router = Router();

/**
 * POST /api/rooms/:slug/rounds/:roundId/questions
 * Add one or many questions (body: { text } or { questions: [{ text }, ...] })
 */
router.post("/:slug/rounds/:roundId/questions", async (req, res) => {
  const { slug, roundId } = req.params;
  const result = await getRoomAndVerifyAdmin(req, slug);
  if (result.error) return res.status(result.status).json({ error: result.error });
  const { room } = result;
  const round = await prisma.round.findFirst({
    where: { id: roundId, roomId: room.id },
  });
  if (!round) return res.status(404).json({ error: "Round not found" });

  let inputs = [];
  if (req.body?.text != null) {
    inputs = [{ text: String(req.body.text) }];
  } else if (Array.isArray(req.body?.questions)) {
    inputs = req.body.questions.map((q) => ({ text: q?.text != null ? String(q.text) : "" })).filter((q) => q.text);
  }
  if (inputs.length === 0) {
    return res.status(400).json({ error: "Provide text or questions array" });
  }

  try {
    const maxOrder = await prisma.question.findFirst({
      where: { roundId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    let nextOrder = (maxOrder?.order ?? -1) + 1;
    const created = await prisma.question.createManyAndReturn({
      data: inputs.map((q) => ({ roundId, text: q.text, order: nextOrder++ })),
    });
    res.status(201).json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to add questions" });
  }
});

/**
 * PATCH /api/rooms/:slug/rounds/:roundId/questions/:questionId
 * Edit question text or order
 */
router.patch("/:slug/rounds/:roundId/questions/:questionId", async (req, res) => {
  const { slug, roundId, questionId } = req.params;
  const result = await getRoomAndVerifyAdmin(req, slug);
  if (result.error) return res.status(result.status).json({ error: result.error });
  const { room } = result;
  const round = await prisma.round.findFirst({
    where: { id: roundId, roomId: room.id },
  });
  if (!round) return res.status(404).json({ error: "Round not found" });
  const question = await prisma.question.findFirst({
    where: { id: questionId, roundId },
  });
  if (!question) return res.status(404).json({ error: "Question not found" });
  const { text, order } = req.body ?? {};
  const data = {};
  if (typeof text === "string") data.text = text.trim();
  if (typeof order === "number") data.order = order;
  try {
    const updated = await prisma.question.update({
      where: { id: questionId },
      data,
    });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update question" });
  }
});

/**
 * DELETE /api/rooms/:slug/rounds/:roundId/questions/:questionId
 */
router.delete("/:slug/rounds/:roundId/questions/:questionId", async (req, res) => {
  const { slug, roundId, questionId } = req.params;
  const result = await getRoomAndVerifyAdmin(req, slug);
  if (result.error) return res.status(result.status).json({ error: result.error });
  const { room } = result;
  const round = await prisma.round.findFirst({
    where: { id: roundId, roomId: room.id },
  });
  if (!round) return res.status(404).json({ error: "Round not found" });
  try {
    await prisma.question.deleteMany({ where: { id: questionId, roundId } });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete question" });
  }
});

export default router;
