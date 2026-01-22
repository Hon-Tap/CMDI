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

const partners = [
  'UNICEF',
  'Save the Children',
  'USAID',
  'World Vision',
  'Oxfam',
  'Plan International',
];

/* Motion presets */
const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 26, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: easeOut },
  },
};

const leftVariants: Variants = {
  hidden: { opacity: 0, x: -34, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.75, ease: easeOut },
  },
};

const rightVariants: Variants = {
  hidden: { opacity: 0, x: 34, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.75, ease: easeOut },
  },
};

const gridStagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.08 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: easeOut },
  },
};

/* ---------------------------
   Page
---------------------------- */
export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const marqueeItems = useMemo(
    () => [...partners, ...partners, ...partners],
    []
  );

  // Hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Programs + Projects
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projRes, progRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/projects'),
          fetch('http://127.0.0.1:8000/api/programs'),
        ]);

        const projJson = await projRes.json();
        const progJson = await progRes.json();

        const projArray = projJson?.data || (Array.isArray(projJson) ? projJson : []);
        const progArray = progJson?.data || (Array.isArray(progJson) ? progJson : []);

        setProjects((projArray || []).slice(0, 3));
        setPrograms(progArray || []);
      } catch (err) {
        console.error('Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main>
      {/* =====================================================
          1) HERO
      ====================================================== */}
      <section className={styles.hero}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className={styles.heroBg}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1.25, ease: easeOut }}
            style={{ backgroundImage: `url(${heroImages[currentSlide]})` }}
          />
        </AnimatePresence>

        <div className={styles.heroOverlay} />

        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>Transforming South Sudan</span>

            <h1 className={styles.heroTitle}>
               Creating a <span className={styles.highlight}>Better</span> world for children
            </h1>

            <p className={styles.heroLead}>
              CMDI protects vulnerable children and strengthens communities through education,
              health, WASH, child protection, and long-term resilience.
            </p>

            <div className={styles.heroActions}>
              <Link href="/projects" className={styles.btnPrimary}>
                View Our Work <ArrowRight size={18} />
              </Link>
              <Link href="/donate" className={styles.btnOutline}>
                Support Us <Heart size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          2) PARTNERS / MARQUEE
      ====================================================== */}
      <section className={styles.partnerSection}>
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
                priority={false}
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
                CMDI is community-led and child-focused. We work with families, local leaders, and
                partners to deliver practical support that protects children and helps communities
                recover and grow.
              </p>

              <Link href="/about" className={styles.btnSoft}>
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

          <motion.div
            className={styles.programGrid}
            variants={gridStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {!loading && programs.length > 0 ? (
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

                  <h3 className={styles.programTitle}>{prog?.title ?? 'Program'}</h3>
                  <p className={styles.programSummary}>
                    {prog?.description ??
                      'We deliver practical support that strengthens children and families.'}
                  </p>

                  <Link href="/programs" className={styles.programLink}>
                    Learn more <ArrowRight size={16} />
                  </Link>
                </motion.div>
              ))
            ) : (
              <motion.p
                variants={cardVariants}
                style={{ opacity: 0.6, textAlign: 'center', gridColumn: '1 / -1' }}
              >
                Loading pillars of impact...
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

            <Link href="/projects" className={styles.btnSoft}>
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
            {!loading && projects.length > 0 ? (
              projects.map((project: any, i: number) => (
                <motion.div
                  key={project?.id ?? i}
                  className={`${styles.projectCardWrapper} ${styles.scrollAnimate}`}
                  variants={cardVariants}
                >
                  <div className={styles.projectImgBox}>
                    <Image
                      src={project?.image_url || '/images/projects/project1.jpeg'}
                      alt={project?.title || 'Project'}
                      fill
                      className={styles.projectImg}
                      unoptimized
                    />
                  </div>

                  <motion.div
                    className={styles.projectOverlayCard}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.25, ease: easeOut }}
                  >
                    <span className={styles.projectCategory}>
                      <MapPin size={14} />
                      {project?.category || project?.status || 'Field Work'}
                    </span>

                    <h4>{project?.title || 'Community Project'}</h4>
                    <p>{(project?.description || '').substring(0, 110)}...</p>

                    <div className={styles.projectArrow} aria-hidden="true">
                      <ArrowUpRight size={20} />
                    </div>
                  </motion.div>
                </motion.div>
              ))
            ) : (
              <motion.p
                variants={cardVariants}
                style={{ opacity: 0.6, textAlign: 'center', gridColumn: '1 / -1' }}
              >
                Loading featured projects...
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          6) CTA / DONATE
      ====================================================== */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
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
              Your donation helps deliver safe learning, clean water, protection services, and
              essential support for children and families.
            </p>

            <div className={styles.ctaActions}>
              <Link href="/donate" className={styles.ctaSecondaryBtn}>
                Donate Now <Heart size={18} />
              </Link>

              <Link href="/contact" className={styles.ctaSecondaryBtn}>
                Partner With Us <ArrowRight size={18} />
              </Link>
            </div>

          </motion.div>
        </div>
      </section>
    </main>
  );
}
