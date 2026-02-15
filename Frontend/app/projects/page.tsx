'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import styles from './projects.module.css';
import {
  Droplets,
  BookOpen,
  Shield,
  Hammer,
  Loader2,
  AlertCircle,
  Layers,
  Activity,
  CheckCircle2,
  CalendarClock,
  CalendarRange,
} from 'lucide-react';

/* -----------------------------
  Types (match DB columns)
----------------------------- */
type Project = {
  id?: number | string;
  title?: string;
  description?: string;
  image_url?: string;
  status?: string;
  location?: string;
  category?: string;
  start_date?: string; // date -> string
  end_date?: string; // date -> string
  created_at?: string; // timestamptz -> string in JSON
  updated_at?: string; // timestamptz -> string in JSON
};

type ApiResponse = { status?: string; data?: Project[] } | Project[];

type Status = 'All' | 'Ongoing' | 'Completed' | 'Planning';

type Stats = {
  total: number;
  ongoing: number;
  planning: number;
  completed: number;
};

const HERO_BG = '/images/projects/project4.jpeg';

/* -----------------------------
  Helpers
----------------------------- */
const isExternal = (src: string) => src.startsWith('http://') || src.startsWith('https://');

const resolveImg = (src?: string) => {
  const s = (typeof src === 'string' ? src : '').trim();
  if (!s) return '/images/projects/project1.jpeg';
  if (isExternal(s)) return s;
  if (s.startsWith('/')) return s;
  return `/${s}`;
};

const unwrapArray = (result: ApiResponse): Project[] => {
  if (Array.isArray(result)) return result;
  if (result && typeof result === 'object' && Array.isArray((result as any).data)) return (result as any).data as Project[];
  return [];
};

const normalizeStatus = (s?: string): Exclude<Status, 'All'> => {
  const v = (s || '').trim().toLowerCase();
  if (v === 'completed') return 'Completed';
  if (v === 'planning') return 'Planning';
  return 'Ongoing';
};

const getCategoryIcon = (category?: string) => {
  const cat = (category || '').toUpperCase();
  if (cat.includes('WASH') || cat.includes('WATER')) return <Droplets size={20} />;
  if (cat.includes('EDU')) return <BookOpen size={20} />;
  if (cat.includes('LIVELIHOOD') || cat.includes('FOOD')) return <Hammer size={20} />;
  return <Shield size={20} />;
};

const getStatusIcon = (status: Exclude<Status, 'All'>) => {
  if (status === 'Completed') return <CheckCircle2 size={16} />;
  if (status === 'Planning') return <CalendarClock size={16} />;
  return <Activity size={16} />;
};

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

const toMs = (v?: string) => {
  const s = (v || '').trim();
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
};

const calcProgress = (p: Project) => {
  const status = normalizeStatus(p.status);
  if (status === 'Completed') return 100;

  const startMs = toMs(p.start_date || p.created_at);
  const endMs = toMs(p.end_date);

  if (!startMs || !endMs || endMs <= startMs) return 0;

  const now = Date.now();

  // Not started yet
  if (now < startMs) return 0;

  const pct = ((now - startMs) / (endMs - startMs)) * 100;
  return clamp(pct);
};

const fmtDate = (v?: string) => {
  const ms = toMs(v);
  if (!ms) return '';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(ms);
};

/* =========================================================
  Default export wraps a child in Suspense.
  The child is the ONLY place we call useSearchParams().
========================================================= */
export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <main className={styles.page}>
          <Hero />
          <FiltersSkeleton />
          <GridSkeleton />
        </main>
      }
    >
      <ProjectsClient />
    </Suspense>
  );
}

