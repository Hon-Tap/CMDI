'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export const dynamic = 'force-dynamic';

type CreatePayload = {
  title: string | null;
  description: string | null;
  image_url: string | null;
  status: 'draft' | 'published';
  location: string | null;
  category: string | null;
};

function toNull(v: string) {
  const s = v.trim();
  return s.length ? s : null;
}

export default function NewProjectPage() {
  const router = useRouter();

  const endpoint = useMemo(() => '/api/admin/content/projects', []);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>('');

  async function create(status: 'draft' | 'published') {
    setSaving(true);
    setErr('');

    if (!title.trim()) {
      setSaving(false);
      setErr('Title is required.');
      return;
    }

    const payload: CreatePayload = {
      title: toNull(title),
      description: toNull(description),
      image_url: toNull(imageUrl),
      status,
      location: toNull(location),
      category: toNull(category),
    };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => '');
        if (res.status === 401 || res.status === 403) {
          throw new Error(`Unauthorized. Please log in at /admin/login.\n\n${t}`.trim());
        }
        throw new Error(`Create failed (${res.status}).\n\n${t}`.trim());
      }

      const row = await res.json();
      const id = row?.id;
      if (!id) throw new Error('Created project but no id was returned from API.');

      router.push(`/admin/content/projects/${id}/edit`);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || 'Failed to create project.');
      setSaving(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            <Link href="/admin" style={{ textDecoration: 'none' }}>Admin</Link> /{' '}
            <Link href="/admin/content" style={{ textDecoration: 'none' }}>Content</Link> /{' '}
            <Link href="/admin/content/projects" style={{ textDecoration: 'none' }}>Projects</Link> / New
          </div>

          <h1 style={{ margin: '10px 0 0', fontSize: 28, lineHeight: 1.2 }}>Create Project</h1>
          <p style={{ margin: '8px 0 0', opacity: 0.8 }}>
            Create a new project as a draft or publish immediately. After creation you’ll land on the edit screen.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link
            href="/admin/content/projects"
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,.12)',
              textDecoration: 'none',
            }}
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={saving}
            onClick={() => create('draft')}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,.12)',
              background: 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            Save Draft
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => create('published')}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,.12)',
              background: 'black',
              color: 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.8 : 1,
            }}
          >
            Publish
          </button>
        </div>
      </header>

      {err && (
        <div style={{ marginTop: 14, padding: 14, borderRadius: 12, border: '1px solid rgba(255,0,0,.25)' }}>
          <strong>Can’t create project</strong>
          <pre style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap', fontSize: 12 }}>{err}</pre>
        </div>
      )}

      <section
        style={{
          marginTop: 18,
          border: '1px solid rgba(0,0,0,.12)',
          borderRadius: 16,
          padding: 18,
        }}
      >
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
                {/* use <img> to avoid next/image domain config issues */}
                <img
                  src={imageUrl}
                  alt="Preview"
                  style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, opacity: 0.75 }}>
          Tip: create as <strong>Draft</strong> first, then publish from the edit screen once the image and copy are correct.
        </div>
      </section>
    </main>
  );
}
