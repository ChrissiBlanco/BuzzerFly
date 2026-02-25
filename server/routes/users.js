import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { USER_COOKIE } from "../lib/constants.js";

const router = Router();
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000; // 1 year

// Cross-origin (e.g. Amplify → EB): cookie must be SameSite=None; Secure so the browser sends it
const clientOrigin = process.env.CLIENT_ORIGIN ?? "";
const isCrossOrigin = clientOrigin.length > 0 && !clientOrigin.includes("localhost");

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
    res.cookie(USER_COOKIE, user.id, {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      sameSite: isCrossOrigin ? "none" : "lax",
      secure: isCrossOrigin,
    });
    res.status(201).json({ userId: user.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create user" });
  }
});

export default router;
