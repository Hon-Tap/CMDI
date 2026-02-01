'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type FetchError = { error?: string };

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextParam = useMemo(() => {
    const next = searchParams.get('next');
    return next && next.startsWith('/') ? next : '/admin';
  }, [searchParams]);

  const [email, setEmail] = useState('admin@cmdi-ss.org');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as FetchError | null;
        setError(data?.error || 'Login failed');
        return;
      }

      router.replace(nextParam);
      router.refresh();
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = email.trim().length > 3 && password.length >= 6 && !loading;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Login</h1>
        <p style={styles.subtitle}>Sign in to manage content.</p>
      </div>

      {error ? (
        <div role="alert" style={styles.alert}>
          <strong style={{ fontWeight: 800 }}>Error:</strong> {error}
        </div>
      ) : null}

      <form onSubmit={onSubmit} style={styles.form}>
        <label style={styles.label}>
          <span style={styles.labelText}>Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
            placeholder="admin@cmdi-ss.org"
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          <span style={styles.labelRow}>
            <span style={styles.labelText}>Password</span>

            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              style={styles.linkBtn}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </span>

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder="••••••••••••"
            style={styles.input}
          />
        </label>

        <button type="submit" disabled={!canSubmit} style={{ ...styles.primaryBtn, ...(canSubmit ? null : styles.primaryBtnDisabled) }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p style={styles.hint}>
          Tip: if you get “Invalid credentials”, confirm Vercel has <code>DATABASE_URL</code> set and you’re using the latest password.
        </p>
      </form>
    </div>
  );
}

export default function Page() {
  return (
    <main style={styles.page}>
      <Suspense fallback={<div style={styles.skeleton}>Loading…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: 24,
    background: 'radial-gradient(1200px 800px at 20% 10%, rgba(14,165,233,.12), transparent 50%), #f6f7fb',
  },
  card: {
    width: '100%',
    maxWidth: 460,
    background: '#fff',
    border: '1px solid rgba(15,23,42,.10)',
    borderRadius: 18,
    padding: 22,
    boxShadow: '0 18px 60px rgba(15,23,42,.10)',
  },
  header: { marginBottom: 14 },
  title: { margin: 0, fontSize: 24, fontWeight: 900, letterSpacing: -0.2, color: '#0f172a' },
  subtitle: { margin: '6px 0 0', fontSize: 13.5, opacity: 0.75, color: '#0f172a' },

  alert: {
    background: 'rgba(220,38,38,.08)',
    border: '1px solid rgba(220,38,38,.22)',
    color: '#7f1d1d',
    padding: 12,
    borderRadius: 14,
    margin: '12px 0 14px',
    fontSize: 13.5,
    lineHeight: 1.35,
  },

  form: { display: 'grid', gap: 12, marginTop: 12 },
  label: { display: 'grid', gap: 7 },
  labelRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  labelText: { fontSize: 12.5, fontWeight: 800, color: '#0f172a', opacity: 0.9 },

  input: {
    padding: '11px 12px',
    borderRadius: 14,
    border: '1px solid rgba(15,23,42,.16)',
    outline: 'none',
    fontSize: 14,
    color: '#0f172a',
    background: '#fff',
  },

  linkBtn: {
    border: 'none',
    background: 'transparent',
    color: '#0369a1',
    fontWeight: 800,
    fontSize: 12.5,
    cursor: 'pointer',
    padding: 0,
  },

  primaryBtn: {
    marginTop: 6,
    padding: '11px 12px',
    borderRadius: 14,
    border: '1px solid rgba(15,23,42,.14)',
    background: 'linear-gradient(180deg, rgba(14,165,233,.16), rgba(14,165,233,.08))',
    fontWeight: 900,
    cursor: 'pointer',
    color: '#0f172a',
  },
  primaryBtnDisabled: {
    opacity: 0.55,
    cursor: 'not-allowed',
  },

  hint: { margin: '10px 0 0', fontSize: 12, opacity: 0.65, color: '#0f172a', lineHeight: 1.4 },
  skeleton: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 18,
    border: '1px solid rgba(15,23,42,.10)',
    background: '#fff',
    padding: 22,
    opacity: 0.7,
    fontSize: 13,
  },
};
