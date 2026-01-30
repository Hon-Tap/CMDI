'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Droplets,
  BookOpen,
  Sprout,
  ShieldCheck,
  Heart,
  Zap,
  MapPin,
} from 'lucide-react';

import styles from './page.module.css';

/* ---------------------------
   Types
---------------------------- */

type IconName = 'Droplets' | 'BookOpen' | 'Sprout' | 'ShieldCheck' | string;

type Program = {
  id?: number | string;
  title?: string;
  description?: string;
  icon_name?: string;
};

type Project = {
  id?: number | string;
  title?: string;
  description?: string;
  image_url?: string;
  category?: string;
  status?: string;
};

/* ---------------------------
   Helpers
---------------------------- */

const IconComponent = ({ name, size = 24 }: { name: IconName; size?: number }) => {
  switch (name) {
    case 'Droplets':
      return <Droplets size={size} />;
    case 'BookOpen':
      return <BookOpen size={size} />;
    case 'Sprout':
      return <Sprout size={size} />;
    case 'ShieldCheck':
      return <ShieldCheck size={size} />;
    default:
      return <Zap size={size} />;
  }
};

const heroImages = [
  '/images/hero/slide1.jpeg',
  '/images/hero/slide2.png',
  '/images/hero/slide3.jpeg',
  '/images/hero/slide4.jpeg',
];

const partners = ['UNICEF', 'Save the Children', 'USAID', 'World Vision', 'Oxfam', 'Plan International'];

const FALLBACK_PROGRAMS: Program[] = [
  {
    id: 'fallback-edu',
    title: 'Education',
    description:
      'Improving access to quality learning through school support, teacher capacity building, and inclusive education pathways.',
    icon_name: 'BookOpen',
  },
  {
    id: 'fallback-wash',
    title: 'WASH',
    description:
      'Clean water points, sanitation facilities, and hygiene promotion to reduce preventable diseases and improve dignity.',
    icon_name: 'Droplets',
  },
  {
    id: 'fallback-cp',
    title: 'Child Protection',
    description:
      'Safeguarding, case management referrals, psychosocial support, and prevention of violence against children.',
    icon_name: 'ShieldCheck',
  },
  {
    id: 'fallback-liv',
    title: 'Livelihoods',
    description:
      'Skills training and resilience support for youth and caregivers to strengthen household stability and recovery.',
    icon_name: 'Sprout',
  },
];

const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'fallback-p1',
    title: 'Safe Water Access',
    description: 'Community-led work to increase safe water access and reduce waterborne illness.',
    image_url: '/images/projects/project-wash.jpeg',
    category: 'WASH',
    status: 'Ongoing',
  },
  {
    id: 'fallback-p2',
    title: 'Back-to-School Support',
    description: 'Learning materials and community mobilization to help children return to school.',
    image_url: '/images/projects/project-edu.jpeg',
    category: 'Education',
    status: 'Planning',
  },
  {
    id: 'fallback-p3',
    title: 'Child Protection Outreach',
    description: 'Community sessions strengthening safeguarding, referrals, and protective environments.',
    image_url: '/images/projects/project1.jpeg',
    category: 'Protection',
    status: 'Ongoing',
  },
];

function safeText(v: unknown, fallback = '') {
  return typeof v === 'string' ? v : fallback;
}

function normalizeBase(raw: string) {
  return (raw || '').trim().replace(/\/$/, '');
}

function isExternal(src: string) {
  return src.startsWith('http://') || src.startsWith('https://');
}

function resolveImg(src?: string) {
  const s = safeText(src, '');
  if (!s) return '/images/projects/project1.jpeg';
  if (isExternal(s)) return s;
  if (s.startsWith('/')) return s;
  return `/${s}`;
}

function clipText(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

function extractArray<T>(json: any): T[] {
  const arr = json?.data ?? (Array.isArray(json) ? json : []);
  return Array.isArray(arr) ? arr : [];
}

/* Motion presets */
const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 26, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: easeOut } },
};

const leftVariants: Variants = {
  hidden: { opacity: 0, x: -34, filter: 'blur(10px)' },
  show: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.75, ease: easeOut } },
};

const rightVariants: Variants = {
  hidden: { opacity: 0, x: 34, filter: 'blur(10px)' },
  show: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.75, ease: easeOut } },
};

const gridStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.985, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease: easeOut } },
};

/* ---------------------------
   Page
---------------------------- */

