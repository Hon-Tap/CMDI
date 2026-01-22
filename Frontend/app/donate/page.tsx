'use client';

import React, { useMemo, useState } from 'react';
import styles from './donate.module.css';
import {
  Heart,
  ShieldCheck,
  Users,
  Zap,
  BookOpen,
  Droplets,
  Copy,
  CheckCircle2,
  ArrowRight,
  Info,
} from 'lucide-react';

type Tier = {
  amount: number;
  impact: string;
  desc: string;
  icon: React.ReactNode;
  featured?: boolean;
};

type Status = { type: '' | 'success' | 'error'; message: string };

export default function DonatePage() {
  const tiers: Tier[] = useMemo(
    () => [
      {
        amount: 25,
        impact: 'Back to School',
        desc: 'Provides learning materials for one child and supports classroom supplies in Fangak.',
        icon: <BookOpen size={40} />,
      },
      {
        amount: 75,
        impact: 'Clean Water Supporter',
        desc: 'Helps maintain community water points and hygiene supplies for families in hard-to-reach areas.',
        icon: <Droplets size={40} />,
        featured: true,
      },
      {
        amount: 150,
        impact: 'Youth Empowerment',
        desc: 'Supports vocational training, starter toolkits, and mentoring for young people to earn income.',
        icon: <Zap size={40} />,
      },
    ],
    []
  );

  const [customAmount, setCustomAmount] = useState<string>('');
  const [status, setStatus] = useState<Status>({ type: '', message: '' });

  const contactEmail = 'info@cmdi-ss.org';
  const volunteerEmail = 'volunteers@cmdi-ss.org';

  const handleCopyEmail = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus({ type: 'success', message: 'Copied to clipboard.' });
      setTimeout(() => setStatus({ type: '', message: '' }), 1800);
    } catch {
      setStatus({
        type: 'error',
        message: 'Copy failed. You can select and copy it manually.',
      });
    }
  };

  const normalizeAmount = (val: string) => {
    const cleaned = val.replace(/[^\d.]/g, '');
    // prevent multiple dots
    const parts = cleaned.split('.');
    const safe = parts.length <= 2 ? cleaned : `${parts[0]}.${parts.slice(1).join('')}`;
    return safe;
  };

  const getMailtoLink = (amount?: number) => {
    const amt = amount ?? Number(customAmount || 0);
    const subject = encodeURIComponent(`Donation inquiry — CMDI (${amt ? `$${amt}` : 'Custom'})`);
    const body = encodeURIComponent(
      [
        'Hello CMDI team,',
        '',
        `I would like to support CMDI${amt ? ` with a donation of $${amt}` : ''}.`,
        'Please share the available donation accounts / payment instructions.',
        '',
        'Name:',
        'Country:',
        'Preferred contact:',
        '',
        'Thank you.',
      ].join('\n')
    );
    return `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  const onSelectTier = (tier: Tier) => {
    // Payment not ready yet: guide user to contact + record intent
    setStatus({
      type: 'success',
      message: `Thanks! Donation channels are being finalized. Tap “Request payment details” to get instructions for $${tier.amount}.`,
    });
    setTimeout(() => setStatus({ type: '', message: '' }), 4200);
  };

  const onCustomCTA = () => {
    const amt = Number(customAmount || 0);
    if (!amt || amt < 1) {
      setStatus({ type: 'error', message: 'Enter a valid amount (at least $1).' });
      setTimeout(() => setStatus({ type: '', message: '' }), 2600);
      return;
    }
    setStatus({
      type: 'success',
      message: `Great — we’ll share donation instructions for $${amt}. Use “Request payment details”.`,
    });
    setTimeout(() => setStatus({ type: '', message: '' }), 4200);
  };

  return (
    <main className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} ${styles.animate}`}>
          <span className={styles.eyebrow}>Donate</span>
          <h1 className={styles.heroTitle}>Your support becomes real help on the ground.</h1>
          <p className={styles.heroSubtitle}>
            Our donation channels are being finalized. For now, you can choose an impact tier and request
            payment details by email — we’ll reply with the available accounts as soon as they’re ready.
          </p>

          <div className={styles.heroActions}>
            <a className={styles.primaryBtn} href={getMailtoLink()}>
              Request payment details <ArrowRight size={18} />
            </a>

            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => handleCopyEmail(contactEmail)}
            >
              Copy email <Copy size={18} />
            </button>
          </div>

          {status.message && (
            <div
              className={`${styles.alert} ${
                status.type === 'success' ? styles.alertSuccess : styles.alertError
              }`}
              role="status"
              aria-live="polite"
            >
              {status.type === 'success' ? <CheckCircle2 size={18} /> : <Info size={18} />}
              <span>{status.message}</span>
            </div>
          )}
        </div>
      </section>

      {/* TIERS */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Choose an impact tier</h2>
            <p className={styles.sectionSubtext}>
              These are examples of what support can enable. Exact allocation depends on urgent field needs.
            </p>
          </div>

          <div className={styles.tierGrid}>
            {tiers.map((tier, idx) => (
              <article
                key={tier.amount}
                className={`${styles.tierCard} ${tier.featured ? styles.tierFeatured : ''} ${
                  styles.animate
                }`}
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className={styles.tierIcon}>{tier.icon}</div>

                <div className={styles.tierTop}>
                  <span className={styles.tierImpact}>{tier.impact}</span>
                  {tier.featured && <span className={styles.featureTag}>Most popular</span>}
                </div>

                <div className={styles.tierAmount}>
                  <span className={styles.currency}>$</span>
                  {tier.amount}
                </div>

                <p className={styles.tierDesc}>{tier.desc}</p>

                <div className={styles.tierActions}>
                  <button
                    type="button"
                    className={`${styles.tierBtn} ${tier.featured ? styles.tierBtnActive : ''}`}
                    onClick={() => onSelectTier(tier)}
                  >
                    Choose ${tier.amount}
                  </button>

                  <a className={styles.tierLink} href={getMailtoLink(tier.amount)}>
                    Request payment details <ArrowRight size={16} />
                  </a>
                </div>
              </article>
            ))}
          </div>

          {/* CUSTOM AMOUNT */}
          <div className={`${styles.customCard} ${styles.animate}`} style={{ animationDelay: '0.28s' }}>
            <div className={styles.customText}>
              <h3>Prefer a custom amount?</h3>
              <p>Enter an amount and we’ll share donation instructions when accounts are available.</p>
            </div>

            <div className={styles.customControls}>
              <div className={styles.customInputWrap}>
                <span className={styles.customPrefix}>$</span>
                <input
                  className={styles.customInput}
                  inputMode="decimal"
                  placeholder="Amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(normalizeAmount(e.target.value))}
                />
              </div>

              <button type="button" className={styles.primaryBtnSmall} onClick={onCustomCTA}>
                Continue <ArrowRight size={18} />
              </button>

              <a className={styles.secondaryBtnSmall} href={getMailtoLink()}>
                Email us <MailIcon />
              </a>
            </div>

            <p className={styles.customNote}>
              You can also reach us at <strong>{contactEmail}</strong>. If you prefer volunteering, use{' '}
              <strong>{volunteerEmail}</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className={styles.trustSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why give to CMDI?</h2>
            <p className={styles.sectionSubtext}>
              We focus on practical delivery, community trust, and clear accountability.
            </p>
          </div>

          <div className={styles.trustGrid}>
            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>
                <ShieldCheck size={26} />
              </div>
              <h4>Accountability</h4>
              <p>
                We document activities and share updates so supporters can see what was delivered and where.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>
                <Users size={26} />
              </div>
              <h4>Local delivery</h4>
              <p>
                Our team and partners know the terrain and logistics realities — we work from within communities.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>
                <Heart size={26} />
              </div>
              <h4>Direct impact</h4>
              <p>
                Your support goes to real needs: education materials, WASH supplies, protection support, and tools.
              </p>
            </div>
          </div>

          <div className={styles.processCard}>
            <h3>How support moves to the field</h3>
            <ol className={styles.processList}>
              <li>
                <span className={styles.processStep}>01</span>
                <div>
                  <strong>You request payment details</strong>
                  <p>We respond with the available donation accounts (coming soon).</p>
                </div>
              </li>
              <li>
                <span className={styles.processStep}>02</span>
                <div>
                  <strong>We confirm & record</strong>
                  <p>Your support is logged for transparency and reporting.</p>
                </div>
              </li>
              <li>
                <span className={styles.processStep}>03</span>
                <div>
                  <strong>Delivery & update</strong>
                  <p>Funds are used for priority needs, and we publish updates through our News page.</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}

/** Tiny icon wrapper to avoid adding lucide Mail import just for one button */
function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6h16v12H4V6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
