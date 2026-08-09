import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const incomingId = req.headers["x-request-id"];

  const requestId =
    typeof incomingId === "string" && incomingId.length > 0
      ? incomingId
      : randomUUID();

  req.headers["x-request-id"] = requestId;

  res.setHeader("x-request-id", requestId);

  res.locals.requestId = requestId;

  next();
};
