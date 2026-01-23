import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/blog";
import { getSessionUser } from "@/lib/auth-helpers";
import { isAdmin } from "@/lib/utils";

export async function GET(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !isAdmin(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status"); // "all", "approved", "pending"
  const privacy = searchParams.get("privacy"); // "all", "public", "private"

  const filters: Record<string, unknown> = {};
  if (status === "approved") filters.approved = true;
  if (status === "pending") filters.approved = false;
  if (privacy === "public") filters.privacy = "public";
  if (privacy === "private") filters.privacy = "private";

  const blogs = await Blog.find(filters)
    .sort({ createdAt: -1 })
    .populate("author", "name email")
    .select("title slug location travelType privacy approved createdAt author")
    .lean();

  const serializedBlogs = blogs.map((blog: any) => ({
    _id: String(blog._id),
    title: blog.title,
    slug: blog.slug,
    location: blog.location,
    travelType: blog.travelType,
    privacy: blog.privacy,
    approved: blog.approved,
    createdAt: blog.createdAt ? new Date(blog.createdAt).toISOString() : new Date().toISOString(),
    author: blog.author
      ? {
          _id: String(blog.author._id),
          name: typeof blog.author === "object" ? blog.author.name : undefined,
          email: typeof blog.author === "object" ? blog.author.email : undefined,
        }
      : null,
  }));

  return NextResponse.json({ blogs: serializedBlogs });
}
