import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { BadRequestError } from "../errors/BadRequestError";

/**
 * Validates that named route params are valid MongoDB ObjectIds.
 *
 * Usage: router.get("/:id", validateObjectId("id"), handler)
 */
export const validateObjectId =
  (...paramNames: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    for (const name of paramNames) {
      const value = req.params[name] as string | undefined;

      if (value && !Types.ObjectId.isValid(value)) {
        next(
          new BadRequestError(
            `Invalid ${name}: ${value} is not a valid ObjectId`
          )
        );
        return;
      }
    }

    next();
  };
