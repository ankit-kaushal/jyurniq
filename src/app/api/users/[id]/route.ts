import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const user = await User.findById(params.id).select(
    "name email bio avatar contactEnabled questionPrice conversationPrice createdAt"
  );
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

