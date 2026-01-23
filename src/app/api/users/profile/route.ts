import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import { getSessionUser } from "@/lib/auth-helpers";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().url().optional(),
  bio: z.string().optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const userDoc = await User.findById(user.id).select(
    "name email bio avatar"
  );
  if (!userDoc) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    _id: userDoc._id.toString(),
    name: userDoc.name,
    email: userDoc.email,
    bio: userDoc.bio,
    avatar: userDoc.avatar,
  });
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.message },
      { status: 400 }
    );
  }

  await dbConnect();
  const userDoc = await User.findById(user.id);
  if (!userDoc) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Email cannot be changed - only name, avatar, and bio
  if (parsed.data.name) userDoc.name = parsed.data.name;
  if (parsed.data.avatar) userDoc.avatar = parsed.data.avatar;
  if (parsed.data.bio !== undefined) userDoc.bio = parsed.data.bio;

  await userDoc.save();

  return NextResponse.json({
    _id: userDoc._id.toString(),
    name: userDoc.name,
    email: userDoc.email,
    bio: userDoc.bio,
    avatar: userDoc.avatar,
  });
}
