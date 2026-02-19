import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Blog from "@/models/blog";
import { getSessionUser } from "@/lib/auth-helpers";
import { canModerateBlogs } from "@/lib/utils";
import { z } from "zod";

const bodySchema = z.object({
  note: z.string().min(1, "Rejection note is required").max(2000),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !canModerateBlogs(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON. Send { note: string }." },
      { status: 400 }
    );
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  await dbConnect();
  const { id } = await context.params;

  const update = {
    approved: false,
    status: "rejected" as const,
    rejectionNote: parsed.data.note,
    rejectedAt: new Date(),
    rejectedBy: new mongoose.Types.ObjectId(sessionUser.id),
  };

  const blog = await Blog.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true, runValidators: true }
  );

  if (!blog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: "Blog rejected",
  });
}
