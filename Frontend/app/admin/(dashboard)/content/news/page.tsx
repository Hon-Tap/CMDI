"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  RefreshCw,
  Plus,
  Newspaper,
  Pencil,
  Trash2,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

type NewsItem = {
  id?: number | string;
  title?: string;
  content?: string;
};

type ApiResponse = { status?: string; data?: NewsItem[]; total?: number } | NewsItem[];

function normalize(result: ApiResponse): { rows: NewsItem[]; total: number } {
  const rows = Array.isArray(result)
    ? result
    : Array.isArray((result as any)?.data)
    ? ((result as any).data as NewsItem[])
    : [];

  const total =
    !Array.isArray(result) && typeof (result as any)?.total === "number"
      ? (result as any).total
      : rows.length;

  return { rows, total };
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function snippet(text?: string, max = 180) {
  const v = (text || "").replace(/\s+/g, " ").trim();
  if (!v) return "—";
  return v.length > max ? v.slice(0, max - 1) + "…" : v;
}

export default function AdminNewsPage() {
  const router = useRouter();
  const API = "/api/admin/content/news";

  const [items, setItems] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 350);

  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState("");

  // Modal (create/edit)
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [confirmId, setConfirmId] = useState<NewsItem["id"] | null>(null);
  const [confirmTitle, setConfirmTitle] = useState<string>("");

  const abortRef = useRef<AbortController | null>(null);

  const subtitle = useMemo(() => {
    if (loading) return "Loading…";
    if (fetchErr) return "Can’t load news";
    return `${total} item(s)`;
  }, [loading, fetchErr, total]);

  async function fetchNews() {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setFetchErr("");

    try {
      const url = new URL(API, window.location.origin);
      if (debouncedQ.trim()) url.searchParams.set("q", debouncedQ.trim());
      url.searchParams.set("page", "1");
      url.searchParams.set("pageSize", "50");

      const res = await fetch(url.toString(), {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        signal: ac.signal,
      });

      if (res.status === 401 || res.status === 403) {
        router.push(`/admin/login?next=${encodeURIComponent("/admin/content/news")}`);
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`GET ${API} failed (${res.status}). ${text.slice(0, 220)}`.trim());
      }

      const result = (await res.json()) as ApiResponse;
      const { rows, total } = normalize(result);
      setItems(rows);
      setTotal(total);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      console.error("[admin news] fetch failed:", e);
      setFetchErr(e?.message || "Can’t load news");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  function openCreate() {
    setFormErr("");
    setEditing(null);
    setFormTitle("");
    setFormContent("");
    setOpen(true);
  }

  function openEdit(n: NewsItem) {
    setFormErr("");
    setEditing(n);
    setFormTitle(n.title ?? "");
    setFormContent(n.content ?? "");
    setOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setOpen(false);
    setEditing(null);
  }

  async function submit() {
    setFormErr("");

    const title = formTitle.trim();
    const content = formContent.trim();

    if (!title) return setFormErr("Title is required.");
    if (!content) return setFormErr("Content is required.");

    setSaving(true);

    try {
      const isEdit = Boolean(editing?.id);

      const res = await fetch(API, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(isEdit ? { id: editing!.id, title, content } : { title, content }),
      });

      if (res.status === 401 || res.status === 403) {
        router.push(`/admin/login?next=${encodeURIComponent("/admin/content/news")}`);
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`${isEdit ? "PATCH" : "POST"} failed (${res.status}). ${text.slice(0, 220)}`.trim());
      }

      setOpen(false);
      setEditing(null);
      await fetchNews();
    } catch (e: any) {
      console.error("[admin news] save failed:", e);
      setFormErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function askDelete(n: NewsItem) {
    if (!n?.id) return;
    setConfirmId(n.id);
    setConfirmTitle(n.title ?? "this article");
  }

  function closeDelete() {
    setConfirmId(null);
    setConfirmTitle("");
  }

  async function removeConfirmed() {
    if (!confirmId) return;

    setFetchErr("");

    try {
      const res = await fetch(`${API}?id=${encodeURIComponent(String(confirmId))}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        router.push(`/admin/login?next=${encodeURIComponent("/admin/content/news")}`);
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`DELETE failed (${res.status}). ${text.slice(0, 220)}`.trim());
      }

      closeDelete();
      await fetchNews();
    } catch (e: any) {
      console.error("[admin news] delete failed:", e);
      setFetchErr(e?.message || "Delete failed");
    }
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="header">
        <div>
          <div className="kicker">Content / News</div>
          <h1 className="h1">News</h1>
          <p className="sub">
            Manage news articles shown on the public site. Keep titles clear and content structured into short paragraphs.
          </p>
        </div>

        <div className="actions">
          <button className="btn" onClick={fetchNews} type="button" disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </button>

          <button className="btnPrimary" onClick={openCreate} type="button">
            <Plus size={16} />
            New Article
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search news…"
            aria-label="Search news"
          />
          {q.trim() && (
            <button className="iconBtn" type="button" onClick={() => setQ("")} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="meta">
          <span className="chip">{subtitle}</span>
        </div>
      </div>

      {/* Error */}
      {fetchErr && (
        <div className="errorBox">
          <div className="errorTitle">Can’t load news</div>
          <div className="errorText">{fetchErr}</div>
          <div className="errorHint">
            If this is <b>401/403</b>, your session cookie is missing/expired — log in again.
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="card">
        <div className="tableWrap">
          <table className="table" aria-label="News table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Preview</th>
                <th className="right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="empty">
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="empty">
                    No news found.
                  </td>
                </tr>
              ) : (
                items.map((n) => (
                  <tr key={String(n.id ?? n.title)}>
                    <td>
                      <div className="newsCell">
                        <div className="avatar" aria-hidden="true">
                          <Newspaper size={18} />
                        </div>
                        <div className="newsText">
                          <div className="title">{n.title ?? "—"}</div>
                          <div className="muted">ID: {n.id ?? "—"}</div>
                        </div>
                      </div>
                    </td>

                    <td className="preview">{snippet(n.content, 210)}</td>

                    <td className="right">
                      <div className="rowActions">
                        <button className="btnGhost" type="button" onClick={() => openEdit(n)}>
                          <Pencil size={16} />
                          Edit
                        </button>
                        <button className="btnDanger" type="button" onClick={() => askDelete(n)}>
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="mobileList" aria-label="News list">
          {loading && <div className="mobileEmpty">Loading…</div>}
          {!loading && items.length === 0 && <div className="mobileEmpty">No news found.</div>}

          {!loading &&
            items.map((n) => (
              <div className="mCard" key={String(n.id ?? n.title)}>
                <div className="mTop">
                  <div className="mLeft">
                    <div className="mAvatar" aria-hidden="true">
                      <Newspaper size={18} />
                    </div>
                    <div>
                      <div className="mTitle">{n.title ?? "—"}</div>
                      <div className="muted">ID: {n.id ?? "—"}</div>
                    </div>
                  </div>
                </div>

                <div className="mPreview">{snippet(n.content, 280)}</div>

                <div className="mActions">
                  <button className="btnGhost" type="button" onClick={() => openEdit(n)}>
                    <Pencil size={16} /> Edit
                  </button>
                  <button className="btnDanger" type="button" onClick={() => askDelete(n)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {open && (
        <div className="modalBackdrop" role="dialog" aria-modal="true" aria-label="News editor">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div className="modalTitle">
                <Sparkles size={16} />
                {editing ? "Edit Article" : "New Article"}
              </div>

              <button className="btn" type="button" onClick={closeModal} disabled={saving}>
                Close
              </button>
            </div>

            <div className="modalBody">
              <div className="field">
                <label>Title</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. CMDI Trains 100 Community Health Workers…"
                />
              </div>

              <div className="field">
                <label>Content</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write your story. Use short paragraphs for readability…"
                />
                <div className="hint">
                  Tip: Use 2–4 sentence paragraphs. This makes the public News page look premium.
                </div>
              </div>

              {formErr && <div className="inlineErr">{formErr}</div>}

              <div className="modalActions">
                <button className="btn" type="button" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button className="btnPrimary" type="button" onClick={submit} disabled={saving}>
                  {saving ? "Saving…" : editing ? "Save changes" : "Publish"}
                </button>
              </div>

              <div className="note">
                If Edit/Delete returns <b>501</b>, your <code>lib/crud</code> is missing <code>updateRow</code> /
                <code>deleteRow</code>.
              </div>
            </div>
          </div>

          <div className="modalClickout" onClick={closeModal} />
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmId !== null && (
        <div className="modalBackdrop" role="dialog" aria-modal="true" aria-label="Confirm delete">
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div className="modalTitle">
                <Trash2 size={16} />
                Delete article?
              </div>
            </div>

            <div className="modalBody">
              <p className="confirmText">
                You’re about to permanently delete <strong>{confirmTitle}</strong>. This cannot be undone.
              </p>

              <div className="modalActions">
                <button className="btn" type="button" onClick={closeDelete}>
                  Cancel
                </button>
                <button className="btnDangerSolid" type="button" onClick={removeConfirmed}>
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="modalClickout" onClick={closeDelete} />
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
          max-width: 76ch;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn,
        .btnGhost {
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
          font-weight: 950;
          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
          text-decoration: none;
          user-select: none;
        }

        .btn:hover,
        .btnGhost:hover {
          transform: translateY(-1px);
          border-color: rgba(2, 6, 23, 0.14);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.12);
        }

        .btn:disabled {
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
          background: rgba(2, 132, 199, 0.95);
          color: white;
          font-weight: 950;
          border: 1px solid rgba(2, 132, 199, 0.45);
          box-shadow: 0 10px 24px rgba(2, 132, 199, 0.22);
          cursor: pointer;
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
          font-weight: 800;
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
          font-weight: 950;
          letter-spacing: 0.02em;
        }

        .errorBox {
          margin-top: 10px;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid rgba(248, 113, 113, 0.35);
          background: rgba(254, 242, 242, 0.92);
        }

        .errorTitle {
          font-weight: 950;
          color: rgba(153, 27, 27, 0.95);
        }

        .errorText {
          margin-top: 6px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12px;
          line-height: 1.5;
          color: rgba(153, 27, 27, 0.9);
          white-space: pre-wrap;
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
          vertical-align: top;
          color: rgba(15, 23, 42, 0.92);
        }

        tbody tr:hover td {
          background: rgba(2, 132, 199, 0.04);
        }

        .right {
          text-align: right;
        }

        .newsCell {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: rgba(2, 132, 199, 0.10);
          border: 1px solid rgba(2, 132, 199, 0.18);
          color: rgba(2, 132, 199, 0.95);
          flex: 0 0 auto;
        }

        .newsText {
          display: grid;
          gap: 4px;
        }

        .title {
          font-weight: 950;
          letter-spacing: -0.01em;
        }

        .muted {
          color: rgba(100, 116, 139, 0.95);
          font-size: 12px;
        }

        .preview {
          color: rgba(51, 65, 85, 0.95);
          line-height: 1.55;
        }

        .rowActions {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
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
          font-weight: 950;
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
          font-weight: 950;
          cursor: pointer;
        }

        .empty {
          padding: 16px !important;
          color: rgba(71, 85, 105, 0.95);
        }

        /* Mobile */
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

        .mLeft {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .mAvatar {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: rgba(2, 132, 199, 0.10);
          border: 1px solid rgba(2, 132, 199, 0.18);
          color: rgba(2, 132, 199, 0.95);
        }

        .mTitle {
          font-weight: 950;
          color: rgba(15, 23, 42, 0.95);
          letter-spacing: -0.01em;
        }

        .mPreview {
          color: rgba(51, 65, 85, 0.95);
          line-height: 1.55;
          margin-bottom: 10px;
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

        .modalClickout {
          position: fixed;
          inset: 0;
        }

        .modal {
          width: 100%;
          max-width: 860px;
          border-radius: 20px;
          border: 1px solid rgba(2, 6, 23, 0.10);
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 34px 90px rgba(2, 6, 23, 0.30);
          overflow: hidden;
          z-index: 61;
        }

        .modal.small {
          max-width: 520px;
        }

        .modalHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 14px 14px;
          border-bottom: 1px solid rgba(2, 6, 23, 0.08);
          background: rgba(2, 6, 23, 0.02);
        }

        .modalTitle {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-weight: 950;
          color: rgba(15, 23, 42, 0.95);
        }

        .modalBody {
          padding: 14px;
        }

        .field {
          display: grid;
          gap: 6px;
          margin-bottom: 12px;
        }

        .field label {
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(71, 85, 105, 0.95);
          font-weight: 900;
        }

        .field input,
        .field textarea {
          padding: 12px 12px;
          border-radius: 14px;
          border: 1px solid rgba(2, 6, 23, 0.10);
          background: rgba(255, 255, 255, 0.92);
          outline: none;
          color: rgba(15, 23, 42, 0.95);
          font-weight: 750;
        }

        .field textarea {
          min-height: 240px;
          resize: vertical;
          font-weight: 650;
          line-height: 1.6;
        }

        .hint {
          font-size: 12px;
          color: rgba(100, 116, 139, 0.95);
        }

        .inlineErr {
          margin-top: 8px;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(248, 113, 113, 0.35);
          background: rgba(254, 242, 242, 0.92);
          color: rgba(153, 27, 27, 0.95);
          font-weight: 850;
        }

        .modalActions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .confirmText {
          margin: 0;
          color: rgba(71, 85, 105, 0.95);
          line-height: 1.6;
        }

        .note {
          margin-top: 14px;
          font-size: 12px;
          color: rgba(100, 116, 139, 0.95);
        }

        .note code {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 999px;
          border: 1px solid rgba(2, 6, 23, 0.08);
          background: rgba(255, 255, 255, 0.9);
          margin: 0 3px;
        }
      `}</style>
    </div>
  );
}
