"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FolderKanban,
  Newspaper,
  CalendarRange,
  Image as ImageIcon,
  Inbox,
  Settings,
  ArrowRight,
  Plus,
} from "lucide-react";

export const dynamic = "force-dynamic";

type CountState = {
  projects?: number;
  programs?: number;
  news?: number;
  inbox?: number;
};

function normalizeCount(json: any): number | undefined {
  // Prefer meta.total if present, fallback to array length.
  if (json && typeof json === "object") {
    const total = json?.meta?.total;
    if (typeof total === "number") return total;
    const data = json?.data;
    if (Array.isArray(data)) return data.length;
  }
  if (Array.isArray(json)) return json.length;
  return undefined;
}

export default function AdminHomePage() {
  const modules = useMemo(
    () => [
      {
        href: "/admin/content/projects",
        title: "Projects",
        desc: "Create drafts, publish updates, and manage impact projects.",
        icon: FolderKanban,
        tone: "blue" as const,
      },
      {
        href: "/admin/content/programs",
        title: "Programs",
        desc: "Control program categories and how they appear on the public site.",
        icon: CalendarRange,
        tone: "indigo" as const,
      },
      {
        href: "/admin/content/news",
        title: "News",
        desc: "Write stories, announcements, and press updates.",
        icon: Newspaper,
        tone: "emerald" as const,
      },
      {
        href: "/admin/media",
        title: "Media Library",
        desc: "Upload and reuse images across pages, projects, and posts.",
        icon: ImageIcon,
        tone: "purple" as const,
      },
      {
        href: "/admin/inbox",
        title: "Inbox",
        desc: "See contact messages and form submissions from the website.",
        icon: Inbox,
        tone: "amber" as const,
      },
      {
        href: "/admin/settings",
        title: "Settings",
        desc: "Admin preferences, site configuration, and housekeeping.",
        icon: Settings,
        tone: "slate" as const,
      },
    ],
    []
  );

  const quickActions = useMemo(
    () => [
      { href: "/admin/content/projects/new", label: "New Project" },
      { href: "/admin/content/programs/new", label: "New Program" },
      { href: "/admin/content/news/new", label: "New News Post" },
    ],
    []
  );

  const [counts, setCounts] = useState<CountState>({});
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadCounts() {
      setCountsLoading(true);

      // These endpoints may differ in your app; we fail gracefully.
      const targets: Array<[keyof CountState, string]> = [
        ["projects", "/api/admin/content/projects?page=1&pageSize=1"],
        ["programs", "/api/admin/content/programs?page=1&pageSize=1"],
        ["news", "/api/admin/content/news?page=1&pageSize=1"],
        ["inbox", "/api/admin/inbox/contacts?page=1&pageSize=1"],
      ];

      const results = await Promise.allSettled(
        targets.map(async ([k, url]) => {
          const res = await fetch(url, { credentials: "include", cache: "no-store" });
          if (!res.ok) throw new Error(String(res.status));
          const json = await res.json();
          return [k, normalizeCount(json)] as const;
        })
      );

      if (!alive) return;

      const next: CountState = {};
      for (const r of results) {
        if (r.status === "fulfilled") {
          const [k, v] = r.value;
          if (typeof v === "number") next[k] = v;
        }
      }

      setCounts(next);
      setCountsLoading(false);
    }

    loadCounts().catch(() => {
      if (!alive) return;
      setCountsLoading(false);
    });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="page">
      <div className="hero">
        <div>
          <h1 className="title">Dashboard</h1>
          <p className="subtitle">
            You’re in the secure admin area. Manage content, media, and inbound messages from here.
          </p>

          <div className="quick">
            {quickActions.map((a) => (
              <Link key={a.href} href={a.href} className="quickBtn" prefetch={false}>
                <Plus size={16} />
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="stats">
          <StatCard label="Projects" value={counts.projects} loading={countsLoading} />
          <StatCard label="Programs" value={counts.programs} loading={countsLoading} />
          <StatCard label="News" value={counts.news} loading={countsLoading} />
          <StatCard label="Inbox" value={counts.inbox} loading={countsLoading} />
        </div>
      </div>

      <div className="grid">
        {modules.map((m) => (
          <ModuleCard
            key={m.href}
            href={m.href}
            title={m.title}
            desc={m.desc}
            icon={m.icon}
            tone={m.tone}
          />
        ))}
      </div>

      <style jsx>{`
        .page {
          max-width: 1120px;
        }

        .hero {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 18px;
          align-items: start;
          margin-bottom: 18px;
        }

        @media (max-width: 980px) {
          .hero {
            grid-template-columns: 1fr;
          }
        }

        .title {
          margin: 0;
          font-size: 30px;
          letter-spacing: -0.02em;
          font-weight: 850;
          color: rgba(15, 23, 42, 0.95);
        }

        .subtitle {
          margin: 10px 0 0;
          max-width: 62ch;
          line-height: 1.6;
          color: rgba(51, 65, 85, 0.92);
        }

        .quick {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
        }

        .quickBtn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 14px;
          text-decoration: none;
          color: rgba(15, 23, 42, 0.92);
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(2, 6, 23, 0.08);
          box-shadow: 0 1px 2px rgba(2, 6, 23, 0.06);
          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
        }

        .quickBtn:hover {
          transform: translateY(-1px);
          border-color: rgba(2, 6, 23, 0.14);
          box-shadow: 0 8px 22px rgba(2, 6, 23, 0.10);
        }

        .stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        @media (max-width: 540px) {
          .stats {
            grid-template-columns: 1fr;
          }
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        @media (max-width: 980px) {
          .grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, loading }: { label: string; value?: number; loading: boolean }) {
  return (
    <div className="stat">
      <div className="label">{label}</div>
      <div className="value">{loading ? "…" : typeof value === "number" ? value : "—"}</div>

      <style jsx>{`
        .stat {
          padding: 14px 14px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(2, 6, 23, 0.08);
          box-shadow: 0 1px 2px rgba(2, 6, 23, 0.06);
        }

        .label {
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(71, 85, 105, 0.95);
        }

        .value {
          margin-top: 6px;
          font-size: 22px;
          font-weight: 850;
          letter-spacing: -0.02em;
          color: rgba(15, 23, 42, 0.95);
        }
      `}</style>
    </div>
  );
}

function ModuleCard({
  href,
  title,
  desc,
  icon: Icon,
  tone,
}: {
  href: string;
  title: string;
  desc: string;
  icon: any;
  tone: "blue" | "indigo" | "emerald" | "purple" | "amber" | "slate";
}) {
  const tones: Record<string, { ring: string; bg: string; fg: string }> = {
    blue: { ring: "rgba(59,130,246,.28)", bg: "rgba(59,130,246,.10)", fg: "rgb(37,99,235)" },
    indigo: { ring: "rgba(99,102,241,.28)", bg: "rgba(99,102,241,.10)", fg: "rgb(79,70,229)" },
    emerald: { ring: "rgba(16,185,129,.28)", bg: "rgba(16,185,129,.10)", fg: "rgb(5,150,105)" },
    purple: { ring: "rgba(168,85,247,.28)", bg: "rgba(168,85,247,.10)", fg: "rgb(124,58,237)" },
    amber: { ring: "rgba(245,158,11,.28)", bg: "rgba(245,158,11,.10)", fg: "rgb(217,119,6)" },
    slate: { ring: "rgba(100,116,139,.24)", bg: "rgba(100,116,139,.10)", fg: "rgb(71,85,105)" },
  };

  const t = tones[tone];

  return (
    <Link href={href} className="card" prefetch={false}>
      <div className="top">
        <div className="icon" style={{ background: t.bg, color: t.fg, boxShadow: `0 0 0 5px ${t.ring}` }}>
          <Icon size={22} />
        </div>

        <div className="text">
          <div className="t">{title}</div>
          <p className="d">{desc}</p>
        </div>
      </div>

      <div className="foot">
        <span className="cta">Open module</span>
        <ArrowRight size={15} />
      </div>

      <style jsx>{`
        .card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 14px;

          padding: 16px;
          border-radius: 20px;
          text-decoration: none;

          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(2, 6, 23, 0.08);
          box-shadow: 0 1px 2px rgba(2, 6, 23, 0.06);

          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
          color: inherit;
        }

        .card:hover {
          transform: translateY(-2px);
          border-color: rgba(2, 6, 23, 0.14);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.12);
        }

        .top {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .icon {
          width: 46px;
          height: 46px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
        }

        .text {
          min-width: 0;
        }

        .t {
          font-weight: 850;
          color: rgba(15, 23, 42, 0.95);
          letter-spacing: -0.01em;
        }

        .d {
          margin: 6px 0 0;
          color: rgba(71, 85, 105, 0.95);
          line-height: 1.55;
          font-size: 14px;
        }

        .foot {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgb(2, 132, 199);
          font-weight: 700;
          font-size: 13px;
        }

        .cta {
          position: relative;
          top: 0.5px;
        }
      `}</style>
    </Link>
  );
}
