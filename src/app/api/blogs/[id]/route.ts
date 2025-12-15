import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/blog";
import { getSessionUser } from "@/lib/auth-helpers";
import { z } from "zod";
import { isAdmin } from "@/lib/utils";

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  content: z.string().min(20).optional(),
  location: z.string().optional(),
  travelType: z.enum(["solo", "family", "budget", "luxury"]).optional(),
  images: z.array(z.string()).optional(),
  privacy: z.enum(["public", "private"]).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const blog = await Blog.findById(params.id);
  if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (blog.privacy === "private") {
    const sessionUser = await getSessionUser();
    const isOwner = sessionUser?.id === blog.author.toString();
    if (!isOwner && !isAdmin(sessionUser?.role)) {
      return NextResponse.json({ error: "Private blog" }, { status: 403 });
    }
  }

  return NextResponse.json(blog);
}

export async function PATCH(
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

  const isOwner = blog.author.toString() === sessionUser.id;
  if (!isOwner && !isAdmin(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  Object.assign(blog, parsed.data);
  await blog.save();

  return NextResponse.json(blog);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const blog = await Blog.findById(params.id);
  if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = blog.author.toString() === sessionUser.id;
  if (!isOwner && !isAdmin(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await blog.deleteOne();
  return NextResponse.json({ success: true });
}

