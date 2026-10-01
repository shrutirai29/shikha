import nodemailer, { Transporter } from "nodemailer";
import { env } from "../../config/env";

const config = env();

let transporter: Transporter | null = null;

const getTransporter = (): Transporter | null => {
  if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASS) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_PORT === 465,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
      // Fail fast: some hosts (e.g. Railway) block SMTP egress entirely.
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 20000,
    });
  }

  return transporter;
};

/**
 * Split a "Name <email>" sender string into its parts so providers receive a
 * clean email address (some reject the combined form with "valid sender email
 * required").
 */
const parseSender = (
  value: string | undefined
): { name: string; email: string } => {
  const match = /^(.*?)\s*<([^>]+)>$/.exec(value ?? "");

  if (match) {
    return { name: match[1].trim() || "Knottiingale", email: match[2].trim() };
  }

  return {
    name: "Knottiingale",
    email: (value ?? "no-reply@knottiingale.store").trim(),
  };
};

/**
 * Send via an HTTPS email API (Brevo-style REST). This is the preferred path:
 * it works from any host because it only needs outbound HTTPS (port 443), which
 * is never blocked — unlike SMTP ports. Configure EMAIL_API_KEY + EMAIL_API_URL.
 */
const sendViaHttpApi = async ({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<boolean> => {
  if (!config.EMAIL_API_KEY) {
    return false;
  }

  try {
    const url =
      config.EMAIL_API_URL ||
      "https://api.brevo.com/v3/smtp/email";

    const sender = parseSender(config.EMAIL_FROM || config.SMTP_USER);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": config.EMAIL_API_KEY,
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (response.ok) {
      return true;
    }

    console.error(
      `[email-api] provider returned ${response.status}: ${(await response.text()).slice(0, 300)}`
    );
  } catch (error) {
    console.error("[email-api] delivery failed:", error);
  }

  return false;
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<{ delivered: boolean }> => {
  // Preferred: HTTPS email API — works from any host, no SMTP port needed.
  if (await sendViaHttpApi({ to, subject, html })) {
    return { delivered: true };
  }

  const transport = getTransporter();

  if (transport) {
    try {
      await transport.sendMail({
        from: config.EMAIL_FROM || config.SMTP_USER,
        to,
        subject,
        html,
      });

      return { delivered: true };
    } catch (error) {
      console.error("[smtp] delivery failed:", error);
    }
  }

  // Nothing configured/reachable — log the body so flows stay testable in dev.
  console.log(
    `[mail:dev] to=${to} subject="${subject}"\n${html.replace(/<[^>]+>/g, " ")}`
  );
  return { delivered: false };
};

export const sendVerificationOtpEmail = async (
  to: string,
  otp: string
): Promise<{ delivered: boolean }> => {
  return sendEmail({
    to,
    subject: "Your Knottiingale verification code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #22223B;">
        <h2 style="color: #22223B; margin: 0 0 8px;">Welcome to Knottiingale ✨</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #4A4E69;">
          Use the code below to verify your email address and finish creating your account.
          The code expires in <strong>10 minutes</strong>.
        </p>
        <div style="background: #F2E9E4; border-radius: 12px; padding: 20px; text-align: center; margin: 16px 0;">
          <span style="font-size: 34px; font-weight: 700; letter-spacing: 8px; color: #22223B;">${otp}</span>
        </div>
        <p style="font-size: 13px; color: #9A8C98;">
          If you did not request this, you can safely ignore this email. No account will be created without verification.
        </p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (
  to: string,
  token: string
): Promise<{ delivered: boolean }> => {
  const link = `${config.CLIENT_URL ?? "http://localhost:5173"}/reset-password?token=${token}`;

  return sendEmail({
    to,
    subject: "Reset your Knottiingale password ✨",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #3B2924; background-color: #FFF8F0; border-radius: 24px; border: 1px solid #E8DCD0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 26px; font-weight: 700; color: #B85C4A; margin: 0;">Knottiingale</h1>
          <p style="font-size: 13px; color: #806E66; margin: 4px 0 0;">Handmade Crochet Treasures</p>
        </div>
        <div style="background-color: #FFFCF7; padding: 24px; border-radius: 16px; border: 1px solid #E8DCD0;">
          <h2 style="font-size: 18px; font-weight: 600; color: #3B2924; margin: 0 0 12px;">Reset your password</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #5E463E; margin: 0 0 20px;">
            We received a request to reset the password for your Knottiingale account. Tap the button below to choose a new secure password:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${link}" style="background-color: #B85C4A; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: bold; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(184, 92, 74, 0.25);">
              Reset My Password →
            </a>
          </div>
          <p style="font-size: 12px; line-height: 1.5; color: #806E66; margin: 20px 0 0; word-break: break-all;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${link}" style="color: #B85C4A;">${link}</a>
          </p>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <p style="font-size: 12px; color: #806E66; margin: 0;">
            This link is valid for 1 hour. If you didn't request this reset, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });
};
