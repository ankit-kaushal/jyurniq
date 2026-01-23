"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import styles from "./users.module.css";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  emailVerified: boolean;
  earnings: number;
  createdAt: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<"user" | "admin">("user");

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
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else if (res.status === 403) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
    if (!confirm(`Change user role to ${newRole}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        fetchUsers();
        setEditingUser(null);
      } else {
        alert("Failed to update user role");
      }
    } catch (err) {
      alert("Something went wrong");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone."))
      return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete user");
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
          { label: "User Management" },
        ]}
      />
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Admin Panel</p>
          <h1 className={styles.heading}>User Management</h1>
          <p className={styles.meta}>
            Manage user accounts, roles, and permissions. Total: {users.length}
          </p>
        </div>
        <Link href="/admin" className={styles.backButton}>
          ← Back to Admin
        </Link>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Verified</th>
              <th>Earnings</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={
                        user.role === "admin"
                          ? styles.badgeAdmin
                          : styles.badgeUser
                      }
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.emailVerified ? (
                      <span className={styles.verified}>✓</span>
                    ) : (
                      <span className={styles.unverified}>✗</span>
                    )}
                  </td>
                  <td>₹{user.earnings.toFixed(2)}</td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {editingUser?._id === user._id ? (
                        <>
                          <select
                            className={styles.roleSelect}
                            value={newRole}
                            onChange={(e) =>
                              setNewRole(e.target.value as "user" | "admin")
                            }
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            className={styles.saveButton}
                            onClick={() => handleRoleChange(user._id, newRole)}
                          >
                            Save
                          </button>
                          <button
                            className={styles.cancelButton}
                            onClick={() => setEditingUser(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className={styles.editButton}
                            onClick={() => {
                              setEditingUser(user);
                              setNewRole(user.role);
                            }}
                          >
                            Change Role
                          </button>
                          {user._id !== session?.user?.id && (
                            <button
                              className={styles.deleteButton}
                              onClick={() => handleDelete(user._id)}
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
