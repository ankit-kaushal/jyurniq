import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import { sendVerificationEmail } from "@/lib/mailer";
import { z } from "zod";
import crypto from "crypto";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);

    await dbConnect();
    const existing = await User.findOne({ email: parsed.email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(parsed.password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const user = await User.create({
      name: parsed.name,
      email: parsed.email,
      password: hashed,
      role: "viewer",
      emailVerified: false,
      verificationToken,
    });

    // Send verification email if configured
    if (process.env.NEXT_PUBLIC_APP_URL && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${verificationToken}`;
        await sendVerificationEmail(user.email, verifyLink);
        console.log(`Verification email sent to ${user.email}`);
      } catch (err) {
        console.error("Email send failed during registration", err);
        // Don't fail registration if email fails, but log it
      }
    } else {
      console.warn("Email not configured - verification email not sent");
    }

    return NextResponse.json(
      { id: user._id.toString(), email: user.email },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 400 });
  }
}

