import styles from "./admin.module.css";

const moderationEndpoints = [
  { action: "Approve blog", path: "PATCH /api/admin/blogs/:id/approve" },
  { action: "List blogs", path: "GET /api/blogs?privacy=public" },
  { action: "Delete blog", path: "DELETE /api/blogs/:id" },
];

export default function AdminPage() {
  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <p className={styles.kicker}>Admin</p>
        <h1 className={styles.heading}>Moderation</h1>
        <p className={styles.meta}>
          Approve or reject blogs. Protect the platform from spam.
        </p>
      </header>

      <div className={styles.grid}>
        {moderationEndpoints.map((item) => (
          <div key={item.path} className={styles.card}>
            <h3>{item.action}</h3>
            <code>{item.path}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

