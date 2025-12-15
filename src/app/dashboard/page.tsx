"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./dashboard.module.css";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  location?: string;
  travelType?: string;
  privacy: string;
  approved: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    location: "",
    travelType: "solo" as const,
    privacy: "public" as const,
    images: [] as string[],
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchBlogs();
    }
  }, [status, router]);

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs/my");
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch blogs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBlog
        ? `/api/blogs/${editingBlog._id}`
        : "/api/blogs";
      const method = editingBlog ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingBlog(null);
        setFormData({
          title: "",
          content: "",
          location: "",
          travelType: "solo",
          privacy: "public",
          images: [],
        });
        fetchBlogs();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save blog");
      }
    } catch (err) {
      alert("Something went wrong");
    }
  };

  const handleEdit = async (blog: Blog) => {
    try {
      const res = await fetch(`/api/blogs/${blog._id}`);
      if (res.ok) {
        const fullBlog = await res.json();
        setEditingBlog(blog);
        setFormData({
          title: fullBlog.title || blog.title,
          content: fullBlog.content || "",
          location: fullBlog.location || "",
          travelType: (fullBlog.travelType as any) || "solo",
          privacy: fullBlog.privacy as "public" | "private",
          images: fullBlog.images || [],
        });
        setShowForm(true);
      } else {
        alert("Failed to load blog details");
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
    return <div className={styles.wrap}>Loading...</div>;
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Creator Dashboard</p>
          <h1 className={styles.heading}>Manage Your Blogs</h1>
          <p className={styles.meta}>
            Create, edit, and manage your travel stories. Total: {blogs.length}
          </p>
        </div>
        <div className={styles.actions}>
          <Link href="/contact/me" className={styles.button}>
            Contact Settings
          </Link>
          <button
            className={styles.button}
            onClick={() => {
              setShowForm(!showForm);
              setEditingBlog(null);
              setFormData({
                title: "",
                content: "",
                location: "",
                travelType: "solo",
                privacy: "public",
                images: [],
              });
            }}
          >
            {showForm ? "Cancel" : "New Blog"}
          </button>
        </div>
      </header>

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>
            {editingBlog ? "Edit Blog" : "Create New Blog"}
          </h2>
          <label className={styles.label}>
            Title *
            <input
              className={styles.input}
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              placeholder="My Amazing Trip to..."
            />
          </label>
          <label className={styles.label}>
            Content * (Markdown supported)
            <textarea
              className={styles.textarea}
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
              rows={10}
              placeholder="Write your travel story here..."
            />
          </label>
          <div className={styles.row}>
            <label className={styles.label}>
              Location
              <input
                className={styles.input}
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Paris, France"
              />
            </label>
            <label className={styles.label}>
              Travel Type
              <select
                className={styles.input}
                value={formData.travelType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    travelType: e.target.value as any,
                  })
                }
              >
                <option value="solo">Solo</option>
                <option value="family">Family</option>
                <option value="budget">Budget</option>
                <option value="luxury">Luxury</option>
              </select>
            </label>
          </div>
          <label className={styles.label}>
            Privacy
            <select
              className={styles.input}
              value={formData.privacy}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  privacy: e.target.value as "public" | "private",
                })
              }
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>
          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton}>
              {editingBlog ? "Update Blog" : "Create Blog"}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => {
                setShowForm(false);
                setEditingBlog(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className={styles.grid}>
        {blogs.length === 0 ? (
          <p className={styles.empty}>No blogs yet. Create your first one!</p>
        ) : (
          blogs.map((blog) => (
            <div key={blog._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{blog.title}</h3>
                <div className={styles.badges}>
                  {!blog.approved && (
                    <span className={styles.badgePending}>Pending</span>
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
                {blog.location || "No location"} • {blog.travelType || "travel"} •{" "}
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
                <button
                  className={styles.cardButton}
                  onClick={() => handleEdit(blog)}
                >
                  Edit
                </button>
                <button
                  className={styles.cardButtonDanger}
                  onClick={() => handleDelete(blog._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
