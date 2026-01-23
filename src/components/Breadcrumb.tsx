"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Breadcrumb.module.css";

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const pathname = usePathname();

  const handleClick = (item: BreadcrumbItem, e: React.MouseEvent) => {
    if (item.onClick) {
      e.preventDefault();
      item.onClick();
    }
  };

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrentPage = item.href === pathname;

          if (isLast || isCurrentPage) {
            return (
              <li key={index} className={styles.item}>
                <span className={styles.current}>{item.label}</span>
                {!isLast && <span className={styles.separator}>/</span>}
              </li>
            );
          }

          return (
            <li key={index} className={styles.item}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={styles.link}
                  onClick={(e) => handleClick(item, e)}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={styles.link} onClick={(e) => handleClick(item, e)}>
                  {item.label}
                </span>
              )}
              <span className={styles.separator}>/</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
