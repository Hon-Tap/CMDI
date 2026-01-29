'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './programs.module.css';
import {
  Droplets,
  BookOpen,
  Sprout,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  AlertCircle,
} from 'lucide-react';

// --- Types ---
type Program = {
  id?: number | string;
  title?: string;
  description?: string;
  icon_name?: string;
};

type ApiResponse =
  | { status?: string; data?: Program[] }
  | Program[];

// --- Mock Stats (Added back as they were in your previous version) ---
const stats = [
  { label: 'Communities Served', value: '45+' },
  { label: 'Clean Water Points', value: '120+' },
  { label: 'Active Students', value: '3,200+' },
];

// --- Components ---
const IconComponent = ({ name, size = 32 }: { name?: string; size?: number }) => {
  switch (name) {
    case 'Droplets': return <Droplets size={size} />;
    case 'BookOpen': return <BookOpen size={size} />;
    case 'Sprout': return <Sprout size={size} />;
    case 'ShieldCheck': return <ShieldCheck size={size} />;
    default: return <Zap size={size} />;
  }
};

const colorMap: Record<string, { bg: string; icon: string }> = {
  'WASH Initiative': { bg: '#e0f2fe', icon: '#0ea5e9' },
  'Quality Education': { bg: '#fef2f2', icon: '#ef4444' },
  'Food Security': { bg: '#f0fdf4', icon: '#22c55e' },
  'Child Protection': { bg: '#faf5ff', icon: '#a855f7' },
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // SAFE API LOGIC: No more 'throw new Error' during build
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cmdi-backend.onrender.com').replace(/\/$/, '');

  const fetchPrograms = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${apiBase}/api/programs`, { cache: 'no-store' });

      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }

      const result = (await res.json()) as ApiResponse;
      const dataArray = Array.isArray(result)
        ? result
        : Array.isArray((result as any)?.data)
        ? ((result as any).data as Program[])
        : [];

      setPrograms(dataArray);
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setError('Connection failed. Please check your internet or retry below.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  return (
    <main className={styles.mainWrapper}>
      {/* 1) HERO */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={`${styles.heroContent} ${styles.animate}`}>
            <span className={styles.eyebrow}>What We Do</span>
            <h1 className={styles.heroTitle}>
              Strategic <span className={styles.heroHighlight}>Solutions</span> for South Sudan.
            </h1>
            <p className={styles.heroDescription}>
              Our programs are designed with communities in Fangak County to address immediate needs
              while building long-term resilience.
            </p>
            <div className={styles.heroStats}>
              {stats.map((s) => (
                <div key={s.label} className={styles.statItem}>
                  <h3>{s.value}</h3>
                  <p>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2) PROGRAM PILLARS */}
      <section className={styles.pillarSection}>
        <div className={styles.container}>
          {loading && (
            <div className={styles.statusMessage}>
              <div className={styles.spinner} />
              <p>Loading programs...</p>
            </div>
          )}

          {!loading && error && (
            <div className={styles.errorMessage}>
              <AlertCircle size={40} />
              <p>{error}</p>
              <button onClick={fetchPrograms} className={styles.retryBtn}>Retry Connection</button>
            </div>
          )}

          {!loading && !error && (
            <div className={styles.pillarGrid}>
              {programs.length > 0 ? (
                programs.map((prog, idx) => {
                  const title = prog?.title?.trim() || 'Program';
                  const theme = colorMap[title] || { bg: '#f8fafc', icon: '#00aeef' };
                  const filter = encodeURIComponent(title.toLowerCase());

                  return (
                    <div
                      key={prog?.id ?? idx}
                      className={`${styles.pillarCard} ${styles.animate}`}
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div className={styles.pillarIcon} style={{ background: theme.bg, color: theme.icon }}>
                        <IconComponent name={prog?.icon_name} />
                      </div>
                      <h2 className={styles.pillarTitle}>{title}</h2>
                      <p className={styles.pillarDescription}>
                        {prog?.description || 'Community-led support strengthening children and families.'}
                      </p>
                      <ul className={styles.pillarList}>
                        <li><CheckCircle2 size={16} color={theme.icon} /> Community-led delivery</li>
                        <li><CheckCircle2 size={16} color={theme.icon} /> Sustainable impact</li>
                      </ul>
                      <Link href={`/projects?filter=${filter}`} className={styles.pillarLink}>
                        View Active Projects <ArrowRight size={20} />
                      </Link>
                    </div>
                  );
                })
              ) : (
                <p className={styles.emptyState}>No programs available at this time.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3) APPROACH */}
      <section className={styles.approachSection}>
        <div className={styles.container}>
          <div className={styles.centeredHeader}>
            <h2 className={styles.sectionHeading}>The CMDI Method</h2>
            <p className={styles.sectionSubheading}>A practical framework for accountable delivery.</p>
          </div>
          <div className={styles.approachStep}>
            <div className={styles.stepNumber}>01</div>
            <div>
              <h3 className={styles.stepTitle}>Community Co-Design</h3>
              <p className={styles.stepText}>We solve the priorities people identify through deep consultation.</p>
            </div>
          </div>
          <div className={styles.approachStep}>
            <div className={styles.stepNumber}>02</div>
            <div>
              <h3 className={styles.stepTitle}>Accountable Logistics</h3>
              <p className={styles.stepText}>Local expertise ensuring supplies reach remote areas transparently.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4) CTA */}
      <section className={styles.ctaWrapper}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <Zap size={48} className={styles.ctaIcon} />
            <h2 className={styles.ctaTitle}>Support a Program Today</h2>
            <div className={styles.ctaButtons}>
              <Link href="/donate" className={styles.btnPrimary}>Donate Now <ArrowRight size={18} /></Link>
              <Link href="/partner-with-us" className={styles.btnOutline}>Partner <ArrowRight size={18} /></Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
