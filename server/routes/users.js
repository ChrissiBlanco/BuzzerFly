import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();
const USER_COOKIE = "buzzer_user_id";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000; // 1 year

/**
 * POST /api/users
 * Create anonymous user if none in cookie; set cookie; return userId
 */
router.post("/", async (req, res) => {
  try {
    const existing = req.cookies?.[USER_COOKIE];
    if (existing) {
      const user = await prisma.user.findUnique({ where: { id: existing } });
      if (user) {
        return res.status(200).json({ userId: user.id });
      }
    }
    const user = await prisma.user.create({ data: {} });
    res.cookie(USER_COOKIE, user.id, { httpOnly: true, maxAge: COOKIE_MAX_AGE, sameSite: "lax" });
    res.status(201).json({ userId: user.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create user" });
  }
});

export default router;
