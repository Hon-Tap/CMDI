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

type ApiList<T> =
  | T[]
  | {
      data?: T[];
      meta?: { page?: number; pageSize?: number; total?: number };
    };

function fmtDate(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

function normalizeList<T>(payload: ApiList<T>): { data: T[]; meta?: { page?: number; pageSize?: number; total?: number } } {
  if (Array.isArray(payload)) return { data: payload };
  return { data: payload.data ?? [], meta: payload.meta };
}

export default function AdminProjectsListPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [meta, setMeta] = useState<{ page: number; pageSize: number; total: number } | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>('');

  // UX state
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const canPrev = page > 1;
  const canNext = meta ? page * pageSize < meta.total : items.length === pageSize; // fallback heuristic

  const endpoint = useMemo(() => '/api/admin/content/projects', []);

  async function load() {
    setLoading(true);
    setErr('');

    try {
      // Build URL with query params
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.set('page', String(page));
      url.searchParams.set('pageSize', String(pageSize));
      if (q.trim()) url.searchParams.set('q', q.trim());

      const res = await fetch(url.toString(), {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
      });

      if (!res.ok) {
        const t = await res.text().catch(() => '');
        // Make auth failures obvious
        if (res.status === 401 || res.status === 403) {
          throw new Error(`Unauthorized. Please log in at /admin/login.\n\n${t}`.trim());
        }
        throw new Error(`Failed to load projects (${res.status}).\n\n${t}`.trim());
      }

      const json = (await res.json()) as ApiList<Project>;
      const { data, meta: m } = normalizeList(json);

      setItems(data);
      if (m && typeof m.page === 'number' && typeof m.pageSize === 'number' && typeof m.total === 'number') {
        setMeta({ page: m.page, pageSize: m.pageSize, total: m.total });
      } else {
        setMeta(null);
      }
    } catch (e: any) {
      setErr(e?.message || 'Failed to load projects.');
      setItems([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: Project['id']) {
    const ok = window.confirm('Delete this project? This cannot be undone.');
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/content/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`Delete failed (${res.status}).\n\n${t}`.trim());
      }

      // Reload current page (and if it becomes empty, go back one page)
      await load();
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
    } catch (e: any) {
      alert(e?.message || 'Failed to delete.');
    }
  }

  // Load on mount + when page changes
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Debounced search reload
  useEffect(() => {
    const handle = setTimeout(() => {
      setPage(1);
      load();
    }, 350);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const countLabel = useMemo(() => {
    if (loading) return 'Loading…';
    if (meta) return `${meta.total} total`;
    return `${items.length} item(s)`;
  }, [loading, meta, items.length]);

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
            <Link href="/admin" style={{ textDecoration: 'none' }}>
              Admin
            </Link>{' '}
            /{' '}
            <Link href="/admin/content" style={{ textDecoration: 'none' }}>
              Content
            </Link>{' '}
            / Projects
          </div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Projects</h1>
          <p style={{ margin: '8px 0 0', opacity: 0.8 }}>Create, edit, preview, publish. This becomes your CMS backbone.</p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={load}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,.12)',
              background: 'white',
              cursor: 'pointer',
            }}
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
          placeholder="Search by title, status, category, location…"
          style={{
            flex: '1 1 320px',
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid rgba(0,0,0,.15)',
          }}
        />

        <div style={{ fontSize: 12, opacity: 0.75 }}>{countLabel}</div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            disabled={!canPrev || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,.12)',
              background: 'white',
              cursor: !canPrev || loading ? 'not-allowed' : 'pointer',
              opacity: !canPrev || loading ? 0.5 : 1,
            }}
          >
            Prev
          </button>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Page {page}</div>
          <button
            type="button"
            disabled={!canNext || loading}
            onClick={() => setPage((p) => p + 1)}
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,.12)',
              background: 'white',
              cursor: !canNext || loading ? 'not-allowed' : 'pointer',
              opacity: !canNext || loading ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      </section>

      {err && (
        <div style={{ marginTop: 14, padding: 14, borderRadius: 12, border: '1px solid rgba(255,0,0,.25)' }}>
          <strong>Can’t load projects</strong>
          <pre style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap', fontSize: 12 }}>{err}</pre>
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
            If this is an auth issue, log in at <Link href="/admin/login">/admin/login</Link>.
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
              {!loading && items.length === 0 && !err && (
                <tr>
                  <td colSpan={6} style={{ padding: 14, opacity: 0.8 }}>
                    No projects found.
                  </td>
                </tr>
              )}

              {items.map((p) => (
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
                        style={{
                          padding: '8px 10px',
                          borderRadius: 10,
                          border: '1px solid rgba(255,0,0,.35)',
                          background: 'white',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {loading && (
                <tr>
                  <td colSpan={6} style={{ padding: 14, opacity: 0.8 }}>
                    Loading…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
