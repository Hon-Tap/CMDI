'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export const dynamic = 'force-dynamic';

type Project = {
  id: number | string;
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  status?: string | null;
  location?: string | null;
  category?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

function fmtDate(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

export default function AdminProjectsListPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>('');
  const [q, setQ] = useState('');

  // We *try* these endpoints in order.
  // If you later add a list route handler for projects, `/admin/content/projects` will work.
  const endpoints = useMemo(() => ['/admin/content/projects', '/api/admin/projects'], []);

  async function load() {
    setLoading(true);
    setErr('');

    try {
      let lastText = '';
      for (const url of endpoints) {
        const res = await fetch(url, { method: 'GET', cache: 'no-store', credentials: 'include' });
        if (res.ok) {
          const data = (await res.json()) as Project[] | { data?: Project[] };
          const rows = Array.isArray(data) ? data : data.data ?? [];
          setItems(rows);
          setLoading(false);
          return;
        }
        lastText = await res.text().catch(() => '');
        // If 404, try the next endpoint; otherwise stop.
        if (res.status !== 404) throw new Error(`GET ${url} failed (${res.status}) ${lastText}`.trim());
      }

      throw new Error(
        `No projects list endpoint found.\n` +
          `Create a route handler at: app/admin/content/projects/route.ts (GET/POST)\n` +
          `or create: app/api/admin/projects/route.ts (GET/POST).\n\n` +
          `Last response: ${lastText}`.trim()
      );
    } catch (e: any) {
      setErr(e?.message || 'Failed to load projects.');
      setItems([]);
      setLoading(false);
    }
  }

  async function remove(id: Project['id']) {
    const ok = window.confirm('Delete this project? This cannot be undone.');
    if (!ok) return;

    try {
      // Your DELETE already exists at /admin/content/projects/:id (route.ts inside [id]).
      const res = await fetch(`/admin/content/projects/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`Delete failed (${res.status}). ${t}`.trim());
      }
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to delete.');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((p) => {
      const hay = `${p.title ?? ''} ${p.status ?? ''} ${p.category ?? ''} ${p.location ?? ''}`.toLowerCase();
      return hay.includes(s);
    });
  }, [items, q]);

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
            <Link href="/admin" style={{ textDecoration: 'none' }}>Admin</Link> /{' '}
            <Link href="/admin/content" style={{ textDecoration: 'none' }}>Content</Link> / Projects
          </div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Projects</h1>
          <p style={{ margin: '8px 0 0', opacity: 0.8 }}>
            Create, edit, preview, publish. This becomes your CMS backbone.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={load}
            style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,.12)', background: 'white' }}
          >
            Refresh
          </button>

          <Link
            href="/admin/content/projects/new"
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,.12)',
              background: 'black',
              color: 'white',
              textDecoration: 'none',
            }}
          >
            + New Project
          </Link>
        </div>
      </header>

      <section style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects…"
          style={{
            flex: '1 1 280px',
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid rgba(0,0,0,.15)',
          }}
        />
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          {loading ? 'Loading…' : `${filtered.length} item(s)`}
        </div>
      </section>

      {err && (
        <div style={{ marginTop: 14, padding: 14, borderRadius: 12, border: '1px solid rgba(255,0,0,.25)' }}>
          <strong>Can’t load projects list</strong>
          <pre style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap', fontSize: 12 }}>{err}</pre>
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
            If you see 401/403, log in at <Link href="/admin/login">/admin/login</Link>.
          </div>
        </div>
      )}

      <section style={{ marginTop: 14, border: '1px solid rgba(0,0,0,.12)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ background: 'rgba(0,0,0,.03)' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: 12 }}>Title</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Status</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Category</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Location</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Updated</th>
                <th style={{ textAlign: 'right', padding: 12 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 14, opacity: 0.8 }}>
                    No projects found.
                  </td>
                </tr>
              )}

              {filtered.map((p) => (
                <tr key={String(p.id)} style={{ borderTop: '1px solid rgba(0,0,0,.08)' }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontWeight: 600 }}>{p.title || '(Untitled)'}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>#{p.id}</div>
                  </td>
                  <td style={{ padding: 12, textTransform: 'capitalize' }}>{p.status || 'draft'}</td>
                  <td style={{ padding: 12 }}>{p.category || '—'}</td>
                  <td style={{ padding: 12 }}>{p.location || '—'}</td>
                  <td style={{ padding: 12 }}>{fmtDate(p.updated_at || p.created_at)}</td>
                  <td style={{ padding: 12, textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <Link
                        href={`/admin/content/projects/${p.id}/preview`}
                        style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(0,0,0,.12)', textDecoration: 'none' }}
                      >
                        Preview
                      </Link>
                      <Link
                        href={`/admin/content/projects/${p.id}/edit`}
                        style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(0,0,0,.12)', textDecoration: 'none' }}
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,0,0,.35)', background: 'white' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
