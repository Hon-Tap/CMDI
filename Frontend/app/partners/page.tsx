'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './partners.module.css';
import {
  Handshake,
  Globe,
  Award,
  ShieldCheck,
  X,
  Send,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

type StatusState = { loading: boolean; success: boolean; error: string };

export default function PartnersPage() {
  // -----------------------------
  // Modal + form state
  // -----------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [status, setStatus] = useState<StatusState>({
    loading: false,
    success: false,
    error: '',
  });

  const [formData, setFormData] = useState({
    org_name: '',
    contact_person: '',
    email: '',
    partnership_type: 'NGO',
    proposal_summary: '',
  });

  const closeTimeoutRef = useRef<number | null>(null);

  const openModal = () => {
    setIsModalOpen(true);
    setIsClosing(false);
    setStatus({ loading: false, success: false, error: '' });
  };

  const closeModal = () => {
    // play closing animation then unmount
    setIsClosing(true);
    if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      setStatus({ loading: false, success: false, error: '' });
    }, 220);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // -----------------------------
  // Partner data
  // -----------------------------
  const featuredPartner = useMemo(
    () => ({
      name: 'Thon Met African Peace Foundation',
      description:
        'A key community-based partner strengthening peacebuilding and service delivery through coordination with local systems and humanitarian clusters.',
      clusters: [
        'Local Authority',
        'RRC',
        'Education Cluster',
        'WASH Cluster',
        'Nutrition Cluster',
        'Protection Cluster',
      ],
      // If you have the logo image in your public folder, update this path:
      logoSrc: '/images/partners/thon-met.png',
    }),
    []
  );

  const partners = useMemo(
    () => [
      {
        name: 'Relief and Rehabilitation Commission (RRC)',
        blurb: 'Government coordination and regulatory support.',
      },
      {
        name: 'Local Authorities',
        blurb: 'Community access, approvals, and operational alignment.',
      },
      {
        name: 'Education Cluster',
        blurb: 'Coordination for school access, supplies, and learning support.',
      },
      {
        name: 'WASH Cluster',
        blurb: 'Technical standards and field coordination for WASH response.',
      },
      {
        name: 'Nutrition Cluster',
        blurb: 'Linkages for nutrition programming and referrals.',
      },
      {
        name: 'Protection Cluster',
        blurb: 'Safeguarding, referrals, and protection mainstreaming.',
      },
    ],
    []
  );

  // -----------------------------
  // Submission
  // -----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    try {
      const res = await fetch('http://127.0.0.1:8000/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ loading: false, success: true, error: '' });

        // Auto-close after a short delay
        window.setTimeout(() => {
          setFormData({
            org_name: '',
            contact_person: '',
            email: '',
            partnership_type: 'NGO',
            proposal_summary: '',
          });
          closeModal();
        }, 1700);
      } else {
        throw new Error(data?.error || 'Something went wrong');
      }
    } catch (err: any) {
      setStatus({ loading: false, success: false, error: err?.message || 'Submission failed' });
    }
  };

  // Close on ESC
  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') closeModal();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  return (
    <main className={styles.page}>
      {/* =========================
          MODAL
      ========================= */}
      {isModalOpen && (
        <div
          className={`${styles.modalOverlay} ${isClosing ? styles.isClosing : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Partnership Proposal"
          onMouseDown={(e) => {
            // click backdrop to close
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className={`${styles.modalContent} ${isClosing ? styles.isClosing : ''}`}>
            <button className={styles.closeBtn} onClick={closeModal} aria-label="Close modal">
              <X size={20} />
            </button>

            {status.success ? (
              <div className={styles.successState}>
                <CheckCircle2 size={80} />
                <h2 className={styles.successTitle}>Proposal Received!</h2>
                <p>
                  Thank you for reaching out. Our partnership team will contact you within 3–5
                  business days.
                </p>
              </div>
            ) : (
              <div className={styles.modalBody}>
                <div className={styles.modalHeader}>
                  <Handshake size={40} />
                  <h2>Partnership Proposal</h2>
                  <p>Tell us how your organization can work with CMDI.</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="org_name">Organization Name</label>
                    <input
                      id="org_name"
                      type="text"
                      placeholder="e.g. Thon Met African Peace Foundation"
                      required
                      value={formData.org_name}
                      onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
                    />
                  </div>

                  <div className={styles.row}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="contact_person">Contact Person</label>
                      <input
                        id="contact_person"
                        type="text"
                        placeholder="Your Name"
                        required
                        value={formData.contact_person}
                        onChange={(e) =>
                          setFormData({ ...formData, contact_person: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="email">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="email@org.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="partnership_type">Partnership Type</label>
                    <select
                      id="partnership_type"
                      value={formData.partnership_type}
                      onChange={(e) =>
                        setFormData({ ...formData, partnership_type: e.target.value })
                      }
                    >
                      <option value="NGO">Non-Governmental Organization (NGO)</option>
                      <option value="Government">Governmental Body</option>
                      <option value="Corporate">Corporate / Private Sector</option>
                      <option value="Funding">Funding / Donor Agency</option>
                      <option value="Technical">Technical / Advisory Partner</option>
                    </select>
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="proposal_summary">Brief Proposal Summary</label>
                    <textarea
                      id="proposal_summary"
                      rows={4}
                      placeholder="Describe the area of collaboration..."
                      required
                      value={formData.proposal_summary}
                      onChange={(e) =>
                        setFormData({ ...formData, proposal_summary: e.target.value })
                      }
                    />
                  </div>

                  {status.error && (
                    <p style={{ color: '#ef4444', fontWeight: 700, margin: '0.25rem 0 0' }}>
                      {status.error}
                    </p>
                  )}

                  <button type="submit" className={styles.submitBtn} disabled={status.loading}>
                    {status.loading ? 'Submitting...' : 'Send Proposal'} <Send size={18} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================
          HERO
      ========================= */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}>PARTNERSHIPS</div>
          <h1 className={styles.heroTitle}>Our Partners</h1>
          <p className={styles.heroSubtitle}>
            Collaboration is the heartbeat of CMDI. We work with local systems, clusters, and
            organizations to deliver sustainable impact across South Sudan.
          </p>
        </div>
      </section>

      {/* =========================
          CONTENT
      ========================= */}
      <section className={styles.section}>
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Collective Strength</span>
            <h2 className={styles.sectionTitle}>We don’t work alone.</h2>
            <p className={styles.sectionText}>
              Our partnerships strengthen coordination, improve accountability, and help us reach
              communities that need support the most.
            </p>
          </header>

          {/* Featured partner */}
         <div className={styles.featuredPartner}>
  <div>
    <img
      className={styles.partnerLogo}
      src="/images/partners/Thonmet.jpg"
      alt="Thon Men African Peace Foundation logo"
      loading="eager"
    />
  </div>


            <div>
              <h3 className={styles.partnerName}>{featuredPartner.name}</h3>
              <p className={styles.partnerDescription}>{featuredPartner.description}</p>

              <div className={styles.clusterList}>
                {featuredPartner.clusters.map((c) => (
                  <span key={c} className={styles.clusterTag}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Other partners */}
          <div className={styles.partnerGrid}>
            {partners.map((p) => (
              <article key={p.name} className={styles.partnerCard}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 18,
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 0.75rem',
                    background: 'rgba(0, 174, 239, 0.10)',
                    border: '1px solid rgba(0, 174, 239, 0.25)',
                  }}
                  aria-hidden="true"
                >
                  <Handshake size={30} />
                </div>
                <h4>{p.name}</h4>
                <p>{p.blurb}</p>
              </article>
            ))}
          </div>

          {/* CTA */}
          <div className={styles.partnerCTA}>
            <h3>Become a CMDI Partner</h3>
            <p>
              Are you an organization looking to make a real difference on the ground in South
              Sudan? Let’s combine resources for greater reach and stronger outcomes.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
              <button className={styles.ctaBtn} onClick={openModal}>
                Partner with Us <ArrowRight size={18} />
              </button>
              <a className={styles.ctaBtn} href="/projects">
                View Our Work <ArrowRight size={18} />
              </a>
            </div>
          </div>

          {/* (Optional) Mini credibility row — keep if you want */}
          <div style={{ marginTop: '3.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div style={{ padding: '1.3rem 1.2rem', border: '1px solid rgba(15,23,42,0.08)', borderRadius: 18, background: '#fff', boxShadow: '0 10px 26px rgba(2,6,23,0.05)' }}>
              <Globe size={22} />
              <div style={{ fontWeight: 900, marginTop: 8 }}>Local Access</div>
              <div style={{ color: '#64748b', marginTop: 6, lineHeight: 1.6 }}>
                Deep roots in hard-to-reach areas like Fangak.
              </div>
            </div>

            <div style={{ padding: '1.3rem 1.2rem', border: '1px solid rgba(15,23,42,0.08)', borderRadius: 18, background: '#fff', boxShadow: '0 10px 26px rgba(2,6,23,0.05)' }}>
              <ShieldCheck size={22} />
              <div style={{ fontWeight: 900, marginTop: 8 }}>Accountability</div>
              <div style={{ color: '#64748b', marginTop: 6, lineHeight: 1.6 }}>
                Clear reporting and strong safeguarding standards.
              </div>
            </div>

            <div style={{ padding: '1.3rem 1.2rem', border: '1px solid rgba(15,23,42,0.08)', borderRadius: 18, background: '#fff', boxShadow: '0 10px 26px rgba(2,6,23,0.05)' }}>
              <Award size={22} />
              <div style={{ fontWeight: 900, marginTop: 8 }}>Proven Delivery</div>
              <div style={{ color: '#64748b', marginTop: 6, lineHeight: 1.6 }}>
                Practical results through coordinated field work.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
