import { Request, Response, NextFunction } from "express";

/**
 * Sanitizes strings against Cross-Site Scripting (XSS) attacks.
 * Strips script tags, executable event handlers, iframe injections,
 * and dangerous pseudo-protocol schemes.
 */
export const sanitizeXssString = (input: string): string => {
  if (typeof input !== "string") return input;

  return input
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove iframe, object, embed tags
    .replace(/<\/?(iframe|object|embed|applet|meta|link)\b[^>]*>/gi, "")
    // Remove inline event handlers (e.g. onerror=..., onload=...)
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\bon\w+\s*=\s*[^\s>]+/gi, "")
    // Neutralize javascript: pseudo-protocols
    .replace(/javascript\s*:/gi, "blocked-javascript:")
    .replace(/vbscript\s*:/gi, "blocked-vbscript:")
    .replace(/data\s*:\s*text\/html/gi, "blocked-data:");
};

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    return sanitizeXssString(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object" && !(value instanceof Date) && !(value instanceof RegExp)) {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      cleaned[k] = sanitizeValue(v);
    }
    return cleaned;
  }

  return value;
};

export const xssMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }

  if (req.params && typeof req.params === "object") {
    req.params = sanitizeValue(req.params) as Record<string, string>;
  }

  if (req.query && typeof req.query === "object") {
    try {
      for (const key of Object.keys(req.query)) {
        if (typeof req.query[key] === "string") {
          (req.query as Record<string, unknown>)[key] = sanitizeXssString(
            req.query[key] as string
          );
        } else if (typeof req.query[key] === "object") {
          (req.query as Record<string, unknown>)[key] = sanitizeValue(
            req.query[key]
          );
        }
      }
    } catch {
      // In Express 5 query object may have restricted properties
    }
  }

  next();
};
