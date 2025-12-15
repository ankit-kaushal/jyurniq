import nodemailer from "nodemailer";

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;
const host = process.env.EMAIL_HOST || "smtp.gmail.com";
const port = Number(process.env.EMAIL_PORT || 465);

if (!user || !pass) {
  console.warn("EMAIL_USER or EMAIL_PASSWORD not set; mailer disabled.");
}

export const transporter =
  user && pass
    ? nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465 (SSL), false for 587 (STARTTLS)
        auth: { user, pass },
      })
    : null;

export async function verifyTransport() {
  if (!transporter) throw new Error("Mailer not configured");
  return transporter.verify();
}

export async function sendVerificationEmail(to: string, link: string) {
  if (!transporter) {
    const error = "Mailer not configured - EMAIL_USER or EMAIL_PASSWORD missing";
    console.error(error);
    throw new Error(error);
  }

  try {
    // Verify connection first
    await transporter.verify();
    console.log("SMTP connection verified");
  } catch (verifyError) {
    console.error("SMTP verification failed:", verifyError);
    throw new Error("SMTP connection failed. Check your email credentials.");
  }

  try {
    const info = await transporter.sendMail({
      from: `"Jyurniq" <${user}>`,
      to,
      subject: "Verify your email",
      html: `<p>Welcome to Jyurniq!</p>
             <p>Click the link to verify your email:</p>
             <p><a href="${link}">${link}</a></p>
             <p>If you didn't request this, ignore this email.</p>`,
    });
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (sendError) {
    console.error("Failed to send email:", sendError);
    throw sendError;
  }
}

