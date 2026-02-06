'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export const dynamic = 'force-dynamic';

type MediaItem = {
  id: number | string;
  url?: string | null;
  title?: string | null;
  created_at?: string | null;
};

function fmtDate(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');

  const endpoints = useMemo(() => ['/admin/media', '/api/admin/media'], []);

  async function load() {
    setLoading(true);
    setErr('');

    try {
      let lastText = '';
      for (const url of endpoints) {
        const res = await fetch(url, { method: 'GET', cache: 'no-store', credentials: 'include' });
        if (res.ok) {
          const data = (await res.json()) as MediaItem[] | { data?: MediaItem[] };
          const rows = Array.isArray(data) ? data : data.data ?? [];
          setItems(rows);
          setLoading(false);
          return;
        }
        lastText = await res.text().catch(() => '');
        if (res.status !== 404) throw new Error(`GET ${url} failed (${res.status}). ${lastText}`.trim());
      }

      // If no endpoint exists yet, that's OK; we still render the page.
      setItems([]);
      setLoading(false);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load media.');
      setItems([]);
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((m) => `${m.title ?? ''} ${m.url ?? ''}`.toLowerCase().includes(s));
  }, [items, q]);

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
            <Link href="/admin" style={{ textDecoration: 'none' }}>Admin</Link> / Media
          </div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Media Library</h1>
          <p style={{ margin: '8px 0 0', opacity: 0.8 }}>
            Central place for images. Next step: add upload + storage (S3/R2/Cloudinary) + safe references to content.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={load}
            style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,.12)', background: 'white' }}
          >
            Refresh
          </button>

          <button
            type="button"
            onClick={() => alert('Next step: implement upload endpoint + storage provider')}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,.12)',
              background: 'black',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Upload (next)
          </button>
        </div>
      </header>

      <section style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search media…"
          style={{
            flex: '1 1 280px',
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid rgba(0,0,0,.15)',
          }}
        />
        <div style={{ fontSize: 12, opacity: 0.75 }}>{loading ? 'Loading…' : `${filtered.length} item(s)`}</div>
      </section>

      {err && (
        <div style={{ marginTop: 14, padding: 14, borderRadius: 12, border: '1px solid rgba(255,0,0,.25)' }}>
          <strong>Can’t load media</strong>
          <pre style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap', fontSize: 12 }}>{err}</pre>
        </div>
      )}

      <section style={{ marginTop: 14 }}>
        {(!loading && filtered.length === 0) ? (
          <div style={{ padding: 16, borderRadius: 16, border: '1px solid rgba(0,0,0,.12)' }}>
            <strong>No media yet</strong>
            <p style={{ margin: '8px 0 0', opacity: 0.8 }}>
              For now, you can use static images in <code>/public</code> or remote URLs.
              When you’re ready, we’ll wire an upload pipeline and show everything here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {filtered.map((m) => (
              <div key={String(m.id)} style={{ border: '1px solid rgba(0,0,0,.12)', borderRadius: 16, overflow: 'hidden' }}>
                {m.url ? (
                  <img
                    src={m.url}
                    alt={m.title ?? 'Media'}
                    style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700 }}>{m.title || 'Untitled'}</div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>{fmtDate(m.created_at)}</div>
                  <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>#{m.id}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
