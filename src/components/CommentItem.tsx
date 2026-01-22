"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import CommentForm from "./CommentForm";
import styles from "./CommentItem.module.css";

interface Comment {
  _id: string;
  content: string;
  author?: {
    name: string;
    email?: string;
    avatar?: string;
  } | string;
  createdAt: string | Date;
  parent?: string;
}

interface CommentItemProps {
  comment: Comment;
  blogId: string;
  replies?: Comment[];
  depth?: number;
}

export default function CommentItem({ comment, blogId, replies = [], depth = 0 }: CommentItemProps) {
  const { data: session } = useSession();
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  // Maximum depth is 1 (only one level of nesting)
  const maxDepth = 1;
  const canReply = depth < maxDepth;
  
  const author = comment.author && typeof comment.author === 'object' 
    ? comment.author 
    : null;

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    // Refresh the page to show new reply
    window.location.reload();
  };

  return (
    <div className={styles.commentItem}>
      <div className={styles.commentHeader}>
        {author?.avatar ? (
          <img
            src={author.avatar}
            alt={author.name}
            className={styles.commentAvatar}
          />
        ) : (
          <div className={styles.commentAvatarPlaceholder}>
            {author?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
        <div className={styles.commentAuthorInfo}>
          <span className={styles.commentAuthorName}>
            {author?.name || "Anonymous"}
          </span>
          <span className={styles.commentDate}>
            {new Date(comment.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
      <p className={styles.commentBody}>{comment.content}</p>
      
      {session && canReply && (
        <div className={styles.commentActions}>
          <button
            className={styles.replyButton}
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            {showReplyForm ? "Cancel Reply" : "Reply"}
          </button>
        </div>
      )}

      {showReplyForm && (
        <div className={styles.replyFormContainer}>
          <CommentForm
            blogId={blogId}
            parentId={comment._id}
            onSuccess={handleReplySuccess}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {replies.length > 0 && canReply && (
        <div className={styles.replies}>
          {replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              blogId={blogId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
