import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "./app";

describe("API integration", () => {
  it("responds with a health check payload at /", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("includes a request ID header on every response", async () => {
    const res = await request(app).get("/");

    expect(res.headers["x-request-id"]).toBeTruthy();
  });

  it("rejects invalid pagination values with a 400", async () => {
    const res = await request(app).get(
      "/api/products?page=0&limit=99999"
    );

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it("returns 400 for invalid ObjectId route params", async () => {
    const res = await request(app).get(
      "/api/products/not-an-object-id"
    );

    expect(res.status).toBe(400);
  });

  it("rejects invalid login payloads with a 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "not-an-email", password: "123" });

    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});
