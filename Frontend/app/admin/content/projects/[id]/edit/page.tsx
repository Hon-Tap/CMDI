'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type Project = {
  id?: number | string;
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  status?: string | null;
  location?: string | null;
  category?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type LoadState = 'idle' | 'loading' | 'ready' | 'error';
type SaveState = 'idle' | 'saving' | 'error' | 'success';

function safeId(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0];
  return '';
}

function toNull(v: string) {
  const s = v.trim();
  return s.length ? s : null;
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = useMemo(() => safeId((params as any)?.id), [params]);

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  const [original, setOriginal] = useState<Project | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  const endpoint = useMemo(() => (id ? `/admin/content/projects/${id}` : ''), [id]);

  const isDirty = useMemo(() => {
    if (!original) return false;
    return (
      (original.title ?? '') !== title ||
      (original.description ?? '') !== description ||
      (original.image_url ?? '') !== imageUrl ||
      (original.status ?? '') !== status ||
      (original.location ?? '') !== location ||
      (original.category ?? '') !== category
    );
  }, [original, title, description, imageUrl, status, location, category]);

  async function load() {
    if (!endpoint) return;
    setLoadState('loading');
    setError('');
    setNotice('');

    try {
      const res = await fetch(endpoint, { method: 'GET', cache: 'no-store', credentials: 'include' });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Failed to load project (${res.status}). ${text}`.trim());
      }

      const row = (await res.json()) as Project;
      setOriginal(row);

      setTitle((row.title ?? '') as string);
      setDescription((row.description ?? '') as string);
      setImageUrl((row.image_url ?? '') as string);

      const s = (row.status ?? 'draft').toString().toLowerCase();
      setStatus(s === 'published' ? 'published' : s === 'archived' ? 'archived' : 'draft');

      setLocation((row.location ?? '') as string);
      setCategory((row.category ?? '') as string);

      setLoadState('ready');
    } catch (e: any) {
      setLoadState('error');
      setError(e?.message || 'Unknown error while loading project.');
    }
  }

  useEffect(() => {
    if (!id) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function save(nextStatus?: 'draft' | 'published' | 'archived') {
    if (!endpoint) return;

    setSaveState('saving');
    setError('');
    setNotice('');

    // Minimal validation (tighten later with zod)
    if (!title.trim()) {
      setSaveState('error');
      setError('Title is required.');
      return;
    }

    const payload = {
      title: toNull(title),
      description: toNull(description),
      image_url: toNull(imageUrl),
      status: nextStatus ?? status,
      location: toNull(location),
      category: toNull(category),
    };

    try {
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Failed to save (${res.status}). ${text}`.trim());
      }

      const updated = (await res.json()) as Project;
      setOriginal(updated);
      setStatus(((updated.status ?? payload.status) as any) || status);

      setSaveState('success');
      setNotice('Saved ✅');
      setTimeout(() => setNotice(''), 1500);
      setTimeout(() => setSaveState('idle'), 800);
    } catch (e: any) {
      setSaveState('error');
      setError(e?.message || 'Unknown error while saving.');
    }
  }

  async function remove() {
    if (!endpoint) return;
    const ok = window.confirm('Delete this project? This cannot be undone.');
    if (!ok) return;

    setSaveState('saving');
    setError('');
    setNotice('');

    try {
      const res = await fetch(endpoint, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Failed to delete (${res.status}). ${text}`.trim());
      }

      router.push('/admin/content/projects');
      router.refresh();
    } catch (e: any) {
      setSaveState('error');
      setError(e?.message || 'Unknown error while deleting.');
    }
  }

  if (!id) {
    return (
      <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Edit Project</h1>
        <p style={{ opacity: 0.8 }}>Missing project id in route.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
            <Link href="/admin" style={{ textDecoration: 'none' }}>Admin</Link> /{' '}
            <Link href="/admin/content" style={{ textDecoration: 'none' }}>Content</Link> /{' '}
            <Link href="/admin/content/projects" style={{ textDecoration: 'none' }}>Projects</Link> / Edit
          </div>

          <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2 }}>
            Edit Project <span style={{ opacity: 0.5, fontSize: 16 }}>#{id}</span>
          </h1>

          <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid rgba(0,0,0,.12)',
                fontSize: 12,
              }}
            >
              Status:
              <strong style={{ textTransform: 'capitalize' }}>{status}</strong>
            </span>

            {isDirty && (
              <span style={{ fontSize: 12, opacity: 0.75 }}>Unsaved changes</span>
            )}

            {notice && (
              <span style={{ fontSize: 12 }}>{notice}</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link
            href={`/admin/content/projects/${id}/preview`}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,.12)',
              textDecoration: 'none',
            }}
          >
            Preview
          </Link>

          <button
            type="button"
            onClick={() => save('draft')}
            disabled={saveState === 'saving'}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,.12)',
              background: 'white',
              cursor: saveState === 'saving' ? 'not-allowed' : 'pointer',
            }}
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => save('published')}
            disabled={saveState === 'saving'}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,.12)',
              background: 'black',
              color: 'white',
              cursor: saveState === 'saving' ? 'not-allowed' : 'pointer',
            }}
          >
            Publish
          </button>
        </div>
      </header>

      {loadState === 'loading' && (
        <p style={{ marginTop: 18, opacity: 0.8 }}>Loading…</p>
      )}

      {loadState === 'error' && (
        <div style={{ marginTop: 18, padding: 14, border: '1px solid rgba(255,0,0,.25)', borderRadius: 12 }}>
          <strong>Failed to load</strong>
          <p style={{ margin: '8px 0 0' }}>{error}</p>
          <button
            type="button"
            onClick={load}
            style={{ marginTop: 10, padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,.12)' }}
          >
            Retry
          </button>
        </div>
      )}

      {loadState === 'ready' && (
        <section
          style={{
            marginTop: 18,
            border: '1px solid rgba(0,0,0,.12)',
            borderRadius: 16,
            padding: 18,
          }}
        >
          {error && (
            <div style={{ marginBottom: 12, padding: 12, borderRadius: 12, border: '1px solid rgba(255,0,0,.25)' }}>
              <strong>Problem</strong>
              <div style={{ marginTop: 6 }}>{error}</div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project title"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(0,0,0,.15)',
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project about?"
                rows={7}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(0,0,0,.15)',
                  resize: 'vertical',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Juba"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(0,0,0,.15)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Water, Education"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(0,0,0,.15)',
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Image URL</label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... or /images/projects/..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(0,0,0,.15)',
                }}
              />
              {imageUrl.trim() && (
                <div style={{ marginTop: 10, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(0,0,0,.12)' }}>
                  {/* Using <img> avoids next/image domain config issues */}
                  <img
                    src={imageUrl}
                    alt="Preview"
                    style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(0,0,0,.15)',
                  background: 'white',
                }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => save()}
                disabled={saveState === 'saving'}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid rgba(0,0,0,.12)',
                  background: 'white',
                  cursor: saveState === 'saving' ? 'not-allowed' : 'pointer',
                }}
              >
                Save
              </button>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: 8, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,.10)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <strong>Danger zone</strong>
                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                    Delete is permanent (we’ll upgrade this to “archive/soft delete” soon).
                  </div>
                </div>

                <button
                  type="button"
                  onClick={remove}
                  disabled={saveState === 'saving'}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid rgba(255,0,0,.35)',
                    background: 'white',
                    cursor: saveState === 'saving' ? 'not-allowed' : 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
