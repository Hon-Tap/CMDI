'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useMemo } from 'react';
import styles from './partners.module.css';
import { ArrowRight } from 'lucide-react';

type PartnerItem = {
  name: string;
  blurb: string;
  logo?: string; // optional: if you have images for each partner
};

function initialsFromName(name: string) {
  const parts = name
    .replace(/[()]/g, '')
    .split(' ')
    .filter(Boolean);

  const picks = parts.filter((p) => /^[A-Za-z]/.test(p));
  const a = picks[0]?.[0]?.toUpperCase() || 'P';
  const b = picks[1]?.[0]?.toUpperCase() || 'N';
  return `${a}${b}`;
}

function monogramDataUri(initials: string) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#0c74a5" stop-opacity="0.18"/>
        <stop offset="1" stop-color="#0284c7" stop-opacity="0.12"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="20" fill="url(#g)"/>
    <text x="50%" y="54%" text-anchor="middle"
      font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial"
      font-size="34" font-weight="900" fill="#0f172a" opacity="0.90">
      ${initials}
    </text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function PartnersPage() {
  // Reveal animation that matches your CSS (.reveal + .inView)
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal="true"]'));
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add(styles.inView);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

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
      logoSrc: '/images/partners/Thonmet.jpg',
      badge: 'Strategic Partner',
    }),
    []
  );

  const partners: PartnerItem[] = useMemo(
    () => [
      {
        name: 'Relief and Rehabilitation Commission (RRC)',
        blurb: 'Government coordination and regulatory support.',
        // logo: '/images/partners/rrc.png',
      },
      {
        name: 'Local Authorities',
        blurb: 'Community access, approvals, and operational alignment.',
        // logo: '/images/partners/local-authorities.png',
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

  return (
    <main className={styles.page}>
      {/* =========================
          HERO
      ========================= */}
      <section className={styles.hero}>
        <div className={styles.heroMedia} aria-hidden="true">
          <Image
            src="/images/partners/project-wash.jpeg"
            alt=""
            fill
            className={styles.heroImg}
            priority
            sizes="100vw"
          />
        </div>
        <div className={styles.heroOverlay} aria-hidden="true" />

        <div className={`${styles.heroContent} ${styles.reveal}`} data-reveal="true">
          <p className={styles.heroEyebrow}>Partnerships</p>
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
          <header className={`${styles.sectionHeader} ${styles.reveal}`} data-reveal="true">
            <span className={styles.sectionTag}>Collective Strength</span>
            <h2 className={styles.sectionTitle}>We don’t work alone.</h2>
            <p className={styles.sectionText}>
              Our partnerships strengthen coordination, improve accountability, and help us reach
              communities that need support the most.
            </p>
          </header>

          {/* Featured partner (matches CSS: text + shaped image) */}
          <div
            className={`${styles.featuredPartner} ${styles.reveal}`}
            data-reveal="true"
            style={{ ['--d' as any]: '80ms' }}
          >
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

            <div className={styles.partnerArt}>
              <div className={styles.partnerShape}>
                <div className={styles.partnerShapeInner}>
                  <Image
                    src={featuredPartner.logoSrc}
                    alt={`${featuredPartner.name} logo`}
                    fill
                    className={styles.partnerLogo}
                    sizes="(max-width: 960px) 82vw, 420px"
                  />
                </div>
                <div className={styles.partnerBadge}>{featuredPartner.badge}</div>
              </div>
            </div>
          </div>

          {/* Partner grid */}
          <div className={styles.partnerGrid}>
            {partners.map((p, idx) => {
              const fallback = monogramDataUri(initialsFromName(p.name));
              return (
                <article
                  key={p.name}
                  className={`${styles.partnerCard} ${styles.reveal}`}
                  data-reveal="true"
                  style={{ ['--d' as any]: `${120 + idx * 45}ms` }}
                >
                  <div className={styles.partnerCardTop}>
                    <div className={styles.partnerMark} aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.logo || fallback} alt="" />
                    </div>
                    <div>
                      <h4>{p.name}</h4>
                    </div>
                  </div>
                  <p>{p.blurb}</p>
                </article>
              );
            })}
          </div>

          {/* CTA — now links to FORM PAGE */}
          <div
            className={`${styles.partnerCTA} ${styles.reveal}`}
            data-reveal="true"
            style={{ ['--d' as any]: '160ms' }}
          >
            <h3>Become a CMDI Partner</h3>
            <p>
              Are you an organization looking to make a real difference on the ground in South
              Sudan? Let’s combine resources for greater reach and stronger outcomes.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
              <Link className={styles.ctaBtn} href="/partner-with-us" scroll>
                Partner With Us <ArrowRight size={18} />
              </Link>

              <Link className={styles.ctaBtn} href="/projects" scroll>
                View Our Work <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Optional: trust strip section that reuses your styles */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <header className={`${styles.sectionHeader} ${styles.reveal}`} data-reveal="true">
            <span className={styles.sectionTag}>How We Partner</span>
            <h2 className={styles.sectionTitle}>Clear, accountable collaboration</h2>
            <p className={styles.sectionText}>
              We align goals, plan jointly, and deliver with safeguarding and accountability at the core.
            </p>
          </header>

          <div className={styles.partnerGrid}>
            {[
              { title: 'Local Access', text: 'Strong community trust and practical field presence in Fangak.' },
              { title: 'Safeguarding', text: 'Child protection and accountability are non-negotiable.' },
              { title: 'Results Focused', text: 'We coordinate to deliver outcomes that matter for children.' },
            ].map((c, i) => (
              <article
                key={c.title}
                className={`${styles.partnerCard} ${styles.reveal}`}
                data-reveal="true"
                style={{ ['--d' as any]: `${i * 55}ms` }}
              >
                <div className={styles.partnerCardTop}>
                  <div className={styles.partnerMark} aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={monogramDataUri(c.title.slice(0, 2).toUpperCase())} alt="" />
                  </div>
                  <div>
                    <h4>{c.title}</h4>
                  </div>
                </div>
                <p>{c.text}</p>
              </article>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <Link className={styles.ctaBtn} href="/partner-with-us" scroll>
              Start a Partnership Request <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
