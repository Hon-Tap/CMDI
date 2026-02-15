'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './volunteer.module.css';
import {
  Heart,
  Globe,
  Users,
  Briefcase,
  ArrowRight,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  Sparkles,
} from 'lucide-react';

/* --- TYPES --- */
type VolunteerForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  primary_skill: string;
  reason: string;
};

type Status = {
  loading: boolean;
  message: string;
  type: '' | 'success' | 'error';
};

type ApiListResponse<T> = T[] | { data?: T[]; count?: number; total?: number };
type FieldErrors = Partial<Record<keyof VolunteerForm, string>>;

const REASON_MAX = 800;

/* --- UTILS --- */
function parseCount(json: ApiListResponse<any>): number | null {
  if (Array.isArray(json)) return json.length;
  if (typeof (json as any)?.count === 'number') return (json as any).count;
  if (typeof (json as any)?.total === 'number') return (json as any).total;
  if (Array.isArray((json as any)?.data)) return (json as any).data.length;
  return null;
}

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function isValidPhone(phone: string) {
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
  if (phone && !isValidPhone(phone)) e.phone = 'Enter a valid phone number.';

  if (!v.primary_skill.trim()) e.primary_skill = 'Primary skill is required.';

  const reason = v.reason.trim();
  if (!reason) e.reason = 'Please tell us why you want to volunteer.';
  else if (reason.length < 10) e.reason = 'Please give a bit more detail.';
  else if (reason.length > REASON_MAX) e.reason = `Please keep it under ${REASON_MAX} characters.`;

  return e;
}

