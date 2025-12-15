import mongoose, { Schema, type Model, type Types } from "mongoose";

export type PaymentStatus = "pending" | "succeeded" | "failed";
export type PaymentType = "question" | "conversation" | "message";

export interface IPayment {
  _id: Types.ObjectId;
  customer: Types.ObjectId;
  blogger: Types.ObjectId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: PaymentType;
  gateway: "stripe" | "razorpay";
  externalId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    blogger: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["question", "conversation", "message"],
      required: true,
    },
    gateway: { type: String, enum: ["stripe", "razorpay"], required: true },
    externalId: { type: String },
    metadata: { type: Object },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;

