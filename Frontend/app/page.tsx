'use client';

import { useEffect, useMemo, useState } from 'react';
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
   Helpers
---------------------------- */

type IconName = 'Droplets' | 'BookOpen' | 'Sprout' | 'ShieldCheck' | string;

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
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: easeOut },
  },
};

function safeText(v: unknown, fallback = '') {
  return typeof v === 'string' ? v : fallback;
}

function resolveImg(src?: string) {
  const s = safeText(src, '');
  if (!s) return '/images/projects/project1.jpeg';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('/')) return s;
  return `/${s}`;
}

function isExternal(src: string) {
  return src.startsWith('http://') || src.startsWith('https://');
}

function normalizeBase(raw: string) {
  return (raw || '').trim().replace(/\/$/, '');
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

/* ---------------------------
   Page
---------------------------- */

export default function HomePage() {
  const API_BASE = normalizeBase(process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cmdi-backend.onrender.com');

  const [currentSlide, setCurrentSlide] = useState(0);

  const [projects, setProjects] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  const [dataError, setDataError] = useState('');

  const marqueeItems = useMemo(() => [...partners, ...partners, ...partners], []);

  // Hero slider
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  // ✅ Fetch Programs + Projects independently (one failing won't block the other)
  useEffect(() => {
    const ctrl = new AbortController();

    const fetchPrograms = async () => {
      setLoadingPrograms(true);
      try {
        const res = await fetch(`${API_BASE}/api/programs`, {
          signal: ctrl.signal,
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
          setPrograms([]);
          setDataError((prev) => prev || `Backend issue: programs=${res.status}`);
          return;
        }

        const json = await safeJson(res);
        const arr = json?.data || (Array.isArray(json) ? json : []);
        setPrograms(Array.isArray(arr) ? arr : []);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setPrograms([]);
          setDataError((prev) => prev || 'Programs failed to load.');
        }
      } finally {
        setLoadingPrograms(false);
      }
    };

    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const res = await fetch(`${API_BASE}/api/projects`, {
          signal: ctrl.signal,
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
          setProjects([]);
          setDataError((prev) => prev || `Backend issue: projects=${res.status}`);
          return;
        }

        const json = await safeJson(res);
        const arr = json?.data || (Array.isArray(json) ? json : []);
        setProjects(Array.isArray(arr) ? arr.slice(0, 3) : []);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setProjects([]);
          setDataError((prev) => prev || 'Projects failed to load.');
        }
      } finally {
        setLoadingProjects(false);
      }
    };

    // reset message once at start
    setDataError('');
    fetchPrograms();
    fetchProjects();

    return () => ctrl.abort();
  }, [API_BASE]);

  // Keep this if you want a global flag elsewhere (not used for per-section rendering now)
  const loading = loadingPrograms || loadingProjects;

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

          {dataError && <p className={styles.inlineError}>{dataError}</p>}

          <motion.div
            className={styles.programGrid}
            variants={gridStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* ✅ FIX: use loadingPrograms (projects loading should NOT block programs rendering) */}
            {!loadingPrograms && programs.length > 0 ? (
              programs.map((prog: any, i: number) => (
                <motion.div
                  key={prog?.id ?? i}
                  className={`${styles.programCard} ${styles.scrollPop}`}
                  variants={cardVariants}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                >
                  <div className={styles.programIconWrapper} aria-hidden="true">
                    <IconComponent name={prog?.icon_name} />
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
            ) : (
              <motion.p variants={cardVariants} className={styles.loadingText} aria-live="polite">
                {loadingPrograms ? 'Loading pillars of impact...' : 'No programs available at this time.'}
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          5) PROJECTS
      ====================================================== */}
      <section className={styles.projectsSection}>
        <div className={styles.container}>
          <motion.div
            className={styles.headerRow}
            variants={sectionVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
          >
            <div>
              <span className={styles.sectionTag}>On The Ground</span>
              <h2>Featured Projects</h2>
            </div>

            <Link href="/projects" className={styles.btnSoft} scroll>
              View All Projects <ArrowRight size={18} />
            </Link>
          </motion.div>

          <motion.div
            className={styles.projectGrid}
            variants={gridStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* ✅ FIX: use loadingProjects (programs loading should NOT block projects rendering) */}
            {!loadingProjects && projects.length > 0 ? (
              projects.map((project: any, i: number) => {
                const imgSrc = resolveImg(project?.image_url);
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
                      <p>
                        {safeText(project?.description, '').slice(0, 110)}
                        {safeText(project?.description, '').length > 110 ? '…' : ''}
                      </p>

                      <div className={styles.projectArrow} aria-hidden="true">
                        <ArrowUpRight size={20} />
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            ) : (
              <motion.p variants={cardVariants} className={styles.loadingText} aria-live="polite">
                {loadingProjects ? 'Loading featured projects...' : 'No featured projects available at this time.'}
              </motion.p>
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

            <motion.div
              className={styles.ctaContent}
              variants={sectionVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
            >
              <h2>Ready to make a difference?</h2>
              <p>
                Your support helps deliver safe learning, clean water, protection services, and essential care for
                children and families.
              </p>

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
