'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { X, Calendar, Clock, ArrowRight } from 'lucide-react';
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

  // Modal
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  // ✅ Use ONLY your current 3 local images (you’ll update later)
  // NOTE: your filenames contain spaces, so we URL-encode them with %20
  const LOCAL_IMAGES = useMemo(
    () => ({
      hero: '/images/news/news-hero.jpeg',
      alt1: '/images/news/img%20(1).jpeg',
      alt2: '/images/news/img%20(9).jpeg',
    }),
    []
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const estimateReadTime = (text: string) => {
    const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(2, Math.round(words / 200));
    return `${minutes} min read`;
  };

  // Override images for now (featured = hero, others alternate between the two images)
  const resolveImage = (item: NewsItem, indexInList: number, isFeatured: boolean) => {
    if (isFeatured) return LOCAL_IMAGES.hero;
    return indexInList % 2 === 0 ? LOCAL_IMAGES.alt1 : LOCAL_IMAGES.alt2;
  };

  const openModal = (item: NewsItem) => {
    setSelected(item);
    setIsClosing(false);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsClosing(true);
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);

    closeTimerRef.current = window.setTimeout(() => {
      setSelected(null);
      setIsClosing(false);
      document.body.style.overflow = 'auto';
    }, 220);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      document.body.style.overflow = 'auto';
    };
  }, []);

  // ESC closes modal
  useEffect(() => {
    if (!selected) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setFetchState({ loading: true, error: '' });
        const res = await fetch('http://127.0.0.1:8000/api/news', { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to load news updates.');

        const data: NewsItem[] = await res.json();

        // Sort newest first (safe)
        const sorted = [...data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setNews(sorted);
        setFetchState({ loading: false, error: '' });
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setFetchState({ loading: false, error: err?.message || 'Something went wrong.' });
      }
    })();

    return () => controller.abort();
  }, []);

  const featured = news[0] || null;
  const latest = featured ? news.slice(1) : [];

  return (
    <main className={styles.page}>
      {/* =========================
          HERO
      ========================= */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>NEWS & UPDATES</div>
          <h1 className={styles.heroTitle}>Stories from the Field</h1>
          <p className={styles.heroLead}>
            Follow our latest progress, community milestones, and real updates from the ground in South
            Sudan.
          </p>
        </div>
      </section>

      {/* =========================
          CONTENT
      ========================= */}
      <section className={styles.section}>
        <div className={styles.container}>
          {/* Loading / Error / Empty */}
          {fetchState.loading && (
            <div className={styles.skeletonWrap}>
              <div className={styles.skeletonFeatured} />
              <div className={styles.skeletonGrid}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={styles.skeletonCard} />
                ))}
              </div>
            </div>
          )}

          {!fetchState.loading && fetchState.error && (
            <div className={styles.stateCard}>
              <h2 className={styles.stateTitle}>Couldn’t load updates</h2>
              <p className={styles.stateText}>{fetchState.error}</p>
              <button
                className={styles.stateBtn}
                onClick={() => window.location.reload()}
                type="button"
              >
                Refresh <ArrowRight size={18} />
              </button>
            </div>
          )}

          {!fetchState.loading && !fetchState.error && news.length === 0 && (
            <div className={styles.stateCard}>
              <h2 className={styles.stateTitle}>No updates yet</h2>
              <p className={styles.stateText}>
                News articles will appear here once they are published.
              </p>
            </div>
          )}

          {/* Featured */}
          {!fetchState.loading && !fetchState.error && featured && (
            <div className={styles.featuredWrap}>
              <div className={styles.featuredCard}>
                <div className={styles.featuredMedia}>
                  <Image
                    src={resolveImage(featured, 0, true)}
                    alt={featured.title}
                    fill
                    priority
                    sizes="(max-width: 960px) 100vw, 60vw"
                    className={styles.imgCover}
                  />
                </div>

                <div className={styles.featuredBody}>
                  <div className={styles.badgeRow}>
                    <span className={styles.badge}>{formatDate(featured.created_at)}</span>
                    <span className={styles.metaInline}>
                      <Clock size={16} />
                      {estimateReadTime(featured.content)}
                    </span>
                  </div>

                  <h2 className={styles.featuredTitle}>{featured.title}</h2>
                  <p className={styles.featuredExcerpt}>
                    {(featured.content || '').slice(0, 220)}
                    {(featured.content || '').length > 220 ? '…' : ''}
                  </p>

                  <button
                    className={styles.primaryBtn}
                    onClick={() => openModal(featured)}
                    type="button"
                  >
                    Read Story <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Latest Grid */}
          {!fetchState.loading && !fetchState.error && latest.length > 0 && (
            <>
              <div className={styles.gridHeader}>
                <h3 className={styles.gridTitle}>Latest Updates</h3>
                <p className={styles.gridLead}>
                  Short, clear updates on education, WASH, protection, and emergency response.
                </p>
              </div>

              <div className={styles.grid}>
                {latest.map((post, idx) => (
                  <article key={post.id} className={styles.card}>
                    <button
                      className={styles.cardClick}
                      onClick={() => openModal(post)}
                      type="button"
                      aria-label={`Open: ${post.title}`}
                    >
                      <div className={styles.cardMedia}>
                        <Image
                          src={resolveImage(post, idx, false)}
                          alt={post.title}
                          fill
                          sizes="(max-width: 960px) 100vw, 33vw"
                          className={styles.imgCover}
                        />
                      </div>

                      <div className={styles.cardBody}>
                        <div className={styles.cardMeta}>
                          <span className={styles.badgeSm}>{formatDate(post.created_at)}</span>
                          <span className={styles.metaInline}>
                            <Clock size={15} />
                            {estimateReadTime(post.content)}
                          </span>
                        </div>

                        <h4 className={styles.cardTitle}>{post.title}</h4>
                        <p className={styles.cardExcerpt}>
                          {(post.content || '').slice(0, 130)}
                          {(post.content || '').length > 130 ? '…' : ''}
                        </p>

                        <div className={styles.cardAction}>
                          Read Story <ArrowRight size={18} />
                        </div>
                      </div>
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* =========================
          MODAL
      ========================= */}
      {selected && (
        <div
          className={`${styles.modalOverlay} ${isClosing ? styles.isClosing : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="News article"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className={`${styles.modalContent} ${isClosing ? styles.isClosing : ''}`}>
            <button className={styles.closeBtn} onClick={closeModal} aria-label="Close">
              <X size={20} />
            </button>

            <div className={styles.modalHero}>
              <Image
                src={featured && selected.id === featured.id ? LOCAL_IMAGES.hero : LOCAL_IMAGES.alt1}
                alt={selected.title}
                fill
                sizes="100vw"
                className={styles.imgCover}
              />
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalMeta}>
                <span className={styles.modalMetaItem}>
                  <Calendar size={16} />
                  {formatDate(selected.created_at)}
                </span>
                <span className={styles.modalMetaItem}>
                  <Clock size={16} />
                  {estimateReadTime(selected.content)}
                </span>
              </div>

              <h2 className={styles.modalTitle}>{selected.title}</h2>

              <div className={styles.modalText}>
                {(selected.content || '')
                  .split('\n')
                  .filter((p) => p.trim().length)
                  .map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
