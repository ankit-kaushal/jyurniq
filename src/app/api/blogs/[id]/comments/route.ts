import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/blog";
import Comment from "@/models/comment";
import { getSessionUser } from "@/lib/auth-helpers";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(2),
  parentId: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const blog = await Blog.findById(params.id);
  if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (blog.privacy === "private") {
    return NextResponse.json(
      { error: "Comments disabled on private blogs" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const comment = await Comment.create({
    blog: blog._id,
    author: sessionUser.id,
    content: parsed.data.content,
    parent: parsed.data.parentId,
  });

  return NextResponse.json(comment, { status: 201 });
}

