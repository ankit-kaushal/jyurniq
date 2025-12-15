"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import styles from "./contact.module.css";

interface UserData {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  contactEnabled: boolean;
  questionPrice: number;
  conversationPrice: number;
}

export default function ContactPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const userId = params.id === "me" ? session?.user?.id : params.id;
  const isOwnPage = params.id === "me" || params.id === session?.user?.id;

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    contactEnabled: false,
    questionPrice: 20,
    conversationPrice: 100,
    bio: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOwnPage && !session) {
      router.push("/login");
      return;
    }
    if (userId || (isOwnPage && session?.user?.id)) {
      fetchUser();
    }
  }, [userId, isOwnPage, session, router]);

  const fetchUser = async () => {
    try {
      const endpoint = isOwnPage
        ? "/api/users/contact"
        : `/api/users/${userId}`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        if (isOwnPage) {
          setFormData({
            contactEnabled: data.contactEnabled || false,
            questionPrice: data.questionPrice || 20,
            conversationPrice: data.conversationPrice || 100,
            bio: data.bio || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch user", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isOwnPage) return;
    setSaving(true);
    try {
      const res = await fetch("/api/users/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setEditing(false);
        fetchUser();
      } else {
        alert("Failed to save settings");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleContact = async (type: "question" | "conversation") => {
    if (!user?.contactEnabled) {
      alert("Contact is not enabled for this user");
      return;
    }

    const price = type === "question" ? user.questionPrice : user.conversationPrice;
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: type === "question" ? "question" : "conversation",
          recipientId: user._id,
          amount: price,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Payment setup failed");
      }
    } catch (err) {
      alert("Something went wrong");
    }
  };

  if (loading) {
    return <div className={styles.wrap}>Loading...</div>;
  }

  if (!user) {
    return (
      <div className={styles.wrap}>
        <p>User not found</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.profile}>
        {user.avatar && (
          <img src={user.avatar} alt={user.name} className={styles.avatar} />
        )}
        <h1 className={styles.name}>{user.name}</h1>
        {user.bio && <p className={styles.bio}>{user.bio}</p>}
        {isOwnPage && (
          <button
            className={styles.editButton}
            onClick={() => setEditing(!editing)}
          >
            {editing ? "Cancel" : "Edit Settings"}
          </button>
        )}
      </div>

      {editing ? (
        <div className={styles.settings}>
          <h2 className={styles.sectionTitle}>Contact Settings</h2>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.contactEnabled}
              onChange={(e) =>
                setFormData({ ...formData, contactEnabled: e.target.checked })
              }
            />
            <span>Enable paid contact</span>
          </label>
          <label className={styles.label}>
            Question Price (₹)
            <input
              type="number"
              className={styles.input}
              value={formData.questionPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  questionPrice: parseInt(e.target.value) || 0,
                })
              }
              min="0"
            />
          </label>
          <label className={styles.label}>
            1:1 Conversation Price (₹)
            <input
              type="number"
              className={styles.input}
              value={formData.conversationPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  conversationPrice: parseInt(e.target.value) || 0,
                })
              }
              min="0"
            />
          </label>
          <label className={styles.label}>
            Bio
            <textarea
              className={styles.textarea}
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              rows={4}
              placeholder="Tell people about yourself..."
            />
          </label>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      ) : (
        <div className={styles.contact}>
          {user.contactEnabled ? (
            <>
              <h2 className={styles.sectionTitle}>Get in Touch</h2>
              <p className={styles.description}>
                Connect with {user.name} through paid messaging options.
              </p>
              <div className={styles.options}>
                <div className={styles.option}>
                  <h3 className={styles.optionTitle}>Ask a Question</h3>
                  <p className={styles.optionPrice}>₹{user.questionPrice}</p>
                  <p className={styles.optionDesc}>
                    Send a one-time question and get a response.
                  </p>
                  <button
                    className={styles.optionButton}
                    onClick={() => handleContact("question")}
                  >
                    Ask Question
                  </button>
                </div>
                <div className={styles.option}>
                  <h3 className={styles.optionTitle}>1:1 Conversation</h3>
                  <p className={styles.optionPrice}>₹{user.conversationPrice}</p>
                  <p className={styles.optionDesc}>
                    Start a private conversation for deeper discussion.
                  </p>
                  <button
                    className={styles.optionButton}
                    onClick={() => handleContact("conversation")}
                  >
                    Start Conversation
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.disabled}>
              <p>Contact is not enabled for this user.</p>
              {isOwnPage && (
                <Link href="/contact/me" className={styles.link}>
                  Enable contact settings
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

