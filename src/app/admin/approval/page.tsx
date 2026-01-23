"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import styles from "./approval.module.css";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  location?: string;
  travelType?: string;
  privacy: string;
  images: string[];
  author: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ApprovalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

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
      fetchPendingBlogs();
    }
  }, [status, session, router]);

  const fetchPendingBlogs = async () => {
    try {
      const res = await fetch("/api/admin/blogs/pending");
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      } else if (res.status === 403) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to fetch pending blogs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Approve this blog?")) return;
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/blogs/${id}/approve`, {
        method: "PATCH",
      });
      if (res.ok) {
        setBlogs(blogs.filter((b) => b._id !== id));
      } else {
        alert("Failed to approve blog");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Reject and delete this blog? This action cannot be undone."))
      return;
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/blogs/${id}/reject`, {
        method: "PATCH",
      });
      if (res.ok) {
        setBlogs(blogs.filter((b) => b._id !== id));
      } else {
        alert("Failed to reject blog");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setProcessing(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className={styles.wrap}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Blog Approval" },
        ]}
      />
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Admin Panel</p>
          <h1 className={styles.heading}>Blog Approval</h1>
          <p className={styles.meta}>
            Review and approve pending blog submissions. {blogs.length} pending.
          </p>
        </div>
        <Link href="/admin" className={styles.backButton}>
          ← Back to Admin
        </Link>
      </header>

      {blogs.length === 0 ? (
        <div className={styles.empty}>
          <p>No pending blogs to review. All clear! 🎉</p>
        </div>
      ) : (
        <div className={styles.list}>
          {blogs.map((blog) => (
            <div key={blog._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.title}>{blog.title}</h2>
                  <p className={styles.author}>
                    By{" "}
                    <Link
                      href={`/contact/${blog.author._id}`}
                      className={styles.authorLink}
                    >
                      {blog.author.name}
                    </Link>{" "}
                    ({blog.author.email})
                  </p>
                </div>
                <div className={styles.badges}>
                  <span className={styles.badgePending}>Pending</span>
                  <span
                    className={
                      blog.privacy === "public"
                        ? styles.badgePublic
                        : styles.badgePrivate
                    }
                  >
                    {blog.privacy}
                  </span>
                </div>
              </div>

              <div className={styles.meta}>
                {blog.location && (
                  <span className={styles.metaItem}>📍 {blog.location}</span>
                )}
                {blog.travelType && (
                  <span className={styles.metaItem}>🎒 {blog.travelType}</span>
                )}
                <span className={styles.metaItem}>
                  📅 {new Date(blog.createdAt).toLocaleDateString()}
                </span>
              </div>

              {blog.images && blog.images.length > 0 && (
                <div className={styles.images}>
                  {blog.images.slice(0, 3).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${blog.title} ${idx + 1}`}
                      className={styles.image}
                    />
                  ))}
                </div>
              )}

              <div className={styles.contentPreview}>
                <p>{blog.content.substring(0, 300)}...</p>
              </div>

              <div className={styles.actions}>
                <Link
                  href={`/blogs/${blog._id}`}
                  target="_blank"
                  className={styles.viewButton}
                >
                  View Full Blog
                </Link>
                <button
                  className={styles.approveButton}
                  onClick={() => handleApprove(blog._id)}
                  disabled={processing === blog._id}
                >
                  {processing === blog._id ? "Processing..." : "✓ Approve"}
                </button>
                <button
                  className={styles.rejectButton}
                  onClick={() => handleReject(blog._id)}
                  disabled={processing === blog._id}
                >
                  {processing === blog._id ? "Processing..." : "✗ Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
