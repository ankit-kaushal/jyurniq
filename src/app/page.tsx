import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p className={styles.badge}>Travel Blog Platform</p>
          <h1 className={styles.heading}>
            Share journeys, earn from 1:1 chats, embed anywhere.
          </h1>
          <p className={styles.subtitle}>
            Next.js + MongoDB + NextAuth + Stripe/Razorpay with blog CRUD,
            comments, paid questions, embeds, and admin moderation.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/dashboard">
              Go to Dashboard
            </Link>
            <Link className={styles.secondary} href="/blogs">
              Browse Blogs
            </Link>
          </div>
        </div>
        <div className={styles.card}>
          <h3>Embed snippet</h3>
          <code className={styles.code}>
            {`<iframe src="https://yourapp.com/embed/my-trip-slug" height="480" width="100%" />`}
          </code>
          <p className={styles.muted}>
            Give bloggers a drop-in iframe to showcase posts on any site.
          </p>
        </div>
      </header>

      <section className={styles.grid}>
        <div className={styles.tile}>
          <h3>Authentication</h3>
          <p>Email/password with NextAuth, roles (user/admin), profile fields.</p>
        </div>
        <div className={styles.tile}>
          <h3>Blogs</h3>
          <p>Rich content, images, travel type, location, privacy, approvals.</p>
        </div>
        <div className={styles.tile}>
          <h3>Engagement</h3>
          <p>Comments + replies on public posts, embed pages, contact hooks.</p>
        </div>
        <div className={styles.tile}>
          <h3>Monetization</h3>
          <p>Paid questions / 1:1 via Stripe or Razorpay; webhooks recorded.</p>
        </div>
        <div className={styles.tile}>
          <h3>Search & Filter</h3>
          <p>Filter by location, travel type, or author; ready for SEO tuning.</p>
        </div>
        <div className={styles.tile}>
          <h3>Admin</h3>
          <p>Approve/reject blogs and handle reports; secure role checks.</p>
        </div>
      </section>
    </div>
  );
}
