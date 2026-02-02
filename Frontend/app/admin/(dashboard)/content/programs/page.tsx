"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Program = {
  id?: number | string;
  title?: string;
  description?: string | null;
  icon_name?: string | null;
};

type ApiResponse = { status?: string; data?: Program[]; total?: number } | Program[];

function normalizePrograms(result: ApiResponse): { rows: Program[]; total: number } {
  const rows = Array.isArray(result)
    ? result
    : Array.isArray((result as any)?.data)
    ? ((result as any).data as Program[])
    : [];

  const total =
    !Array.isArray(result) && typeof (result as any)?.total === "number"
      ? (result as any).total
      : rows.length;

  return { rows, total };
}

export default function AdminProgramsPage() {
  const router = useRouter();

  const API = "/api/admin/content/programs"; // ✅ correct structure

  const [items, setItems] = useState<Program[]>([]);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // modal state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formIcon, setFormIcon] = useState("");

  const abortRef = useRef<AbortController | null>(null);

  const debouncedQ = useDebouncedValue(q, 350);

  const fetchPrograms = async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setErr("");

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
        router.push(`/admin/login?next=${encodeURIComponent("/admin/content/programs")}`);
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`GET ${API} failed (${res.status}). ${text.slice(0, 180)}`);
      }

      const result = (await res.json()) as ApiResponse;
      const { rows, total } = normalizePrograms(result);

      setItems(rows);
      setTotal(total);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      console.error("[admin programs] fetch failed:", e);
      setErr(e?.message || "Can’t load programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const openCreate = () => {
    setEditing(null);
    setFormTitle("");
    setFormDesc("");
    setFormIcon("");
    setOpen(true);
  };

  const openEdit = (p: Program) => {
    setEditing(p);
    setFormTitle(p.title ?? "");
    setFormDesc(p.description ?? "");
    setFormIcon(p.icon_name ?? "");
    setOpen(true);
  };

  const submit = async () => {
    setErr("");

    const payload = {
      title: formTitle.trim(),
      description: formDesc.trim() || null,
      icon_name: formIcon.trim() || null,
    };

    if (!payload.title) {
      setErr("Title is required.");
      return;
    }

    try {
      const isEdit = Boolean(editing?.id);

      const res = await fetch(API, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: editing!.id, ...payload } : payload),
      });

      if (res.status === 401 || res.status === 403) {
        router.push(`/admin/login?next=${encodeURIComponent("/admin/content/programs")}`);
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`${isEdit ? "PATCH" : "POST"} failed (${res.status}). ${text.slice(0, 180)}`);
      }

      setOpen(false);
      await fetchPrograms();
    } catch (e: any) {
      console.error("[admin programs] save failed:", e);
      setErr(e?.message || "Save failed");
    }
  };

  const remove = async (p: Program) => {
    if (!p?.id) return;
    const ok = window.confirm(`Delete "${p.title ?? "this program"}"?`);
    if (!ok) return;

    setErr("");

    try {
      const res = await fetch(`${API}?id=${encodeURIComponent(String(p.id))}`, {
        method: "DELETE",
      });

      if (res.status === 401 || res.status === 403) {
        router.push(`/admin/login?next=${encodeURIComponent("/admin/content/programs")}`);
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`DELETE failed (${res.status}). ${text.slice(0, 180)}`);
      }

      await fetchPrograms();
    } catch (e: any) {
      console.error("[admin programs] delete failed:", e);
      setErr(e?.message || "Delete failed");
    }
  };

  const subtitle = useMemo(() => {
    if (loading) return "Loading…";
    if (err) return "Can’t load programs";
    return `${total} item(s)`;
  }, [loading, err, total]);

  return (
    <main style={styles.page}>
      <div style={styles.topRow}>
        <div>
          <div style={styles.breadcrumb}>Admin / Content / Programs</div>
          <h1 style={styles.h1}>Programs</h1>
          <p style={styles.p}>Manage the programs shown on the public site.</p>
        </div>

        <div style={styles.actions}>
          <button onClick={fetchPrograms} style={styles.btnGhost} disabled={loading}>
            Refresh
          </button>
          <button onClick={openCreate} style={styles.btnPrimary}>
            + New Program
          </button>
        </div>
      </div>

      <div style={styles.searchRow}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search programs…"
          style={styles.search}
        />
        <div style={styles.count}>{subtitle}</div>
      </div>

      {err && (
        <div style={styles.errorBox}>
          <div style={styles.errorTitle}>Can’t load programs</div>
          <div style={styles.errorText}>{err}</div>
        </div>
      )}

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Icon</th>
              <th style={styles.th}>Description</th>
              <th style={{ ...styles.th, width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td style={styles.td} colSpan={4}>
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td style={styles.td} colSpan={4}>
                  No programs found.
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={String(p.id ?? p.title)}>
                  <td style={styles.tdStrong}>{p.title ?? "—"}</td>
                  <td style={styles.tdMono}>{p.icon_name ?? "—"}</td>
                  <td style={styles.td}>{p.description ?? "—"}</td>
                  <td style={styles.td}>
                    <div style={styles.rowActions}>
                      <button style={styles.btnSmall} onClick={() => openEdit(p)}>
                        Edit
                      </button>
                      <button style={styles.btnSmallDanger} onClick={() => remove(p)}>
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
              <div style={styles.modalTitle}>{editing ? "Edit Program" : "New Program"}</div>
              <button style={styles.btnGhost} onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <div style={styles.form}>
              <label style={styles.label}>Title</label>
              <input
                style={styles.input}
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. WASH Initiative"
              />

              <label style={styles.label}>Icon name</label>
              <input
                style={styles.input}
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                placeholder="e.g. Droplets / BookOpen / Sprout / ShieldCheck"
              />

              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Short description…"
              />

              {err && <div style={styles.inlineErr}>{err}</div>}

              <div style={styles.formActions}>
                <button style={styles.btnGhost} onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button style={styles.btnPrimary} onClick={submit}>
                  {editing ? "Save changes" : "Create program"}
                </button>
              </div>
            </div>

            <div style={styles.note}>
              If Edit/Delete returns <b>501</b>, it means your <code>lib/crud</code> doesn’t export{" "}
              <code>updateRow</code>/<code>deleteRow</code> yet — the GET/POST still work.
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

const styles: Record<string, React.CSSProperties> = {
  page: { padding: "28px", maxWidth: 1180, margin: "0 auto" },
  topRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  breadcrumb: { fontSize: 13, opacity: 0.7, marginBottom: 10 },
  h1: { fontSize: 34, margin: 0, fontWeight: 750 },
  p: { marginTop: 8, opacity: 0.75 },
  actions: { display: "flex", gap: 10 },
  btnGhost: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,.12)",
    background: "#fff",
    cursor: "pointer",
  },
  btnPrimary: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,.08)",
    background: "#000",
    color: "#fff",
    cursor: "pointer",
  },
  searchRow: { display: "flex", alignItems: "center", gap: 12, marginTop: 18 },
  search: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,.12)",
    outline: "none",
  },
  count: { fontSize: 13, opacity: 0.7, minWidth: 90, textAlign: "right" },
  errorBox: {
    marginTop: 16,
    border: "1px solid rgba(220, 38, 38, .35)",
    background: "rgba(220, 38, 38, .06)",
    borderRadius: 14,
    padding: 14,
  },
  errorTitle: { fontWeight: 700, marginBottom: 6 },
  errorText: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, lineHeight: 1.5 },
  tableWrap: {
    marginTop: 16,
    border: "1px solid rgba(0,0,0,.10)",
    borderRadius: 16,
    overflow: "hidden",
    background: "#fff",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 14px", fontSize: 13, opacity: 0.7, borderBottom: "1px solid rgba(0,0,0,.08)" },
  td: { padding: "12px 14px", borderBottom: "1px solid rgba(0,0,0,.06)", verticalAlign: "top" },
  tdStrong: { padding: "12px 14px", borderBottom: "1px solid rgba(0,0,0,.06)", fontWeight: 650 },
  tdMono: {
    padding: "12px 14px",
    borderBottom: "1px solid rgba(0,0,0,.06)",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 12,
  },
  rowActions: { display: "flex", gap: 10 },
  btnSmall: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,.12)",
    background: "#fff",
    cursor: "pointer",
  },
  btnSmallDanger: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(220, 38, 38, .35)",
    background: "rgba(220, 38, 38, .06)",
    cursor: "pointer",
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.35)",
    display: "grid",
    placeItems: "center",
    padding: 18,
  },
  modal: { width: "min(720px, 100%)", borderRadius: 18, background: "#fff", border: "1px solid rgba(0,0,0,.10)" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, borderBottom: "1px solid rgba(0,0,0,.08)" },
  modalTitle: { fontWeight: 750, fontSize: 16 },
  form: { padding: 14, display: "grid", gap: 10 },
  label: { fontSize: 13, opacity: 0.8, marginTop: 6 },
  input: { padding: "11px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,.12)", outline: "none" },
  textarea: { padding: "11px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,.12)", outline: "none", minHeight: 110, resize: "vertical" },
  inlineErr: { color: "rgb(220, 38, 38)", fontSize: 13, marginTop: 6 },
  formActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 },
  note: { padding: "0 14px 14px", fontSize: 12, opacity: 0.7 },
};
