"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

export const dynamic = "force-dynamic";

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
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function normalizeList<T>(payload: ApiList<T>): { data: T[]; meta?: Meta } {
  if (Array.isArray(payload)) return { data: payload };
  const m = payload.meta;
  const hasMeta =
    m && typeof m.page === "number" && typeof m.pageSize === "number" && typeof m.total === "number";
  return { data: payload.data ?? [], meta: hasMeta ? (m as Meta) : undefined };
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

const styles = {
  page: { padding: 24, maxWidth: 1100, margin: "0 auto" } as const,
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start",
    flexWrap: "wrap",
  } as const,
  crumbs: { fontSize: 12, opacity: 0.7, marginBottom: 8 } as const,
  h1: { margin: 0, fontSize: 28 } as const,
  subtitle: { margin: "8px 0 0", opacity: 0.8 } as const,

  toolbar: { marginTop: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" } as const,
  input: {
    flex: "1 1 320px",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,.15)",
  } as const,

  small: { fontSize: 12, opacity: 0.75 } as const,

  card: { marginTop: 14, border: "1px solid rgba(0,0,0,.12)", borderRadius: 16, overflow: "hidden" } as const,
  tableWrap: { overflowX: "auto" } as const,
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 } as const,
  thead: { background: "rgba(0,0,0,.03)" } as const,
  th: { textAlign: "left", padding: 12 } as const,
  thRight: { textAlign: "right", padding: 12 } as const,
  tr: { borderTop: "1px solid rgba(0,0,0,.08)" } as const,
  td: { padding: 12 } as const,
  tdRight: { padding: 12, textAlign: "right" } as const,

  pillRow: { display: "inline-flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" } as const,

  btn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,.12)",
    background: "white",
    cursor: "pointer",
  } as const,
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" } as const,
  btnPrimaryLink: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,.12)",
    background: "black",
    color: "white",
    textDecoration: "none",
  } as const,
  btnLink: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,.12)",
    textDecoration: "none",
  } as const,
  btnDanger: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,0,0,.35)",
    background: "white",
    cursor: "pointer",
  } as const,

  errorBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    border: "1px solid rgba(255,0,0,.25)",
    background: "rgba(255,0,0,.03)",
  } as const,
  pre: { margin: "10px 0 0", whiteSpace: "pre-wrap", fontSize: 12 } as const,
};

export default function AdminProjectsListPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  // UX state
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 350);

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const endpoint = useMemo(() => "/api/admin/content/projects", []);
  const abortRef = useRef<AbortController | null>(null);

  const canPrev = page > 1;
  const canNext = meta ? page * meta.pageSize < meta.total : items.length === pageSize;

  const countLabel = useMemo(() => {
    if (loading) return "Loading…";
    if (meta) return `${meta.total} total`;
    return `${items.length} item(s)`;
  }, [loading, meta, items.length]);

  async function load(nextPage = page, nextQ = debouncedQ) {
    // cancel previous request
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setErr("");

    try {
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.set("page", String(nextPage));
      url.searchParams.set("pageSize", String(pageSize));
      if (nextQ.trim()) url.searchParams.set("q", nextQ.trim());

      const res = await fetch(url.toString(), {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        signal: ac.signal,
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
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
      if (e?.name === "AbortError") return;
      setErr(e?.message || "Failed to load projects.");
      setItems([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }

  async function archiveOrDelete(id: Project["id"]) {
    const choice = window.prompt(
      `Type one of these:\n\n` +
        `- archive  (recommended, reversible)\n` +
        `- delete   (hard delete, irreversible)\n\n` +
        `Then press OK.\n`
    );

    const action = (choice || "").trim().toLowerCase();
    if (action !== "archive" && action !== "delete") return;

    const confirmMsg =
      action === "archive"
        ? "Archive this project? (It will be hidden, not permanently deleted)"
        : "HARD DELETE this project? This cannot be undone.";

    if (!window.confirm(confirmMsg)) return;

    try {
      const url =
        action === "delete"
          ? `/api/admin/content/projects/${id}?hard=1`
          : `/api/admin/content/projects/${id}`;

      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Action failed (${res.status}).\n\n${t}`.trim());
      }

      // Reload current page; if it becomes empty, go back one page
      await load(page, debouncedQ);
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
    } catch (e: any) {
      alert(e?.message || "Failed.");
    }
  }

  // Load on mount + when page changes OR search changes
  useEffect(() => {
    // If query changes, reset to page 1 first
    if (page !== 1 && debouncedQ !== q) {
      // (debouncedQ lags q, so this condition is just defensive)
    }
    load(page, debouncedQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedQ]);

  // When debounced query changes, jump back to page 1
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.crumbs}>
            <Link href="/admin" style={{ textDecoration: "none" }}>
              Admin
            </Link>{" "}
            /{" "}
            <Link href="/admin/content" style={{ textDecoration: "none" }}>
              Content
            </Link>{" "}
            / Projects
          </div>

          <h1 style={styles.h1}>Projects</h1>
          <p style={styles.subtitle}>Create, edit, preview, publish. This becomes your CMS backbone.</p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" onClick={() => load(page, debouncedQ)} style={styles.btn}>
            Refresh
          </button>

          <Link href="/admin/content/projects/new" style={styles.btnPrimaryLink}>
            + New Project
          </Link>
        </div>
      </header>

      <section style={styles.toolbar}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, status, category, location…"
          style={styles.input}
        />

        <div style={styles.small}>{countLabel}</div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            disabled={!canPrev || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{ ...styles.btn, ...(canPrev && !loading ? null : styles.btnDisabled) }}
          >
            Prev
          </button>

          <div style={styles.small}>Page {meta?.page ?? page}</div>

          <button
            type="button"
            disabled={!canNext || loading}
            onClick={() => setPage((p) => p + 1)}
            style={{ ...styles.btn, ...(canNext && !loading ? null : styles.btnDisabled) }}
          >
            Next
          </button>
        </div>
      </section>

      {err && (
        <div style={styles.errorBox}>
          <strong>Can’t load projects</strong>
          <pre style={styles.pre}>{err}</pre>
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
            If this is an auth issue, log in at <Link href="/admin/login">/admin/login</Link>.
          </div>
        </div>
      )}

      <section style={styles.card}>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Updated</th>
                <th style={styles.thRight}>Actions</th>
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
                <tr key={String(p.id)} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 600 }}>{p.title || "(Untitled)"}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>#{p.id}</div>
                  </td>

                  <td style={{ ...styles.td, textTransform: "capitalize" }}>{p.status || "draft"}</td>
                  <td style={styles.td}>{p.category || "—"}</td>
                  <td style={styles.td}>{p.location || "—"}</td>
                  <td style={styles.td}>{fmtDate(p.updated_at || p.created_at)}</td>

                  <td style={styles.tdRight}>
                    <div style={styles.pillRow}>
                      <Link href={`/admin/content/projects/${p.id}/preview`} style={styles.btnLink}>
                        Preview
                      </Link>
                      <Link href={`/admin/content/projects/${p.id}/edit`} style={styles.btnLink}>
                        Edit
                      </Link>
                      <button type="button" onClick={() => archiveOrDelete(p.id)} style={styles.btnDanger}>
                        Archive/Delete
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
