import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import styles from "./admin.module.css";
import { isAdmin, canModerateBlogs } from "@/lib/utils";

export default async function AdminPage() {
  const session = await getServerSession(authOptions as any);
  const role = session?.user?.role;

  if (!session || !canModerateBlogs(role)) {
    redirect("/dashboard");
  }

  const showFullAdmin = isAdmin(role);

  return (
    <div className={styles.wrap}>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Admin" }]} />
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Admin</p>
          <h1 className={styles.heading}>
            {showFullAdmin ? "Admin Dashboard" : "Moderation"}
          </h1>
          <p className={styles.meta}>
            {showFullAdmin
              ? "Manage content moderation, user accounts, and platform settings."
              : "Review and approve or reject blog submissions."}
          </p>
        </div>
      </header>

      <div className={styles.grid}>
        <Link href="/admin/approval" className={styles.card}>
          <h3 className={styles.cardTitle}>Blog Approval</h3>
          <p className={styles.cardDesc}>
            Review and approve or reject pending blog submissions.
          </p>
          <span className={styles.cardLink}>Go to Approval Page →</span>
        </Link>
        {showFullAdmin && (
          <>
            <Link href="/admin/blogs" className={styles.card}>
              <h3 className={styles.cardTitle}>All Blogs</h3>
              <p className={styles.cardDesc}>
                View and manage all blogs on the platform with filters.
              </p>
              <span className={styles.cardLink}>Manage All Blogs →</span>
            </Link>
            <Link href="/admin/users" className={styles.card}>
              <h3 className={styles.cardTitle}>User Management</h3>
              <p className={styles.cardDesc}>
                View and manage user accounts, roles, and permissions.
              </p>
              <span className={styles.cardLink}>Manage Users →</span>
            </Link>
            <Link href="/admin/analytics" className={styles.card}>
              <h3 className={styles.cardTitle}>Analytics</h3>
              <p className={styles.cardDesc}>
                View platform statistics, blog performance, and user activity.
              </p>
              <span className={styles.cardLink}>View Analytics →</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
