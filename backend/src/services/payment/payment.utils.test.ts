import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import crypto from "crypto";

vi.mock("../../models/payment/payment.model", () => ({
  default: { findOne: vi.fn() },
}));

vi.mock("../../models/order/order.model", () => ({
  default: { findById: vi.fn() },
}));

import {
  generatePaymentSignature,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "./payment.utils";

const KEY_SECRET = "rzp_test_secret_abc123";
const WEBHOOK_SECRET = "webhook_secret_999";

describe("payment.utils — Razorpay signature verification", () => {
  beforeAll(() => {
    process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
    process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
  });

  afterAll(() => {
    delete process.env.RAZORPAY_KEY_SECRET;
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  });

  it("generates a deterministic 64-char HMAC-SHA256 signature", () => {
    const orderId = "order_abc123";
    const paymentId = "pay_xyz789";

    const sig = generatePaymentSignature(orderId, paymentId);

    expect(sig).toMatch(/^[a-f0-9]{64}$/);
    expect(generatePaymentSignature(orderId, paymentId)).toBe(sig);
  });

  it("accepts a valid payment signature", () => {
    const orderId = "order_abc123";
    const paymentId = "pay_xyz789";

    const sig = generatePaymentSignature(orderId, paymentId);

    expect(verifyPaymentSignature(orderId, paymentId, sig)).toBe(true);
  });

  it("rejects a tampered signature and a different payment id", () => {
    const orderId = "order_abc123";
    const paymentId = "pay_xyz789";

    const sig = generatePaymentSignature(orderId, paymentId);

    expect(
      verifyPaymentSignature(orderId, paymentId, `${sig}dead`)
    ).toBe(false);

    expect(verifyPaymentSignature(orderId, paymentId, "0".repeat(64))).toBe(
      false
    );

    expect(
      verifyPaymentSignature(orderId, "pay_other", sig)
    ).toBe(false);
  });

  it("verifies a webhook signature computed over the raw body", () => {
    const rawBody = Buffer.from(
      JSON.stringify({ event: "payment.captured", payload: {} })
    );

    const expected = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    expect(verifyWebhookSignature(rawBody, expected)).toBe(true);
    expect(verifyWebhookSignature(rawBody, "deadbeef")).toBe(false);
  });

  it("fails closed when the webhook secret is not configured", () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;

    expect(
      verifyWebhookSignature(Buffer.from("{}"), "anything")
    ).toBe(false);

    process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
  });
});
