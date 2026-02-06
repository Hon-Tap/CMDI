'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// --- Types ---
type ApiError = {
  error?: string;
  details?: string;
  message?: string;
};

// --- Helpers ---
function safeNext(next: string | null) {
  if (!next) return '/admin';
  // Only allow internal relative paths to prevent Open Redirect vulnerabilities
  if (next.startsWith('/') && !next.startsWith('//')) return next;
  return '/admin';
}

// --- Components ---

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine where to redirect after login
  const nextParam = useMemo(() => safeNext(searchParams.get('next')), [searchParams]);

  const [email, setEmail] = useState('admin@cmdi-ss.org');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [capsLockOn, setCapsLockOn] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  // Cleanup any inflight request on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  const cleanEmail = email.trim().toLowerCase();
  const canSubmit = cleanEmail.length > 3 && password.length >= 1 && !loading;

  function setApiErrorFromResponse(payload: ApiError | null) {
    const msg =
      payload?.error ||
      payload?.message ||
      (payload?.details ? `${payload.details}` : '') ||
      'Login failed';
    setError(msg);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    // Abort any previous submit (rare but helps during retries)
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      // NOTE: This points to your Next.js API route. 
      // Ensure app/api/admin/auth/login/route.ts exists and handles the logic.
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
        signal: abortRef.current.signal,
      });

      // Try to parse JSON, but don’t assume it’s JSON (500s often return HTML/text)
      const text = await res.text();
      const data: ApiError | null = (() => {
        try {
          return text ? (JSON.parse(text) as ApiError) : null;
        } catch {
          return null;
        }
      })();

      if (!res.ok) {
        // Prefer API-provided error; otherwise provide a helpful fallback
        if (data) {
          setApiErrorFromResponse(data);
        } else {
          // If response isn't JSON, show status with generic message
          setError(res.status === 500 ? 'Server error. Please try again.' : `Login failed (${res.status}).`);
        }
        return;
      }

      // Success
      router.replace(nextParam);
      router.refresh();
    } catch (err: any) {
      if (err?.name === 'AbortError') return; // ignore
      setError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function onPasswordKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
    // CapsLock detection (best-effort)
    const caps = e.getModifierState?.('CapsLock') ?? false;
    setCapsLockOn(caps);
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.brandRow}>
          <div style={styles.badge}>CMDI</div>
          <div style={styles.brandText}>
            <h1 style={styles.title}>Admin Login</h1>
            <p style={styles.subtitle}>Sign in to manage content.</p>
          </div>
        </div>
      </div>

      {error ? (
        <div role="alert" style={styles.alert}>
          <div style={styles.alertTitle}>Error</div>
          <div style={styles.alertBody}>{error}</div>

          {/* Helpful hint for common database connection failures */}
          {error.toLowerCase().includes('econnrefused') || error.includes('127.0.0.1:5432') ? (
            <div style={styles.alertHint}>
              This usually means the API tried to connect to <code>127.0.0.1:5432</code>. On Vercel that happens when
              the deployment didn’t receive <code>DATABASE_URL</code> (common on Preview) or the backend is ignoring it.
              Redeploy the Preview deployment after setting env vars.
            </div>
          ) : null}
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
            inputMode="email"
            required
            placeholder="admin@cmdi-ss.org"
            style={styles.input}
            aria-invalid={Boolean(error) || undefined}
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

          <div style={styles.pwWrap}>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={onPasswordKeyUp}
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="••••••••••••"
              style={styles.input}
              aria-invalid={Boolean(error) || undefined}
            />
          </div>

          {capsLockOn ? <span style={styles.capsWarn}>Caps Lock is ON</span> : null}
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          style={{ ...styles.primaryBtn, ...(canSubmit ? null : styles.primaryBtnDisabled) }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

// --- Main Page Component ---

export default function Page() {
  return (
    <main style={styles.page}>
      <Suspense fallback={<div style={styles.skeleton}>Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

// --- Styles ---

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: 24,
    background:
      'radial-gradient(1200px 800px at 20% 10%, rgba(14,165,233,.12), transparent 50%), radial-gradient(900px 600px at 90% 30%, rgba(99,102,241,.10), transparent 55%), #f6f7fb',
  },

  card: {
    width: '100%',
    maxWidth: 480,
    background: '#fff',
    border: '1px solid rgba(15,23,42,.10)',
    borderRadius: 18,
    padding: 22,
    boxShadow: '0 18px 60px rgba(15,23,42,.10)',
  },

  header: { marginBottom: 12 },

  brandRow: { display: 'flex', gap: 12, alignItems: 'center' },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: 'grid',
    placeItems: 'center',
    fontWeight: 900,
    letterSpacing: -0.2,
    border: '1px solid rgba(15,23,42,.10)',
    background: 'linear-gradient(180deg, rgba(14,165,233,.14), rgba(14,165,233,.06))',
    color: '#0f172a',
  },
  brandText: { display: 'grid' },

  title: { margin: 0, fontSize: 24, fontWeight: 900, letterSpacing: -0.2, color: '#0f172a' },
  subtitle: { margin: '4px 0 0', fontSize: 13.5, opacity: 0.75, color: '#0f172a' },

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
  alertTitle: { fontWeight: 900, marginBottom: 4 },
  alertBody: { fontWeight: 600, opacity: 0.95 },
  alertHint: { marginTop: 8, fontSize: 12.5, opacity: 0.85, lineHeight: 1.35 },

  form: { display: 'grid', gap: 12, marginTop: 10 },

  label: { display: 'grid', gap: 7 },
  labelRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  labelText: { fontSize: 12.5, fontWeight: 900, color: '#0f172a', opacity: 0.92 },

  microHint: { fontSize: 12, opacity: 0.6, color: '#0f172a', lineHeight: 1.35 },

  input: {
    padding: '11px 12px',
    borderRadius: 14,
    border: '1px solid rgba(15,23,42,.16)',
    outline: 'none',
    fontSize: 14,
    color: '#0f172a',
    background: '#fff',
  },

  pwWrap: { position: 'relative' },

  capsWarn: {
    fontSize: 12,
    fontWeight: 800,
    color: '#92400e',
    background: 'rgba(245,158,11,.14)',
    border: '1px solid rgba(245,158,11,.22)',
    padding: '6px 10px',
    borderRadius: 999,
    width: 'fit-content',
  },

  linkBtn: {
    border: 'none',
    background: 'transparent',
    color: '#0369a1',
    fontWeight: 900,
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

  hint: { margin: '10px 0 0', fontSize: 12, opacity: 0.65, color: '#0f172a', lineHeight: 1.45 },

  skeleton: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 18,
    border: '1px solid rgba(15,23,42,.10)',
    background: '#fff',
    padding: 22,
    opacity: 0.7,
    fontSize: 13,
  },
};