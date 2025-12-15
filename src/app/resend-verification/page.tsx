"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./resend.module.css";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setMessage(data.message || "Verification email sent!");
      } else {
        setError(data.error || "Failed to send verification email");
      }
    } catch (err) {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={styles.wrap}>
      <h1 className={styles.heading}>Resend Verification Email</h1>
      <p className={styles.muted}>
        Enter your email address and we'll send you a new verification link.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
          />
        </label>
        {message && <p className={styles.success}>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Sending..." : "Resend Verification Link"}
        </button>
      </form>
      <p className={styles.link}>
        <Link href="/login">Back to login</Link> | <Link href="/signup">Sign up</Link>
      </p>
    </div>
  );
}

