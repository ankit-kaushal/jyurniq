import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/blog";
import { getSessionUser } from "@/lib/auth-helpers";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const blogSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(20),
  location: z.string().optional(),
  travelType: z.enum(["solo", "family", "budget", "luxury"]).optional(),
  images: z.array(z.string()).optional(),
  privacy: z.enum(["public", "private"]).default("public"),
});

export async function GET(request: Request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location") || undefined;
  const travelType = searchParams.get("travelType") || undefined;
  const author = searchParams.get("author") || undefined;

  const filters: Record<string, unknown> = { privacy: "public", approved: true };
  if (location) filters.location = location;
  if (travelType) filters.travelType = travelType;
  if (author) filters.author = author;

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const skip = (page - 1) * limit;

  const blogs = await Blog.find(filters)
    .sort({ createdAt: -1 })
    .select("title slug location travelType privacy createdAt author images")
    .populate("author", "name email avatar")
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Blog.countDocuments(filters);

  return NextResponse.json({
    blogs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await request.json();
  const parsed = blogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const slugBase = slugify(parsed.data.title);
  const slug =
    slugBase ||
    Math.random().toString(36).substring(2, 8); // ensure non-empty slug

  const blog = await Blog.create({
    ...parsed.data,
    slug,
    author: user.id,
    approved: user.role === "admin",
  });

  return NextResponse.json(blog, { status: 201 });
}

