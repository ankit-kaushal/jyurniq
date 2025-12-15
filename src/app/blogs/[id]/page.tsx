import dbConnect from "@/lib/db";
import Blog from "@/models/blog";
import Comment from "@/models/comment";
import styles from "./blog.module.css";

async function getBlog(id: string) {
  await dbConnect();
  const blog = await Blog.findById(id).lean();
  const comments = await Comment.find({ blog: id })
    .sort({ createdAt: -1 })
    .lean();
  return { blog, comments };
}

export default async function BlogDetail({
  params,
}: {
  params: { id: string };
}) {
  const { blog, comments } = await getBlog(params.id);
  if (!blog) return <div className={styles.wrap}>Not found</div>;

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <p className={styles.kicker}>{blog.travelType || "travel"}</p>
        <h1 className={styles.heading}>{blog.title}</h1>
        <p className={styles.meta}>
          {blog.location || "Somewhere"} · {blog.privacy}
        </p>
      </header>
      <article
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      <section className={styles.comments}>
        <h3>Comments</h3>
        {comments.length === 0 && <p className={styles.muted}>No comments yet.</p>}
        <ul>
          {comments.map((c: any) => (
            <li key={c._id}>
              <p className={styles.commentBody}>{c.content}</p>
              <p className={styles.commentMeta}>
                {new Date(c.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

