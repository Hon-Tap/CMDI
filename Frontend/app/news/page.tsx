'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { X, Calendar, Clock, ArrowRight, Loader2 } from 'lucide-react';
import styles from './news.module.css';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
}

type FetchState = {
  loading: boolean;
  error: string;
};

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>({ loading: true, error: '' });

  // Modal State
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  // Local Image Mapping
  const LOCAL_IMAGES = useMemo(
    () => ({
      hero: '/images/news/news-hero.jpeg',
      alt1: '/images/news/img%20(1).jpeg',
      alt2: '/images/news/img%20(9).jpeg',
    }),
    []
  );

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent Update';
    }
  };

  const estimateReadTime = (text: string) => {
    const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(2, Math.round(words / 200));
    return `${minutes} min read`;
  };

  const resolveImage = (item: NewsItem, indexInList: number, isFeatured: boolean) => {
    if (isFeatured) return LOCAL_IMAGES.hero;
    return indexInList % 2 === 0 ? LOCAL_IMAGES.alt1 : LOCAL_IMAGES.alt2;
  };

  const openModal = (item: NewsItem) => {
    setSelected(item);
    setIsClosing(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setSelected(null);
      setIsClosing(false);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'auto';
      }
    }, 220);
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchNews = async () => {
      try {
        setFetchState({ loading: true, error: '' });

        // BUILD-SAFE API BASE
        const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cmdi-backend.onrender.com').replace(/\/$/, '');

        const res = await fetch(`${API_BASE}/api/news`, { 
          signal: controller.signal,
          cache: 'no-store' 
        });

        if (!res.ok) throw new Error('Failed to load news updates.');

        const json = await res.json();
        const data: NewsItem[] = (json?.data || (Array.isArray(json) ? json : [])) as NewsItem[];

        const sorted = [...data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setNews(sorted);
        setFetchState({ loading: false, error: '' });
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setFetchState({ loading: false, error: err?.message || 'Something went wrong.' });
      }
    };

    fetchNews();
    return () => {
      controller.abort();
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'auto';
      }
    };
  }, []);

  const featured = news[0] || null;
  const latest = featured ? news.slice(1) : [];

  return (
    <main className={styles.page}>
      {/* 1) HERO */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>NEWS & UPDATES</div>
          <h1 className={styles.heroTitle}>Stories from the Field</h1>
          <p className={styles.heroLead}>
            Follow our latest progress and community milestones from the ground in South Sudan.
          </p>
        </div>
      </section>

      {/* 2) CONTENT */}
      <section className={styles.section}>
        <div className={styles.container}>
          {fetchState.loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
              <Loader2 className="animate-spin" size={48} color="#00aeef" />
            </div>
          )}

          {!fetchState.loading && fetchState.error && (
            <div className={styles.stateCard}>
              <h2 className={styles.stateTitle}>Couldn’t load updates</h2>
              <p className={styles.stateText}>{fetchState.error}</p>
              <button className={styles.stateBtn} onClick={() => window.location.reload()}>
                Refresh <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Featured Story */}
          {!fetchState.loading && !fetchState.error && featured && (
            <div className={styles.featuredWrap}>
              <div className={styles.featuredCard}>
                <div className={styles.featuredMedia}>
                  <Image
                    src={resolveImage(featured, 0, true)}
                    alt={featured.title}
                    fill
                    priority
                    className={styles.imgCover}
                  />
                </div>
                <div className={styles.featuredBody}>
                  <div className={styles.badgeRow}>
                    <span className={styles.badge}>{formatDate(featured.created_at)}</span>
                    <span className={styles.metaInline}>
                      <Clock size={16} /> {estimateReadTime(featured.content)}
                    </span>
                  </div>
                  <h2 className={styles.featuredTitle}>{featured.title}</h2>
                  <p className={styles.featuredExcerpt}>
                    {featured.content?.slice(0, 220)}...
                  </p>
                  <button className={styles.primaryBtn} onClick={() => openModal(featured)}>
                    Read Story <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Latest Grid */}
          {!fetchState.loading && !fetchState.error && latest.length > 0 && (
            <div className={styles.grid}>
              {latest.map((post, idx) => (
                <article key={post.id} className={styles.card}>
                  <button className={styles.cardClick} onClick={() => openModal(post)}>
                    <div className={styles.cardMedia}>
                      <Image
                        src={resolveImage(post, idx, false)}
                        alt={post.title}
                        fill
                        className={styles.imgCover}
                      />
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardMeta}>
                        <span className={styles.badgeSm}>{formatDate(post.created_at)}</span>
                      </div>
                      <h4 className={styles.cardTitle}>{post.title}</h4>
                      <p className={styles.cardExcerpt}>{post.content?.slice(0, 100)}...</p>
                      <div className={styles.cardAction}>
                        Read Story <ArrowRight size={18} />
                      </div>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3) MODAL */}
      {selected && (
        <div 
          className={`${styles.modalOverlay} ${isClosing ? styles.isClosing : ''}`}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className={`${styles.modalContent} ${isClosing ? styles.isClosing : ''}`}>
            <button className={styles.closeBtn} onClick={closeModal}><X size={20} /></button>
            <div className={styles.modalHero}>
              <Image
                src={featured && selected.id === featured.id ? LOCAL_IMAGES.hero : LOCAL_IMAGES.alt1}
                alt={selected.title}
                fill
                className={styles.imgCover}
              />
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalMeta}>
                <span><Calendar size={16} /> {formatDate(selected.created_at)}</span>
                <span><Clock size={16} /> {estimateReadTime(selected.content)}</span>
              </div>
              <h2 className={styles.modalTitle}>{selected.title}</h2>
              <div className={styles.modalText}>
                {selected.content?.split('\n').map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
