"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type NavItem = { href: string; label: string };

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const nav: NavItem[] = useMemo(
    () => [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/content", label: "Content" },
      { href: "/admin/inbox", label: "Inbox" },
      { href: "/admin/media", label: "Media" },
      { href: "/admin/settings", label: "Settings" },
    ],
    []
  );

  async function logout() {
    try {
      setLoggingOut(true);
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      setLoggingOut(false);
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandDot} />
          <div>
            <div style={styles.brandTitle}>CMDI Admin</div>
            <div style={styles.brandSub}>Content dashboard</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  ...styles.navItem,
                  ...(active ? styles.navItemActive : null),
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={logout} disabled={loggingOut} style={styles.logoutBtn}>
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
          <div style={styles.hint}>You’re signed in as admin.</div>
        </div>
      </aside>

      <div style={styles.main}>
        <header style={styles.header}>
          <div style={styles.headerTitle}>Admin</div>
          <div style={styles.headerRight}>
            <Link href="/" style={styles.link}>
              View site
            </Link>
          </div>
        </header>

        <main style={styles.content}>{children}</main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    background: "#f6f7fb",
  },
  sidebar: {
    borderRight: "1px solid rgba(0,0,0,.08)",
    background: "#ffffff",
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  brand: { display: "flex", gap: 12, alignItems: "center", padding: "8px 8px 2px" },
  brandDot: { width: 12, height: 12, borderRadius: 999, background: "#0ea5e9" },
  brandTitle: { fontWeight: 800, fontSize: 16, lineHeight: 1.1 },
  brandSub: { opacity: 0.65, fontSize: 12, marginTop: 2 },
  nav: { display: "grid", gap: 6, padding: 8 },
  navItem: {
    padding: "10px 12px",
    borderRadius: 12,
    textDecoration: "none",
    color: "#0f172a",
    border: "1px solid rgba(0,0,0,0)",
  },
  navItemActive: {
    background: "rgba(14,165,233,.10)",
    border: "1px solid rgba(14,165,233,.28)",
    fontWeight: 700,
  },
  sidebarFooter: { marginTop: "auto", padding: 8, display: "grid", gap: 10 },
  logoutBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,.12)",
    background: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  hint: { fontSize: 12, opacity: 0.65 },
  main: { display: "flex", flexDirection: "column" },
  header: {
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 18px",
    borderBottom: "1px solid rgba(0,0,0,.08)",
    background: "rgba(255,255,255,.85)",
    backdropFilter: "blur(10px)",
  },
  headerTitle: { fontWeight: 800, color: "#0f172a" },
  headerRight: { display: "flex", gap: 12, alignItems: "center" },
  link: { color: "#0369a1", textDecoration: "none", fontWeight: 700 },
  content: { padding: 18 },
};
