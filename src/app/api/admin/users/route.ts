import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import { getSessionUser } from "@/lib/auth-helpers";
import { isAdmin } from "@/lib/utils";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !isAdmin(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const users = await User.find({})
    .select("name email role emailVerified createdAt earnings")
    .sort({ createdAt: -1 })
    .lean();

  const serializedUsers = users.map((user: any) => ({
    _id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    earnings: user.earnings,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
  }));

  return NextResponse.json({ users: serializedUsers });
}
