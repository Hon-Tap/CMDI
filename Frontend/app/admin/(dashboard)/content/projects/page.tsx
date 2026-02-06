'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  RefreshCw,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

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

type Meta = { page: number; pageSize: number; total: number };

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

function normalizeList<T>(payload: ApiList<T>): { data: T[]; meta?: Meta } {
  if (Array.isArray(payload)) return { data: payload };
  const m = payload.meta;
  const ok =
    m && typeof m.page === 'number' && typeof m.pageSize === 'number' && typeof m.total === 'number';
  return { data: payload.data ?? [], meta: ok ? (m as Meta) : undefined };
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function statusTone(statusRaw?: string | null) {
  const s = (statusRaw || 'draft').trim().toLowerCase();

  // You can extend this mapping anytime
  if (['published', 'active', 'ongoing'].includes(s)) return 'green';
  if (['planning', 'pending'].includes(s)) return 'amber';
  if (['completed', 'done'].includes(s)) return 'slate';
  if (['draft'].includes(s)) return 'blue';
  return 'slate';
}

export default function AdminProjectsListPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>('');

  const [q, setQ] = useState('');
  const debouncedQ = useDebouncedValue(q, 350);

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const endpoint = useMemo(() => '/api/admin/content/projects', []);
  const abortRef = useRef<AbortController | null>(null);

  const canPrev = page > 1;
  const canNext = meta ? page * meta.pageSize < meta.total : items.length === pageSize;

  const countLabel = useMemo(() => {
    if (loading) return 'Loading…';
    if (meta) return `${meta.total} total`;
    return `${items.length} item(s)`;
  }, [loading, meta, items.length]);

  const pageLabel = useMemo(() => {
    const p = meta?.page ?? page;
    if (!meta) return `Page ${p}`;
    const totalPages = Math.max(1, Math.ceil(meta.total / meta.pageSize));
    return `Page ${p} / ${totalPages}`;
  }, [meta, page]);

  async function load(nextPage = page, nextQ = debouncedQ) {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setErr('');

    try {
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.set('page', String(nextPage));
      url.searchParams.set('pageSize', String(pageSize));
      if (nextQ.trim()) url.searchParams.set('q', nextQ.trim());

      const res = await fetch(url.toString(), {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
        signal: ac.signal,
      });

      if (!res.ok) {
        const t = await res.text().catch(() => '');
        if (res.status === 401 || res.status === 403) {
          throw new Error(`Unauthorized. Please log in at /admin/login.\n\n${t}`.trim());
        }
        throw new Error(`Failed to load projects (${res.status}).\n\n${t}`.trim());
      }

      const json = (await res.json()) as ApiList<Project>;
      const normalized = normalizeList(json);

      setItems(normalized.data);
      setMeta(normalized.meta ?? null);
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      setErr(e?.message || 'Failed to load projects.');
      setItems([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }

  // Delete modal
  const [confirmId, setConfirmId] = useState<Project['id'] | null>(null);
  const [confirmTitle, setConfirmTitle] = useState<string>('');
  const [deleting, setDeleting] = useState(false);

  function openDelete(p: Project) {
    setConfirmId(p.id);
    setConfirmTitle(p.title || '(Untitled)');
  }

  function closeDelete() {
    if (deleting) return;
    setConfirmId(null);
    setConfirmTitle('');
  }

  async function doDelete() {
    if (!confirmId) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/content/projects/${confirmId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`Delete failed (${res.status}).\n\n${t}`.trim());
      }

      closeDelete();
      await load(page, debouncedQ);

      // If we deleted the last row on the page, go back
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
    } catch (e: any) {
      alert(e?.message || 'Failed to delete.');
    } finally {
      setDeleting(false);
    }
  }

  // Load on mount + page changes + debounced query changes
  useEffect(() => {
    load(page, debouncedQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedQ]);

  // Reset to page 1 when query changes
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  return (
    <div className="page">
      {/* Header */}
      <div className="header">
        <div>
          <div className="kicker">Content / Projects</div>
          <h1 className="h1">Projects</h1>
          <p className="sub">
            Create, edit, preview, publish. This becomes your CMS backbone.
          </p>
        </div>

        <div className="actions">
          <button className="btn" onClick={() => load(page, debouncedQ)} type="button" disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </button>

          <Link className="btnPrimary" href="/admin/content/projects/new" prefetch={false}>
            <Plus size={16} />
            New Project
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, status, category, location…"
            aria-label="Search projects"
          />
          {q.trim() && (
            <button className="iconBtn" type="button" onClick={() => setQ('')} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="meta">
          <span className="chip">{countLabel}</span>

          <div className="pager">
            <button
              className="btnSmall"
              type="button"
              disabled={!canPrev || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            <span className="pageLabel">{pageLabel}</span>

            <button
              className="btnSmall"
              type="button"
              disabled={!canNext || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {err && (
        <div className="errorBox">
          <div className="errorTitle">Can’t load projects</div>
          <pre className="errorText">{err}</pre>
          <div className="errorHint">
            If this is an auth issue, log in at <Link href="/admin/login">/admin/login</Link>.
          </div>
        </div>
      )}

      {/* Table / List card */}
      <div className="card">
        <div className="tableWrap">
          <table className="table" aria-label="Projects table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Category</th>
                <th>Location</th>
                <th>Updated</th>
                <th className="right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {!loading && items.length === 0 && !err && (
                <tr>
                  <td colSpan={6} className="empty">
                    No projects found.
                  </td>
                </tr>
              )}

              {items.map((p) => (
                <tr key={String(p.id)}>
                  <td>
                    <div className="titleCell">
                      <div className="title">{p.title || '(Untitled)'}</div>
                      <div className="muted">#{p.id}</div>
                    </div>
                  </td>

                  <td>
                    <StatusPill value={p.status || 'draft'} />
                  </td>

                  <td>{p.category || '—'}</td>
                  <td>{p.location || '—'}</td>
                  <td className="muted">{fmtDate(p.updated_at || p.created_at)}</td>

                  <td className="right">
                    <div className="rowActions">
                      <Link className="btnGhost" href={`/admin/content/projects/${p.id}/preview`} prefetch={false}>
                        <Eye size={16} />
                        Preview
                      </Link>
                      <Link className="btnGhost" href={`/admin/content/projects/${p.id}/edit`} prefetch={false}>
                        <Pencil size={16} />
                        Edit
                      </Link>
                      <button className="btnDanger" type="button" onClick={() => openDelete(p)}>
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {loading && (
                <tr>
                  <td colSpan={6} className="empty">
                    Loading…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mobileList" aria-label="Projects list">
          {!loading && items.length === 0 && !err && <div className="mobileEmpty">No projects found.</div>}
          {loading && <div className="mobileEmpty">Loading…</div>}

          {!loading &&
            items.map((p) => (
              <div className="mCard" key={String(p.id)}>
                <div className="mTop">
                  <div>
                    <div className="mTitle">{p.title || '(Untitled)'}</div>
                    <div className="muted">#{p.id}</div>
                  </div>
                  <StatusPill value={p.status || 'draft'} compact />
                </div>

                <div className="mGrid">
                  <div>
                    <div className="mLabel">Category</div>
                    <div className="mValue">{p.category || '—'}</div>
                  </div>
                  <div>
                    <div className="mLabel">Location</div>
                    <div className="mValue">{p.location || '—'}</div>
                  </div>
                  <div>
                    <div className="mLabel">Updated</div>
                    <div className="mValue muted">{fmtDate(p.updated_at || p.created_at)}</div>
                  </div>
                </div>

                <div className="mActions">
                  <Link className="btnGhost" href={`/admin/content/projects/${p.id}/preview`} prefetch={false}>
                    <Eye size={16} /> Preview
                  </Link>
                  <Link className="btnGhost" href={`/admin/content/projects/${p.id}/edit`} prefetch={false}>
                    <Pencil size={16} /> Edit
                  </Link>
                  <button className="btnDanger" type="button" onClick={() => openDelete(p)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {confirmId !== null && (
        <div className="modalBackdrop" role="dialog" aria-modal="true" aria-label="Confirm delete">
          <div className="modal">
            <div className="modalTitle">Delete project?</div>
            <p className="modalText">
              You’re about to permanently delete <strong>{confirmTitle}</strong>. This cannot be undone.
            </p>

            <div className="modalActions">
              <button className="btn" type="button" onClick={closeDelete} disabled={deleting}>
                Cancel
              </button>
              <button className="btnDangerSolid" type="button" onClick={doDelete} disabled={deleting}>
                <Trash2 size={16} />
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page {
          max-width: 1120px;
        }

        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .kicker {
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(100, 116, 139, 0.95);
        }

        .h1 {
          margin: 6px 0 0;
          font-size: 28px;
          letter-spacing: -0.02em;
          font-weight: 900;
          color: rgba(15, 23, 42, 0.95);
        }

        .sub {
          margin: 8px 0 0;
          color: rgba(71, 85, 105, 0.95);
          line-height: 1.6;
          max-width: 72ch;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn,
        .btnSmall {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 14px;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(2, 6, 23, 0.08);
          box-shadow: 0 1px 2px rgba(2, 6, 23, 0.06);
          cursor: pointer;
          color: rgba(15, 23, 42, 0.92);
          font-weight: 800;
          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
          text-decoration: none;
          user-select: none;
        }

        .btnSmall {
          padding: 9px 10px;
          border-radius: 12px;
          font-size: 13px;
        }

        .btn:hover,
        .btnSmall:hover {
          transform: translateY(-1px);
          border-color: rgba(2, 6, 23, 0.14);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.12);
        }

        .btn:disabled,
        .btnSmall:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 1px 2px rgba(2, 6, 23, 0.06);
        }

        .btnPrimary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 14px;
          padding: 10px 12px;
          text-decoration: none;
          background: rgba(2, 132, 199, 0.95);
          color: white;
          font-weight: 900;
          border: 1px solid rgba(2, 132, 199, 0.45);
          box-shadow: 0 10px 24px rgba(2, 132, 199, 0.22);
          transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
        }

        .btnPrimary:hover {
          transform: translateY(-1px);
          filter: brightness(1.02);
          box-shadow: 0 18px 34px rgba(2, 132, 199, 0.26);
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .search {
          flex: 1 1 420px;
          min-width: 260px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(2, 6, 23, 0.08);
          box-shadow: 0 1px 2px rgba(2, 6, 23, 0.06);
          color: rgba(71, 85, 105, 0.95);
        }

        .search input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          color: rgba(15, 23, 42, 0.95);
          font-weight: 700;
        }

        .iconBtn {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          border: 1px solid rgba(2, 6, 23, 0.08);
          background: rgba(255, 255, 255, 0.85);
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        .meta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .chip {
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(2, 6, 23, 0.08);
          background: rgba(255, 255, 255, 0.85);
          color: rgba(71, 85, 105, 0.95);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.02em;
        }

        .pager {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .pageLabel {
          font-size: 12px;
          color: rgba(71, 85, 105, 0.95);
          font-weight: 900;
        }

        .errorBox {
          margin-top: 10px;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid rgba(248, 113, 113, 0.35);
          background: rgba(254, 242, 242, 0.92);
        }

        .errorTitle {
          font-weight: 900;
          color: rgba(153, 27, 27, 0.95);
        }

        .errorText {
          margin: 10px 0 0;
          white-space: pre-wrap;
          font-size: 12px;
          color: rgba(153, 27, 27, 0.9);
        }

        .errorHint {
          margin-top: 10px;
          font-size: 12px;
          color: rgba(100, 116, 139, 0.95);
        }

        .card {
          margin-top: 12px;
          border-radius: 22px;
          border: 1px solid rgba(2, 6, 23, 0.08);
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 1px 2px rgba(2, 6, 23, 0.06);
          overflow: hidden;
        }

        .tableWrap {
          overflow-x: auto;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        thead th {
          text-align: left;
          padding: 14px 14px;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(71, 85, 105, 0.95);
          background: rgba(2, 6, 23, 0.03);
          border-bottom: 1px solid rgba(2, 6, 23, 0.06);
          white-space: nowrap;
        }

        tbody td {
          padding: 14px 14px;
          border-top: 1px solid rgba(2, 6, 23, 0.06);
          vertical-align: middle;
          color: rgba(15, 23, 42, 0.92);
        }

        tbody tr:hover td {
          background: rgba(2, 132, 199, 0.04);
        }

        .right {
          text-align: right;
        }

        .titleCell {
          display: grid;
          gap: 4px;
        }

        .title {
          font-weight: 900;
          letter-spacing: -0.01em;
        }

        .muted {
          color: rgba(100, 116, 139, 0.95);
          font-size: 12px;
        }

        .rowActions {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .btnGhost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 10px;
          border-radius: 12px;
          text-decoration: none;
          border: 1px solid rgba(2, 6, 23, 0.08);
          background: rgba(255, 255, 255, 0.92);
          color: rgba(15, 23, 42, 0.92);
          font-weight: 800;
          font-size: 13px;
          transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
        }

        .btnGhost:hover {
          transform: translateY(-1px);
          border-color: rgba(2, 6, 23, 0.14);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.10);
        }

        .btnDanger {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 10px;
          border-radius: 12px;
          border: 1px solid rgba(248, 113, 113, 0.35);
          background: rgba(255, 255, 255, 0.92);
          color: rgba(153, 27, 27, 0.95);
          font-weight: 900;
          font-size: 13px;
          cursor: pointer;
          transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
        }

        .btnDanger:hover {
          transform: translateY(-1px);
          border-color: rgba(248, 113, 113, 0.55);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.10);
        }

        .btnDangerSolid {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(185, 28, 28, 0.45);
          background: rgba(185, 28, 28, 0.95);
          color: white;
          font-weight: 900;
          cursor: pointer;
        }

        .btnDangerSolid:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .empty {
          padding: 16px !important;
          color: rgba(71, 85, 105, 0.95);
        }

        /* Mobile view */
        .mobileList {
          display: none;
          padding: 12px;
        }

        @media (max-width: 860px) {
          .tableWrap {
            display: none;
          }
          .mobileList {
            display: grid;
            gap: 10px;
          }
        }

        .mobileEmpty {
          padding: 12px;
          color: rgba(71, 85, 105, 0.95);
        }

        .mCard {
          border-radius: 18px;
          border: 1px solid rgba(2, 6, 23, 0.08);
          background: rgba(255, 255, 255, 0.92);
          padding: 12px;
        }

        .mTop {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }

        .mTitle {
          font-weight: 900;
          color: rgba(15, 23, 42, 0.95);
          letter-spacing: -0.01em;
        }

        .mGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 10px;
        }

        @media (max-width: 520px) {
          .mGrid {
            grid-template-columns: 1fr;
          }
        }

        .mLabel {
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(100, 116, 139, 0.95);
        }

        .mValue {
          margin-top: 4px;
          color: rgba(15, 23, 42, 0.92);
          font-weight: 750;
        }

        .mActions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* Modal */
        .modalBackdrop {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.55);
          display: grid;
          place-items: center;
          padding: 18px;
          z-index: 60;
        }

        .modal {
          width: 100%;
          max-width: 460px;
          border-radius: 20px;
          border: 1px solid rgba(2, 6, 23, 0.10);
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 34px 90px rgba(2, 6, 23, 0.30);
          padding: 16px;
        }

        .modalTitle {
          font-weight: 950;
          font-size: 16px;
          color: rgba(15, 23, 42, 0.95);
        }

        .modalText {
          margin: 10px 0 0;
          color: rgba(71, 85, 105, 0.95);
          line-height: 1.6;
        }

        .modalActions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 14px;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}

function StatusPill({ value, compact }: { value: string; compact?: boolean }) {
  const tone = statusTone(value);

  const styles: Record<
    string,
    { bg: string; border: string; fg: string }
  > = {
    blue: { bg: 'rgba(59,130,246,.10)', border: 'rgba(59,130,246,.22)', fg: 'rgb(37,99,235)' },
    green: { bg: 'rgba(16,185,129,.12)', border: 'rgba(16,185,129,.26)', fg: 'rgb(5,150,105)' },
    amber: { bg: 'rgba(245,158,11,.14)', border: 'rgba(245,158,11,.28)', fg: 'rgb(217,119,6)' },
    slate: { bg: 'rgba(100,116,139,.12)', border: 'rgba(100,116,139,.22)', fg: 'rgb(71,85,105)' },
  };

  const t = styles[tone];

  return (
    <>
      <span className="pill">
        {value}
      </span>

      <style jsx>{`
        .pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          padding: ${compact ? '6px 9px' : '7px 10px'};
          border-radius: 999px;

          background: ${t.bg};
          border: 1px solid ${t.border};
          color: ${t.fg};

          font-weight: 950;
          font-size: ${compact ? '12px' : '12px'};
          letter-spacing: 0.02em;
          text-transform: capitalize;
          white-space: nowrap;
        }
      `}</style>
    </>
  );
}
