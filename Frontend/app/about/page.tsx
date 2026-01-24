'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import styles from './about.module.css';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  Globe,
  Heart,
  Lightbulb,
  Mail,
  MapPin,
  Phone,
  Shield,
  Target,
  Users,
  X,
} from 'lucide-react';

type LeadershipKey =
  | 'executiveDirector'
  | 'programManager'
  | 'adminFinance'
  | 'fieldCoordinator';

type LeadershipMember = {
  key: LeadershipKey;
  name: string;
  title: string;
  image: string;
  blurb: string;
  responsibilities: string[];
};

type RoleCard = {
  title: string;
  responsibilities: string[];
};

export default function AboutPage() {
  // --- reveal-on-scroll animations (small, tasteful) ---
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal="true"]'));
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.inView);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const leadership: LeadershipMember[] = useMemo(
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
        name: 'Bateah Bilieu wang',
        title: 'Program Manager',
        image: '/images/team/BateahBilieuwang.jpeg',
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
        image: '/images/team/JamesKuochwalkeat.jpeg',
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
        name: 'Micheal Taban Wanjang',
        title: 'Field Coordinator (Fangak County)',
        image: '/images/team/MichealTabanWanjang.jpeg',
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

  const roles: RoleCard[] = useMemo(
    () => [
      {
        title: 'Monitoring, Evaluation & Learning (MEAL) Officer',
        responsibilities: [
          'Designs and implements M&E frameworks and tools',
          'Collects, analyzes, and reports project data',
          'Tracks performance indicators and outputs',
          'Leads learning and improvement processes',
          'Ensures accountability and feedback mechanisms',
        ],
      },
      {
        title: 'Education Program Officer',
        responsibilities: [
          'Leads education activities and supports schools',
          'Coordinates with Education Cluster and authorities',
          'Trains teachers and school management committees',
          'Distributes learning materials and supports curriculum',
          'Monitors enrollment, retention, and performance',
        ],
      },
      {
        title: 'Child Protection Officer',
        responsibilities: [
          'Leads child protection and safeguarding programming',
          'Handles case management and referral systems',
          'Trains staff and communities on child rights and safety',
          'Establishes and supports child protection committees',
          'Coordinates with the Child Protection Cluster',
        ],
      },
      {
        title: 'WASH Officer',
        responsibilities: [
          'Plans and implements WASH projects in schools and communities',
          'Leads hygiene promotion and sanitation campaigns',
          'Coordinates water infrastructure and repairs',
          'Trains community volunteers on hygiene and water use',
          'Monitors WASH indicators and reports progress',
        ],
      },
      {
        title: 'Logistics & Procurement Officer',
        responsibilities: [
          'Manages procurement of goods and services',
          'Coordinates logistics, transport, and warehousing',
          'Ensures asset tracking and inventory management',
          'Supports field delivery and supply chain needs',
          'Prepares procurement plans and vendor databases',
        ],
      },
      {
        title: 'Communications & Fundraising Officer',
        responsibilities: [
          'Leads organizational visibility and storytelling',
          'Prepares donor reports, newsletters, and media',
          'Maintains website and social media platforms',
          'Develops fundraising proposals and campaigns',
          'Builds relationships with donors and partners',
        ],
      },
    ],
    []
  );

  const coreValues = useMemo(
    () => [
      'Child centeredness',
      'Integrity',
      'Community empowerment',
      'Equity',
      'Partnership',
      'Compassion',
      'Inclusiveness',
      'Accountability',
      'Sustainability',
    ],
    []
  );

  const objectives = useMemo(
    () => [
      {
        title: 'Improve access to education',
        text:
          'Address conflict, poverty, and social barriers while investing in infrastructure, teacher training, inclusive education, accelerated learning, and school meals.',
        icon: <Target size={18} />,
      },
      {
        title: 'Strengthen healthcare systems',
        text:
          'Support routine immunization and continuous access to care by engaging families and communities to improve health equity in under-served areas.',
        icon: <Heart size={18} />,
      },
      {
        title: 'Provide child protection services',
        text:
          'Prevent and respond to violence against children, promote positive parenting, and ensure access to education, health, and psychosocial support.',
        icon: <Shield size={18} />,
      },
      {
        title: 'Improve WASH (Water, Sanitation & Hygiene)',
        text:
          'Increase access to safe water and sanitation through boreholes, purification solutions, latrines, and hygiene promotion with strong monitoring.',
        icon: <Globe size={18} />,
      },
      {
        title: 'Peace-building and reconciliation',
        text:
          'Transform negative relationships, repair community structures, and strengthen belonging through inclusive dialogue and conflict resolution.',
        icon: <Users size={18} />,
      },
      {
        title: 'Youth & women empowerment',
        text:
          'Deliver vocational training, life skills, microfinance and income-generating initiatives, mentorship, and leadership development.',
        icon: <Lightbulb size={18} />,
      },
      {
        title: 'Livelihoods',
        text: 'Skills training for youth and parents to strengthen household resilience and self-reliance.',
        icon: <BadgeCheck size={18} />,
      },
    ],
    []
  );

  const areasOfFocus = useMemo(
    () => [
      'Education',
      'Child Protection',
      'WASH (Water, Sanitation and Hygiene)',
      'Emergency Response & Resilience',
      'Advocacy and Community Engagement',
    ],
    []
  );

  const [openKey, setOpenKey] = useState<LeadershipKey | null>(null);
  const activeMember = leadership.find((m) => m.key === openKey) ?? null;

  const openModal = (key: LeadershipKey) => setOpenKey(key);
  const closeModal = () => setOpenKey(null);

  return (
    <main className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} aria-hidden="true" />

        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={`${styles.heroText} ${styles.reveal}`} data-reveal="true">
              <p className={styles.kicker}>Children’s Mission For Development Initiative</p>
              <h1 className={styles.heroTitle}>CMDI</h1>
              <p className={styles.motto}>Motto: Empowering Children and Transforming Communities.</p>

              <p className={styles.heroLead}>
                CMDI is a child-focused, community-driven non-profit organization dedicated to
                promoting the rights, well-being, and holistic development of vulnerable children.
                We create sustainable change by empowering children, families, and communities
                through education, health care, child protection, and economic empowerment.
              </p>

              <div className={styles.heroActions}>
                <Link href="/donate" className={styles.btnPrimary} scroll>
                  Donate <ArrowRight size={18} />
                </Link>
                <Link href="/partner-with-us" className={styles.ctaSecondaryBtn} scroll>
                  Partner With Us <ArrowRight size={18} />
                </Link>

              </div>
            </div>

            <div
              className={`${styles.heroMedia} ${styles.reveal}`}
              data-reveal="true"
              style={{ ['--d' as any]: '120ms' }}
            >
              <Image
                src="/images/about/story-image.jpeg"
                alt="CMDI supporting vulnerable children and children with disabilities"
                fill
                className={styles.heroImg}
                priority
                sizes="(max-width: 960px) 92vw, 520px"
              />
              <div className={styles.heroMediaBadge}>
                <BadgeCheck size={16} />
                Registered NGO • South Sudan
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROFILE OVERVIEW */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={`${styles.sectionHeader} ${styles.reveal}`} data-reveal="true">
            <h2 className={styles.sectionTitle}>Profile Overview</h2>
            <p className={styles.sectionSubtext}>
              Key details about CMDI’s registration, location, and operational footprint.
            </p>
          </div>

          <div className={styles.factsGrid}>
            <div className={`${styles.factCard} ${styles.reveal}`} data-reveal="true">
              <div className={styles.factIcon}>
                <Building2 size={18} />
              </div>
              <div>
                <p className={styles.factLabel}>Type</p>
                <p className={styles.factValue}>Non-Profit, Non-Governmental Organization (NGO)</p>
              </div>
            </div>

            <div className={`${styles.factCard} ${styles.reveal}`} data-reveal="true">
              <div className={styles.factIcon}>
                <Calendar size={18} />
              </div>
              <div>
                <p className={styles.factLabel}>Founded / Registered</p>
                <p className={styles.factValue}>Founded in 2022 • Officially registered in 2025</p>
              </div>
            </div>

            <div className={`${styles.factCard} ${styles.reveal}`} data-reveal="true">
              <div className={styles.factIcon}>
                <BadgeCheck size={18} />
              </div>
              <div>
                <p className={styles.factLabel}>Registration</p>
                <p className={styles.factValue}>
                  Reg. No: 5899,/NGO//2025 • Registered under the NGO Act of South Sudan
                </p>
              </div>
            </div>

            <div className={`${styles.factCard} ${styles.reveal}`} data-reveal="true">
              <div className={styles.factIcon}>
                <MapPin size={18} />
              </div>
              <div>
                <p className={styles.factLabel}>Location</p>
                <p className={styles.factValue}>HQ: Juba • Field Office: Fangak County</p>
              </div>
            </div>

            <div className={`${styles.factCard} ${styles.reveal}`} data-reveal="true">
              <div className={styles.factIcon}>
                <Mail size={18} />
              </div>
              <div>
                <p className={styles.factLabel}>Email</p>
                <p className={styles.factValue}>cmdi67768@gmail.com</p>
              </div>
            </div>

            <div className={`${styles.factCard} ${styles.reveal}`} data-reveal="true">
              <div className={styles.factIcon}>
                <Phone size={18} />
              </div>
              <div>
                <p className={styles.factLabel}>Phone</p>
                <p className={styles.factValue}>+211 929 045 655</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT + WHY */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.twoCol}>
            <div className={`${styles.card} ${styles.reveal}`} data-reveal="true">
              <p className={styles.eyebrow}>About Us</p>
              <h3 className={styles.cardTitle}>Child-focused support, led by communities.</h3>
              <p className={styles.cardText}>
                CMDI was established in response to the growing challenges faced by children in
                under-served regions. Our programs aim to break the cycle of poverty and ensure that
                every child has the opportunity to reach their full potential in a safe and
                nurturing environment.
              </p>
              <div className={styles.callouts}>
                <div className={styles.callout}>
                  <Shield size={18} />
                  <span>Protection & safeguarding</span>
                </div>
                <div className={styles.callout}>
                  <Globe size={18} />
                  <span>Access & inclusion</span>
                </div>
                <div className={styles.callout}>
                  <Users size={18} />
                  <span>Community-driven delivery</span>
                </div>
              </div>
            </div>

            <div
              className={`${styles.card} ${styles.reveal}`}
              data-reveal="true"
              style={{ ['--d' as any]: '120ms' }}
            >
              <p className={styles.eyebrow}>Geographical Focus</p>
              <h3 className={styles.cardTitle}>Fangak County today — expanding tomorrow.</h3>
              <p className={styles.cardText}>
                CMDI primarily operates in Fangak County, Jonglei State, South Sudan, with plans to
                expand to other under-served counties of the Upper Nile Region.
              </p>

              <div className={styles.note}>
                <MapPin size={18} />
                <p>
                  We prioritize crisis-affected and underdeveloped areas where children face the
                  highest risk of exclusion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VISION / MISSION / GOAL / AIM */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={`${styles.sectionHeader} ${styles.reveal}`} data-reveal="true">
            <h2 className={styles.sectionTitle}>Vision, Mission & Direction</h2>
            <p className={styles.sectionSubtext}>
              What we believe, what we do, and how we measure progress.
            </p>
          </div>

          <div className={styles.pillGrid}>
            <div className={`${styles.pillCard} ${styles.reveal}`} data-reveal="true">
              <div className={styles.pillIcon}>
                <Globe size={22} />
              </div>
              <h3>Vision</h3>
              <p>
                “A South Sudan where every child grows up healthy, educated, protected, and
                empowered—supported by resilient communities with access to peace, safe water,
                livelihoods, and essential services.”
              </p>
            </div>

            <div className={`${styles.pillCard} ${styles.reveal}`} data-reveal="true">
              <div className={styles.pillIcon}>
                <Target size={22} />
              </div>
              <h3>Mission</h3>
              <p>
                To empower children and communities in South Sudan through education, improved
                nutrition, safe water and sanitation, and protection services—enabling every child
                to grow, learn, and thrive.
              </p>
            </div>

            <div className={`${styles.pillCard} ${styles.reveal}`} data-reveal="true">
              <div className={styles.pillIcon}>
                <Shield size={22} />
              </div>
              <h3>Strategic Goal</h3>
              <p>
                To strengthen community resilience and child development through integrated services
                that ensure access to quality education, essential health and nutrition, child
                protection, peace and conflict resolution, and timely humanitarian assistance.
              </p>
            </div>

            <div className={`${styles.pillCard} ${styles.reveal}`} data-reveal="true">
              <div className={styles.pillIcon}>
                <Heart size={22} />
              </div>
              <h3>Aim</h3>
              <p>
                To promote the holistic well-being and development of children and their communities
                in crisis-affected and underdeveloped areas—enabling them to survive, thrive, and
                become agents of peace and change.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={`${styles.sectionHeader} ${styles.reveal}`} data-reveal="true">
            <h2 className={styles.sectionTitle}>Core Values</h2>
            <p className={styles.sectionSubtext}>
              The principles guiding our work with children, families, and communities.
            </p>
          </div>

          <div className={styles.chipGrid}>
            {coreValues.map((v, i) => (
              <div
                key={v}
                className={`${styles.chip} ${styles.reveal}`}
                data-reveal="true"
                style={{ ['--d' as any]: `${i * 35}ms` }}
              >
                <span className={styles.chipDot} aria-hidden="true" />
                {v}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OBJECTIVES + AREAS OF FOCUS */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={`${styles.sectionHeader} ${styles.reveal}`} data-reveal="true">
            <h2 className={styles.sectionTitle}>Objectives & Areas of Focus</h2>
            <p className={styles.sectionSubtext}>
              Where we deliver services and how we build long-term resilience.
            </p>
          </div>

          <div className={styles.splitGrid}>
            <div className={`${styles.panel} ${styles.reveal}`} data-reveal="true">
              <h3 className={styles.panelTitle}>Objectives</h3>
              <div className={styles.objectives}>
                {objectives.map((o) => (
                  <div key={o.title} className={styles.objective}>
                    <div className={styles.objectiveIcon}>{o.icon}</div>
                    <div>
                      <p className={styles.objectiveTitle}>{o.title}</p>
                      <p className={styles.objectiveText}>{o.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`${styles.panel} ${styles.reveal}`}
              data-reveal="true"
              style={{ ['--d' as any]: '120ms' }}
            >
              <h3 className={styles.panelTitle}>Areas of Focus</h3>
              <ul className={styles.focusList}>
                {areasOfFocus.map((a) => (
                  <li key={a}>
                    <span className={styles.bullet} aria-hidden="true" />
                    {a}
                  </li>
                ))}
              </ul>

              <div className={styles.partnerNote}>
                <Lightbulb size={18} />
                <p>
                  CMDI is mobilizing resources to implement its flagship “Learning for Life” program
                  in Fangak County and is seeking strategic partners to support planning and
                  co-design of education and child protection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ORGANIZATION STRUCTURE */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={`${styles.sectionHeader} ${styles.reveal}`} data-reveal="true">
            <h2 className={styles.sectionTitle}>Organization Structure</h2>
            <p className={styles.sectionSubtext}>
              A lean structure designed for accountability, delivery, and learning.
            </p>
          </div>

          <div className={styles.accordionGrid}>
            {roles.map((role, idx) => (
              <details
                key={role.title}
                className={`${styles.details} ${styles.reveal}`}
                data-reveal="true"
                style={{ ['--d' as any]: `${idx * 45}ms` }}
              >
                <summary className={styles.summary}>
                  <span>{role.title}</span>
                  <span className={styles.summaryHint}>View responsibilities</span>
                </summary>
                <ul className={styles.detailsList}>
                  {role.responsibilities.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={`${styles.sectionHeader} ${styles.reveal}`} data-reveal="true">
            <h2 className={styles.sectionTitle}>Leadership</h2>
            <p className={styles.sectionSubtext}>
              CMDI is led by professionals, local experts, and volunteers committed to dignity,
              protection, and inclusion. Click a profile to view role responsibilities.
            </p>
          </div>

          <div className={styles.teamGrid}>
            {leadership.map((member, idx) => (
              <button
                key={member.key}
                type="button"
                className={`${styles.teamCard} ${styles.reveal}`}
                data-reveal="true"
                style={{ ['--d' as any]: `${idx * 55}ms` }}
                onClick={() => openModal(member.key)}
              >
                <div className={styles.teamMedia} aria-hidden="true">
                  <Image
                    src={member.image}
                    alt={`${member.name} portrait`}
                    fill
                    className={styles.teamImg}
                    sizes="(max-width: 960px) 92vw, 360px"
                  />
                </div>

                <div className={styles.teamMeta}>
                  <p className={styles.teamName}>{member.name}</p>
                  <p className={styles.teamRole}>{member.title}</p>
                  <p className={styles.teamHint}>
                    View role details <ArrowRight size={16} />
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* MODAL */}
        {activeMember && (
          <div
            className={styles.modalOverlay}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeMember.name} role details`}
            onClick={closeModal}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button type="button" className={styles.modalClose} onClick={closeModal} aria-label="Close">
                <X size={18} />
              </button>

              <div className={styles.modalHeader}>
                <div className={styles.modalAvatar}>
                  <Image src={activeMember.image} alt={activeMember.name} fill className={styles.teamImg} />
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
                <Link className={styles.btnPrimary} href="/contact" scroll onClick={closeModal}>
                  Contact CMDI <ArrowRight size={18} />
                </Link>
                <Link className={styles.btnOutline} href="/partners" scroll onClick={closeModal}>
                  Become a Partner <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* IMPACT + GET INVOLVED */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.bottomGrid}>
            <div className={`${styles.card} ${styles.reveal}`} data-reveal="true">
              <p className={styles.eyebrow}>Partnerships & Impact</p>
              <h3 className={styles.cardTitle}>Working together for lasting change.</h3>
              <p className={styles.cardText}>
                CMDI collaborates with local communities, government agencies, international donors,
                and like-minded NGOs to maximize impact and ensure long-term change. Since its
                inception, CMDI has impacted over 500 children and families across South Sudan.
              </p>

              <div className={styles.achievement}>
                <BadgeCheck size={18} />
                <div>
                  <p className={styles.achievementTitle}>Major Achievement</p>
                  <p className={styles.achievementText}>
                    Trained 100 community health workers on hygiene and sanitation.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`${styles.card} ${styles.reveal}`}
              data-reveal="true"
              style={{ ['--d' as any]: '120ms' }}
            >
              <p className={styles.eyebrow}>Get Involved</p>
              <h3 className={styles.cardTitle}>Donate. Partner. Volunteer.</h3>
              <p className={styles.cardText}>
                Whether through volunteering, partnerships, or donations, there are many ways you
                can support our mission. Join us in creating a better world for children.
              </p>

              <div className={styles.ctaRow}>
                <Link href="/donate" className={styles.btnPrimary} scroll>
                  Donate <ArrowRight size={18} />
                </Link>
                <Link href="/partners" className={styles.btnOutline} scroll>
                  Partner <ArrowRight size={18} />
                </Link>
              </div>

              <div className={styles.contactBox}>
                <div className={styles.contactLine}>
                  <Users size={18} />
                  <div>
                    <p className={styles.contactTitle}>Contact Person</p>
                    <p className={styles.contactText}>
                      Jal Bhap Biel — Founder & Executive Director
                    </p>
                  </div>
                </div>

                <div className={styles.contactLine}>
                  <Mail size={18} />
                  <p className={styles.contactText}>jalbhap@gmail.com</p>
                </div>

                <div className={styles.contactLine}>
                  <Phone size={18} />
                  <p className={styles.contactText}>+211 929 045 655</p>
                </div>
              </div>

              <p className={styles.smallNote}>
                Website: <span className={styles.mono}>www.cmd-ss.org</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
