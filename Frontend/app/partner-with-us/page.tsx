'use client';

import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import styles from './partner-with-us.module.css';
import { ArrowRight, CheckCircle2, Send } from 'lucide-react';

type StatusState = { loading: boolean; success: boolean; error: string };

type PartnershipType =
  | 'NGO'
  | 'Government'
  | 'UN/INGO'
  | 'Corporate'
  | 'Foundation/Donor'
  | 'Academic'
  | 'Faith-based'
  | 'Technical';

type FocusArea =
  | 'Education'
  | 'Child Protection'
  | 'WASH'
  | 'Health & Nutrition'
  | 'Livelihoods'
  | 'Peacebuilding'
  | 'Emergency Response'
  | 'Advocacy & Community Engagement';

export default function PartnerWithUsPage() {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000';

  const focusAreas: FocusArea[] = useMemo(
    () => [
      'Education',
      'Child Protection',
      'WASH',
      'Health & Nutrition',
      'Livelihoods',
      'Peacebuilding',
      'Emergency Response',
      'Advocacy & Community Engagement',
    ],
    []
  );

  const [status, setStatus] = useState<StatusState>({ loading: false, success: false, error: '' });

  const [formData, setFormData] = useState({
    organization_name: '',
    organization_type: 'NGO' as PartnershipType,
    contact_name: '',
    contact_title: '',
    email: '',
    phone: '',
    country: 'South Sudan',
    website: '',
    focus_areas: [] as FocusArea[],
    partnership_interest: 'Funding' as 'Funding' | 'Implementation' | 'Technical' | 'Referral/Coordination' | 'Other',
    proposed_support: '',
    consent: false,
  });

  const toggleFocus = (area: FocusArea) => {
    setFormData((prev) => {
      const exists = prev.focus_areas.includes(area);
      return {
        ...prev,
        focus_areas: exists ? prev.focus_areas.filter((a) => a !== area) : [...prev.focus_areas, area],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    if (!formData.focus_areas.length) {
      setStatus({ loading: false, success: false, error: 'Please select at least one focus area.' });
      return;
    }
    if (!formData.consent) {
      setStatus({ loading: false, success: false, error: 'Please confirm consent so we can contact you.' });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.error || data?.message || 'Submission failed');

      setStatus({ loading: false, success: true, error: '' });

      // Optional reset after success
      setFormData({
        organization_name: '',
        organization_type: 'NGO',
        contact_name: '',
        contact_title: '',
        email: '',
        phone: '',
        country: 'South Sudan',
        website: '',
        focus_areas: [],
        partnership_interest: 'Funding',
        proposed_support: '',
        consent: false,
      });
    } catch (err: any) {
      setStatus({ loading: false, success: false, error: err?.message || 'Submission failed' });
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Partner With CMDI</p>
            <h1 className={styles.title}>Let’s collaborate for children and communities</h1>
            <p className={styles.subtitle}>
              Share a few details. We’ll review and reach out to discuss the best partnership pathway.
            </p>

            <div className={styles.heroActions}>
              <Link className={styles.btnLight} href="/partners" scroll>
                View Partners <ArrowRight size={18} />
              </Link>
              <Link className={styles.btnGhost} href="/projects" scroll>
                See Our Work <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Left info card */}
            <aside className={styles.infoCard}>
              <h2 className={styles.cardTitle}>What to include</h2>
              <p className={styles.cardText}>
                Keep it simple. Tell us what you want to support and how you prefer to collaborate.
              </p>

              <ul className={styles.bullets}>
                <li>Organization type and contact person</li>
                <li>Focus areas (Education, WASH, Child Protection…)</li>
                <li>Support plan (funding, technical, implementation, coordination)</li>
              </ul>

              <div className={styles.noteBox}>
                <div className={styles.noteTitle}>Need a quick response?</div>
                <div className={styles.noteText}>
                  Use a clear email address and phone number so we can reach you easily.
                </div>
              </div>
            </aside>

            {/* Form card */}
            <div className={styles.formCard}>
              {status.success ? (
                <div className={styles.successBox}>
                  <CheckCircle2 size={64} />
                  <h2>Request received</h2>
                  <p>
                    Thank you. CMDI will contact you soon to explore collaboration.
                  </p>
                  <Link className={styles.btnPrimary} href="/partners" scroll>
                    Back to Partners <ArrowRight size={18} />
                  </Link>
                </div>
              ) : (
                <>
                  <h2 className={styles.formTitle}>Partnership Request</h2>
                  <p className={styles.formHint}>
                    Fields marked * are required.
                  </p>

                  <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="org">Organization Name *</label>
                        <input
                          id="org"
                          required
                          value={formData.organization_name}
                          onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                          placeholder="e.g. Organization name"
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label htmlFor="type">Organization Type *</label>
                        <select
                          id="type"
                          value={formData.organization_type}
                          onChange={(e) => setFormData({ ...formData, organization_type: e.target.value as PartnershipType })}
                        >
                          <option value="NGO">NGO</option>
                          <option value="UN/INGO">UN / INGO</option>
                          <option value="Government">Government</option>
                          <option value="Corporate">Corporate</option>
                          <option value="Foundation/Donor">Foundation / Donor</option>
                          <option value="Academic">Academic</option>
                          <option value="Faith-based">Faith-based</option>
                          <option value="Technical">Technical / Advisory</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.row}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="name">Contact Person *</label>
                        <input
                          id="name"
                          required
                          value={formData.contact_name}
                          onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                          placeholder="Full name"
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label htmlFor="title">Role / Title</label>
                        <input
                          id="title"
                          value={formData.contact_title}
                          onChange={(e) => setFormData({ ...formData, contact_title: e.target.value })}
                          placeholder="e.g. Program Manager"
                        />
                      </div>
                    </div>

                    <div className={styles.row}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="email">Email *</label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="email@org.com"
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label htmlFor="phone">Phone</label>
                        <input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+211..."
                        />
                      </div>
                    </div>

                    <div className={styles.row}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="country">Country</label>
                        <input
                          id="country"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          placeholder="Country"
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label htmlFor="website">Website</label>
                        <input
                          id="website"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Focus Areas *</label>
                      <div className={styles.chipRow}>
                        {focusAreas.map((a) => {
                          const active = formData.focus_areas.includes(a);
                          return (
                            <button
                              key={a}
                              type="button"
                              className={`${styles.chipBtn} ${active ? styles.chipActive : ''}`}
                              onClick={() => toggleFocus(a)}
                              aria-pressed={active}
                            >
                              {a}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="interest">Partnership Interest *</label>
                      <select
                        id="interest"
                        value={formData.partnership_interest}
                        onChange={(e) =>
                          setFormData({ ...formData, partnership_interest: e.target.value as any })
                        }
                      >
                        <option value="Funding">Funding / Donor support</option>
                        <option value="Implementation">Co-implementation</option>
                        <option value="Technical">Technical assistance</option>
                        <option value="Referral/Coordination">Referral / Coordination</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="support">Proposed Support *</label>
                      <textarea
                        id="support"
                        required
                        rows={5}
                        value={formData.proposed_support}
                        onChange={(e) => setFormData({ ...formData, proposed_support: e.target.value })}
                        placeholder="Briefly describe what you want to support and how..."
                      />
                    </div>

                    <label className={styles.consent}>
                      <input
                        type="checkbox"
                        checked={formData.consent}
                        onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                      />
                      <span>I consent to CMDI contacting me about this request.</span>
                    </label>

                    {status.error && <p className={styles.error}>{status.error}</p>}

                    <button className={styles.submitBtn} type="submit" disabled={status.loading}>
                      {status.loading ? 'Submitting...' : 'Send Request'} <Send size={18} />
                    </button>

                    <p className={styles.smallNote}>
                      Tip: For deployment, set <strong>NEXT_PUBLIC_API_BASE_URL</strong> to your backend domain.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
