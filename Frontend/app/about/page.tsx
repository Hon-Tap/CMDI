'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import styles from './about.module.css';
import {
  Target,
  Heart,
  Shield,
  Users,
  Globe,
  Lightbulb,
  X,
  ArrowRight,
} from 'lucide-react';

type TeamRole = {
  key: 'executiveDirector' | 'programManager' | 'adminFinance' | 'fieldCoordinator';
  name: string;
  title: string;
  image: string;
  blurb: string;
  responsibilities: string[];
};

export default function AboutPage() {
  const team: TeamRole[] = useMemo(
    () => [
      {
        key: 'executiveDirector',
        name: 'Jal Bhap Biel',
        title: 'Founder & Executive Director',
        image: '/images/about/JalBhap.jpeg',
        blurb:
          'Provides overall leadership and strategic direction for CMDI, ensuring inclusive programming that protects vulnerable children and children with disabilities.',
        responsibilities: [
          'Sets organizational strategy and priorities',
          'Leads partnerships and representation',
          'Drives resource mobilization and donor engagement',
          'Ensures accountable and effective program delivery',
        ],
      },
      {
        key: 'programManager',
        name: 'Michael Taban Wanjang',
        title: 'Program Manager',
        image: '/images/team/MichaelTabanWanjang.jpeg',
        blurb:
          'Oversees planning, implementation, and monitoring to ensure CMDI services are inclusive, safe, and aligned with child protection and disability inclusion standards.',
        responsibilities: [
          'Plans and coordinates program implementation',
          'Monitors results, quality, and compliance',
          'Works with field teams and partners for delivery',
          'Supports reporting and learning for improvement',
        ],
      },
      {
        key: 'adminFinance',
        name: 'James Kuoch Wal Keat',
        title: 'Admin & Finance Manager',
        image: '/images/team/JamesKuochWalKeat.jpeg',
        blurb:
          'Manages financial, administrative, and operational systems to ensure transparency, efficiency, and compliance across CMDI operations.',
        responsibilities: [
          'Manages budgeting and financial controls',
          'Ensures compliance and documentation',
          'Oversees procurement and administration systems',
          'Strengthens operational efficiency and accountability',
        ],
      },
      {
        key: 'fieldCoordinator',
        name: 'Bateah Bilieuwang',
        title: 'Field Coordinator (Fangak County)',
        image: '/images/team/BateahBilieuwang.jpeg',
        blurb:
          'Oversees day-to-day field operations and coordinates community-level implementation to ensure activities are delivered safely, on time, and to standard.',
        responsibilities: [
          'Coordinates field teams and daily operations',
          'Liaises with local authorities and communities',
          'Ensures safety, timeliness, and quality in delivery',
          'Tracks field progress and escalates challenges',
        ],
      },
    ],
    []
  );

  const [openKey, setOpenKey] = useState<TeamRole['key'] | null>(null);
  const activeMember = team.find((m) => m.key === openKey) ?? null;

  const openModal = (key: TeamRole['key']) => setOpenKey(key);
  const closeModal = () => setOpenKey(null);

  return (
    <main className={styles.page}>
      {/* 1) HERO */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} ${styles.animate}`}>
          <span className={styles.sectionEyebrow} style={{ color: '#fff', opacity: 0.85 }}>
            Who We Are
          </span>

          {/* REQUIRED HERO LINE */}
          <h1 className={styles.heroTitle}>
            Supporting Vulnerable Children and Children with Disabilities.
          </h1>

          <p className={styles.heroSubtitle}>
            Children with disabilities and other vulnerable children face heightened risks of
            exclusion, neglect, and abuse. Children&apos;s Mission for Development Initiative (CMDI)
            is committed to ensuring that no child is left behind, regardless of physical, sensory,
            intellectual, or psychosocial challenges.
          </p>

          <div className={styles.heroActions}>
            <a className={styles.btnPrimary} href="/donate">
              Support Our Work <ArrowRight size={18} />
            </a>
            <a className={styles.btnOutline} href="/contact">
              Partner With Us <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* 2) OUR STORY (REPURPOSED AS OUR APPROACH — SAME STYLING/STRUCTURE) */}
      <section className={styles.storySection}>
        <div className={styles.container}>
          <div className={styles.gridTwo}>
            <div className={styles.textBlock}>
              <span className={`${styles.sectionEyebrow} ${styles.animate}`}>Our Approach</span>
              <h2 className={`${styles.sectionTitle} ${styles.animate} ${styles.delay1}`}>
                Inclusive, child-centered support that protects dignity and expands access.
              </h2>

              <div className={`${styles.animate} ${styles.delay2}`}>
                <p>
                  CMDI delivers inclusive, child-centered support that promotes dignity, protection,
                  and equal access to essential services.
                </p>

                <p>
                  <strong>Inclusive Education:</strong> Supporting children with disabilities to
                  access safe, inclusive learning environments through adapted teaching methods,
                  learning materials, and teacher training.
                </p>

                <p>
                  <strong>Child Protection &amp; Case Management:</strong> Identifying vulnerable
                  children, providing psychosocial support, and referring severe cases to
                  specialized services in line with child protection standards.
                </p>

                <p>
                  <strong>Community-Based Rehabilitation (CBR):</strong> Working with families and
                  communities to support children with disabilities through home-based care,
                  rehabilitation guidance, and social inclusion.
                </p>

                <p>
                  <strong>Health, Nutrition &amp; WASH Support:</strong> Improving access to basic
                  health care, nutrition services, assistive devices, clean water, and accessible
                  sanitation facilities.
                </p>

                <p>
                  <strong>Parental &amp; Caregiver Support:</strong> Strengthening caregivers&apos;
                  capacity through awareness sessions on disability inclusion, positive parenting,
                  and child rights.
                </p>

                <p>
                  <strong>Advocacy &amp; Awareness:</strong> Reducing stigma and discrimination by
                  engaging community leaders, teachers, and parents to promote acceptance and
                  inclusion.
                </p>
              </div>

              {/* Micro-stats row kept for layout consistency (text updated) */}
              <div className={`${styles.storyStats} ${styles.animate} ${styles.delay3}`}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>Inclusive</span>
                  <span className={styles.statLabel}>Education</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>Protection</span>
                  <span className={styles.statLabel}>Case Management</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>Access</span>
                  <span className={styles.statLabel}>Health &amp; WASH</span>
                </div>
              </div>
            </div>

            <div className={`${styles.imageFrame} ${styles.animate} ${styles.delay3}`}>
              <Image
                src="/images/about/story-image.jpeg"
                alt="CMDI supporting vulnerable children and children with disabilities"
                fill
                className={styles.storyImg}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3) VISION / MISSION / GOAL (REWRITTEN TO MATCH THE NEW THEME) */}
      <section className={styles.visionSection}>
        <div className={styles.visionOverlay} />
        <div className={styles.container}>
          <div className={styles.visionHeader}>
            <span
              className={`${styles.sectionEyebrow} ${styles.animate}`}
              style={{ color: '#fff', opacity: 0.85 }}
            >
              What We Stand For
            </span>
            <h2
              className={`${styles.sectionTitle} ${styles.animate} ${styles.delay1}`}
              style={{ color: '#fff' }}
            >
              Inclusion, Protection &amp; Equal Opportunity
            </h2>
          </div>

          <div className={styles.visionGrid}>
            <div className={`${styles.visionCard} ${styles.animate} ${styles.delay1}`}>
              <div className={styles.iconBox}>
                <Globe size={32} />
              </div>
              <h3 className={styles.cardTitle}>Our Commitment</h3>
              <p className={styles.cardText}>
                CMDI is committed to ensuring that no child is left behind, regardless of physical,
                sensory, intellectual, or psychosocial challenges.
              </p>
            </div>

            <div className={`${styles.visionCard} ${styles.animate} ${styles.delay2}`}>
              <div className={styles.iconBox}>
                <Target size={32} />
              </div>
              <h3 className={styles.cardTitle}>Our Impact</h3>
              <p className={styles.cardText}>
                Through partnerships with communities, local authorities, and humanitarian actors,
                CMDI helps vulnerable children and children with disabilities access education and
                protection services, improve wellbeing and self-reliance, and participate
                meaningfully in family and community life.
              </p>
            </div>

            <div className={`${styles.visionCard} ${styles.animate} ${styles.delay3}`}>
              <div className={styles.iconBox}>
                <Shield size={32} />
              </div>
              <h3 className={styles.cardTitle}>Our Belief</h3>
              <p className={styles.cardText}>
                CMDI believes that disability is not inability — with the right support, every
                child can learn, grow, and thrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4) VALUES (SAME STYLING, UPDATED WORDING TO FIT INCLUSION THEME) */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <div className={`${styles.valuesIntro} ${styles.animate}`}>
            <span className={styles.sectionEyebrow}>What Drives Us</span>
            <h2 className={styles.sectionTitle}>Our Core Values</h2>
            <p className={styles.sectionSubtext}>
              The principles behind inclusive support, dignity, and protection for every child.
            </p>
          </div>

          <div className={styles.valuesGrid}>
            {[
              { name: 'Inclusion & Accessibility', icon: <Globe size={24} /> },
              { name: 'Child Protection First', icon: <Shield size={24} /> },
              { name: 'Dignity & Respect', icon: <Heart size={24} /> },
              { name: 'Community Partnership', icon: <Users size={24} /> },
              { name: 'Compassion in Action', icon: <Heart size={24} /> },
              { name: 'Learning & Sustainability', icon: <Lightbulb size={24} /> },
            ].map((value, index) => (
              <div
                key={value.name}
                className={`${styles.valueItem} ${styles.animate} ${
                  styles[`delay${(index % 3) + 1}`]
                }`}
              >
                <div className={styles.valueIcon}>{value.icon}</div>
                <h4 className={styles.valueTitle}>{value.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5) TEAM (KEEP AS-IS FOR STYLING/STRUCTURE) */}
      <section className={styles.teamSection}>
        <div className={styles.container}>
          <div className={styles.teamHeader}>
            <div>
              <span className={`${styles.sectionEyebrow} ${styles.animate}`}>Leadership</span>
              <h2 className={`${styles.sectionTitle} ${styles.animate} ${styles.delay1}`}>
                Meet the Team
              </h2>
            </div>
            <p className={`${styles.teamIntro} ${styles.animate} ${styles.delay2}`}>
              CMDI is led by professionals, local experts, and volunteers committed to the dignity,
              protection, and inclusion of vulnerable children and children with disabilities. Click
              a profile to view role responsibilities.
            </p>
          </div>

          <div className={styles.teamGrid}>
            {team.map((member, idx) => (
              <button
                key={member.key}
                type="button"
                className={`${styles.teamCard} ${styles.animate} ${
                  styles[`delay${(idx % 3) + 1}`]
                }`}
                onClick={() => openModal(member.key)}
              >
                <div className={styles.memberImageWrapper} aria-hidden="true">
                  <Image
                    src={member.image}
                    alt={`${member.name} portrait`}
                    fill
                    className={styles.memberImg}
                  />
                </div>

                <div className={styles.memberMeta}>
                  <h3 className={styles.memberName}>{member.name}</h3>
                  <p className={styles.memberRole}>{member.title}</p>
                  <p className={styles.memberHint}>
                    View role details <ArrowRight size={16} />
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Modal */}
        {activeMember && (
          <div
            className={styles.modalOverlay}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeMember.name} role details`}
            onClick={closeModal}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={styles.modalClose}
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className={styles.modalHeader}>
                <div className={styles.modalAvatar}>
                  <Image
                    src={activeMember.image}
                    alt={activeMember.name}
                    fill
                    className={styles.memberImg}
                  />
                </div>

                <div className={styles.modalTitleBlock}>
                  <h3 className={styles.modalName}>{activeMember.name}</h3>
                  <p className={styles.modalRole}>{activeMember.title}</p>
                </div>
              </div>

              <p className={styles.modalBlurb}>{activeMember.blurb}</p>

              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Key Responsibilities</h4>
                <ul className={styles.modalList}>
                  {activeMember.responsibilities.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.modalActions}>
                <a className={styles.btnPrimary} href="/contact">
                  Contact CMDI <ArrowRight size={18} />
                </a>
                <a className={styles.btnOutline} href="/partners">
                  Become a Partner <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
