import Razorpay from "razorpay";
import { env } from "./env";

import { ConflictError } from "../errors/ConflictError";

let client: Razorpay | null = null;

/**
 * Returns a configured Razorpay client, creating it lazily so the
 * app can boot without payment keys configured (e.g. in tests or
 * local development without a Razorpay account).
 */
const getRazorpay = (): Razorpay => {
  if (client) {
    return client;
  }

  const config = env();

  if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
    throw new ConflictError(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }

  client = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET,
  });

  return client;
};

export default getRazorpay;
