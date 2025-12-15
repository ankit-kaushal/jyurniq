import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import { sendVerificationEmail } from "@/lib/mailer";
import { z } from "zod";
import crypto from "crypto";

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resendSchema.parse(body);

    await dbConnect();
    const user = await User.findOne({ email: parsed.email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { error: "Email not found. Please check your email address or sign up first." },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    await user.save();

    // Check if email is configured
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error("NEXT_PUBLIC_APP_URL not set");
      return NextResponse.json(
        { error: "Email service not configured. Please contact support." },
        { status: 500 }
      );
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("EMAIL_USER or EMAIL_PASSWORD not set");
      return NextResponse.json(
        { error: "Email service not configured. Please contact support." },
        { status: 500 }
      );
    }

    try {
      const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${verificationToken}`;
      await sendVerificationEmail(user.email, verifyLink);
      console.log(`Verification email sent to ${user.email}`);
      return NextResponse.json(
        { message: "Verification email sent! Please check your inbox." },
        { status: 200 }
      );
    } catch (err) {
      console.error("Email send failed", err);
      return NextResponse.json(
        { error: "Failed to send email. Please try again later or contact support." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Resend verification error", error);
    return NextResponse.json(
      { error: "Failed to resend verification email" },
      { status: 500 }
    );
  }
}

