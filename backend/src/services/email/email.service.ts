import nodemailer, { Transporter } from "nodemailer";
import { env } from "../../config/env";

const config = env();

let transporter: Transporter | null = null;

const getTransporter = (): Transporter | null => {
  if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASS) {
    return null;
  }

  if (!transporter) {
    const isGmail =
      config.SMTP_HOST.toLowerCase().includes("gmail") ||
      config.SMTP_USER.toLowerCase().endsWith("@gmail.com");
    const port = config.SMTP_PORT || (isGmail ? 465 : 587);
    const secure = port === 465;

    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port,
      secure,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
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
 * Send via Resend HTTPS API (https://resend.com).
 * Zero IP whitelisting restrictions, highly reliable from Render/Vercel/cloud.
 */
const sendViaResend = async ({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<boolean> => {
  if (!config.RESEND_API_KEY) {
    return false;
  }

  try {
    const sender = parseSender(config.EMAIL_FROM);
    const from = sender.email.includes("@")
      ? `${sender.name} <${sender.email}>`
      : "Knottiingale <onboarding@resend.dev>";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    });

    if (response.ok) {
      console.log(`[resend] Email delivered to ${to}`);
      return true;
    }

    const errorText = await response.text();
    console.error(
      `[resend] delivery failed (${response.status}): ${errorText.slice(0, 300)}`
    );
  } catch (error) {
    console.error("[resend] delivery failed:", error);
  }

  return false;
};

/**
 * Send via an HTTPS email API (Brevo-style REST).
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
    const recipient = parseSender(to);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": config.EMAIL_API_KEY,
      },
      body: JSON.stringify({
        sender,
        to: [{ email: recipient.email }],
        subject,
        htmlContent: html,
      }),
    });

    if (response.ok) {
      return true;
    }

    const errorBody = await response.text();
    console.error(
      `[email-api] provider returned ${response.status}: ${errorBody.slice(0, 300)}`
    );

    if (response.status === 401 && errorBody.includes("authorised_ips")) {
      console.error(
        "⚠️ [BREVO IP RESTRICTION ACTIVE] Brevo rejected this email because 'Authorised IPs' is enabled.\n" +
        "To allow sending from any server/IP, log into Brevo and turn off 'Authorised IPs':\n" +
        "➡️ https://app.brevo.com/security/authorised_ips"
      );
    }
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
  // 1. SMTP (e.g. Gmail App Password, verified custom mail server)
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

  // 2. Resend API (if configured with custom verified domain)
  if (config.RESEND_API_KEY) {
    if (await sendViaResend({ to, subject, html })) {
      return { delivered: true };
    }
  }

  // 3. Brevo HTTPS email API (works if Authorised IPs disabled in Brevo)
  if (config.EMAIL_API_KEY) {
    if (await sendViaHttpApi({ to, subject, html })) {
      return { delivered: true };
    }
  }

  // Nothing configured/reachable — log the body so flows stay testable in dev/console.
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

export const sendOrderConfirmationEmail = async (
  to: string,
  order: any
): Promise<{ delivered: boolean }> => {
  const orderUrl = `${config.CLIENT_URL ?? "http://localhost:5173"}/orders/${order._id}`;
  const itemsHtml = order.items
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #E8DCD0; font-size: 14px; color: #3B2924;">
          <strong>${item.name}</strong> × ${item.quantity}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #E8DCD0; font-size: 14px; text-align: right; color: #3B2924; font-weight: 600;">
          ₹${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join("");

  return sendEmail({
    to,
    subject: `Order Confirmed: #${order._id.toString().slice(-8).toUpperCase()} ✨ Knottiingale`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #3B2924; background-color: #FFF8F0; border-radius: 24px; border: 1px solid #E8DCD0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 26px; font-weight: 700; color: #B85C4A; margin: 0;">Knottiingale</h1>
          <p style="font-size: 13px; color: #806E66; margin: 4px 0 0;">Handmade with love by Shikkha Rai</p>
        </div>
        <div style="background-color: #FFFCF7; padding: 24px; border-radius: 16px; border: 1px solid #E8DCD0;">
          <h2 style="font-size: 20px; font-weight: 700; color: #3B2924; margin: 0 0 10px;">Thank you for your order! 🎉</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #5E463E; margin: 0 0 20px;">
            Your crochet order has been received and is being prepared with heartfelt care.
          </p>

          <div style="background-color: #F7EFE6; padding: 14px 18px; border-radius: 12px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; color: #806E66;">Order ID: <strong style="color: #3B2924;">#${order._id.toString().slice(-8).toUpperCase()}</strong></p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #806E66;">Payment: <strong style="color: #3B2924;">${order.paymentMethod} (${order.paymentStatus})</strong></p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="text-align: left; padding-bottom: 8px; font-size: 12px; color: #806E66; text-transform: uppercase;">Item</th>
                <th style="text-align: right; padding-bottom: 8px; font-size: 12px; color: #806E66; text-transform: uppercase;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding-top: 14px; font-size: 13px; color: #806E66;">Subtotal</td>
                <td style="padding-top: 14px; font-size: 13px; text-align: right; color: #3B2924;">₹${order.subtotal?.toLocaleString()}</td>
              </tr>
              ${
                order.discount > 0
                  ? `<tr>
                      <td style="padding-top: 6px; font-size: 13px; color: #7A8B68;">Discount Applied</td>
                      <td style="padding-top: 6px; font-size: 13px; text-align: right; color: #7A8B68;">-₹${order.discount.toLocaleString()}</td>
                    </tr>`
                  : ""
              }
              <tr>
                <td style="padding-top: 6px; font-size: 13px; color: #806E66;">Shipping</td>
                <td style="padding-top: 6px; font-size: 13px; text-align: right; color: #3B2924;">${order.shippingCharge === 0 ? "FREE" : `₹${order.shippingCharge}`}</td>
              </tr>
              <tr>
                <td style="padding-top: 6px; font-size: 13px; color: #806E66;">GST (18%)</td>
                <td style="padding-top: 6px; font-size: 13px; text-align: right; color: #3B2924;">₹${order.tax?.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-top: 12px; font-size: 16px; font-weight: 700; color: #3B2924; border-top: 2px solid #E8DCD0;">Total</td>
                <td style="padding-top: 12px; font-size: 16px; font-weight: 700; text-align: right; color: #B85C4A; border-top: 2px solid #E8DCD0;">₹${order.totalAmount?.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div style="border-top: 1px solid #E8DCD0; padding-top: 16px; margin-bottom: 24px;">
            <h4 style="margin: 0 0 6px; font-size: 13px; text-transform: uppercase; color: #806E66;">Delivery Address</h4>
            <p style="margin: 0; font-size: 13px; color: #3B2924; line-height: 1.5;">
              ${order.shippingAddress.fullName}<br/>
              ${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? ", " + order.shippingAddress.addressLine2 : ""}<br/>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}<br/>
              Phone: ${order.shippingAddress.phone}
            </p>
          </div>

          <div style="text-align: center;">
            <a href="${orderUrl}" style="background-color: #B85C4A; color: #ffffff; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: bold; text-decoration: none; display: inline-block;">
              Track Order & View Details →
            </a>
          </div>
        </div>
      </div>
    `,
  });
};

export const sendOrderStatusUpdateEmail = async (
  to: string,
  order: any,
  status: string
): Promise<{ delivered: boolean }> => {
  const orderUrl = `${config.CLIENT_URL ?? "http://localhost:5173"}/orders/${order._id}`;
  const trackingInfo = order.trackingNumber
    ? `<div style="background-color: #F7EFE6; padding: 12px 16px; border-radius: 12px; margin: 16px 0;">
        <p style="margin: 0; font-size: 13px; color: #806E66;">Courier / Carrier: <strong style="color: #3B2924;">${order.courierName || "Standard Shipping"}</strong></p>
        <p style="margin: 4px 0 0; font-size: 13px; color: #806E66;">Tracking Number: <strong style="color: #B85C4A;">${order.trackingNumber}</strong></p>
      </div>`
    : "";

  return sendEmail({
    to,
    subject: `Order Update: #${order._id.toString().slice(-8).toUpperCase()} is now ${status} ✨`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #3B2924; background-color: #FFF8F0; border-radius: 24px; border: 1px solid #E8DCD0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 26px; font-weight: 700; color: #B85C4A; margin: 0;">Knottiingale</h1>
          <p style="font-size: 13px; color: #806E66; margin: 4px 0 0;">Handmade Crochet Treasures</p>
        </div>
        <div style="background-color: #FFFCF7; padding: 24px; border-radius: 16px; border: 1px solid #E8DCD0;">
          <h2 style="font-size: 20px; font-weight: 700; color: #3B2924; margin: 0 0 10px;">Order Status: ${status} 📦</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #5E463E; margin: 0 0 16px;">
            Your order <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong> has been updated to <strong>${status}</strong>.
          </p>

          ${trackingInfo}

          <div style="text-align: center; margin-top: 24px;">
            <a href="${orderUrl}" style="background-color: #B85C4A; color: #ffffff; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: bold; text-decoration: none; display: inline-block;">
              View Order Tracking →
            </a>
          </div>
        </div>
      </div>
    `,
  });
};

export const sendContactNotificationEmail = async (
  inquiry: { name: string; email: string; phone?: string; subject: string; message: string }
): Promise<{ delivered: boolean }> => {
  const adminEmail = parseSender(
    config.EMAIL_FROM || config.SMTP_USER || "shruti.rai2901@gmail.com"
  ).email;

  // Notify owner
  await sendEmail({
    to: adminEmail,
    subject: `New Customer Inquiry: ${inquiry.subject} from ${inquiry.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #3B2924;">
        <h2>New Inquiry on Knottiingale 💌</h2>
        <p><strong>From:</strong> ${inquiry.name} (${inquiry.email})</p>
        ${inquiry.phone ? `<p><strong>Phone:</strong> ${inquiry.phone}</p>` : ""}
        <p><strong>Subject:</strong> ${inquiry.subject}</p>
        <div style="background: #F7EFE6; padding: 16px; border-radius: 8px; margin-top: 12px;">
          <p style="margin: 0; white-space: pre-wrap;">${inquiry.message}</p>
        </div>
      </div>
    `,
  });

  // Confirm to customer
  return sendEmail({
    to: inquiry.email,
    subject: "We received your message! ✨ Knottiingale",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #3B2924; background-color: #FFF8F0; border-radius: 24px; border: 1px solid #E8DCD0;">
        <h2 style="color: #B85C4A; margin-top: 0;">Thank you for contacting Knottiingale! ✨</h2>
        <p>Hi ${inquiry.name},</p>
        <p>We've received your note regarding <strong>"${inquiry.subject}"</strong>. Shikkha Rai will personally review your request and get back to you within 24 hours.</p>
        <div style="background: #FFFCF7; padding: 16px; border-radius: 12px; border: 1px solid #E8DCD0; margin: 16px 0;">
          <p style="margin: 0; font-size: 13px; color: #806E66;">Your Message:</p>
          <p style="margin: 6px 0 0; font-size: 14px; color: #3B2924; white-space: pre-wrap;">${inquiry.message}</p>
        </div>
        <p style="font-size: 13px; color: #806E66;">Warmly,<br/>Shikkha Rai & The Knottiingale Team</p>
      </div>
    `,
  });
};