export default function VolunteerPage() {
  /* --- DATA --- */
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
      {
        title: 'Field Support Volunteer',
        location: 'Fangak County',
        type: 'On-site',
        suggestedSkill: 'Logistics / Engineering',
      },
      {
        title: 'Grant Writing Assistant',
        location: 'Remote',
        type: 'Virtual',
        suggestedSkill: 'Administration / Operations',
      },
      {
        title: 'Community Health Educator',
        location: 'Juba / Upper Nile',
        type: 'On-site',
        suggestedSkill: 'Healthcare / Medical',
      },
    ],
    []
  );

  const volunteersEndpoint = useMemo(() => {
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cmdi-backend.onrender.com').replace(/\/$/, '');
    return `${base}/api/volunteers`;
  }, []);

  /* --- STATE --- */
  const [formData, setFormData] = useState<VolunteerForm>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    primary_skill: 'Healthcare / Medical',
    reason: '',
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ loading: false, message: '', type: '' });
  const [volunteerCount, setVolunteerCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(true);

  const noticeRef = useRef<HTMLDivElement | null>(null);

  /* --- ACTIONS --- */
  const scrollToNotice = () => {
    requestAnimationFrame(() => {
      noticeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const setField = <K extends keyof VolunteerForm>(key: K, value: VolunteerForm[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (status.message) setStatus((s) => ({ ...s, message: '', type: '' }));
  };

  const applyRole = (suggestedSkill: string, title: string) => {
    setField('primary_skill', (suggestedSkill || 'Other') as any);
    if (!formData.reason.trim()) {
      setField('reason', `I am interested in the ${title} role. I can contribute by...`);
    }
    document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch Count
  useEffect(() => {
    let mounted = true;
    (async () => {
      setCountLoading(true);
      try {
        const res = await fetch(volunteersEndpoint, { cache: 'no-store' });
        if (res.ok) {
          const json: ApiListResponse<any> = await res.json();
          const count = parseCount(json);
          if (mounted) setVolunteerCount(count ?? 0);
        }
      } catch {
        if (mounted) setVolunteerCount(null);
      } finally {
        if (mounted) setCountLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [volunteersEndpoint]);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.loading) return;

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
      setStatus({ loading: false, type: 'error', message: 'Please review the errors below.' });
      scrollToNotice();
      return;
    }

    setStatus({ loading: true, type: '', message: 'Submitting application...' });

    try {
      const res = await fetch(volunteersEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(result?.message || 'Request failed');

      const ok = result?.success === true || result?.status === 'success' || result?.data != null || result?.id != null;
      if (!ok) throw new Error(result?.message || 'Submission failed.');

      setStatus({ loading: false, type: 'success', message: 'Application received. We will be in touch soon!' });
      setFormData({ first_name: '', last_name: '', email: '', phone: '', primary_skill: 'Healthcare / Medical', reason: '' });
      setErrors({});
      scrollToNotice();
      setVolunteerCount((c) => (typeof c === 'number' ? c + 1 : c));

    } catch (err: any) {
      setStatus({ loading: false, type: 'error', message: err?.message || 'Something went wrong. Please try again.' });
      scrollToNotice();
    }
  };

  /* --- RENDER HELPERS --- */
  const getInputClass = (k: keyof VolunteerForm) =>
    `${styles.input} ${errors[k] ? styles.inputError : ''} ${formData[k] ? styles.inputFilled : ''}`;

  return (
    <main className={styles.pageWrapper}>
      
      {/* --- HERO SECTION --- */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <Sparkles size={14} className={styles.badgeIcon} />
              <span>Join the Mission</span>
            </div>
            
            <h1 className={styles.heroTitle}>
              Build Communities,<br />
              <span className={styles.textGradient}>Change Lives.</span>
            </h1>
            
            <p className={styles.heroSubtitle}>
              We are looking for practical, kind, and consistent people to support communities in South Sudan—whether in the field or remotely.
            </p>

            {/* Glassmorphism Stats Bar */}
            <div className={styles.statsBar}>
              <div className={styles.statItem}>
                <div className={styles.statIconWrapper}><Users size={20} /></div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    {countLoading ? <Loader2 size={14} className={styles.spin} /> : (volunteerCount?.toLocaleString() ?? '—')}
                  </span>
                  <span className={styles.statLabel}>Volunteers Joined</span>
                </div>
              </div>

              <div className={styles.statDivider} />

              <div className={styles.statItem}>
                <div className={styles.statIconWrapper}><MapPin size={20} /></div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>Fangak & Upper Nile</span>
                  <span className={styles.statLabel}>Primary Focus Areas</span>
                </div>
              </div>

              <div className={styles.statDivider} />

              <div className={styles.statItem}>
                <div className={styles.statIconWrapper}><Heart size={20} /></div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>Urgent Needs</span>
                  <span className={styles.statLabel}>Medical & Logistics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BENEFITS GRID --- */}
      <section className={styles.benefitsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionHeading}>Why volunteer with CMDI?</h2>
            <p className={styles.sectionSubheading}>You’ll work with a trusted team that shows up consistently.</p>
          </div>

          <div className={styles.bentoGrid}>
            <div className={styles.bentoCard}>
              <div className={styles.cardIcon}><Globe size={28} /></div>
              <h3 className={styles.cardTitle}>Global Experience</h3>
              <p className={styles.cardText}>Gain hands-on exposure to humanitarian work, logistics coordination, and field delivery in complex environments.</p>
            </div>

            <div className={styles.bentoCard}>
              <div className={styles.cardIcon}><Users size={28} /></div>
              <h3 className={styles.cardTitle}>Community Roots</h3>
              <p className={styles.cardText}>Work alongside local leaders and families. Our approach is community-led, meaning you listen first and act second.</p>
            </div>

            <div className={styles.bentoCard}>
              <div className={styles.cardIcon}><Heart size={28} /></div>
              <h3 className={styles.cardTitle}>Tangible Impact</h3>
              <p className={styles.cardText}>See the results clearly—children learning, families accessing clean water, and safer communities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- OPEN ROLES --- */}
      <section className={styles.rolesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionHeading}>Current Openings</h2>
            <p className={styles.sectionSubheading}>Select a role to fast-track your application.</p>
          </div>

          <div className={styles.rolesGrid}>
            {openRoles.map((role, idx) => (
              <button
                key={idx}
                type="button"
                className={styles.roleCard}
                onClick={() => applyRole(role.suggestedSkill, role.title)}
              >
                <div className={styles.roleHeader}>
                  <Briefcase size={20} className={styles.roleIcon} />
                  <span className={styles.roleTypeBadge}>{role.type}</span>
                </div>
                <h4 className={styles.roleTitle}>{role.title}</h4>
                <p className={styles.roleLocation}>{role.location}</p>
                <div className={styles.roleFooter}>
                  <span>Apply Now</span>
                  <ArrowRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* --- APPLICATION FORM --- */}
      <section id="application-form" className={styles.formSection}>
        <div className={styles.container}>
          <div className={styles.formLayout}>
            
            {/* Form Sidebar/Context */}
            <div className={styles.formContext}>
              <h2 className={styles.formHeading}>Ready to start your journey?</h2>
              <p className={styles.formDescription}>
                Tell us your primary skill and why you want to volunteer. We review every application personally and will get back to you soon.
              </p>
              
              <div className={styles.tipBox}>
                <Sparkles size={16} className={styles.tipIcon} />
                <div>
                  <strong>Tip:</strong> Be specific about your availability and how soon you can start.
                </div>
              </div>
            </div>

            {/* The Form Card */}
            <div className={styles.formCardWrapper}>
              <form onSubmit={handleSubmit} className={styles.form}>
                
                {/* Status Notices */}
                <div ref={noticeRef} className={styles.statusArea}>
                  {status.message && (
                    <div className={`${styles.alert} ${status.type === 'error' ? styles.alertError : styles.alertSuccess}`}>
                      {status.loading ? <Loader2 size={18} className={styles.spin} /> : 
                       status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      <span>{status.message}</span>
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="primary_skill" className={styles.label}>Primary Skill</label>
                  <div className={styles.selectWrapper}>
                    <select
                      id="primary_skill"
                      value={formData.primary_skill}
                      onChange={(e) => setField('primary_skill', e.target.value)}
                      className={getInputClass('primary_skill')}
                    >
                      {skills.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="first_name" className={styles.label}>First Name</label>
                    <input
                      id="first_name"
                      type="text"
                      className={getInputClass('first_name')}
                      value={formData.first_name}
                      onChange={(e) => setField('first_name', e.target.value)}
                      placeholder="First Name..."
                    />
                    {errors.first_name && <span className={styles.errorMsg}>{errors.first_name}</span>}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="last_name" className={styles.label}>Last Name</label>
                    <input
                      id="last_name"
                      type="text"
                      className={getInputClass('last_name')}
                      value={formData.last_name}
                      onChange={(e) => setField('last_name', e.target.value)}
                      placeholder="Last Name..."
                    />
                    {errors.last_name && <span className={styles.errorMsg}>{errors.last_name}</span>}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>Email Address</label>
                    <input
                      id="email"
                      type="email"
                      className={getInputClass('email')}
                      value={formData.email}
                      onChange={(e) => setField('email', e.target.value)}
                      placeholder="jane@example.com"
                    />
                    {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="phone" className={styles.label}>Phone (Optional)</label>
                    <input
                      id="phone"
                      type="tel"
                      className={getInputClass('phone')}
                      value={formData.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                      placeholder="+211..."
                    />
                    {errors.phone && <span className={styles.errorMsg}>{errors.phone}</span>}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="reason" className={styles.label}>Why do you want to join?</label>
                  <textarea
                    id="reason"
                    rows={4}
                    className={getInputClass('reason')}
                    value={formData.reason}
                    onChange={(e) => setField('reason', e.target.value)}
                    placeholder="Tell us a bit about yourself and your motivation..."
                  />
                  <div className={styles.charCount}>
                    {errors.reason && <span className={styles.errorMsg}>{errors.reason}</span>}
                    <span>{formData.reason.length}/{REASON_MAX}</span>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={status.loading}>
                  {status.loading ? 'Sending...' : 'Submit Application'}
                  {!status.loading && <Send size={18} />}
                </button>
                
                <p className={styles.disclaimer}>
                  By submitting, you agree to be contacted by CMDI regarding this application.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className={styles.footerCta}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h3>Questions about volunteering?</h3>
            <a href="mailto:volunteers@cmdi-ss.org" className={styles.ctaLink}>
              volunteers@cmdi-ss.org <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}