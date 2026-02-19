import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/blog";
import { getSessionUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const blogs = await Blog.find({ author: user.id })
    .sort({ createdAt: -1 })
    .select("title slug location travelType privacy approved status createdAt rejectionNote rejectedAt");

  return NextResponse.json(blogs);
}

