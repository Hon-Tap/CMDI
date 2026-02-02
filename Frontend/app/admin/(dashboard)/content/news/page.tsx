"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function AdminNewsPage() {
  const router = useRouter();
  const API = "/api/admin/content/news";

  const [items, setItems] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const [fetchErr, setFetchErr] = useState("");
  const [formErr, setFormErr] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const debouncedQ = useDebouncedValue(q, 350);

  const fetchNews = async () => {
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
        signal: ac.signal,
      });

      if (res.status === 401 || res.status === 403) {
        router.push(`/admin/login?next=${encodeURIComponent("/admin/content/news")}`);
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`GET ${API} failed (${res.status}). ${text.slice(0, 180)}`);
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
  };

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const openCreate = () => {
    setFormErr("");
    setEditing(null);
    setFormTitle("");
    setFormContent("");
    setOpen(true);
  };

  const openEdit = (n: NewsItem) => {
    setFormErr("");
    setEditing(n);
    setFormTitle(n.title ?? "");
    setFormContent(n.content ?? "");
    setOpen(true);
  };

  const submit = async () => {
    setFormErr("");

    const title = formTitle.trim();
    const content = formContent.trim();

    if (!title) return setFormErr("Title is required.");
    if (!content) return setFormErr("Content is required.");

    try {
      const isEdit = Boolean(editing?.id);

      const res = await fetch(API, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: editing!.id, title, content } : { title, content }),
      });

      if (res.status === 401 || res.status === 403) {
        router.push(`/admin/login?next=${encodeURIComponent("/admin/content/news")}`);
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`${isEdit ? "PATCH" : "POST"} failed (${res.status}). ${text.slice(0, 180)}`);
      }

      setOpen(false);
      await fetchNews();
    } catch (e: any) {
      console.error("[admin news] save failed:", e);
      setFormErr(e?.message || "Save failed");
    }
  };

  const remove = async (n: NewsItem) => {
    if (!n?.id) return;
    const ok = window.confirm(`Delete "${n.title ?? "this news"}"?`);
    if (!ok) return;

    setFetchErr("");

    try {
      const res = await fetch(`${API}?id=${encodeURIComponent(String(n.id))}`, { method: "DELETE" });

      if (res.status === 401 || res.status === 403) {
        router.push(`/admin/login?next=${encodeURIComponent("/admin/content/news")}`);
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`DELETE failed (${res.status}). ${text.slice(0, 180)}`);
      }

      await fetchNews();
    } catch (e: any) {
      console.error("[admin news] delete failed:", e);
      setFetchErr(e?.message || "Delete failed");
    }
  };

  const subtitle = useMemo(() => {
    if (loading) return "Loading…";
    if (fetchErr) return "Can’t load news";
    return `${total} item(s)`;
  }, [loading, fetchErr, total]);

  return (
    <main style={styles.page}>
      <div style={styles.topRow}>
        <div>
          <div style={styles.breadcrumb}>Admin / Content / News</div>
          <h1 style={styles.h1}>News</h1>
          <p style={styles.p}>Manage news articles shown on the public site.</p>
        </div>

        <div style={styles.actions}>
          <button onClick={fetchNews} style={styles.btnGhost} disabled={loading}>
            Refresh
          </button>
          <button onClick={openCreate} style={styles.btnPrimary}>
            + New Article
          </button>
        </div>
      </div>

      <div style={styles.searchRow}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search news…" style={styles.search} />
        <div style={styles.count}>{subtitle}</div>
      </div>

      {fetchErr && (
        <div style={styles.errorBox}>
          <div style={styles.errorTitle}>Can’t load news</div>
          <div style={styles.errorText}>{fetchErr}</div>
        </div>
      )}

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Content</th>
              <th style={{ ...styles.th, width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td style={styles.td} colSpan={3}>
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td style={styles.td} colSpan={3}>
                  No news found.
                </td>
              </tr>
            ) : (
              items.map((n) => (
                <tr key={String(n.id ?? n.title)}>
                  <td style={styles.tdStrong}>{n.title ?? "—"}</td>
                  <td style={styles.td}>
                    <div style={styles.ellipsis}>{(n.content ?? "—").slice(0, 220)}</div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.rowActions}>
                      <button style={styles.btnSmall} onClick={() => openEdit(n)}>
                        Edit
                      </button>
                      <button style={styles.btnSmallDanger} onClick={() => remove(n)}>
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

      {open && (
        <div style={styles.backdrop} onClick={() => setOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>{editing ? "Edit Article" : "New Article"}</div>
              <button style={styles.btnGhost} onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <div style={styles.form}>
              <label style={styles.label}>Title</label>
              <input style={styles.input} value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />

              <label style={styles.label}>Content</label>
              <textarea
                style={{ ...styles.textarea, minHeight: 220 }}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
              />

              {formErr && <div style={styles.inlineErr}>{formErr}</div>}

              <div style={styles.formActions}>
                <button style={styles.btnGhost} onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button style={styles.btnPrimary} onClick={submit}>
                  {editing ? "Save changes" : "Publish"}
                </button>
              </div>
            </div>

            <div style={styles.note}>
              If Edit/Delete returns <b>501</b>, your <code>lib/crud</code> is missing <code>updateRow</code> /
              <code>deleteRow</code>.
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

const styles: Record<string, CSSProperties> = {
  page: { padding: "28px", maxWidth: 1180, margin: "0 auto" },
  topRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  breadcrumb: { fontSize: 13, opacity: 0.7, marginBottom: 10 },
  h1: { fontSize: 34, margin: 0, fontWeight: 750 },
  p: { marginTop: 8, opacity: 0.75 },
  actions: { display: "flex", gap: 10 },
  btnGhost: { padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,.12)", background: "#fff", cursor: "pointer" },
  btnPrimary: { padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,.08)", background: "#000", color: "#fff", cursor: "pointer" },
  searchRow: { display: "flex", alignItems: "center", gap: 12, marginTop: 18 },
  search: { flex: 1, padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,.12)", outline: "none" },
  count: { fontSize: 13, opacity: 0.7, minWidth: 90, textAlign: "right" },
  errorBox: { marginTop: 16, border: "1px solid rgba(220, 38, 38, .35)", background: "rgba(220, 38, 38, .06)", borderRadius: 14, padding: 14 },
  errorTitle: { fontWeight: 700, marginBottom: 6 },
  errorText: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, lineHeight: 1.5 },
  tableWrap: { marginTop: 16, border: "1px solid rgba(0,0,0,.10)", borderRadius: 16, overflow: "hidden", background: "#fff" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 14px", fontSize: 13, opacity: 0.7, borderBottom: "1px solid rgba(0,0,0,.08)" },
  td: { padding: "12px 14px", borderBottom: "1px solid rgba(0,0,0,.06)", verticalAlign: "top" },
  tdStrong: { padding: "12px 14px", borderBottom: "1px solid rgba(0,0,0,.06)", fontWeight: 650 },
  ellipsis: { maxWidth: 640, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  rowActions: { display: "flex", gap: 10 },
  btnSmall: { padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(0,0,0,.12)", background: "#fff", cursor: "pointer" },
  btnSmallDanger: { padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(220, 38, 38, .35)", background: "rgba(220, 38, 38, .06)", cursor: "pointer" },
  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", display: "grid", placeItems: "center", padding: 18 },
  modal: { width: "min(860px, 100%)", borderRadius: 18, background: "#fff", border: "1px solid rgba(0,0,0,.10)" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, borderBottom: "1px solid rgba(0,0,0,.08)" },
  modalTitle: { fontWeight: 750, fontSize: 16 },
  form: { padding: 14, display: "grid", gap: 10 },
  label: { fontSize: 13, opacity: 0.8, marginTop: 6 },
  input: { padding: "11px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,.12)", outline: "none" },
  textarea: { padding: "11px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,.12)", outline: "none", resize: "vertical" },
  inlineErr: { color: "rgb(220, 38, 38)", fontSize: 13, marginTop: 6 },
  formActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 },
  note: { padding: "0 14px 14px", fontSize: 12, opacity: 0.7 },
};
