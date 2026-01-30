'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './projects.module.css';
import { Droplets, BookOpen, Shield, Hammer, Loader2, AlertCircle } from 'lucide-react';

/**
 * Utility to map project categories to specific icons.
 * Matches the 'category' column in your database.
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
  const [error, setError] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const ctrl = new AbortController();

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        // API Base URL Configuration
        const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cmdi-backend.onrender.com';
        const API_BASE = rawBase.trim().replace(/\/$/, '');

        const res = await fetch(`${API_BASE}/api/projects`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
          },
          signal: ctrl.signal,
        });

        if (!res.ok) {
          throw new Error(`Server responded with status: ${res.status}`);
        }

        const json = await res.json();
        
        // Handle different possible JSON structures from your backend
        const data = json?.data || (Array.isArray(json) ? json : []);
        setProjects(data);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Fetch error details:', err);
          setError(err.message || 'Failed to connect to the server');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();

    return () => ctrl.abort();
  }, []);

  // Hydration guard: Prevents mismatch between server and client HTML
  if (!hasMounted) return null;

  // Filter Logic
  const filteredProjects = filter === 'All'
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
          
          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '5rem' }}>
              <Loader2 className="animate-spin" size={48} color="#00aeef" style={{ margin: '0 auto' }} />
              <p style={{ marginTop: '1rem', color: '#64748b' }}>Waking up server, please wait...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div style={{ textAlign: 'center', color: '#ef4444', padding: '3rem' }}>
              <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 'bold' }}>Connection Error</p>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                style={{ marginTop: '1rem', color: '#00aeef', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Project List View */}
          {!loading && !error && (
            <div className={styles.projectGrid}>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project: any, index: number) => (
                  <div
                    key={project.id || index}
                    className={styles.projectCard}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={styles.imageWrapper}>
                      <Image
                        src={project.image_url || '/images/projects/project-placeholder.jpeg'}
                        alt={project.title || 'Project Image'}
                        fill
                        className={styles.cardImg}
                        unoptimized 
                      />
                      <div className={styles.statusBadge}>{project.status}</div>
                    </div>

                    <div className={styles.cardContent}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span className={styles.categoryTag}>{project.location || 'South Sudan'}</span>
                        <span style={{ color: '#94a3b8' }}>
                          {/* Uses category from DB for correct icon mapping */}
                          {getIcon(project.category || project.title)}
                        </span>
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
                <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '3rem', opacity: 0.5 }}>
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
