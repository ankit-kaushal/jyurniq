import mongoose, { Schema, type Model, type Types } from "mongoose";

export type TravelType = "solo" | "family" | "budget" | "luxury";
export type BlogPrivacy = "public" | "private";
export type BlogStatus = "pending" | "approved" | "rejected";

export interface IBlog {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  location?: string;
  travelType?: TravelType;
  images: string[];
  privacy: BlogPrivacy;
  author: Types.ObjectId;
  approved: boolean;
  /** Explicit state: pending (awaiting review), approved, or rejected */
  status?: BlogStatus;
  /** Set when blog is rejected by editor/admin */
  rejectionNote?: string;
  rejectedAt?: Date;
  rejectedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    location: { type: String },
    travelType: {
      type: String,
      enum: ["solo", "family", "budget", "luxury"],
    },
    images: [{ type: String }],
    privacy: { type: String, enum: ["public", "private"], default: "public" },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    approved: { type: Boolean, default: true },
    status: { type: String, enum: ["pending", "approved", "rejected"] },
    rejectionNote: { type: String },
    rejectedAt: { type: Date },
    rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;

