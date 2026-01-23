import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import styles from "./blogs.module.css";

async function getBlogs() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/blogs`, { cache: "no-store" });
  if (!res.ok) return { blogs: [], pagination: null };
  const data = await res.json();
  // Handle both old format (array) and new format (object with blogs property)
  if (Array.isArray(data)) {
    return { blogs: data, pagination: null };
  }
  return data;
}

export default async function BlogsPage() {
  const { blogs } = await getBlogs();

  return (
    <div className={styles.wrap}>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Blogs" }]} />
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Discover</p>
          <h1 className={styles.heading}>Travel stories</h1>
          <p>Filter by location or travel type using query parameters.</p>
        </div>
        <Link className={styles.create} href="/dashboard">
          Create blog
        </Link>
      </header>

      <div className={styles.grid}>
        {blogs.length === 0 && <p>No blogs yet.</p>}
        {blogs.map((blog: any) => (
          <Link key={blog._id} className={styles.card} href={`/blogs/${blog._id}`}>
            <p className={styles.type}>{blog.travelType || "travel"}</p>
            <h3>{blog.title}</h3>
            <p className={styles.meta}>
              {blog.location || "Somewhere"}, privacy: {blog.privacy}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

