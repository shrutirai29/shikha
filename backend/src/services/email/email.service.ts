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
    });
  }

  return transporter;
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
  const transport = getTransporter();

  if (!transport) {
    // SMTP not configured — log the email body so flows remain testable in dev.
    console.log(
      `[mail:dev] to=${to} subject="${subject}"\n${html.replace(/<[^>]+>/g, " ")}`
    );
    return { delivered: false };
  }

  await transport.sendMail({
    from: config.EMAIL_FROM || config.SMTP_USER,
    to,
    subject,
    html,
  });

  return { delivered: true };
};

export const sendVerificationEmail = async (
  to: string,
  token: string
): Promise<void> => {
  const link = `${config.CLIENT_URL ?? "http://localhost:5173"}/verify-email?token=${token}`;

  await sendEmail({
    to,
    subject: "Verify your Shikha account",
    html: `
      <h2>Welcome to Shikha!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${link}">Verify Email</a></p>
      <p>This link is valid for 24 hours.</p>
    `,
  });
};

export const sendOtpEmail = async (
  to: string,
  code: string,
  purpose: "email" | "phone" = "email"
): Promise<{ delivered: boolean }> => {
  const subject =
    purpose === "phone"
      ? "Your Shikha phone verification code"
      : "Your Shikha verification code";
  const label =
    purpose === "phone" ? "phone number" : "email address";

  return sendEmail({
    to,
    subject,
    html: `
      <h2>Verify your Shikha account</h2>
      <p>Use the code below to verify your ${label}:</p>
      <p style="font-size:28px;letter-spacing:6px;font-weight:700">${code}</p>
      <p>This code expires in 10 minutes. If you did not create an account, you can safely ignore this email.</p>
    `,
  });
};

export const sendPasswordResetEmail = async (
  to: string,
  token: string
): Promise<void> => {
  const link = `${config.CLIENT_URL ?? "http://localhost:5173"}/reset-password?token=${token}`;

  await sendEmail({
    to,
    subject: "Reset your Shikha password",
    html: `
      <h2>Reset your password</h2>
      <p>We received a request to reset your password. Click the link below to choose a new one:</p>
      <p><a href="${link}">Reset Password</a></p>
      <p>This link is valid for 1 hour. If you did not request this, you can safely ignore this email.</p>
    `,
  });
};
