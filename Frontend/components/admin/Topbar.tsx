"use client";

import { useRouter } from "next/navigation";
import styles from "./Topbar.module.css";

export default function Topbar({ title }: { title: string }) {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.subtitle}>Manage content and inbox safely</div>
      </div>

      <div className={styles.right}>
        <button className={styles.btnGhost} onClick={() => router.refresh()}>
          Refresh
        </button>
        <button className={styles.btn} onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
