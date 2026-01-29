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

  // BUILD-SAFE API ENDPOINT
  const endpoint = useMemo(() => {
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cmdi-backend.onrender.com').replace(/\/$/, '');
    return `${base}/api/contact`;
  }, []);

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
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result?.error || result?.message || 'Failed to send message.');
      }

      setStatus({
        loading: false,
        message: 'Message sent! We will get back to you soon.',
        type: 'success',
      });

      // Clear form on success
      setFormData({
        full_name: '',
        email: '',
        subject: 'General Inquiry',
        message: '',
      });
    } catch (err: any) {
      console.error('Submission error:', err);
      setStatus({
        loading: false,
        message: err?.message || 'Something went wrong. Please try again later.',
        type: 'error',
      });
    }
  };

  return (
    <main className={styles.page}>
      {/* 1) HERO */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.heroKicker}>Contact</p>
          <h1 className={styles.heroTitle}>Let’s talk</h1>
          <p className={styles.heroSubtitle}>
            Questions, partnerships, or support — send us a message and we’ll respond.
          </p>
        </div>
      </section>

      {/* 2) MAIN CONTENT */}
      <section className={styles.contactSection}>
        <div className={styles.container}>
          <div className={styles.contactGrid}>
            
            {/* LEFT: INFO SIDEBAR */}
            <aside className={styles.infoSidebar}>
              <div className={styles.infoCard}>
                <div className={styles.iconWrapper}><Mail size={22} /></div>
                <div className={styles.infoText}>
                  <h3>Email</h3>
                  <a href="mailto:info@cmdi-ss.org">info@cmdi-ss.org</a>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.iconWrapper}><Phone size={22} /></div>
                <div className={styles.infoText}>
                  <h3>Phone</h3>
                  <a href="tel:+211000000000">+211 000 000 000</a>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.iconWrapper}><MapPin size={22} /></div>
                <div className={styles.infoText}>
                  <h3>Location</h3>
                  <p>Juba, South Sudan</p>
                </div>
              </div>

              <div className={styles.sideCallout}>
                <div className={styles.sideCalloutIcon}><Heart size={18} /></div>
                <div className={styles.sideCalloutText}>
                  <h4>Want to partner?</h4>
                  <p>Select <strong>Partnership Proposal</strong> and we'll prioritize your inquiry.</p>
                </div>
              </div>
            </aside>

            {/* RIGHT: FORM */}
            <div className={styles.formWrapper}>
              <div className={styles.formHeader}>
                <div className={styles.formHeaderIcon}><MessageSquare size={18} /></div>
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
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject">Subject / Interest</label>
                  <select id="subject" value={formData.subject} onChange={onChange('subject')}>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
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
              </form>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
