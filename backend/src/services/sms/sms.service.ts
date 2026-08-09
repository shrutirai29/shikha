import { env } from "../../config/env";
import { sendOtpEmail } from "../email/email.service";

/**
 * Phone OTP delivery.
 *
 * When an SMS provider is configured (SMS_API_URL + SMS_API_KEY), the code is
 * sent as an SMS via a generic HTTP API (provider-specific payload). Without
 * a provider the code is delivered to the account email with a clear note,
 * so the verification flow remains fully functional and testable — swap in
 * real SMS credentials to switch channels with no code changes.
 */
export const sendOtpSms = async (
  email: string,
  phone: string,
  code: string
): Promise<{ delivered: boolean; channel: "sms" | "email" }> => {
  const config = env();

  if (config.SMS_API_URL && config.SMS_API_KEY) {
    try {
      const response = await fetch(config.SMS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.SMS_API_KEY}`,
        },
        body: JSON.stringify({
          to: phone,
          sender: config.SMS_SENDER_ID ?? "SHIKHA",
          message: `Your Shikha verification code is ${code}. It expires in 10 minutes.`,
        }),
      });

      if (response.ok) {
        return { delivered: true, channel: "sms" };
      }

      console.error(
        `[sms] provider returned ${response.status}: ${(await response.text()).slice(0, 200)}`
      );
    } catch (error) {
      console.error("[sms] delivery failed, falling back to email:", error);
    }
  }

  // Fallback channel so the flow always works in dev / without SMS credentials.
  const fallback = await sendOtpEmail(email, code, "phone");

  return { delivered: fallback.delivered, channel: "email" };
};
