'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

function Card({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: 'none',
        border: '1px solid rgba(0,0,0,.12)',
        borderRadius: 16,
        padding: 16,
        display: 'block',
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
      <div style={{ marginTop: 8, opacity: 0.8, lineHeight: 1.5 }}>{desc}</div>
      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>Open →</div>
    </Link>
  );
}

export default function AdminHomePage() {
  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>Site</Link> / Admin
      </div>

      <h1 style={{ margin: 0, fontSize: 30 }}>Admin Dashboard</h1>
      <p style={{ margin: '10px 0 0', opacity: 0.85 }}>
        Content, media, inbox, settings. We’re turning this into a real CMS: drafts, publish flow, preview, ordering,
        soft delete, and safe edits.
      </p>

      <section style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        <Card href="/admin/content/projects" title="Projects" desc="Create, edit, preview, publish. Core content type." />
        <Card href="/admin/content/programs" title="Programs" desc="Manage programs and how they appear on the public site." />
        <Card href="/admin/content/news" title="News" desc="Create news posts (draft/published), images, and scheduling later." />
        <Card href="/admin/media" title="Media" desc="Central place for images and uploads (we’ll harden this next)." />
        <Card href="/admin/inbox" title="Inbox" desc="Messages, contacts, moderation workflow." />
        <Card href="/admin/settings" title="Settings" desc="Site-wide config, roles, and admin preferences." />
      </section>
    </main>
  );
}
