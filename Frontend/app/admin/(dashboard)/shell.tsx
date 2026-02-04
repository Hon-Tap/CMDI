"use client";

import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CalendarRange,
  Newspaper,
  Image as ImageIcon,
  Inbox,
  Settings,
  Shield,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Search,
} from "lucide-react";

export const dynamic = "force-dynamic";

type NavItem = {
  label: string;
  href: string;
  icon: any;
};

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/admin";
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const nav: { section: string; items: NavItem[] }[] = useMemo(
    () => [
      {
        section: "Overview",
        items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
      },
      {
        section: "Content",
        items: [
          { label: "Projects", href: "/admin/content/projects", icon: FolderKanban },
          { label: "Programs", href: "/admin/content/programs", icon: CalendarRange },
          { label: "News", href: "/admin/content/news", icon: Newspaper },
        ],
      },
      {
        section: "Library",
        items: [{ label: "Media", href: "/admin/media", icon: ImageIcon }],
      },
      {
        section: "Communication",
        items: [{ label: "Inbox", href: "/admin/inbox", icon: Inbox }],
      },
      {
        section: "System",
        items: [{ label: "Settings", href: "/admin/settings", icon: Settings }],
      },
    ],
    []
  );

  const filteredNav = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return nav;

    return nav
      .map((s) => ({
        ...s,
        items: s.items.filter(
          (i) => i.label.toLowerCase().includes(q) || i.href.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [filter, nav]);

  const crumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    // Make "Admin" the root crumb always
    const out: Array<{ label: string; href: string }> = [{ label: "Admin", href: "/admin" }];

    let acc = "";
    for (let i = 1; i < parts.length; i++) {
      acc += `/${parts[i]}`;
      out.push({
        label: parts[i].replace(/-/g, " "),
        href: `/` + parts.slice(0, i + 1).join("/"),
      });
    }

    return out;
  }, [pathname]);

  async function logout() {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      // ignore; we still route away
    } finally {
      setMobileOpen(false);
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="shell">
      {/* Mobile overlay */}
      <div className={`overlay ${mobileOpen ? "show" : ""}`} onClick={() => setMobileOpen(false)} />

      <aside className={`sidebar ${mobileOpen ? "open" : ""}`} aria-label="Admin sidebar">
        <div className="brand">
          <div className="badge" aria-hidden="true">
            <Shield size={18} />
          </div>
          <div className="brandText">
            <div className="brandTitle">CMDI Admin</div>
            <div className="brandSub">Secure console</div>
          </div>

          <button className="iconBtn mobileOnly" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className="search">
          <Search size={16} />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search modules…"
            aria-label="Search modules"
          />
        </div>

        <nav className="nav">
          {filteredNav.map((s) => (
            <div key={s.section} className="section">
              <div className="sectionTitle">{s.section}</div>
              <div className="sectionItems">
                {s.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={isActive(pathname, item.href)}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="sideFooter">
          <Link className="sideAction" href="/" target="_blank" rel="noreferrer">
            <ExternalLink size={16} />
            View public site
          </Link>

          <button className="sideAction danger" onClick={logout} type="button">
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="iconBtn mobileOnly" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={18} />
          </button>

          <div className="crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, idx) => (
              <span key={c.href} className="crumb">
                {idx > 0 && <ChevronRight size={14} className="sep" />}
                <Link href={c.href} className="crumbLink" onClick={() => setMobileOpen(false)}>
                  {titleCase(c.label)}
                </Link>
              </span>
            ))}
          </div>

          <div className="topRight">
            <span className="securePill" title="Admin area">
              <Shield size={14} />
              Secured
            </span>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>

      <style jsx>{`
        .shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 280px 1fr;
          background: radial-gradient(900px 420px at 20% 0%, rgba(59, 130, 246, 0.12), transparent 65%),
            radial-gradient(800px 420px at 90% 10%, rgba(16, 185, 129, 0.10), transparent 60%),
            linear-gradient(180deg, rgba(248, 250, 252, 0.92), rgba(241, 245, 249, 0.92));
        }

        @media (max-width: 980px) {
          .shell {
            grid-template-columns: 1fr;
          }
        }

        .overlay {
          display: none;
        }

        @media (max-width: 980px) {
          .overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(2, 6, 23, 0.45);
            opacity: 0;
            pointer-events: none;
            transition: opacity 160ms ease;
            z-index: 40;
          }
          .overlay.show {
            opacity: 1;
            pointer-events: auto;
          }
        }

        .sidebar {
          position: sticky;
          top: 0;
          height: 100vh;
          padding: 14px;
          border-right: 1px solid rgba(2, 6, 23, 0.08);
          background: rgba(255, 255, 255, 0.80);
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 50;
        }

        @media (max-width: 980px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            width: 86vw;
            max-width: 320px;
            transform: translateX(-110%);
            transition: transform 180ms ease;
            box-shadow: 0 24px 70px rgba(2, 6, 23, 0.28);
          }
          .sidebar.open {
            transform: translateX(0);
          }
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 12px;
          border-radius: 18px;
          border: 1px solid rgba(2, 6, 23, 0.08);
          background: rgba(255, 255, 255, 0.9);
        }

        .badge {
          width: 38px;
          height: 38px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: rgb(2, 132, 199);
          background: rgba(2, 132, 199, 0.10);
          box-shadow: 0 0 0 5px rgba(2, 132, 199, 0.12);
          flex: 0 0 auto;
        }

        .brandText {
          min-width: 0;
        }
        .brandTitle {
          font-weight: 900;
          letter-spacing: -0.01em;
          color: rgba(15, 23, 42, 0.95);
        }
        .brandSub {
          font-size: 12px;
          color: rgba(71, 85, 105, 0.95);
          margin-top: 2px;
        }

        .search {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 16px;
          border: 1px solid rgba(2, 6, 23, 0.08);
          background: rgba(255, 255, 255, 0.92);
          color: rgba(71, 85, 105, 0.95);
        }

        .search input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          color: rgba(15, 23, 42, 0.95);
        }

        .nav {
          padding: 6px 2px;
          overflow: auto;
          flex: 1 1 auto;
        }

        .section {
          margin-top: 10px;
        }

        .sectionTitle {
          font-size: 11px;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: rgba(100, 116, 139, 0.95);
          padding: 8px 10px;
        }

        .sectionItems {
          display: grid;
          gap: 6px;
        }

        .sideFooter {
          display: grid;
          gap: 8px;
          padding-top: 10px;
          border-top: 1px solid rgba(2, 6, 23, 0.08);
        }

        .sideAction {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          justify-content: center;

          padding: 10px 12px;
          border-radius: 16px;

          border: 1px solid rgba(2, 6, 23, 0.08);
          background: rgba(255, 255, 255, 0.92);
          text-decoration: none;

          color: rgba(15, 23, 42, 0.92);
          font-weight: 700;

          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
        }

        .sideAction:hover {
          transform: translateY(-1px);
          border-color: rgba(2, 6, 23, 0.14);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.12);
        }

        .sideAction.danger {
          color: rgba(185, 28, 28, 0.95);
          background: rgba(254, 242, 242, 0.95);
          border-color: rgba(248, 113, 113, 0.25);
          cursor: pointer;
        }

        .main {
          min-width: 0;
          display: grid;
          grid-template-rows: auto 1fr;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;

          padding: 14px 16px;
          border-bottom: 1px solid rgba(2, 6, 23, 0.08);
          background: rgba(255, 255, 255, 0.70);
          backdrop-filter: blur(12px);
        }

        .crumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          color: rgba(71, 85, 105, 0.95);
          font-size: 13px;
        }

        .crumb {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .sep {
          opacity: 0.65;
        }

        .crumbLink {
          color: rgba(15, 23, 42, 0.92);
          text-decoration: none;
          font-weight: 700;
        }

        .crumbLink:hover {
          text-decoration: underline;
        }

        .topRight {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .securePill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(2, 6, 23, 0.08);
          background: rgba(255, 255, 255, 0.85);
          color: rgba(15, 23, 42, 0.90);
          font-weight: 800;
          font-size: 12px;
        }

        .content {
          padding: 18px 16px 30px;
        }

        .iconBtn {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          border: 1px solid rgba(2, 6, 23, 0.08);
          background: rgba(255, 255, 255, 0.92);
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
        }

        .iconBtn:hover {
          transform: translateY(-1px);
          border-color: rgba(2, 6, 23, 0.14);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.12);
        }

        .mobileOnly {
          display: none;
        }

        @media (max-width: 980px) {
          .mobileOnly {
            display: grid;
          }
        }
      `}</style>
    </div>
  );
}

function NavLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <>
      <Link className={`navItem ${active ? "active" : ""}`} href={item.href} onClick={onClick} prefetch={false}>
        <span className="navIcon">
          <Icon size={18} />
        </span>
        <span className="navLabel">{item.label}</span>
        <span className="navDot" />
      </Link>

      <style jsx>{`
        .navItem {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;

          padding: 10px 10px;
          border-radius: 16px;
          text-decoration: none;

          color: rgba(30, 41, 59, 0.92);
          border: 1px solid rgba(2, 6, 23, 0.06);
          background: rgba(255, 255, 255, 0.7);

          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease;
        }

        .navItem:hover {
          transform: translateY(-1px);
          border-color: rgba(2, 6, 23, 0.12);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.10);
          background: rgba(255, 255, 255, 0.88);
        }

        .navItem.active {
          background: rgba(2, 132, 199, 0.10);
          border-color: rgba(2, 132, 199, 0.22);
        }

        .navIcon {
          width: 34px;
          height: 34px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: rgba(2, 6, 23, 0.04);
          color: rgba(2, 132, 199, 0.95);
        }

        .navItem.active .navIcon {
          background: rgba(2, 132, 199, 0.12);
        }

        .navLabel {
          font-weight: 800;
          font-size: 13px;
          letter-spacing: -0.01em;
          flex: 1 1 auto;
        }

        .navDot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(100, 116, 139, 0.35);
          opacity: ${active ? 1 : 0};
          transition: opacity 160ms ease;
        }
      `}</style>
    </>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

function titleCase(s: string) {
  if (!s) return s;
  return s
    .split(" ")
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}
