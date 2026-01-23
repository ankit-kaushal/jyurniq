"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import styles from "./analytics.module.css";

interface Analytics {
  users: {
    total: number;
    verified: number;
    admins: number;
    recent: number;
  };
  blogs: {
    total: number;
    approved: number;
    pending: number;
    public: number;
    private: number;
    recent: number;
  };
  comments: {
    total: number;
    recent: number;
  };
  payments: {
    total: number;
    successful: number;
    totalEarnings: number;
  };
  topBloggers: Array<{
    userId: string;
    name: string;
    email: string;
    blogCount: number;
  }>;
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/dashboard");
        return;
      }
      fetchAnalytics();
    }
  }, [status, session, router]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      } else if (res.status === 403) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className={styles.wrap}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={styles.wrap}>
        <p>Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Analytics" },
        ]}
      />
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Admin Panel</p>
          <h1 className={styles.heading}>Platform Analytics</h1>
          <p className={styles.meta}>
            Overview of platform statistics and user activity.
          </p>
        </div>
        <Link href="/admin" className={styles.backButton}>
          ← Back to Admin
        </Link>
      </header>

      <div className={styles.grid}>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Total Users</h3>
          <p className={styles.statValue}>{analytics.users.total}</p>
          <p className={styles.statSubtext}>
            {analytics.users.verified} verified • {analytics.users.admins} admins
          </p>
        </div>

        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Total Blogs</h3>
          <p className={styles.statValue}>{analytics.blogs.total}</p>
          <p className={styles.statSubtext}>
            {analytics.blogs.approved} approved • {analytics.blogs.pending} pending
          </p>
        </div>

        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Total Comments</h3>
          <p className={styles.statValue}>{analytics.comments.total}</p>
          <p className={styles.statSubtext}>
            {analytics.comments.recent} in last 7 days
          </p>
        </div>

        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Total Earnings</h3>
          <p className={styles.statValue}>₹{analytics.payments.totalEarnings.toFixed(2)}</p>
          <p className={styles.statSubtext}>
            {analytics.payments.successful} successful payments
          </p>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Blog Statistics</h2>
        <div className={styles.statsGrid}>
          <div className={styles.miniCard}>
            <span className={styles.miniLabel}>Public Blogs</span>
            <span className={styles.miniValue}>{analytics.blogs.public}</span>
          </div>
          <div className={styles.miniCard}>
            <span className={styles.miniLabel}>Private Blogs</span>
            <span className={styles.miniValue}>{analytics.blogs.private}</span>
          </div>
          <div className={styles.miniCard}>
            <span className={styles.miniLabel}>Recent Blogs (7d)</span>
            <span className={styles.miniValue}>{analytics.blogs.recent}</span>
          </div>
          <div className={styles.miniCard}>
            <span className={styles.miniLabel}>Recent Users (7d)</span>
            <span className={styles.miniValue}>{analytics.users.recent}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Top Bloggers</h2>
        {analytics.topBloggers.length === 0 ? (
          <p className={styles.empty}>No bloggers yet</p>
        ) : (
          <div className={styles.topBloggers}>
            {analytics.topBloggers.map((blogger, index) => (
              <div key={blogger.userId} className={styles.bloggerCard}>
                <div className={styles.rank}>#{index + 1}</div>
                <div className={styles.bloggerInfo}>
                  <h4 className={styles.bloggerName}>{blogger.name}</h4>
                  <p className={styles.bloggerEmail}>{blogger.email}</p>
                </div>
                <div className={styles.bloggerStats}>
                  <span className={styles.blogCount}>{blogger.blogCount} blogs</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
