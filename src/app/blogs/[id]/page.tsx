import dbConnect from "@/lib/db";
import Blog from "@/models/blog";
import Comment from "@/models/comment";
import CommentForm from "@/components/CommentForm";
import CommentItem from "@/components/CommentItem";
import styles from "./blog.module.css";

async function getBlog(id: string) {
  await dbConnect();
  const blog = await Blog.findById(id).lean();
  const allComments = await Comment.find({ blog: id })
    .sort({ createdAt: -1 })
    .populate("author", "name email avatar")
    .lean();
  
  // Serialize comments to plain objects
  const serializeComment = (c: any) => ({
    _id: String(c._id),
    content: c.content,
    author: c.author ? {
      name: typeof c.author === 'object' ? c.author.name : undefined,
      email: typeof c.author === 'object' ? c.author.email : undefined,
      avatar: typeof c.author === 'object' ? c.author.avatar : undefined,
    } : null,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    parent: c.parent ? String(c.parent) : undefined,
  });
  
  // Separate top-level comments and replies
  const topLevelComments = allComments
    .filter((c: any) => !c.parent)
    .map(serializeComment);
  const replies = allComments
    .filter((c: any) => c.parent)
    .map(serializeComment);
  
  // Group replies by parent comment
  const repliesByParent = replies.reduce((acc: any, reply: any) => {
    const parentId = reply.parent;
    if (!acc[parentId]) {
      acc[parentId] = [];
    }
    acc[parentId].push(reply);
    return acc;
  }, {});
  
  return { blog, topLevelComments, repliesByParent };
}

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { blog, topLevelComments, repliesByParent } = await getBlog(id);
  if (!blog) return <div className={styles.wrap}>Not found</div>;
  
  const totalComments = topLevelComments.length + Object.values(repliesByParent).flat().length;

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
        <h3>Comments ({totalComments})</h3>
        <CommentForm blogId={id} />
        {topLevelComments.length === 0 ? (
          <p className={styles.muted}>No comments yet. Be the first to comment!</p>
        ) : (
          <div className={styles.commentsList}>
            {topLevelComments.map((comment: any) => {
              const commentId = String(comment._id);
              const commentReplies = repliesByParent[commentId] || [];
              return (
                <CommentItem
                  key={commentId}
                  comment={comment}
                  blogId={id}
                  replies={commentReplies}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
