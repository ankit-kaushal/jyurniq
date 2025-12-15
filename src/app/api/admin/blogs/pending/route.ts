import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/blog";
import User from "@/models/user";
import { getSessionUser } from "@/lib/auth-helpers";
import { isAdmin } from "@/lib/utils";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !isAdmin(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const blogs = await Blog.find({ approved: false })
    .sort({ createdAt: -1 })
    .populate("author", "name email")
    .lean();

  return NextResponse.json(blogs);
}

