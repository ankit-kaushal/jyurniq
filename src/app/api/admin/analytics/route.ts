import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import Blog from "@/models/blog";
import Comment from "@/models/comment";
import Payment from "@/models/payment";
import { getSessionUser } from "@/lib/auth-helpers";
import { isAdmin } from "@/lib/utils";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !isAdmin(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();

  // Get counts
  const totalUsers = await User.countDocuments({});
  const verifiedUsers = await User.countDocuments({ emailVerified: true });
  const adminUsers = await User.countDocuments({ role: "admin" });
  const totalBlogs = await Blog.countDocuments({});
  const approvedBlogs = await Blog.countDocuments({ approved: true });
  const pendingBlogs = await Blog.countDocuments({ approved: false });
  const publicBlogs = await Blog.countDocuments({ privacy: "public" });
  const privateBlogs = await Blog.countDocuments({ privacy: "private" });
  const totalComments = await Comment.countDocuments({});
  const totalPayments = await Payment.countDocuments({});
  const successfulPayments = await Payment.countDocuments({ status: "succeeded" });
  const totalEarnings = await Payment.aggregate([
    { $match: { status: "succeeded" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentUsers = await User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const recentBlogs = await Blog.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const recentComments = await Comment.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  // Top bloggers
  const topBloggers = await Blog.aggregate([
    { $group: { _id: "$author", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        userId: { $toString: "$_id" },
        name: "$user.name",
        email: "$user.email",
        blogCount: "$count",
      },
    },
  ]);

  return NextResponse.json({
    users: {
      total: totalUsers,
      verified: verifiedUsers,
      admins: adminUsers,
      recent: recentUsers,
    },
    blogs: {
      total: totalBlogs,
      approved: approvedBlogs,
      pending: pendingBlogs,
      public: publicBlogs,
      private: privateBlogs,
      recent: recentBlogs,
    },
    comments: {
      total: totalComments,
      recent: recentComments,
    },
    payments: {
      total: totalPayments,
      successful: successfulPayments,
      totalEarnings: totalEarnings[0]?.total || 0,
    },
    topBloggers,
  });
}