/* -----------------------------
  Hero (background image = project4)
----------------------------- */
function Hero({ stats }: { stats?: Stats }) {
  return (
    <section className={styles.hero} aria-label="Projects hero">
      <div className={styles.heroBg} aria-hidden="true">
        <Image src={HERO_BG} alt="" fill priority sizes="100vw" className={styles.heroBgImg} />
        <div className={styles.heroOverlay} />
      </div>

      <div className={styles.heroContent}>
        <div className={styles.heroKicker}>
          <span className={styles.heroKickerDot} />
          CMDI Projects
        </div>

        <h1 className={styles.heroTitle}>Our Impact in Action</h1>

        <p className={styles.heroDesc}>
          From Fangak County to the Upper Nile, we are turning contributions into tangible change.
        </p>

        <div className={styles.heroBadges}>
          <span className={styles.heroBadge}>
            <BookOpen size={16} /> Education
          </span>
          <span className={styles.heroBadge}>
            <Droplets size={16} /> WASH
          </span>
          <span className={styles.heroBadge}>
            <Shield size={16} /> Protection
          </span>
          <span className={styles.heroBadge}>
            <Hammer size={16} /> Livelihoods
          </span>
        </div>

        {stats && (
          <div className={styles.statsRow} aria-label="Project stats">
            <div className={styles.statPill}>
              <Layers size={16} />
              <span>Total</span>
              <b>{stats.total}</b>
            </div>
            <div className={styles.statPill}>
              <Activity size={16} />
              <span>Ongoing</span>
              <b>{stats.ongoing}</b>
            </div>
            <div className={styles.statPill}>
              <CalendarClock size={16} />
              <span>Planning</span>
              <b>{stats.planning}</b>
            </div>
            <div className={styles.statPill}>
              <CheckCircle2 size={16} />
              <span>Completed</span>
              <b>{stats.completed}</b>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function FiltersSkeleton() {
  return (
    <section className={styles.filterSection}>
      <div className={styles.container}>
        <div className={styles.filterContainer}>
          {(['All', 'Ongoing', 'Completed', 'Planning'] as const).map((s) => (
            <button key={s} className={styles.filterBtn} type="button" disabled>
              {s}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function GridSkeleton() {
  return (
    <section>
      <div className={styles.container}>
        <div className={styles.projectGrid} aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonImg} />
              <div className={styles.skeletonLine} />
              <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -----------------------------
  Client component (uses useSearchParams)
----------------------------- */
function ProjectsClient() {
  const searchParams = useSearchParams();

  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cmdi-backend.onrender.com').replace(/\/$/, ''),
    []
  );

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<Status>('All');

  // optional filter from Programs page: /projects?filter=wash%20initiative
  const urlFilter = (searchParams.get('filter') || '').trim().toLowerCase();

  const fetchProjects = async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${apiBase}/api/projects`, {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal,
      });

      if (!res.ok) throw new Error(`Server status: ${res.status}`);

      const result = (await res.json()) as ApiResponse;
      const dataArray = unwrapArray(result);

      const sorted = [...dataArray].sort((a, b) => {
        const ad = a.created_at ? Date.parse(a.created_at) : 0;
        const bd = b.created_at ? Date.parse(b.created_at) : 0;
        if (bd !== ad) return bd - ad;
        const ai = Number(a.id) || 0;
        const bi = Number(b.id) || 0;
        return bi - ai;
      });

      setProjects(sorted);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Fetch Error:', err);
      setProjects([]);
      setError(err?.message || 'Connection failed. Please check your internet or retry below.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    fetchProjects(ctrl.signal);
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats: Stats = useMemo(() => {
    const s: Stats = { total: projects.length, ongoing: 0, planning: 0, completed: 0 };
    for (const p of projects) {
      const st = normalizeStatus(p.status);
      if (st === 'Ongoing') s.ongoing += 1;
      if (st === 'Planning') s.planning += 1;
      if (st === 'Completed') s.completed += 1;
    }
    return s;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let list = projects;

    if (statusFilter !== 'All') {
      list = list.filter((p) => normalizeStatus(p.status) === statusFilter);
    }

    if (urlFilter) {
      list = list.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        return cat.includes(urlFilter) || title.includes(urlFilter);
      });
    }

    return list;
  }, [projects, statusFilter, urlFilter]);

  const filterMeta = (s: Status) => {
    if (s === 'All') return { icon: <Layers size={16} />, label: 'All' };
    if (s === 'Ongoing') return { icon: <Activity size={16} />, label: 'Ongoing' };
    if (s === 'Completed') return { icon: <CheckCircle2 size={16} />, label: 'Completed' };
    return { icon: <CalendarClock size={16} />, label: 'Planning' };
  };

  return (
    <main className={styles.page}>
      <Hero stats={stats} />

      {/* FILTER BAR */}
      <section className={styles.filterSection}>
        <div className={styles.container}>
          <div className={styles.filterContainer}>
            {(['All', 'Ongoing', 'Completed', 'Planning'] as const).map((s) => {
              const meta = filterMeta(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`${styles.filterBtn} ${statusFilter === s ? styles.filterBtnActive : ''}`}
                >
                  <span className={styles.filterBtnIcon} aria-hidden="true">
                    {meta.icon}
                  </span>
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section>
        <div className={styles.container}>
          {/* Loading */}
          {loading && (
            <div className={styles.stateCard}>
              <Loader2 size={44} className={styles.spinner} />
              <h3 className={styles.stateTitle}>Loading projects…</h3>
              <p className={styles.stateText}>Waking up server, please wait.</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className={styles.stateCard}>
              <AlertCircle size={44} style={{ margin: '0 auto 0.9rem', color: '#ef4444' }} />
              <h3 className={styles.stateTitle}>Connection Error</h3>
              <p className={styles.stateText}>{error}</p>
              <button type="button" onClick={() => fetchProjects()} className={styles.linkBtn}>
                Retry Connection
              </button>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && (
            <div className={styles.projectGrid}>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => {
                  const imgSrc = resolveImg(project.image_url);
                  const external = isExternal(imgSrc);

                  const status = normalizeStatus(project.status);
                  const progress = calcProgress(project);
                  const progressLabel = `${Math.round(progress)}%`;

                  const startLabel = fmtDate(project.start_date);
                  const endLabel = fmtDate(project.end_date);

                  return (
                    <article
                      key={project.id ?? index}
                      className={styles.projectCard}
                      style={{ animationDelay: `${index * 0.08}s` }}
                    >
                      <div className={styles.imageWrapper}>
                        <Image
                          src={imgSrc}
                          alt={project.title || 'Project Image'}
                          fill
                          className={styles.cardImg}
                          sizes="(max-width: 960px) 92vw, 420px"
                          unoptimized={external}
                        />

                        <div className={styles.statusBadge}>
                          <span className={styles.statusBadgeIcon} aria-hidden="true">
                            {getStatusIcon(status)}
                          </span>
                          <span className={styles.statusBadgeText}>{status}</span>
                        </div>
                      </div>

                      <div className={styles.cardContent}>
                        <div className={styles.cardHeader}>
                          <span className={styles.categoryTag}>{project.location || 'South Sudan'}</span>
                          <span className={styles.cardIcon} aria-hidden="true">
                            {getCategoryIcon(project.category || project.title)}
                          </span>
                        </div>

                        <h3 className={styles.cardTitle}>{project.title || 'Community Project'}</h3>

                        <p className={styles.cardDesc}>
                          {project.description || 'Community-led interventions delivering practical support.'}
                        </p>

                        {(startLabel || endLabel) && (
                          <div className={styles.timelineRow}>
                            <span className={styles.timelineItem}>
                              <CalendarRange size={16} />
                              <span>
                                {startLabel ? startLabel : '—'} → {endLabel ? endLabel : '—'}
                              </span>
                            </span>
                          </div>
                        )}

                        <div className={styles.fundingMeta}>
                          <div className={styles.fundingInfo}>
                            <span>Progress</span>
                            <span>{status === 'Completed' ? '100%' : progressLabel}</span>
                          </div>

                          <div className={styles.progressBarBg}>
                            <div
                              className={styles.progressBarFill}
                              style={{ width: `${status === 'Completed' ? 100 : progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className={styles.stateCard} style={{ gridColumn: '1 / -1' }}>
                  <h3 className={styles.stateTitle}>No matches</h3>
                  <p className={styles.stateText}>No projects currently match this filter.</p>
                  <button type="button" onClick={() => fetchProjects()} className={styles.linkBtn}>
                    Refresh
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
