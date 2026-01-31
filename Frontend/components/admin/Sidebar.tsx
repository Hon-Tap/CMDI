"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

type NavItem = { label: string; href: string };

const content: NavItem[] = [
  { label: "Projects", href: "/admin/content/projects" },
  { label: "Programs", href: "/admin/content/programs" },
  { label: "News", href: "/admin/content/news" },
  { label: "Partners", href: "/admin/content/partners" },
  { label: "Donation Tiers", href: "/admin/content/donation-tiers" },
  { label: "Featured Partner", href: "/admin/content/featured-partner" },
  { label: "Gallery Images", href: "/admin/content/gallery-images" },
];

const inbox: NavItem[] = [
  { label: "Contact Messages", href: "/admin/inbox/contacts" },
  { label: "Partner Requests", href: "/admin/inbox/partners" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>CMDI</div>
        <div className={styles.sub}>Admin</div>
      </div>

      <nav className={styles.nav}>
        <Section title="Overview">
          <NavLink href="/admin" active={isActive("/admin") && pathname === "/admin"}>
            Dashboard
          </NavLink>
        </Section>

        <Section title="Content">
          {content.map((item) => (
            <NavLink key={item.href} href={item.href} active={isActive(item.href)}>
              {item.label}
            </NavLink>
          ))}
        </Section>

        <Section title="Inbox">
          {inbox.map((item) => (
            <NavLink key={item.href} href={item.href} active={isActive(item.href)}>
              {item.label}
            </NavLink>
          ))}
        </Section>

        <Section title="System">
          <NavLink href="/admin/media" active={isActive("/admin/media")}>
            Media
          </NavLink>
          <NavLink href="/admin/settings" active={isActive("/admin/settings")}>
            Settings
          </NavLink>
        </Section>
      </nav>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link className={`${styles.link} ${active ? styles.active : ""}`} href={href}>
      {children}
    </Link>
  );
}
