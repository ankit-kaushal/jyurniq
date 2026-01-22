"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./CommentForm.module.css";

interface CommentFormProps {
  blogId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CommentForm({
  blogId,
  parentId,
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!session) {
    return (
      <div className={styles.loginPrompt}>
        <p>Please log in to leave a comment.</p>
        <a href="/login" className={styles.loginLink}>
          Log in
        </a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/blogs/${blogId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          parentId: parentId || undefined,
        }),
      });

      if (res.ok) {
        setContent("");
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } else {
        const data = await res.json();
        setError(data.error || "Failed to post comment");
      }
    } catch (err) {
      console.error("Error posting comment", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}
      <textarea
        className={styles.textarea}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? "Write a reply..." : "Write a comment..."}
        rows={4}
        disabled={submitting}
      />
      <div className={styles.actions}>
        {onCancel && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={submitting || !content.trim()}
        >
          {submitting ? "Posting..." : parentId ? "Reply" : "Post Comment"}
        </button>
      </div>
    </form>
  );
}
