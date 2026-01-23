"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import styles from "./blogs.module.css";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  location?: string;
  travelType?: string;
  privacy: string;
  approved: boolean;
  createdAt: string;
  author: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

export default function AdminBlogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [privacyFilter, setPrivacyFilter] = useState("all");

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
      fetchBlogs();
    }
  }, [status, session, router, statusFilter, privacyFilter]);

  const fetchBlogs = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (privacyFilter !== "all") params.set("privacy", privacyFilter);

      const res = await fetch(`/api/admin/blogs/all?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || []);
      } else if (res.status === 403) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to fetch blogs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blogs/${id}/approve`, {
        method: "PATCH",
      });
      if (res.ok) {
        fetchBlogs();
      } else {
        alert("Failed to approve blog");
      }
    } catch (err) {
      alert("Something went wrong");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchBlogs();
      } else {
        alert("Failed to delete blog");
      }
    } catch (err) {
      alert("Something went wrong");
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
          { label: "All Blogs" },
        ]}
      />
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Admin Panel</p>
          <h1 className={styles.heading}>All Blogs</h1>
          <p className={styles.meta}>
            Manage all blogs on the platform. Total: {blogs.length}
          </p>
        </div>
        <Link href="/admin" className={styles.backButton}>
          ← Back to Admin
        </Link>
      </header>

      <div className={styles.filters}>
        <label className={styles.filterLabel}>
          Status:
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </label>
        <label className={styles.filterLabel}>
          Privacy:
          <select
            className={styles.filterSelect}
            value={privacyFilter}
            onChange={(e) => setPrivacyFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </label>
      </div>

      {blogs.length === 0 ? (
        <div className={styles.empty}>
          <p>No blogs found with the selected filters.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {blogs.map((blog) => (
            <div key={blog._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{blog.title}</h3>
                <div className={styles.badges}>
                  {!blog.approved && (
                    <span className={styles.badgePending}>Pending</span>
                  )}
                  {blog.approved && (
                    <span className={styles.badgeApproved}>Approved</span>
                  )}
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
              <p className={styles.cardMeta}>
                {blog.location || "No location"} • {blog.travelType || "travel"}
              </p>
              {blog.author && (
                <p className={styles.author}>
                  By {blog.author.name} ({blog.author.email})
                </p>
              )}
              <p className={styles.date}>
                {new Date(blog.createdAt).toLocaleDateString()}
              </p>
              <div className={styles.cardActions}>
                <Link
                  href={`/blogs/${blog._id}`}
                  className={styles.cardLink}
                  target="_blank"
                >
                  View
                </Link>
                {!blog.approved && (
                  <button
                    className={styles.approveButton}
                    onClick={() => handleApprove(blog._id)}
                  >
                    Approve
                  </button>
                )}
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(blog._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
