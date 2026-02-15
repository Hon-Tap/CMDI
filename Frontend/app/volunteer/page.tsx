'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './volunteer.module.css';
import {
  Heart,
  Globe,
  Users,
  Briefcase,
  ChevronRight,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

type VolunteerForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  primary_skill: string;
  reason: string;
};

type StatusType = '' | 'loading' | 'success' | 'error';
type Status = { type: StatusType; message: string };

type ApiListResponse<T> = T[] | { data?: T[]; count?: number; total?: number };

type FieldErrors = Partial<Record<keyof VolunteerForm, string>>;

const REASON_MAX = 800;

function parseCount(json: ApiListResponse<any>): number | null {
  if (Array.isArray(json)) return json.length;
  if (typeof json?.count === 'number') return json.count;
  if (typeof json?.total === 'number') return json.total;
  if (Array.isArray((json as any)?.data)) return (json as any).data.length;
  return null;
}

function isValidEmail(email: string) {
  // good-enough browser-safe check
  return /^\S+@\S+\.\S+$/.test(email);
}

function isValidPhone(phone: string) {
  // allow +, spaces, (), -, digits. Keep it permissive.
  return /^[0-9+().\s-]{6,}$/.test(phone);
}

function validate(v: VolunteerForm): FieldErrors {
  const e: FieldErrors = {};

  if (!v.first_name.trim()) e.first_name = 'First name is required.';
  if (!v.last_name.trim()) e.last_name = 'Last name is required.';

  const email = v.email.trim();
  if (!email) e.email = 'Email is required.';
  else if (!isValidEmail(email)) e.email = 'Enter a valid email address.';

  const phone = v.phone.trim();
  if (phone && !isValidPhone(phone)) e.phone = 'Enter a valid phone number (or leave it empty).';

  if (!v.primary_skill.trim()) e.primary_skill = 'Primary skill is required.';

  const reason = v.reason.trim();
  if (!reason) e.reason = 'Please tell us why you want to volunteer.';
  else if (reason.length < 10) e.reason = 'Give a bit more detail (at least 10 characters).';
  else if (reason.length > REASON_MAX) e.reason = `Please keep it under ${REASON_MAX} characters.`;

  return e;
}

