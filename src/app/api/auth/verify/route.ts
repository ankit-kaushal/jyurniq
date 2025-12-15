import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  await dbConnect();
  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  user.emailVerified = true;
  user.verificationToken = undefined;
  await user.save();

  return NextResponse.json({ success: true });
}

