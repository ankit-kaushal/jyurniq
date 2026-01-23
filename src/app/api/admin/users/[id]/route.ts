import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import { getSessionUser } from "@/lib/auth-helpers";
import { isAdmin } from "@/lib/utils";
import { z } from "zod";

const updateUserSchema = z.object({
  role: z.enum(["user", "admin"]).optional(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !isAdmin(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  await dbConnect();
  const user = await User.findById(id)
    .select("name email role emailVerified createdAt earnings bio avatar")
    .lean();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    _id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    earnings: user.earnings,
    bio: user.bio,
    avatar: user.avatar,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !isAdmin(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.message },
      { status: 400 }
    );
  }

  await dbConnect();
  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (parsed.data.role) {
    user.role = parsed.data.role;
  }

  await user.save();

  return NextResponse.json({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !isAdmin(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  
  // Prevent deleting yourself
  if (id === sessionUser.id) {
    return NextResponse.json(
      { error: "Cannot delete your own account" },
      { status: 400 }
    );
  }

  await dbConnect();
  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await user.deleteOne();
  return NextResponse.json({ success: true });
}
