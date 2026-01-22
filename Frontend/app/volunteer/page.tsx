'use client';

import React, { useEffect, useMemo, useState } from 'react';
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

type Status =
  | { type: ''; message: '' }
  | { type: 'loading'; message: string }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string };

type ApiListResponse<T> = T[] | { data?: T[]; count?: number; total?: number };

export default function VolunteerPage() {
  // DB-aligned form fields (matches: first_name, last_name, email, phone, primary_skill, reason)
  const [formData, setFormData] = useState<VolunteerForm>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    primary_skill: 'Healthcare / Medical',
    reason: '',
  });

  const [status, setStatus] = useState<Status>({ type: '', message: '' });

  // Pull volunteer count from API (no hardcoding)
  const [volunteerCount, setVolunteerCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(true);

  const openRoles = useMemo(
    () => [
      { title: 'Field Support Volunteer', location: 'Fangak County', type: 'On-site' },
      { title: 'Grant Writing Assistant', location: 'Remote', type: 'Virtual' },
      { title: 'Community Health Educator', location: 'Juba / Upper Nile', type: 'On-site' },
    ],
    []
  );

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

  // 1) Fetch volunteer count (tries common shapes: {count}, {total}, {data.length}, array length)
  useEffect(() => {
    let isMounted = true;

    async function fetchCount() {
      setCountLoading(true);
      try {
        // Assumption: your backend exposes GET /api/volunteers
        const res = await fetch('http://127.0.0.1:8000/api/volunteers', { cache: 'no-store' });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: ApiListResponse<any> = await res.json();

        let count: number | null = null;

        if (Array.isArray(json)) {
          count = json.length;
        } else {
          if (typeof json.count === 'number') count = json.count;
          else if (typeof json.total === 'number') count = json.total;
          else if (Array.isArray(json.data)) count = json.data.length;
        }

        if (isMounted) setVolunteerCount(count ?? 0);
      } catch {
        if (isMounted) setVolunteerCount(null);
      } finally {
        if (isMounted) setCountLoading(false);
      }
    }

    fetchCount();
    return () => {
      isMounted = false;
    };
  }, []);

  const setField = <K extends keyof VolunteerForm>(key: K, value: VolunteerForm[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Sending application…' });

    try {
      // Basic client-side cleanup
      const payload: VolunteerForm = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        primary_skill: formData.primary_skill,
        reason: formData.reason.trim(),
      };

      const response = await fetch('http://127.0.0.1:8000/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && (result.success === true || result.status === 'success' || result.ok === true)) {
        setStatus({ type: 'success', message: 'Application submitted successfully. Thank you!' });
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          primary_skill: 'Healthcare / Medical',
          reason: '',
        });

        // Refresh count after successful submit
        try {
          const res = await fetch('http://127.0.0.1:8000/api/volunteers', { cache: 'no-store' });
          if (res.ok) {
            const json: ApiListResponse<any> = await res.json();
            const count =
              Array.isArray(json)
                ? json.length
                : typeof json.count === 'number'
                  ? json.count
                  : typeof json.total === 'number'
                    ? json.total
                    : Array.isArray(json.data)
                      ? json.data.length
                      : null;
            setVolunteerCount(count ?? volunteerCount);
          }
        } catch {
          // ignore count refresh failures
        }
      } else {
        const msg =
          result?.message ||
          result?.error ||
          'Something went wrong. Please check your inputs and try again.';
        throw new Error(msg);
      }
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: error?.message || 'Could not connect to the server.',
      });
    }
  };

  return (
    <main className={styles.page}>
      {/* 1) HERO */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.container}>
          <div className={`${styles.heroContent} ${styles.animate}`}>
            <span className={styles.eyebrow}>Volunteer</span>

            <h1 className={styles.heroTitle}>
              Join the <span className={styles.heroHighlight}>Movement</span>
            </h1>

            <p className={styles.heroLead}>
              We’re looking for practical, kind, and consistent people to help us rebuild communities in South Sudan—
              in the field or remotely.
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

      {/* 2) BENEFITS */}
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
                Get hands-on exposure to humanitarian work—field logistics, coordination, and delivery.
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
                See the results clearly—children learning, families accessing clean water, safer communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3) OPEN ROLES */}
      <section className={styles.rolesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Opportunities</span>
            <h2 className={styles.sectionTitle}>Current openings</h2>
            <p className={styles.sectionLead}>Apply to a role—or send a general application using the form below.</p>
          </div>

          <div className={styles.rolesList}>
            {openRoles.map((role, idx) => (
              <div key={`${role.title}-${idx}`} className={styles.roleCard}>
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4) APPLICATION FORM */}
      <section className={styles.formSection}>
        <div className={styles.container}>
          <div className={styles.splitGrid}>
            <div className={styles.formIntro}>
              <span className={styles.sectionTag}>Apply Now</span>
              <h2 className={styles.formTitle}>Ready to start your journey?</h2>
              <p className={styles.formLead}>
                Tell us your primary skill and why you want to volunteer. We’ll review and get back to you as soon as we can.
              </p>

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

              <div className={styles.formHint}>
                <p className={styles.formHintTitle}>Tip</p>
                <p className={styles.formHintText}>
                  Keep your message specific: what you can do, where you’re available, and how soon you can start.
                </p>
              </div>
            </div>

            <div className={styles.formCard}>
              <form onSubmit={handleSubmit} className={styles.volunteerForm}>
                <div className={styles.inputGroup}>
                  <label htmlFor="primary_skill">Primary skill</label>
                  <select
                    id="primary_skill"
                    value={formData.primary_skill}
                    onChange={(e) => setField('primary_skill', e.target.value)}
                  >
                    {skills.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.row}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="first_name">First name</label>
                    <input
                      id="first_name"
                      type="text"
                      placeholder="First name"
                      required
                      value={formData.first_name}
                      onChange={(e) => setField('first_name', e.target.value)}
                      autoComplete="given-name"
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="last_name">Last name</label>
                    <input
                      id="last_name"
                      type="text"
                      placeholder="Last name"
                      required
                      value={formData.last_name}
                      onChange={(e) => setField('last_name', e.target.value)}
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={formData.email}
                      onChange={(e) => setField('email', e.target.value)}
                      autoComplete="email"
                    />
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
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="reason">Why do you want to volunteer with CMDI?</label>
                  <textarea
                    id="reason"
                    rows={5}
                    placeholder="Tell us your story…"
                    required
                    value={formData.reason}
                    onChange={(e) => setField('reason', e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={status.type === 'loading'}
                >
                  {status.type === 'loading' ? 'Sending…' : 'Submit Application'}
                  <span className={styles.btnIcon}>
                    <Send size={18} />
                  </span>
                </button>

                <p className={styles.formFootnote}>
                  By submitting, you agree to be contacted by CMDI regarding this application.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 5) CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Questions?</h2>
            <p className={styles.ctaText}>
              Email us at <span className={styles.ctaEmail}>volunteers@cmdi.org</span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
