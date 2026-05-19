import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthedRequest extends Request {
  userId?: string;
  role?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[env.cookieName];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string; role?: string };
    req.userId = payload.sub;
    req.role = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function signToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, env.jwtSecret, { expiresIn: "7d" });
}