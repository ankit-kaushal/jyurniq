import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IComment {
  _id: Types.ObjectId;
  blog: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  parent?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    blog: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    parent: { type: Schema.Types.ObjectId, ref: "Comment" },
  },
  { timestamps: true }
);

const Comment: Model<IComment> =
  mongoose.models.Comment ||
  mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;

