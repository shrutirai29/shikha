import { CookieOptions, Response } from "express";
import { env } from "../config/env";

export const getSecureCookieOptions = (overrides?: Partial<CookieOptions>): CookieOptions => {
  const isProd = env().NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "lax" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    ...overrides,
  };
};

export const setSecureCookie = (
  res: Response,
  name: string,
  value: string,
  options?: Partial<CookieOptions>
): void => {
  res.cookie(name, value, getSecureCookieOptions(options));
};

export const clearSecureCookie = (
  res: Response,
  name: string,
  options?: Partial<CookieOptions>
): void => {
  res.clearCookie(name, getSecureCookieOptions({ maxAge: 0, ...options }));
};
