import { NextResponse } from "next/server";
import Stripe from "stripe";
import Razorpay from "razorpay";
import { z } from "zod";
import dbConnect from "@/lib/db";
import Payment from "@/models/payment";
import { getSessionUser } from "@/lib/auth-helpers";

const payloadSchema = z.object({
  bloggerId: z.string(),
  amount: z.number().min(1),
  currency: z.string().default("INR"),
  type: z.enum(["question", "conversation", "message"]),
  gateway: z.enum(["stripe", "razorpay"]).default("razorpay"),
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  await dbConnect();

  const payment = await Payment.create({
    customer: sessionUser.id,
    blogger: parsed.data.bloggerId,
    amount: parsed.data.amount,
    currency: parsed.data.currency,
    status: "pending",
    type: parsed.data.type,
    gateway: parsed.data.gateway,
    metadata: parsed.data.metadata,
  });

  if (parsed.data.gateway === "stripe") {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }
    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-11-20" as any });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: parsed.data.currency.toLowerCase(),
            product_data: {
              name: `${parsed.data.type} with blogger`,
            },
            unit_amount: Math.round(parsed.data.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: { paymentId: payment._id.toString() },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/cancel`,
    });

    payment.externalId = session.id;
    await payment.save();

    return NextResponse.json({ sessionId: session.id });
  }

  // Razorpay flow
  const razorKey = process.env.RAZORPAY_KEY_ID;
  const razorSecret = process.env.RAZORPAY_KEY_SECRET;
  if (!razorKey || !razorSecret) {
    return NextResponse.json(
      { error: "Razorpay not configured" },
      { status: 500 }
    );
  }
  const razorpay = new Razorpay({ key_id: razorKey, key_secret: razorSecret });
  const order = await razorpay.orders.create({
    amount: Math.round(parsed.data.amount * 100),
    currency: parsed.data.currency,
    receipt: payment._id.toString(),
    notes: { type: parsed.data.type },
  });

  payment.externalId = order.id;
  await payment.save();

  return NextResponse.json({ orderId: order.id });
}

