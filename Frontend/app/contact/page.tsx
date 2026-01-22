'use client';

import React, { useMemo, useState } from 'react';
import styles from './contact.module.css';
import { Mail, Phone, MapPin, Send, MessageSquare, Heart } from 'lucide-react';

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

const SUBJECTS = [
  'General Inquiry',
  'Partnership Proposal',
  'Volunteering',
  'Donation Question',
  'Media/Press',
];

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactForm>({
    full_name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [status, setStatus] = useState<Status>({
    loading: false,
    message: '',
    type: '',
  });

  // ✅ change this to your deployed API later:
  // e.g. process.env.NEXT_PUBLIC_API_BASE_URL + '/api/contact'
  const endpoint = useMemo(() => 'http://127.0.0.1:8000/api/contact', []);

  const onChange =
    (key: keyof ContactForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));
      if (status.message) setStatus((s) => ({ ...s, message: '', type: '' }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.loading) return;

    setStatus({ loading: true, message: '', type: '' });

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // Protect against non-JSON error responses
      const text = await res.text();
      const result = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(result?.error || result?.message || 'Failed to send message.');
      }

      setStatus({
        loading: false,
        message: 'Message sent! We will get back to you soon.',
        type: 'success',
      });

      setFormData({
        full_name: '',
        email: '',
        subject: 'General Inquiry',
        message: '',
      });
    } catch (err: any) {
      setStatus({
        loading: false,
        message: err?.message || 'Something went wrong. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <main className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.heroKicker}>Contact</p>
          <h1 className={styles.heroTitle}>Let’s talk</h1>
          <p className={styles.heroSubtitle}>
            Questions, partnerships, volunteering, or support — send us a message and we’ll respond.
          </p>
        </div>
      </section>

      {/* MAIN */}
      <section className={styles.contactSection}>
        <div className={styles.container}>
          <div className={styles.contactGrid}>
            {/* LEFT: INFO */}
            <aside className={styles.infoSidebar}>
              <div className={styles.infoCard}>
                <div className={styles.iconWrapper}>
                  <Mail size={22} />
                </div>
                <div className={styles.infoText}>
                  <h3>Email</h3>
                  <a href="mailto:info@cmdi-ss.org">info@cmdi-ss.org</a>
                  <p>We reply as soon as possible.</p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.iconWrapper}>
                  <Phone size={22} />
                </div>
                <div className={styles.infoText}>
                  <h3>Phone</h3>
                  <a href="tel:+211000000000">+211 000 000 000</a>
                  <p>Weekdays, 9am – 5pm.</p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.iconWrapper}>
                  <MapPin size={22} />
                </div>
                <div className={styles.infoText}>
                  <h3>Location</h3>
                  <p>Juba, South Sudan</p>
                  <p>We work across communities.</p>
                </div>
              </div>

              <div className={styles.sideCallout}>
                <div className={styles.sideCalloutIcon}>
                  <Heart size={18} />
                </div>
                <div className={styles.sideCalloutText}>
                  <h4>Want to partner with us?</h4>
                  <p>
                    Select <strong>Partnership Proposal</strong> and share what you have in mind.
                  </p>
                </div>
              </div>
            </aside>

            {/* RIGHT: FORM */}
            <div className={styles.formWrapper}>
              <div className={styles.formHeader}>
                <div className={styles.formHeaderIcon}>
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h2>Send a Message</h2>
                  <p>Fill in the form below and we’ll reach out.</p>
                </div>
              </div>

              {status.message && (
                <div
                  className={`${styles.alert} ${
                    status.type === 'success' ? styles.alertSuccess : styles.alertError
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {status.message}
                </div>
              )}

              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label htmlFor="full_name">Full Name</label>
                    <input
                      id="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={onChange('full_name')}
                      placeholder="Your name..."
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={onChange('email')}
                      placeholder="youremail@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject">Subject / Interest</label>
                  <select id="subject" value={formData.subject} onChange={onChange('subject')}>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message">Your Message</label>
                  <textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={onChange('message')}
                    placeholder="How can we help you?"
                    required
                  />
                </div>

                <button type="submit" className={styles.submitBtn} disabled={status.loading}>
                  <span>{status.loading ? 'Sending...' : 'Send Message'}</span>
                  <Send size={18} />
                </button>

                <p className={styles.formFootnote}>
                  By sending this message, you agree to be contacted back by CMDI.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
