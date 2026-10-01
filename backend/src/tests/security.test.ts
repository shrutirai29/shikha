import { describe, it, expect, vi } from "vitest";

vi.mock("../models/auth/auth.model", () => ({
  default: {
    findById: vi.fn((id: string) => ({
      select: vi.fn().mockResolvedValue({
        _id: id,
        role: id.endsWith("b") ? "admin" : "customer",
        isActive: true,
      }),
    })),
    findOne: vi.fn(),
  },
}));

import request from "supertest";
import app from "../app";
import { generateAccessToken } from "../utils/jwt";
import { sanitizeXssString } from "../middleware/xss.middleware";
import { escapeRegex } from "../utils/regex.util";

describe("Security Audit & Permission Enforcement", () => {
  const customerToken = generateAccessToken("64f12345678901234567890a", "customer");
  const adminToken = generateAccessToken("64f12345678901234567890b", "admin");

  describe("1. User Permissions & Admin Route Protection", () => {
    it("rejects unauthenticated requests to admin dashboard with 401", async () => {
      const res = await request(app).get("/api/dashboard");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("rejects non-admin customers from accessing admin dashboard with 403", async () => {
      const res = await request(app)
        .get("/api/dashboard")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("rejects unauthenticated requests to admin analytics with 401", async () => {
      const res = await request(app).get("/api/analytics/sales");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("rejects non-admin customers from accessing admin analytics with 403", async () => {
      const res = await request(app)
        .get("/api/analytics/sales")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("rejects unauthenticated requests to product creation with 401", async () => {
      const res = await request(app).post("/api/products").send({ name: "Malicious" });
      expect(res.status).toBe(401);
    });

    it("rejects non-admin customers from creating products with 403", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ name: "Unauthorized Product" });

      expect(res.status).toBe(403);
    });

    it("rejects non-admin customers from creating coupons with 403", async () => {
      const res = await request(app)
        .post("/api/coupons")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ code: "HACK50" });

      expect(res.status).toBe(403);
    });
  });

  describe("2. Security Headers & Debug Information Protection", () => {
    it("omits x-powered-by header to prevent framework fingerprinting", async () => {
      const res = await request(app).get("/");
      expect(res.headers["x-powered-by"]).toBeUndefined();
    });

    it("sets X-Frame-Options to DENY to prevent clickjacking", async () => {
      const res = await request(app).get("/");
      expect(res.headers["x-frame-options"]).toBe("DENY");
    });

    it("sets X-Content-Type-Options to nosniff", async () => {
      const res = await request(app).get("/");
      expect(res.headers["x-content-type-options"]).toBe("nosniff");
    });

    it("includes Permissions-Policy restrictive header", async () => {
      const res = await request(app).get("/");
      expect(res.headers["permissions-policy"]).toBeDefined();
      expect(res.headers["permissions-policy"]).toContain("camera=()");
    });

    it("issues XSRF-TOKEN cookie on initial read request", async () => {
      const res = await request(app).get("/");
      const cookieHeader = res.headers["set-cookie"];
      expect(cookieHeader).toBeDefined();
      const cookieList = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader];
      expect(cookieList.some((c) => typeof c === "string" && c.startsWith("XSRF-TOKEN="))).toBe(true);
    });
  });

  describe("3. XSS and Injection Neutralization", () => {
    it("strips script tags and executable JavaScript from user input", () => {
      const malicious = '<script>alert("xss")</script>Hello <img src="x" onerror="steal()"/>';
      const cleaned = sanitizeXssString(malicious);
      expect(cleaned).not.toContain("<script>");
      expect(cleaned).not.toContain("onerror=");
      expect(cleaned).toContain("Hello");
    });

    it("escapes regex special characters to prevent ReDoS and query injection", () => {
      const query = "(a+)+$[*?]^";
      const escaped = escapeRegex(query);
      expect(escaped).toBe("\\(a\\+\\)\\+\\$\\[\\*\\?\\]\\^");
    });
  });
});
