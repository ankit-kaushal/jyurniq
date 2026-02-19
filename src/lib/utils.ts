export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Full admin: users, analytics, all blogs, settings */
export function isAdmin(role?: string) {
  return role === "admin";
}

/** Can approve/reject blogs (admin + editor) */
export function canModerateBlogs(role?: string) {
  return role === "admin" || role === "editor";
}

/** Can view and submit blogs (viewer, editor, admin; legacy "user" treated as viewer) */
export function canViewAndSubmitBlogs(role?: string) {
  return (
    role === "admin" ||
    role === "editor" ||
    role === "viewer" ||
    role === "user"
  );
}

