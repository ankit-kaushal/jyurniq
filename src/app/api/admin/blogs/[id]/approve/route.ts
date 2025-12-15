import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/blog";
import { getSessionUser } from "@/lib/auth-helpers";
import { isAdmin } from "@/lib/utils";

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !isAdmin(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const blog = await Blog.findById(params.id);
  if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });

  blog.approved = true;
  await blog.save();
  return NextResponse.json(blog);
}

