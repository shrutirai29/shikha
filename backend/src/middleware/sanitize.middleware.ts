import { Request, Response, NextFunction } from "express";

/**
 * Recursively strips keys starting with '$' or containing '.'
 * to defend against MongoDB NoSQL operator injection attacks.
 */
const sanitizeData = (value: unknown): unknown => {
  if (!value || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeData);
  }

  const cleaned: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    // Strip MongoDB operators like $ne, $gt, $where, or dotted field injection
    if (key.startsWith("$") || key.includes(".")) {
      continue;
    }
    cleaned[key] = sanitizeData(val);
  }

  return cleaned;
};

export const sanitizeMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeData(req.body);
  }

  if (req.params && typeof req.params === "object") {
    req.params = sanitizeData(req.params) as Record<string, string>;
  }

  if (req.query && typeof req.query === "object") {
    try {
      for (const key of Object.keys(req.query)) {
        if (key.startsWith("$") || key.includes(".")) {
          delete (req.query as Record<string, unknown>)[key];
        } else if (typeof req.query[key] === "object") {
          (req.query as Record<string, unknown>)[key] = sanitizeData(req.query[key]);
        }
      }
    } catch {
      // In Express 5 query object may be read-only in some handlers
    }
  }

  next();
};
