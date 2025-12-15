# Jyurniq – Travel Blog Platform

Full-stack Next.js + MongoDB starter for travel blogging with auth, blog CRUD, comments, embeds, and paid questions/1:1 chat via Stripe or Razorpay.

## Stack
- Next.js (App Router, TypeScript)
- MongoDB + Mongoose
- NextAuth (credentials)
- Stripe or Razorpay payments
- Cloudinary uploads

## Setup
1) Create `.env.local` and fill:
```
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=...
MONGODB_DB=jyurniq
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

2) Install deps:
```
npm install
```

3) Run dev server:
```
npm run dev
```

## Key API routes
- Auth: `POST /api/auth/register`, `api/auth/[...nextauth]`
- Blogs: `GET/POST /api/blogs`, `GET/PATCH/DELETE /api/blogs/:id`
- Comments: `POST /api/blogs/:id/comments`
- Payments: `POST /api/payments/checkout`, `POST /api/payments/webhook`
- Uploads: `POST /api/upload` (Cloudinary)
- Embed page: `/embed/:slug` (iframe-ready)
- Admin approve: `PATCH /api/admin/blogs/:id/approve`

## UI pages
- `/` landing summary
- `/blogs` list
- `/blogs/[id]` detail + comments
- `/dashboard` creator overview
- `/admin` moderation overview

## Notes
- Uses modular CSS (no Tailwind).
- Slugs are generated from titles; privacy enforced on fetch.
- Payments create checkout/order; configure secrets + webhook before prod.
