import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/blog";
import { getSessionUser } from "@/lib/auth-helpers";
import { isAdmin } from "@/lib/utils";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !isAdmin(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const { id } = await context.params;
  const blog = await Blog.findById(id);
  if (!blog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Instead of deleting, we can mark as rejected or delete
  // For now, we'll delete it, but you could add a "rejected" status
  await blog.deleteOne();
  
  return NextResponse.json({ success: true, message: "Blog rejected and deleted" });
}

