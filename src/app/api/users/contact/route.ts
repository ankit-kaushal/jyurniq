import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import { getSessionUser } from "@/lib/auth-helpers";
import { z } from "zod";

const contactSchema = z.object({
  contactEnabled: z.boolean().optional(),
  questionPrice: z.number().min(0).optional(),
  conversationPrice: z.number().min(0).optional(),
  bio: z.string().optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const userDoc = await User.findById(user.id).select(
    "name email bio avatar contactEnabled questionPrice conversationPrice"
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
    contactEnabled: userDoc.contactEnabled,
    questionPrice: userDoc.questionPrice,
    conversationPrice: userDoc.conversationPrice,
  });
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = contactSchema.safeParse(body);
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

  Object.assign(userDoc, parsed.data);
  await userDoc.save();

  return NextResponse.json({
    contactEnabled: userDoc.contactEnabled,
    questionPrice: userDoc.questionPrice,
    conversationPrice: userDoc.conversationPrice,
    bio: userDoc.bio,
  });
}

