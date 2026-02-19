import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/blog";
import User from "@/models/user";
import { getSessionUser } from "@/lib/auth-helpers";
import { canModerateBlogs } from "@/lib/utils";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !canModerateBlogs(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  // Only blogs awaiting review: status "pending", or legacy docs (no status, not approved, no rejection note).
  const blogs = await Blog.find({
    $or: [
      { status: "pending" },
      {
        status: { $exists: false },
        approved: false,
        $or: [
          { rejectionNote: { $exists: false } },
          { rejectionNote: null },
          { rejectionNote: "" },
        ],
      },
    ],
  })
    .sort({ createdAt: -1 })
    .populate("author", "name email")
    .lean();

  return NextResponse.json(blogs);
}

