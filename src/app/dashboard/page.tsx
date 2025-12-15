import Link from "next/link";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Creator</p>
          <h1 className={styles.heading}>Your dashboard</h1>
          <p className={styles.meta}>Manage blogs, earnings, and requests.</p>
        </div>
        <Link className={styles.button} href="/blogs">
          View public feed
        </Link>
      </header>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Write a blog</h3>
          <p>Create, edit, or delete your travel posts.</p>
          <code>POST /api/blogs</code>
        </div>
        <div className={styles.card}>
          <h3>Paid questions</h3>
          <p>Enable Rs20 questions or Rs100 conversations.</p>
          <code>POST /api/payments/checkout</code>
        </div>
        <div className={styles.card}>
          <h3>Embeds</h3>
          <p>Share iframe code to drop posts into any site.</p>
          <code>{`/embed/:slug`}</code>
        </div>
        <div className={styles.card}>
          <h3>Earnings</h3>
          <p>Track payment status via webhook updates.</p>
          <code>GET /api/payments</code>
        </div>
      </div>
    </div>
  );
}

