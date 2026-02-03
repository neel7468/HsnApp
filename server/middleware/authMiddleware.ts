import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export default function authMiddleware(
  req: any,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = { id: decoded.userId };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
