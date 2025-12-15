import mongoose, { Schema, type Model, type Types } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  earnings: number;
  emailVerified: boolean;
  verificationToken?: string;
  // Contact & monetization
  contactEnabled: boolean;
  questionPrice: number; // Price for paid questions (e.g., 20)
  conversationPrice: number; // Price for 1:1 conversations (e.g., 100)
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    avatar: { type: String },
    bio: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    earnings: { type: Number, default: 0 },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    contactEnabled: { type: Boolean, default: false },
    questionPrice: { type: Number, default: 20 },
    conversationPrice: { type: Number, default: 100 },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

