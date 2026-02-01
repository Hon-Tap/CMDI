'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export const dynamic = 'force-dynamic';

type News = {
  id: number | string;
  title?: string | null;
  image_url?: string | null;
  status?: string | null;
  created_at?: string | null;
};

function fmtDate(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

export default function AdminNewsPage() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch('/api/admin/news', { cache: 'no-store', credentials: 'include' });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`GET /api/admin/news failed (${res.status}). ${t}`.trim());
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.data ?? []);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load news.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((n) => `${n.title ?? ''} ${n.status ?? ''}`.toLowerCase().includes(s));
  }, [items, q]);

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
            <Link href="/admin" style={{ textDecoration: 'none' }}>Admin</Link> /{' '}
            <Link href="/admin/content" style={{ textDecoration: 'none' }}>Content</Link> / News
          </div>
          <h1 style={{ margin: 0, fontSize: 28 }}>News</h1>
          <p style={{ margin: '8px 0 0', opacity: 0.8 }}>Draft and publish news updates.</p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={load}
            style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,.12)', background: 'white' }}
          >
            Refresh
          </button>

          <Link
            href="/admin/content/news/new"
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,.12)',
              background: 'black',
              color: 'white',
              textDecoration: 'none',
            }}
          >
            + New Post
          </Link>
        </div>
      </header>

      <section style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search news…"
          style={{ flex: '1 1 280px', padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(0,0,0,.15)' }}
        />
        <div style={{ fontSize: 12, opacity: 0.75 }}>{loading ? 'Loading…' : `${filtered.length} item(s)`}</div>
      </section>

      {err && (
        <div style={{ marginTop: 14, padding: 14, borderRadius: 12, border: '1px solid rgba(255,0,0,.25)' }}>
          <strong>Can’t load news</strong>
          <pre style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap', fontSize: 12 }}>{err}</pre>
        </div>
      )}

      <section style={{ marginTop: 14, border: '1px solid rgba(0,0,0,.12)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ background: 'rgba(0,0,0,.03)' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: 12 }}>Title</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Status</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: 14, opacity: 0.8 }}>No news posts.</td>
                </tr>
              )}
              {filtered.map((n) => (
                <tr key={String(n.id)} style={{ borderTop: '1px solid rgba(0,0,0,.08)' }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontWeight: 600 }}>{n.title || '(Untitled)'}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>#{n.id}</div>
                  </td>
                  <td style={{ padding: 12, textTransform: 'capitalize' }}>{n.status || 'draft'}</td>
                  <td style={{ padding: 12 }}>{fmtDate(n.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
