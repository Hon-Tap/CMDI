'use client';

import React, { useMemo, useRef, useState } from 'react';
import styles from './contact.module.css';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  HeartHandshake,
  Copy,
  Check,
  Loader2,
  LifeBuoy,
  Newspaper,
  Handshake,
  Gift,
  Users,
} from 'lucide-react';

type ContactForm = {
  full_name: string;
  email: string;
  subject: string;
  message: string;
};

type Status = {
  loading: boolean;
  message: string;
  type: '' | 'success' | 'error';
};

type FieldErrors = Partial<Record<keyof ContactForm, string>>;

const MESSAGE_MAX = 1200;

const SUBJECTS = [
  { label: 'General Inquiry', icon: LifeBuoy },
  { label: 'Partnership Proposal', icon: Handshake },
  { label: 'Volunteering', icon: Users },
  { label: 'Donation Question', icon: Gift },
  { label: 'Media/Press', icon: Newspaper },
] as const;

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function validate(v: ContactForm): FieldErrors {
  const e: FieldErrors = {};

  if (!v.full_name.trim() || v.full_name.trim().length < 2) {
    e.full_name = 'Please enter your full name.';
  }

  const email = v.email.trim();
  if (!email) e.email = 'Email is required.';
  else if (!isValidEmail(email)) e.email = 'Enter a valid email address.';

  if (!v.subject.trim()) e.subject = 'Please select a subject.';

  const msg = v.message.trim();
  if (!msg) e.message = 'Message is required.';
  else if (msg.length < 10) e.message = 'Please add a bit more detail (at least 10 characters).';
  else if (msg.length > MESSAGE_MAX) e.message = `Please keep it under ${MESSAGE_MAX} characters.`;

  return e;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactForm>({
    full_name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ loading: false, message: '', type: '' });

  const [copiedKey, setCopiedKey] = useState<'' | 'email' | 'phone' | 'location'>('');
  const noticeRef = useRef<HTMLDivElement | null>(null);

  // BUILD-SAFE API ENDPOINT
  const endpoint = useMemo(() => {
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cmdi-backend.onrender.com').replace(/\/$/, '');
    return `${base}/api/contact`;
  }, []);

  const clearNoticeSoon = () => {
    // small UX: clear copied state after a moment
    window.setTimeout(() => setCopiedKey(''), 1400);
  };

  const scrollToNotice = () => {
    requestAnimationFrame(() => {
      noticeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const setField = <K extends keyof ContactForm>(key: K, value: ContactForm[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    // clear field error as user types
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

    if (status.message) setStatus((s) => ({ ...s, message: '', type: '' }));
  };

  const handleCopy = async (key: 'email' | 'phone' | 'location', text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      clearNoticeSoon();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.loading) return;

    const payload: ContactForm = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      subject: formData.subject,
      message: formData.message.trim(),
    };

    const vErrors = validate(payload);
    if (Object.keys(vErrors).length) {
      setErrors(vErrors);
      setStatus({ loading: false, type: 'error', message: 'Please fix the highlighted fields.' });
      scrollToNotice();
      return;
    }

    setStatus({ loading: true, message: 'Sending your message...', type: '' });

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(result?.error || result?.message || 'Failed to send message.');

      setStatus({
        loading: false,
        message: 'Message sent! We’ll get back to you soon.',
        type: 'success',
      });

      setFormData({
        full_name: '',
        email: '',
        subject: 'General Inquiry',
        message: '',
      });

      setErrors({});
      scrollToNotice();
    } catch (err: any) {
      setStatus({
        loading: false,
        message: err?.message || 'Something went wrong. Please try again later.',
        type: 'error',
      });
      scrollToNotice();
    }
  };

  const contactEmail = 'info@cmdi-ss.org';
  const contactPhone = '+211 000 000 000'; // replace when ready
  const contactLocation = 'Juba, South Sudan';

  return (
    <main className={styles.page}>
      {/* HERO */}
      <header className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <HeartHandshake size={16} />
            <span>Contact CMDI</span>
          </div>

          <h1 className={styles.heroTitle}>
            Let’s build something <span className={styles.heroAccent}>meaningful</span>.
          </h1>

          <p className={styles.heroSubtitle}>
            Questions, partnerships, media, or support — send a message and we’ll respond.
          </p>

          <div className={styles.heroQuick}>
            <a className={styles.heroQuickBtn} href={`mailto:${contactEmail}`}>
              <Mail size={18} />
              Email us
            </a>
            <a className={styles.heroQuickBtnGhost} href="#contact-form">
              <MessageSquare size={18} />
              Send a message
            </a>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* LEFT: CONTACT CARDS */}
            <aside className={styles.left}>
              <div className={styles.panelTitle}>
                <span className={styles.panelDot} />
                <h2>Ways to reach us</h2>
              </div>

              <div className={styles.cards}>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>
                    <Mail size={22} />
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.cardLabel}>Email</p>
                    <a className={styles.cardValue} href={`mailto:${contactEmail}`}>
                      {contactEmail}
                    </a>
                    <p className={styles.cardHint}>Best for proposals, documents, and official requests.</p>

                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => handleCopy('email', contactEmail)}
                        aria-label="Copy email"
                      >
                        {copiedKey === 'email' ? <Check size={16} /> : <Copy size={16} />}
                        {copiedKey === 'email' ? 'Copied' : 'Copy'}
                      </button>

                      <a className={styles.actionBtnPrimary} href={`mailto:${contactEmail}`}>
                        <Send size={16} />
                        Write
                      </a>
                    </div>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardIconAlt}>
                    <Phone size={22} />
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.cardLabel}>Phone</p>
                    <a className={styles.cardValue} href={`tel:${contactPhone.replace(/\s+/g, '')}`}>
                      {contactPhone}
                    </a>
                    <p className={styles.cardHint}>Quick coordination and urgent follow-ups.</p>

                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => handleCopy('phone', contactPhone)}
                        aria-label="Copy phone"
                      >
                        {copiedKey === 'phone' ? <Check size={16} /> : <Copy size={16} />}
                        {copiedKey === 'phone' ? 'Copied' : 'Copy'}
                      </button>

                      <a className={styles.actionBtnPrimary} href={`tel:${contactPhone.replace(/\s+/g, '')}`}>
                        <Phone size={16} />
                        Call
                      </a>
                    </div>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardIconAlt2}>
                    <MapPin size={22} />
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.cardLabel}>Location</p>
                    <p className={styles.cardValuePlain}>{contactLocation}</p>
                    <p className={styles.cardHint}>Operating across South Sudan with community partners.</p>

                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => handleCopy('location', contactLocation)}
                        aria-label="Copy location"
                      >
                        {copiedKey === 'location' ? <Check size={16} /> : <Copy size={16} />}
                        {copiedKey === 'location' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.callout}>
                <div className={styles.calloutIcon}>
                  <HeartHandshake size={18} />
                </div>
                <div>
                  <h3>Want to partner?</h3>
                  <p>
                    Choose <strong>Partnership Proposal</strong> and share your concept + timeline. We’ll prioritize it.
                  </p>
                </div>
              </div>
            </aside>

            {/* RIGHT: FORM */}
            <div className={styles.right}>
              <div className={styles.formCard} id="contact-form">
                <div className={styles.formTopBar} aria-hidden="true" />

                <div className={styles.formHeader}>
                  <div className={styles.formHeaderIcon}>
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h2>Send a message</h2>
                    <p>Fill the form below — we read every message.</p>
                  </div>
                </div>

                <div ref={noticeRef} className={styles.noticeArea}>
                  {status.message && (
                    <div
                      className={`${styles.notice} ${
                        status.type === 'success' ? styles.noticeSuccess : styles.noticeError
                      }`}
                      role="status"
                    >
                      {status.loading ? <Loader2 size={18} className={styles.spin} /> : null}
                      <span>{status.message}</span>
                    </div>
                  )}
                </div>

                {/* SUBJECT PICKER */}
                <div className={styles.subjectBlock}>
                  <p className={styles.subjectLabel}>Subject</p>
                  <div className={styles.subjectChips} role="radiogroup" aria-label="Choose a subject">
                    {SUBJECTS.map((s) => {
                      const Icon = s.icon;
                      const active = formData.subject === s.label;
                      return (
                        <button
                          key={s.label}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                          onClick={() => setField('subject', s.label)}
                        >
                          <Icon size={16} />
                          <span>{s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.subject && <p className={styles.fieldError}>{errors.subject}</p>}
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label htmlFor="full_name">Full name</label>
                      <div className={`${styles.inputWrap} ${errors.full_name ? styles.inputWrapError : ''}`}>
                        <span className={styles.inputIcon} aria-hidden="true">
                          <Users size={16} />
                        </span>
                        <input
                          id="full_name"
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => setField('full_name', e.target.value)}
                          placeholder="Your name…"
                          autoComplete="name"
                          required
                        />
                      </div>
                      {errors.full_name && <p className={styles.fieldError}>{errors.full_name}</p>}
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="email">Email address</label>
                      <div className={`${styles.inputWrap} ${errors.email ? styles.inputWrapError : ''}`}>
                        <span className={styles.inputIcon} aria-hidden="true">
                          <Mail size={16} />
                        </span>
                        <input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setField('email', e.target.value)}
                          placeholder="you@example.com"
                          autoComplete="email"
                          required
                        />
                      </div>
                      {errors.email && <p className={styles.fieldError}>{errors.email}</p>}
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="message">Message</label>
                    <div className={`${styles.textareaWrap} ${errors.message ? styles.inputWrapError : ''}`}>
                      <textarea
                        id="message"
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setField('message', e.target.value)}
                        placeholder="How can we help you?"
                        maxLength={MESSAGE_MAX + 50} // allow typing; we validate strictly
                        required
                      />
                    </div>

                    <div className={styles.metaRow}>
                      {errors.message ? (
                        <p className={styles.fieldError}>{errors.message}</p>
                      ) : (
                        <p className={styles.helperText}>Be specific (what you need + when).</p>
                      )}
                      <span className={styles.counter}>
                        {formData.message.length}/{MESSAGE_MAX}
                      </span>
                    </div>
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={status.loading}>
                    <span>{status.loading ? 'Sending…' : 'Send message'}</span>
                    {status.loading ? <Loader2 size={18} className={styles.spin} /> : <Send size={18} />}
                  </button>

                  <p className={styles.footnote}>
                    By submitting, you agree to be contacted by CMDI regarding this inquiry.
                  </p>
                </form>
              </div>

              {/* MICRO CTA */}
              <div className={styles.miniCta}>
                <div className={styles.miniCtaIcon}>
                  <HeartHandshake size={18} />
                </div>
                <div>
                  <p className={styles.miniCtaTitle}>Prefer email instead?</p>
                  <a className={styles.miniCtaLink} href={`mailto:${contactEmail}`}>
                    {contactEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
