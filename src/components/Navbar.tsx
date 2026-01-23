import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Logo from "./Logo";
import Link from "next/link";
import styles from "./Navbar.module.css";

export default async function Navbar() {
  let session = null;
  try {
    session = await getServerSession(authOptions as any);
  } catch (error) {
    console.error("Session error:", error);
    // Continue without session if there's an error
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Logo />
        <div className={styles.links}>
          <Link href="/blogs">Blogs</Link>
          {session ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              {session.user?.role === "admin" && (
                <Link href="/admin">Admin</Link>
              )}
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className={styles.signOut}>
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/signup" className={styles.signUp}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
