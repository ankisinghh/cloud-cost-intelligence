import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User";
import { signToken } from "../middleware/auth";
import { env, isProd } from "../config/env";
import type { AuthedRequest } from "../middleware/auth";

const credSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

function setAuthCookie(res: Response, token: string) {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function signup(req: Request, res: Response) {
  const parsed = credSchema.safeParse(req.body);

if (!parsed.success) {
  return res.status(400).json({
    error: parsed.error.errors[0].message,
  });
}

const { email, password } = parsed.data;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: "Email already registered" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });
  const token = signToken(user._id.toString(), user.role);
  setAuthCookie(res, token);
  res.status(201).json({ id: user._id, email: user.email, role: user.role });
}

export async function login(req: Request, res: Response) {
  const parsed = credSchema.safeParse(req.body);

if (!parsed.success) {
  return res.status(400).json({
    error: parsed.error.errors[0].message,
  });
}

const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = signToken(user._id.toString(), user.role);
  setAuthCookie(res, token);
  res.json({ id: user._id, email: user.email, role: user.role });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(env.cookieName, {
  httpOnly: true,
  sameSite: "none",
  secure: true,
});
  res.json({ ok: true });
}

export async function me(req: AuthedRequest, res: Response) {
  const user = await User.findById(req.userId).select("_id email role");
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
}