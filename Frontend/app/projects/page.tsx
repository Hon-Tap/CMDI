'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './projects.module.css';
import { Droplets, BookOpen, Shield, Hammer, Loader2, AlertCircle } from 'lucide-react';

/**
 * Utility to map project titles or categories to specific icons
 */
const getIcon = (category: string) => {
  const cat = category?.toUpperCase() || '';
  if (cat.includes('WASH') || cat.includes('WATER')) return <Droplets size={20} />;
  if (cat.includes('EDU')) return <BookOpen size={20} />;
  if (cat.includes('LIVELIHOOD')) return <Hammer size={20} />;
  return <Shield size={20} />;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 1. HYDRATION FIX: Ensures the component only renders content once on the client.
  // This prevents the "Server-rendered HTML didn't match" error.
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    const ctrl = new AbortController();

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(false);

          const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cmdi-backend.onrender.com')
            .trim()
            .replace(/\/$/, '');

        
          // In production builds, fail fast if the env var is missing
          if (!raw && process.env.NODE_ENV === 'production') {
            throw new Error('Missing NEXT_PUBLIC_API_BASE_URL in production deployment');
          }
        
          // In dev, allow localhost fallback
          const base = (raw ?? 'http://127.0.0.1:8000').trim();
        
          // Remove trailing slash if present
          return base.replace(/\/$/, '');
        })();


        const res = await fetch(`${API_BASE}/api/projects`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: ctrl.signal,
        });

        if (!res.ok) throw new Error('Could not reach backend');

        const json = await res.json();
        const data = json?.data || (Array.isArray(json) ? json : []);
        setProjects(data);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Backend connection error:', err);
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();

    return () => ctrl.abort();
  }, []);

  // Exit early if the component hasn't mounted in the browser yet.
  if (!hasMounted) return null;

  // Filter Logic: Compares status from database (e.g., "Ongoing", "active") to the filter buttons.
  const filteredProjects =
    filter === 'All'
      ? projects
      : projects.filter((p: any) => p.status?.toLowerCase() === filter.toLowerCase());

  return (
    <main className={styles.page}>
      {/* 1. HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Our Impact in Action</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>
            From Fangak County to the Upper Nile, we are turning contributions into tangible change.
          </p>
        </div>
      </section>

      {/* 2. FILTER BAR */}
      <section className={styles.filterSection}>
        <div className={styles.container}>
          <div className={styles.filterContainer}>
            {['All', 'Ongoing', 'Completed', 'Planning'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`${styles.filterBtn} ${filter === cat ? styles.filterBtnActive : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PROJECT GRID */}
      <section className={styles.gridSection}>
        <div className={styles.container}>
          {/* Loading View */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
              <Loader2 className="animate-spin" size={48} color="#00aeef" />
            </div>
          )}

          {/* Error View */}
          {error && !loading && (
            <div style={{ textAlign: 'center', color: '#ef4444', padding: '3rem' }}>
              <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 'bold' }}>Backend Connection Failed</p>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Check that your backend is reachable and the API base URL is correct.
              </p>
            </div>
          )}

          {/* Project List View */}
          {!loading && !error && (
            <div className={styles.projectGrid}>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project: any, index: number) => (
                  <div
                    key={project.id ?? index}
                    className={styles.projectCard}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={styles.imageWrapper}>
                      <Image
                        src={project.image_url || '/images/projects/project-edu.jpeg'}
                        alt={project.title}
                        fill
                        className={styles.cardImg}
                        unoptimized // Bypasses external image domain restrictions for development
                      />
                      <div className={styles.statusBadge}>{project.status}</div>
                    </div>

                    <div className={styles.cardContent}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <span className={styles.categoryTag}>{project.location || 'South Sudan'}</span>
                        <span style={{ color: '#94a3b8' }}>{getIcon(project.title)}</span>
                      </div>

                      <h3 className={styles.cardTitle}>{project.title}</h3>
                      <p className={styles.cardDesc}>{project.description}</p>

                      <div className={styles.fundingMeta}>
                        <div className={styles.fundingInfo}>
                          <span>Progress</span>
                          <span>{project.status?.toLowerCase() === 'completed' ? '100%' : '65%'}</span>
                        </div>
                        <div className={styles.progressBarBg}>
                          <div
                            className={styles.progressBarFill}
                            style={{
                              width: project.status?.toLowerCase() === 'completed' ? '100%' : '65%',
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{ textAlign: 'center', gridColumn: '1/-1', padding: '3rem', opacity: 0.5 }}
                >
                  <p>No projects currently match this filter.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
