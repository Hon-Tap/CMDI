'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export const dynamic = 'force-dynamic';

type Contact = {
  id: number | string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  created_at?: string | null;
};

function fmtDate(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

export default function AdminContactsPage() {
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');

  const endpoints = useMemo(() => ['/admin/inbox/contacts', '/api/admin/contacts'], []);

  async function load() {
    setLoading(true);
    setErr('');

    try {
      let lastText = '';
      for (const url of endpoints) {
        const res = await fetch(url, { method: 'GET', cache: 'no-store', credentials: 'include' });
        if (res.ok) {
          const data = (await res.json()) as Contact[] | { data?: Contact[] };
          const rows = Array.isArray(data) ? data : data.data ?? [];
          setItems(rows);
          setLoading(false);
          return;
        }

        lastText = await res.text().catch(() => '');
        if (res.status !== 404) throw new Error(`GET ${url} failed (${res.status}). ${lastText}`.trim());
      }

      throw new Error(
        `No contacts list endpoint found.\n` +
          `Create one at: app/admin/inbox/contacts/route.ts (GET)\n` +
          `or: app/api/admin/contacts/route.ts (GET).\n\n` +
          `Last response: ${lastText}`.trim()
      );
    } catch (e: any) {
      setErr(e?.message || 'Failed to load contacts.');
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
    return items.filter((c) => {
      const hay = `${c.name ?? ''} ${c.email ?? ''} ${c.phone ?? ''} ${c.subject ?? ''} ${c.message ?? ''}`.toLowerCase();
      return hay.includes(s);
    });
  }, [items, q]);

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
            <Link href="/admin" style={{ textDecoration: 'none' }}>Admin</Link> /{' '}
            <Link href="/admin/inbox" style={{ textDecoration: 'none' }}>Inbox</Link> / Contacts
          </div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Contacts</h1>
          <p style={{ margin: '8px 0 0', opacity: 0.8 }}>
            Messages submitted from your public contact form. Later we’ll add status (new/read), assignments, and notes.
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
        </div>
      </header>

      <section style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search contacts…"
          style={{
            flex: '1 1 280px',
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid rgba(0,0,0,.15)',
          }}
        />
        <div style={{ fontSize: 12, opacity: 0.75 }}>{loading ? 'Loading…' : `${filtered.length} message(s)`}</div>
      </section>

      {err && (
        <div style={{ marginTop: 14, padding: 14, borderRadius: 12, border: '1px solid rgba(255,0,0,.25)' }}>
          <strong>Can’t load contacts</strong>
          <pre style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap', fontSize: 12 }}>{err}</pre>
        </div>
      )}

      <section style={{ marginTop: 14, border: '1px solid rgba(0,0,0,.12)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ background: 'rgba(0,0,0,.03)' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: 12 }}>From</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Subject</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Message</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Received</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 14, opacity: 0.8 }}>
                    No contact messages.
                  </td>
                </tr>
              )}

              {filtered.map((c) => (
                <tr key={String(c.id)} style={{ borderTop: '1px solid rgba(0,0,0,.08)' }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontWeight: 700 }}>{c.name || '—'}</div>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>{c.email || c.phone || ''}</div>
                    <div style={{ fontSize: 12, opacity: 0.6 }}>#{c.id}</div>
                  </td>
                  <td style={{ padding: 12 }}>{c.subject || '—'}</td>
                  <td style={{ padding: 12, maxWidth: 520 }}>
                    <div style={{ opacity: 0.9, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.message || '—'}
                    </div>
                  </td>
                  <td style={{ padding: 12 }}>{fmtDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
