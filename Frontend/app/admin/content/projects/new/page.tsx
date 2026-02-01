'use client';

import Link from 'next/link';

export default function NewProjectPage() {
  return (
    <main style={{ padding: '24px', maxWidth: 980, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            <Link href="/admin">Admin</Link> / <Link href="/admin/content">Content</Link> /{' '}
            <Link href="/admin/content/projects">Projects</Link> / New
          </div>
          <h1 style={{ margin: '10px 0 0', fontSize: 28, lineHeight: 1.2 }}>Create Project</h1>
          <p style={{ margin: '8px 0 0', opacity: 0.8 }}>
            Draft your project details here. We’ll add “Save Draft / Publish”, preview, and versioning next.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
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
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,.12)',
              background: 'black',
              color: 'white',
              cursor: 'pointer',
            }}
            onClick={() => alert('Next step: wire this to your API + DB')}
          >
            Save Draft
          </button>
        </div>
      </div>

      <section
        style={{
          marginTop: 18,
          border: '1px solid rgba(0,0,0,.12)',
          borderRadius: 16,
          padding: 18,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18 }}>Editor (placeholder)</h2>
        <p style={{ marginTop: 8, opacity: 0.8 }}>
          This is intentionally minimal to unblock the deployment. Next we’ll replace this with a real Project Editor
          component (create + edit), with validation and draft/publish workflow.
        </p>
      </section>
    </main>
  );
}