export default function VolunteerPage() {
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

  const skills = useMemo(
    () => [
      'Healthcare / Medical',
      'Education / Teaching',
      'Logistics / Engineering',
      'Communications / Media',
      'Administration / Operations',
      'IT / Data',
      'Other',
    ],
    []
  );

  const openRoles = useMemo(
    () => [
      { title: 'Field Support Volunteer', location: 'Fangak County', type: 'On-site', suggestedSkill: 'Logistics / Engineering' },
      { title: 'Grant Writing Assistant', location: 'Remote', type: 'Virtual', suggestedSkill: 'Administration / Operations' },
      { title: 'Community Health Educator', location: 'Juba / Upper Nile', type: 'On-site', suggestedSkill: 'Healthcare / Medical' },
    ],
    []
  );

  // Form matches DB columns exactly
  const [formData, setFormData] = useState<VolunteerForm>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    primary_skill: 'Healthcare / Medical',
    reason: '',
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ type: '', message: '' });

  const [volunteerCount, setVolunteerCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(true);

  const noticeRef = useRef<HTMLDivElement | null>(null);

  const setField = <K extends keyof VolunteerForm>(key: K, value: VolunteerForm[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error as the user fixes it
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  async function apiFetch(path: string, init?: RequestInit, timeoutMs = 15000) {
    const controller = new AbortController();
    const t = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers || {}),
        },
      });
      return res;
    } finally {
      window.clearTimeout(t);
    }
  }

  // Count: GET /api/volunteers (supports array or {count}/{total}/{data})
  useEffect(() => {
    let mounted = true;

    (async () => {
      setCountLoading(true);
      try {
        const res = await apiFetch('/api/volunteers', { method: 'GET', cache: 'no-store' as any }, 12000);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiListResponse<any> = await res.json();
        const count = parseCount(json);
        if (mounted) setVolunteerCount(count ?? 0);
      } catch {
        if (mounted) setVolunteerCount(null);
      } finally {
        if (mounted) setCountLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE]);

  const scrollToNotice = () => {
    // Smooth scroll the user to feedback area
    requestAnimationFrame(() => {
      noticeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: VolunteerForm = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      primary_skill: formData.primary_skill,
      reason: formData.reason.trim(),
    };

    const vErrors = validate(payload);
    if (Object.keys(vErrors).length) {
      setErrors(vErrors);
      setStatus({ type: 'error', message: 'Please fix the highlighted fields and try again.' });
      scrollToNotice();
      return;
    }

    setStatus({ type: 'loading', message: 'Sending application…' });

    try {
      const res = await apiFetch('/api/volunteers', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        const msg = result?.error || result?.message || `Request failed (HTTP ${res.status})`;
        throw new Error(msg);
      }

      // Accept common success shapes
      const ok =
        result?.success === true ||
        result?.status === 'success' ||
        result?.ok === true ||
        result?.data != null;

      if (!ok) {
        throw new Error(result?.message || 'Submission failed. Please try again.');
      }

      setStatus({ type: 'success', message: 'Application submitted successfully. Thank you!' });
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        primary_skill: 'Healthcare / Medical',
        reason: '',
      });
      setErrors({});
      scrollToNotice();

      // Optimistic count bump (fast UX)
      setVolunteerCount((c) => (typeof c === 'number' ? c + 1 : c));

      // Best-effort refresh count (authoritative)
      try {
        const cRes = await apiFetch('/api/volunteers', { method: 'GET', cache: 'no-store' as any }, 12000);
        if (cRes.ok) {
          const json: ApiListResponse<any> = await cRes.json();
          const count = parseCount(json);
          if (typeof count === 'number') setVolunteerCount(count);
        }
      } catch {
        // ignore
      }
    } catch (err: any) {
      const msg =
        err?.name === 'AbortError'
          ? 'Request timed out. Please try again.'
          : err?.message || 'Could not connect to the server.';
      setStatus({ type: 'error', message: msg });
      scrollToNotice();
    }
  };

  const applyRole = (suggestedSkill: string, title: string) => {
    setField('primary_skill', (suggestedSkill || 'Other') as any);
    if (!formData.reason.trim()) {
      setField('reason', `I would like to volunteer as a ${title}. I can contribute with...`);
    }
    setStatus({ type: '', message: '' });
  };

  const fieldClass = (k: keyof VolunteerForm) =>
    errors[k] ? `${styles.fieldControl} ${styles.fieldError}` : styles.fieldControl;

  return (
    <main className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.container}>
          <div className={`${styles.heroContent} ${styles.animate}`}>
            <span className={styles.eyebrow}>Volunteer</span>

            <h1 className={styles.heroTitle}>
              Ready to help <span className={styles.heroHighlight}>build communities</span>?
            </h1>

            <p className={styles.heroLead}>
              We’re looking for practical, kind, and consistent people to support communities in South Sudan — in the field or remotely.
            </p>

            <div className={styles.heroStats}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Users size={18} />
                </div>
                <div>
                  <p className={styles.statLabel}>Volunteer Applications</p>
                  <div className={styles.statValue}>
                    {countLoading ? (
                      <span className={styles.statLoading}>
                        <Loader2 size={18} className={styles.spin} /> Loading…
                      </span>
                    ) : volunteerCount === null ? (
                      <span className={styles.statFallback}>—</span>
                    ) : (
                      <span>{volunteerCount.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Globe size={18} />
                </div>
                <div>
                  <p className={styles.statLabel}>Focus Area</p>
                  <p className={styles.statValueSmall}>Fangak County &amp; Upper Nile</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Heart size={18} />
                </div>
                <div>
                  <p className={styles.statLabel}>What we need</p>
                  <p className={styles.statValueSmall}>Skills + commitment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Why Volunteer</span>
            <h2 className={styles.sectionTitle}>Do meaningful work with real people</h2>
            <p className={styles.sectionLead}>
              You’ll learn, contribute, and be part of a trusted team that shows up consistently.
            </p>
          </div>

          <div className={styles.benefitsGrid}>
            <div className={`${styles.benefitCard} ${styles.animate}`} style={{ animationDelay: '0.08s' }}>
              <div className={styles.iconCircle}>
                <Globe size={26} />
              </div>
              <h4 className={styles.benefitTitle}>Global Experience</h4>
              <p className={styles.benefitText}>
                Get hands-on exposure to humanitarian work — logistics, coordination, and delivery.
              </p>
            </div>

            <div className={`${styles.benefitCard} ${styles.animate}`} style={{ animationDelay: '0.16s' }}>
              <div className={styles.iconCircle}>
                <Users size={26} />
              </div>
              <h4 className={styles.benefitTitle}>Community Roots</h4>
              <p className={styles.benefitText}>
                Work alongside local leaders and families across the Upper Nile region.
              </p>
            </div>

            <div className={`${styles.benefitCard} ${styles.animate}`} style={{ animationDelay: '0.24s' }}>
              <div className={styles.iconCircle}>
                <Heart size={26} />
              </div>
              <h4 className={styles.benefitTitle}>Lasting Impact</h4>
              <p className={styles.benefitText}>
                See the results clearly — children learning, families accessing clean water, safer communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OPEN ROLES */}
      <section className={styles.rolesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Opportunities</span>
            <h2 className={styles.sectionTitle}>Current openings</h2>
            <p className={styles.sectionLead}>Apply to a role — or send a general application using the form below.</p>
          </div>

          <div className={styles.rolesList}>
            {openRoles.map((role, idx) => (
              <button
                key={`${role.title}-${idx}`}
                type="button"
                className={styles.roleCard}
                onClick={() => applyRole(role.suggestedSkill, role.title)}
                aria-label={`Apply for ${role.title}`}
              >
                <div className={styles.roleLeft}>
                  <div className={styles.roleIcon}>
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <h5 className={styles.roleTitle}>{role.title}</h5>
                    <p className={styles.roleMeta}>{role.location}</p>
                  </div>
                </div>

                <div className={styles.roleRight}>
                  <span className={styles.roleTag}>{role.type}</span>
                  <ChevronRight size={18} className={styles.roleChevron} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* APPLICATION FORM */}
      <section className={styles.formSection}>
        <div className={styles.container}>
          <div className={styles.splitGrid}>
            <div className={styles.formIntro}>
              <span className={styles.sectionTag}>Apply Now</span>
              <h2 className={styles.formTitle}>Ready to start your journey?</h2>
              <p className={styles.formLead}>
                Tell us your primary skill and why you want to volunteer. We’ll review and get back to you as soon as we can.
              </p>

              <div ref={noticeRef}>
                {status.type && (
                  <div
                    className={`${styles.notice} ${
                      status.type === 'success'
                        ? styles.noticeSuccess
                        : status.type === 'error'
                          ? styles.noticeError
                          : styles.noticeLoading
                    }`}
                    role="status"
                    aria-live="polite"
                  >
                    <span className={styles.noticeIcon}>
                      {status.type === 'success' ? (
                        <CheckCircle2 size={18} />
                      ) : status.type === 'error' ? (
                        <AlertCircle size={18} />
                      ) : (
                        <Loader2 size={18} className={styles.spin} />
                      )}
                    </span>
                    <span>{status.message}</span>
                  </div>
                )}
              </div>

              <div className={styles.formHint}>
                <p className={styles.formHintTitle}>Tip</p>
                <p className={styles.formHintText}>
                  Keep it specific: what you can do, where you’re available, and how soon you can start.
                </p>
              </div>
            </div>

            <div className={styles.formCard}>
              <form onSubmit={handleSubmit} className={styles.volunteerForm}>
                <div className={styles.inputGroup}>
                  <label htmlFor="primary_skill">
                    Primary skill <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="primary_skill"
                    value={formData.primary_skill}
                    onChange={(e) => setField('primary_skill', e.target.value)}
                    className={fieldClass('primary_skill')}
                    aria-invalid={Boolean(errors.primary_skill)}
                  >
                    {skills.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.primary_skill && <p className={styles.errorText}>{errors.primary_skill}</p>}
                </div>

                <div className={styles.row}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="first_name">
                      First name <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="first_name"
                      type="text"
                      placeholder="First name"
                      required
                      value={formData.first_name}
                      onChange={(e) => setField('first_name', e.target.value)}
                      autoComplete="given-name"
                      className={fieldClass('first_name')}
                      aria-invalid={Boolean(errors.first_name)}
                    />
                    {errors.first_name && <p className={styles.errorText}>{errors.first_name}</p>}
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="last_name">
                      Last name <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="last_name"
                      type="text"
                      placeholder="Last name"
                      required
                      value={formData.last_name}
                      onChange={(e) => setField('last_name', e.target.value)}
                      autoComplete="family-name"
                      className={fieldClass('last_name')}
                      aria-invalid={Boolean(errors.last_name)}
                    />
                    {errors.last_name && <p className={styles.errorText}>{errors.last_name}</p>}
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="email">
                      Email <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={formData.email}
                      onChange={(e) => setField('email', e.target.value)}
                      autoComplete="email"
                      className={fieldClass('email')}
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+211 …"
                      value={formData.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                      autoComplete="tel"
                      className={fieldClass('phone')}
                      aria-invalid={Boolean(errors.phone)}
                    />
                    {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="reason">
                    Why do you want to volunteer with CMDI? <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="reason"
                    rows={5}
                    placeholder="Tell us your story…"
                    required
                    value={formData.reason}
                    onChange={(e) => setField('reason', e.target.value)}
                    maxLength={REASON_MAX}
                    className={fieldClass('reason')}
                    aria-invalid={Boolean(errors.reason)}
                  />
                  <div className={styles.helperRow}>
                    {errors.reason ? <p className={styles.errorText}>{errors.reason}</p> : <span />}
                    <span className={styles.charCount}>
                      {formData.reason.length}/{REASON_MAX}
                    </span>
                  </div>
                </div>

                <button type="submit" className={styles.btnPrimary} disabled={status.type === 'loading'}>
                  {status.type === 'loading' ? 'Sending…' : 'Submit Application'}
                  <span className={styles.btnIcon}>
                    <Send size={18} />
                  </span>
                </button>

                <p className={styles.formFootnote}>
                  By submitting, you agree to be contacted by CMDI regarding this application.
                </p>

                <p className={styles.smallDeployNote}>
                  Deployment note: set <strong>NEXT_PUBLIC_API_BASE_URL</strong> to your backend domain.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Questions?</h2>
            <p className={styles.ctaText}>
              Email us at <span className={styles.ctaEmail}>volunteers@cmdi-ss.org</span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
