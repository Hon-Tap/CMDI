"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Newspaper, 
  CalendarRange, 
  Image as ImageIcon, 
  Inbox, 
  Settings, 
  LogOut, 
  ExternalLink 
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // Grouped navigation to match your folder structure and avoid 404s
  const navGroups: NavGroup[] = useMemo(() => [
    {
      title: "Overview",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      ]
    },
    {
      title: "Content Management",
      items: [
        { href: "/admin/content/projects", label: "Projects", icon: FolderKanban },
        { href: "/admin/content/programs", label: "Programs", icon: CalendarRange },
        { href: "/admin/content/news", label: "News & Updates", icon: Newspaper },
      ]
    },
    {
      title: "System",
      items: [
        { href: "/admin/media", label: "Media Library", icon: ImageIcon },
        { href: "/admin/inbox", label: "Inbox", icon: Inbox },
        { href: "/admin/settings", label: "Settings", icon: Settings },
      ]
    }
  ], []);

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
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brandContainer}>
          <div style={styles.logoCircle}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: 14 }}>C</span>
          </div>
          <div>
            <div style={styles.brandTitle}>CMDI Admin</div>
            <div style={styles.brandSub}>Workspace</div>
          </div>
        </div>

        <div style={styles.scrollableNav}>
          {navGroups.map((group) => (
            <div key={group.title} style={styles.navGroup}>
              <div style={styles.groupTitle}>{group.title}</div>
              <div style={styles.groupItems}>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        ...styles.navItem,
                        ...(isActive ? styles.navItemActive : {}),
                      }}
                    >
                      <item.icon size={18} style={isActive ? { color: '#0ea5e9' } : { opacity: 0.7 }} />
                      <span style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.sidebarFooter}>
          <button 
            onClick={logout} 
            disabled={loggingOut} 
            style={styles.logoutBtn}
          >
            <LogOut size={16} />
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={styles.main}>
        <header style={styles.header}>
          <div style={styles.breadcrumbs}>
             <span style={{opacity: 0.5}}>Admin</span> 
             {pathname !== '/admin' && <span style={{opacity: 0.3}}> / </span>}
             {pathname !== '/admin' && <span style={{textTransform: 'capitalize'}}>{pathname.split('/').pop()}</span>}
          </div>
          <Link href="/" style={styles.siteLink} target="_blank">
            View Live Site <ExternalLink size={14} />
          </Link>
        </header>

        <main style={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}

// Styles
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    background: "#f8fafc", // Slate-50
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  sidebar: {
    borderRight: "1px solid #e2e8f0",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    position: "sticky",
    top: 0,
  },
  brandContainer: {
    padding: "24px 20px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderBottom: "1px solid #f1f5f9",
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(14, 165, 233, 0.2)",
  },
  brandTitle: { fontWeight: 700, fontSize: 15, color: "#0f172a", lineHeight: 1.2 },
  brandSub: { fontSize: 12, color: "#64748b" },
  
  scrollableNav: {
    flex: 1,
    padding: "20px 16px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  navGroup: { display: "flex", flexDirection: "column", gap: 8 },
  groupTitle: { 
    fontSize: 11, 
    textTransform: "uppercase", 
    letterSpacing: "0.05em", 
    color: "#94a3b8", 
    fontWeight: 700, 
    paddingLeft: 12 
  },
  groupItems: { display: "flex", flexDirection: "column", gap: 2 },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 8,
    textDecoration: "none",
    color: "#475569",
    fontSize: 14,
    transition: "all 0.2s ease",
  },
  navItemActive: {
    background: "#f0f9ff", // Sky-50
    color: "#0284c7", // Sky-700
  },
  
  sidebarFooter: {
    padding: 16,
    borderTop: "1px solid #f1f5f9",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    background: "white",
    color: "#64748b",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  
  main: { display: "flex", flexDirection: "column", minWidth: 0 },
  header: {
    height: 64,
    borderBottom: "1px solid #e2e8f0",
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  breadcrumbs: { fontSize: 14, fontWeight: 500, color: "#334155" },
  siteLink: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    color: "#0ea5e9",
    textDecoration: "none",
    padding: "6px 12px",
    borderRadius: 6,
    background: "rgba(14,165,233, 0.1)",
  },
  content: {
    padding: 32,
    maxWidth: 1200,
    width: "100%",
    margin: "0 auto",
  },
};