'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
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

function safeId(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0];
  return '';
}

export default function ProjectPreviewPage() {
  const params = useParams();
  const id = useMemo(() => safeId((params as any)?.id), [params]);

  const endpoint = `/api/admin/content/projects/${id}`;


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!endpoint) return;

    (async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(endpoint, { method: 'GET', cache: 'no-store', credentials: 'include' });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Failed to load project (${res.status}). ${text}`.trim());
        }
        const row = (await res.json()) as Project;
        setProject(row);
      } catch (e: any) {
        setError(e?.message || 'Unknown error while loading preview.');
      } finally {
        setLoading(false);
      }
    })();
  }, [endpoint]);

  if (!id) {
    return (
      <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Project Preview</h1>
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
            <Link href="/admin/content/projects" style={{ textDecoration: 'none' }}>Projects</Link> / Preview
          </div>

          <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2 }}>Preview</h1>
          <p style={{ margin: '8px 0 0', opacity: 0.8 }}>
            This is the “what will go live” view. Next we’ll add true preview mode + version snapshots.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link
            href={`/admin/content/projects/${id}/edit`}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,.12)',
              textDecoration: 'none',
            }}
          >
            Back to Edit
          </Link>

          <Link
            href="/admin/content/projects"
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,.12)',
              textDecoration: 'none',
            }}
          >
            Projects List
          </Link>
        </div>
      </header>

      {loading && <p style={{ marginTop: 18, opacity: 0.8 }}>Loading…</p>}

      {error && (
        <div style={{ marginTop: 18, padding: 14, border: '1px solid rgba(255,0,0,.25)', borderRadius: 12 }}>
          <strong>Failed to load preview</strong>
          <p style={{ margin: '8px 0 0' }}>{error}</p>
        </div>
      )}

      {!loading && !error && project && (
        <article
          style={{
            marginTop: 18,
            borderRadius: 18,
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,.12)',
          }}
        >
          {project.image_url ? (
            <img
              src={project.image_url}
              alt={project.title ?? 'Project image'}
              style={{ width: '100%', height: 360, objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : null}

          <div style={{ padding: 18 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 10px',
                  borderRadius: 999,
                  border: '1px solid rgba(0,0,0,.12)',
                  fontSize: 12,
                }}
              >
                Status: <strong style={{ marginLeft: 6, textTransform: 'capitalize' }}>{project.status ?? 'draft'}</strong>
              </span>

              {project.category && (
                <span style={{ fontSize: 12, opacity: 0.8 }}>Category: <strong>{project.category}</strong></span>
              )}
              {project.location && (
                <span style={{ fontSize: 12, opacity: 0.8 }}>Location: <strong>{project.location}</strong></span>
              )}
            </div>

            <h2 style={{ margin: '14px 0 0', fontSize: 26 }}>{project.title ?? '(Untitled project)'}</h2>

            <div style={{ marginTop: 10, opacity: 0.9, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {project.description ?? 'No description yet.'}
            </div>

            <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7 }}>
              Updated: {project.updated_at ? new Date(project.updated_at).toLocaleString() : '—'}
            </div>
          </div>
        </article>
      )}
    </main>
  );
}
