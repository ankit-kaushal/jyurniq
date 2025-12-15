import Link from "next/link";
import styles from "./Logo.module.css";

export default function Logo() {
  return (
    <Link href="/" className={styles.logo}>
      <div className={styles.logoIcon}>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* Compass circle */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="#d4a574" strokeWidth="2" strokeDasharray="4,4" />
          {/* Compass points */}
          <line x1="50" y1="5" x2="50" y2="15" stroke="#d4a574" strokeWidth="2" />
          <line x1="50" y1="85" x2="50" y2="95" stroke="#d4a574" strokeWidth="2" />
          <line x1="5" y1="50" x2="15" y2="50" stroke="#d4a574" strokeWidth="2" />
          <line x1="85" y1="50" x2="95" y2="50" stroke="#d4a574" strokeWidth="2" />
          {/* Bird */}
          <path d="M 30 25 Q 50 15, 70 25 Q 50 20, 30 25" fill="#1e3a5f" />
          <path d="M 35 30 Q 50 25, 65 30" stroke="#2d5a7f" strokeWidth="2" fill="none" />
          {/* Mountains on book */}
          <rect x="20" y="60" width="60" height="25" fill="#2d5a7f" rx="2" />
          <rect x="25" y="65" width="50" height="15" fill="#d4a574" />
          <polygon points="30,65 40,55 50,65" fill="#2d5a7f" />
          <polygon points="50,65 60,55 70,65" fill="#2d5a7f" />
        </svg>
      </div>
      <div className={styles.logoText}>
        <span className={styles.brandName}>JYURNIQ</span>
        <span className={styles.tagline}>Your Journey, Uniquely Told</span>
      </div>
    </Link>
  );
}

