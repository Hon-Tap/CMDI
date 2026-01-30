'use client';

import React, { useEffect, useMemo, useState } from 'react';
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

type ApiResponse =
  | { status?: string; data?: Project[] }
  | Project[];

/* -----------------------------
  Helpers
----------------------------- */

const isExternal = (src: string) => src.startsWith('http://') || src.startsWith('https://');

const resolveImg = (src?: string) => {
  const s = (typeof src === 'string' ? src : '').trim();
  if (!s) return '/images/projects/project1.jpeg'; // make sure this exists in /public
  if (isExternal(s)) return s;
  if (s.startsWith('/')) return s;
  return `/${s}`; // <-- prevents next/image crash when backend returns "images/..."
};

// maps project categories to icons (based on your DB "category" column)
const getIcon = (category?: string) => {
  const cat = (category || '').toUpperCase();
  if (cat.includes('WASH') || cat.includes('WATER')) return <Droplets size={20} />;
  if (cat.includes('EDU')) return <BookOpen size={20} />;
  if (cat.includes('LIVELIHOOD') || cat.includes('FOOD')) return <Hammer size={20} />;
  return <Shield size={20} />;
};

const unwrapArray = (result: ApiResponse): Project[] => {
  if (Array.isArray(result)) return result;
  if (result && typeof result === 'object' && Array.isArray((result as any).data)) return (result as any).data as Project[];
  return [];
};

/* -----------------------------
  Page
----------------------------- */

export default function ProjectsPage() {
  const searchParams = useSearchParams();

  // SAFE API BASE (same idea as Programs page)
  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cmdi-backend.onrender.com').replace(/\/$/, ''),
    []
  );

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Status filter buttons (matches your UI)
  const [statusFilter, setStatusFilter] = useState<'All' | 'Ongoing' | 'Completed' | 'Planning'>('All');

  // Optional category filter from URL, e.g. /projects?filter=wash%20initiative
  const urlFilter = (searchParams.get('filter') || '').trim().toLowerCase();

  const fetchProjects = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${apiBase}/api/projects`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }

      const result = (await res.json()) as ApiResponse;
      const dataArray = unwrapArray(result);

      setProjects(dataArray);
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setProjects([]);
      setError('Connection failed. Please check your internet or retry below.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtering
  const filteredProjects = useMemo(() => {
    let list = projects;

    // status filter (your buttons)
    if (statusFilter !== 'All') {
      list = list.filter((p) => (p.status || '').toLowerCase() === statusFilter.toLowerCase());
    }

    // optional URL filter (from Programs -> /projects?filter=...)
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
      {/* 1) HERO */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Our Impact in Action</h1>
          <p className={styles.heroSubtitle}>
            From Fangak County to the Upper Nile, we are turning contributions into tangible change.
          </p>

          {/* Show URL filter hint if coming from Programs */}
          {urlFilter ? (
            <div className={styles.heroHint}>
              Showing results matching: <strong>{urlFilter}</strong>
            </div>
          ) : null}
        </div>
      </section>

      {/* 2) FILTER BAR */}
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

      {/* 3) GRID */}
      <section className={styles.gridSection}>
        <div className={styles.container}>
          {/* Loading */}
          {loading && (
            <div className={styles.statusWrap}>
              <Loader2 className={styles.spinner} size={44} />
              <p className={styles.statusText}>Waking up server, please wait...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className={styles.errorWrap}>
              <AlertCircle size={44} />
              <p className={styles.errorTitle}>Connection Error</p>
              <p className={styles.errorText}>{error}</p>

              <button type="button" onClick={fetchProjects} className={styles.retryBtn}>
                Retry Connection
              </button>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <div className={styles.projectGrid}>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => {
                  const imgSrc = resolveImg(project.image_url);
                  const external = isExternal(imgSrc);

                  return (
                    <div
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
                        <div className={styles.statusBadge}>{project.status || 'Ongoing'}</div>
                      </div>

                      <div className={styles.cardContent}>
                        <div className={styles.cardTopRow}>
                          <span className={styles.categoryTag}>{project.location || 'South Sudan'}</span>
                          <span className={styles.cardIcon}>{getIcon(project.category || project.title)}</span>
                        </div>

                        <h3 className={styles.cardTitle}>{project.title || 'Community Project'}</h3>
                        <p className={styles.cardDesc}>
                          {project.description || 'Community-led interventions delivering practical support.'}
                        </p>

                        <div className={styles.fundingMeta}>
                          <div className={styles.fundingInfo}>
                            <span>Progress</span>
                            <span>{(project.status || '').toLowerCase() === 'completed' ? '100%' : '65%'}</span>
                          </div>

                          <div className={styles.progressBarBg}>
                            <div
                              className={styles.progressBarFill}
                              style={{
                                width: (project.status || '').toLowerCase() === 'completed' ? '100%' : '65%',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={styles.emptyState}>
                  <p>No projects currently match this filter.</p>
                  <button type="button" onClick={fetchProjects} className={styles.retryBtn}>
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
