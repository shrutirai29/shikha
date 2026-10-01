import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = res.locals.requestId as string | undefined;
  const isDev = process.env.NODE_ENV === "development";

  const common = {
    requestId,
  };

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      ...common,
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if ((err as any).name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid resource identifier format",
      ...common,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.code ? { code: err.code } : {}),
      ...common,
    });
    return;
  }

  // Log detailed error server-side with correlation requestId
  console.error(`[${requestId ?? "-"}] Internal Server Error:`, err);

  // In production, debug details and raw stack traces are never leaked
  res.status(500).json({
    success: false,
    message: isDev ? err.message || "Internal server error" : "Internal server error",
    ...common,
    stack: isDev ? err.stack : undefined,
  });
};
