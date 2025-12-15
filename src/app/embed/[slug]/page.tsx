import dbConnect from "@/lib/db";
import Blog from "@/models/blog";
import styles from "./embed.module.css";

export const revalidate = 60;

async function getBlog(slug: string) {
  await dbConnect();
  return Blog.findOne({ slug, privacy: "public", approved: true }).lean();
}

export default async function EmbedPage({
  params,
}: {
  params: { slug: string };
}) {
  const blog = await getBlog(params.slug);

  if (!blog) {
    return (
      <div className={styles.frame}>
        <p>Blog not found or private.</p>
      </div>
    );
  }

  return (
    <div className={styles.frame}>
      <h2>{blog.title}</h2>
      <p className={styles.meta}>
        {blog.location ? `📍 ${blog.location}` : "Travel blog"}
      </p>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </div>
  );
}

