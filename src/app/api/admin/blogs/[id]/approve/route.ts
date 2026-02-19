import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/blog";
import { getSessionUser } from "@/lib/auth-helpers";
import { canModerateBlogs } from "@/lib/utils";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !canModerateBlogs(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const { id } = await context.params;
  const blog = await Blog.findById(id);
  if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });

  blog.approved = true;
  blog.status = "approved";
  blog.rejectionNote = undefined;
  blog.rejectedAt = undefined;
  blog.rejectedBy = undefined;
  await blog.save();
  return NextResponse.json(blog);
}

