'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import styles from './projects.module.css';
import { Droplets, BookOpen, Shield, Hammer, Loader2, AlertCircle } from 'lucide-react';

/* -----------------------------
  Types
----------------------------- */
type Project = {
  id?: number | string;
  title?: string;
  description?: string;
  image_url?: string;
  status?: string;
  location?: string;
  category?: string;
};

type ApiResponse = { status?: string; data?: Project[] } | Project[];

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

const getIcon = (category?: string) => {
  const cat = (category || '').toUpperCase();
  if (cat.includes('WASH') || cat.includes('WATER')) return <Droplets size={20} />;
  if (cat.includes('EDU')) return <BookOpen size={20} />;
  if (cat.includes('LIVELIHOOD') || cat.includes('FOOD')) return <Hammer size={20} />;
  return <Shield size={20} />;
};

/* =========================================================
  ✅ IMPORTANT:
  Default export wraps a child in Suspense.
  The child is the ONLY place we call useSearchParams().
========================================================= */
export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <main className={styles.page}>
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>Our Impact in Action</h1>
              <p className={styles.heroDesc}>Loading projects…</p>
            </div>
          </section>

          <section className={styles.filterSection}>
            <div className={styles.container}>
              <div className={styles.filterContainer}>
                {['All', 'Ongoing', 'Completed', 'Planning'].map((s) => (
                  <button key={s} className={styles.filterBtn} type="button" disabled>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </section>

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
        </main>
      }
    >
      <ProjectsClient />
    </Suspense>
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

  const [statusFilter, setStatusFilter] = useState<'All' | 'Ongoing' | 'Completed' | 'Planning'>('All');

  // optional filter from Programs page: /projects?filter=wash%20initiative
  const urlFilter = (searchParams.get('filter') || '').trim().toLowerCase();

  const fetchProjects = async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${apiBase}/api/projects`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal,
      });

      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }

      const result = (await res.json()) as ApiResponse;
      const dataArray = unwrapArray(result);
      setProjects(dataArray);
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

  const filteredProjects = useMemo(() => {
    let list = projects;

    if (statusFilter !== 'All') {
      list = list.filter((p) => (p.status || '').toLowerCase() === statusFilter.toLowerCase());
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

  return (
    <main className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Our Impact in Action</h1>
          <p className={styles.heroDesc}>
            From Fangak County to the Upper Nile, we are turning contributions into tangible change.
          </p>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className={styles.filterSection}>
        <div className={styles.container}>
          <div className={styles.filterContainer}>
            {(['All', 'Ongoing', 'Completed', 'Planning'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`${styles.filterBtn} ${statusFilter === s ? styles.filterBtnActive : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section>
        <div className={styles.container}>
          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <Loader2 size={44} className="animate-spin" />
              <p style={{ marginTop: '0.9rem', color: '#64748b', fontWeight: 700 }}>Waking up server, please wait…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '3.2rem 0', color: '#ef4444' }}>
              <AlertCircle size={44} style={{ margin: '0 auto 0.9rem' }} />
              <div style={{ fontWeight: 900, marginBottom: '0.35rem' }}>Connection Error</div>
              <div style={{ opacity: 0.85, marginBottom: '1rem' }}>{error}</div>
              <button
                type="button"
                onClick={() => fetchProjects()}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#00aeef',
                  textDecoration: 'underline',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
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
                  const status = (project.status || 'Ongoing').trim();

                  return (
                    <div key={project.id ?? index} className={styles.projectCard} style={{ animationDelay: `${index * 0.08}s` }}>
                      <div className={styles.imageWrapper}>
                        <Image
                          src={imgSrc}
                          alt={project.title || 'Project Image'}
                          fill
                          className={styles.cardImg}
                          sizes="(max-width: 960px) 92vw, 420px"
                          unoptimized={external}
                        />
                        <div className={styles.statusBadge}>{status}</div>
                      </div>

                      <div className={styles.cardContent}>
                        <div className={styles.cardHeader}>
                          <span className={styles.categoryTag}>{project.location || 'South Sudan'}</span>
                          <span style={{ color: '#94a3b8' }}>{getIcon(project.category || project.title)}</span>
                        </div>

                        <h3 className={styles.cardTitle}>{project.title || 'Community Project'}</h3>
                        <p className={styles.cardDesc}>
                          {project.description || 'Community-led interventions delivering practical support.'}
                        </p>

                        <div className={styles.fundingMeta}>
                          <div className={styles.fundingInfo}>
                            <span>Progress</span>
                            <span>{status.toLowerCase() === 'completed' ? '100%' : '65%'}</span>
                          </div>

                          <div className={styles.progressBarBg}>
                            <div
                              className={styles.progressBarFill}
                              style={{ width: status.toLowerCase() === 'completed' ? '100%' : '65%' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0', opacity: 0.65 }}>
                  <p style={{ fontWeight: 900, color: '#334155' }}>No projects currently match this filter.</p>
                  <button
                    type="button"
                    onClick={() => fetchProjects()}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#00aeef',
                      textDecoration: 'underline',
                      fontWeight: 900,
                      cursor: 'pointer',
                      marginTop: '0.6rem',
                    }}
                  >
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