export default function HomePage() {
  const API_BASE = useMemo(
    () => normalizeBase(process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cmdi-backend.onrender.com'),
    []
  );

  const [currentSlide, setCurrentSlide] = useState(0);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [programsError, setProgramsError] = useState('');
  const [projectsError, setProjectsError] = useState('');

  const marqueeItems = useMemo(() => [...partners, ...partners, ...partners], []);

  // Hero slider
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  const fetchPrograms = useCallback(
    async (signal: AbortSignal) => {
      setLoadingPrograms(true);
      setProgramsError('');

      try {
        const res = await fetch(`${API_BASE}/api/programs`, {
          signal,
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
          setPrograms([]);
          setProgramsError(`Programs endpoint error: ${res.status}`);
          return;
        }

        const json = await safeJson(res);
        const arr = extractArray<Program>(json);
        setPrograms(arr);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setPrograms([]);
          setProgramsError('Programs failed to load.');
        }
      } finally {
        setLoadingPrograms(false);
      }
    },
    [API_BASE]
  );

  const fetchProjects = useCallback(
    async (signal: AbortSignal) => {
      setLoadingProjects(true);
      setProjectsError('');

      try {
        const res = await fetch(`${API_BASE}/api/projects`, {
          signal,
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
          setProjects([]);
          setProjectsError(`Projects endpoint error: ${res.status}`);
          return;
        }

        const json = await safeJson(res);
        const arr = extractArray<Project>(json);
        setProjects(arr.slice(0, 3));
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setProjects([]);
          setProjectsError('Projects failed to load.');
        }
      } finally {
        setLoadingProjects(false);
      }
    },
    [API_BASE]
  );

  // Fetch independently
  useEffect(() => {
    const ctrl = new AbortController();
    fetchPrograms(ctrl.signal);
    fetchProjects(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchPrograms, fetchProjects]);

  const programsToRender =
    !loadingPrograms && (programsError || programs.length === 0) ? FALLBACK_PROGRAMS : programs;

  const projectsToRender =
    !loadingProjects && (projectsError || projects.length === 0) ? FALLBACK_PROJECTS : projects;

  return (
    <main className={styles.page}>
      {/* =====================================================
          1) HERO
      ====================================================== */}
      <section className={styles.hero}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className={styles.heroBg}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1.15, ease: easeOut }}
            style={{ backgroundImage: `url(${heroImages[currentSlide]})` }}
            aria-hidden="true"
          />
        </AnimatePresence>

        <div className={styles.heroOverlay} aria-hidden="true" />

        <div className={styles.heroContainer}>
          <motion.div className={styles.heroContent} variants={sectionVariants} initial="hidden" animate="show">
            <span className={styles.eyebrow}>Supporting Children • Transforming Communities</span>

            <h1 className={styles.heroTitle}>
              Creating a <span className={styles.highlight}>better</span> world for children
            </h1>

            <p className={styles.heroLead}>
              CMDI supports vulnerable children and strengthens communities through education, health, WASH, child
              protection, and long-term resilience.
            </p>

            <div className={styles.heroActions}>
              <Link href="/projects" className={styles.btnPrimary} scroll>
                View Our Work <ArrowRight size={18} />
              </Link>
              <Link href="/donate" className={styles.btnOutline} scroll>
                Support Us <Heart size={18} />
              </Link>
            </div>

            <div className={styles.heroMetaRow} aria-label="Quick highlights">
              <div className={styles.heroMetaPill}>
                <ShieldCheck size={14} aria-hidden="true" />
                Child Protection
              </div>
              <div className={styles.heroMetaPill}>
                <Droplets size={14} aria-hidden="true" />
                WASH & Safe Water
              </div>
              <div className={styles.heroMetaPill}>
                <BookOpen size={14} aria-hidden="true" />
                Inclusive Education
              </div>
            </div>

            <div className={styles.heroDots} aria-label="Hero slides">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.dot} ${i === currentSlide ? styles.dotActive : ''}`}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          2) PARTNERS / MARQUEE
      ====================================================== */}
      <section className={styles.partnerSection} aria-label="Partners marquee">
        <div className={styles.marqueeFade} aria-hidden="true" />
        <div className={styles.marqueeTrack}>
          {marqueeItems.map((partner, index) => (
            <div key={`${partner}-${index}`} className={styles.partnerLogo}>
              {partner}
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          3) ABOUT
      ====================================================== */}
      <section className={styles.aboutSection}>
        <div className={styles.container}>
          <div className={styles.aboutGrid}>
            <motion.div
              className={`${styles.aboutImageWrapper} ${styles.scrollLeft}`}
              variants={leftVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
            >
              <Image
                src="/images/about/story-image.jpeg"
                alt="CMDI team and community members"
                fill
                className={styles.aboutImg}
                sizes="(max-width: 960px) 92vw, 520px"
              />
            </motion.div>

            <motion.div
              className={`${styles.aboutText} ${styles.scrollRight}`}
              variants={rightVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
            >
              <span className={styles.sectionTag}>Who We Are</span>
              <h2>Driven by compassion, guided by impact</h2>
              <p>
                CMDI is community-led and child-focused. We work with families, local leaders, and partners to deliver
                practical support that protects children and helps communities recover and grow.
              </p>

              <Link href="/about" className={styles.btnSoft} scroll>
                Read Our Story <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          4) PROGRAMS
      ====================================================== */}
      <section className={styles.programsSection}>
        <div className={styles.container}>
          <motion.div
            className={`${styles.centeredHeader} ${styles.scrollAnimate}`}
            variants={sectionVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
          >
            <span className={styles.sectionTag}>Our Expertise</span>
            <h2>Core Programs</h2>
            <p>Holistic solutions shaped by community needs and delivered with accountability.</p>
          </motion.div>

          {!!programsError && (
            <p className={styles.inlineError}>
              {programsError}{' '}
              <button type="button" className={styles.btnSoft} onClick={() => fetchPrograms(new AbortController().signal)}>
                Retry
              </button>
            </p>
          )}

          <motion.div
            className={styles.programGrid}
            variants={gridStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {loadingPrograms ? (
              <motion.p variants={cardVariants} className={styles.loadingText} aria-live="polite">
                Loading pillars of impact...
              </motion.p>
            ) : (
              programsToRender.map((prog: any, i: number) => (
                <motion.div
                  key={prog?.id ?? i}
                  className={`${styles.programCard} ${styles.scrollPop}`}
                  variants={cardVariants}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                >
                  <div className={styles.programIconWrapper} aria-hidden="true">
                    <IconComponent name={prog?.icon_name as IconName} />
                  </div>

                  <h3 className={styles.programTitle}>{safeText(prog?.title, 'Program')}</h3>
                  <p className={styles.programSummary}>
                    {safeText(prog?.description, 'We deliver practical support that strengthens children and families.')}
                  </p>

                  <Link href="/programs" className={styles.programLink} scroll>
                    Learn more <ArrowRight size={16} />
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          5) PROJECTS
      ====================================================== */}
      <section className={styles.projectsSection}>
        <div className={styles.container}>
          <motion.div className={styles.headerRow} variants={sectionVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
            <div>
              <span className={styles.sectionTag}>On The Ground</span>
              <h2>Featured Projects</h2>
            </div>

            <Link href="/projects" className={styles.btnSoft} scroll>
              View All Projects <ArrowRight size={18} />
            </Link>
          </motion.div>

          {!!projectsError && (
            <p className={styles.inlineError}>
              {projectsError}{' '}
              <button type="button" className={styles.btnSoft} onClick={() => fetchProjects(new AbortController().signal)}>
                Retry
              </button>
            </p>
          )}

          <motion.div className={styles.projectGrid} variants={gridStagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            {loadingProjects ? (
              <motion.p variants={cardVariants} className={styles.loadingText} aria-live="polite">
                Loading featured projects...
              </motion.p>
            ) : (
              projectsToRender.map((project: any, i: number) => {
                const imgSrc = resolveImg(project?.image_url);
                const desc = safeText(project?.description, '');
                return (
                  <motion.div
                    key={project?.id ?? i}
                    className={`${styles.projectCardWrapper} ${styles.scrollAnimate}`}
                    variants={cardVariants}
                  >
                    <div className={styles.projectImgBox}>
                      <Image
                        src={imgSrc}
                        alt={safeText(project?.title, 'Project')}
                        fill
                        className={styles.projectImg}
                        sizes="(max-width: 960px) 92vw, 420px"
                        unoptimized={isExternal(imgSrc)}
                      />
                    </div>

                    <Link href="/projects" className={styles.projectOverlayCard} scroll>
                      <span className={styles.projectCategory}>
                        <MapPin size={14} />
                        {safeText(project?.category, safeText(project?.status, 'Field Work'))}
                      </span>

                      <h4>{safeText(project?.title, 'Community Project')}</h4>
                      <p>{clipText(desc, 110)}</p>

                      <div className={styles.projectArrow} aria-hidden="true">
                        <ArrowUpRight size={20} />
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          6) CTA / DONATE (UPGRADED)
      ====================================================== */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBackdrop} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaIconRow}>
              <div className={styles.ctaPill}>
                <Heart size={18} /> Sponsor Care
              </div>
              <div className={styles.ctaPill}>
                <BookOpen size={18} /> Support Education
              </div>
              <div className={styles.ctaPill}>
                <Droplets size={18} /> Clean Water
              </div>
              <div className={styles.ctaPill}>
                <ShieldCheck size={18} /> Child Protection
              </div>
            </div>

            <motion.div className={styles.ctaContent} variants={sectionVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
              <h2>Ready to make a difference?</h2>
              <p>Your support helps deliver safe learning, clean water, protection services, and essential care for children and families.</p>

              <div className={styles.ctaActions}>
                <Link href="/donate" className={styles.ctaPrimaryBtn} scroll>
                  Donate Now <Heart size={18} />
                </Link>

                <Link href="/partner-with-us" className={styles.ctaSecondaryBtn} scroll>
                  Partner With Us <ArrowRight size={18} />
                </Link>
              </div>

              <div className={styles.ctaFinePrint}>Trusted collaboration • Clear accountability • Community-led delivery</div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
