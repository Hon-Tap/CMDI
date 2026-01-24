'use client';

import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';

const IconComponent = ({ name, size = 32 }: { name: string, size?: number }) => {
  switch (name) {
    case 'Droplets': return <Droplets size={size} />;
    case 'BookOpen': return <BookOpen size={size} />;
    case 'Sprout': return <Sprout size={size} />;
    case 'ShieldCheck': return <ShieldCheck size={size} />;
    default: return <Zap size={size} />;
  }
};

const colorMap: any = {
  'WASH Initiative': { bg: "#e0f2fe", icon: "#0ea5e9" },
  'Quality Education': { bg: "#fef2f2", icon: "#ef4444" },
  'Food Security': { bg: "#f0fdf4", icon: "#22c55e" },
  'Child Protection': { bg: "#faf5ff", icon: "#a855f7" },
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setError(null);
        const res = await fetch('http://127.0.0.1:8000/api/programs');
        
        if (!res.ok) {
          throw new Error(`Server responded with status: ${res.status}`);
        }

        const result = await res.json();
        
        // Extract array safely from { status, data: [] }
        const dataArray = result.data || (Array.isArray(result) ? result : []);
        setPrograms(dataArray);
      } catch (err: any) {
        console.error("Failed to fetch programs:", err);
        setError("Could not connect to the API. Please ensure the PHP server is running on port 8000.");
        setPrograms([]); 
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrograms();
  }, []);

  return (
    <main className={styles.mainWrapper}>
      {/* 1. HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={`${styles.heroContent} ${styles.animate}`}>
            <span className={styles.eyebrow}>What We Do</span>
            <h1 className={styles.heroTitle}>
              Strategic <span style={{ color: '#00aeef' }}>Solutions</span> for South Sudan.
            </h1>
            <p className={styles.heroDescription}>
              Our programs are designed in collaboration with the people of Fangak County to solve immediate crises while building long-term resilience.
            </p>
            
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <h3>15k+</h3>
                <p>Lives Impacted</p>
              </div>
              <div className={styles.statItem}>
                <h3>42</h3>
                <p>Boreholes Functional</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROGRAM PILLARS */}
      <section className={styles.pillarSection}>
        <div className={styles.container}>
          
          {/* Loading State */}
          {loading && (
            <div className={styles.statusMessage}>
              <div className={styles.spinner}></div>
              <p>Loading programs...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle size={40} />
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className={styles.retryBtn}>Retry Connection</button>
            </div>
          )}

          {/* Data Grid */}
          {!loading && !error && (
            <div className={styles.pillarGrid}>
              {programs.length > 0 ? (
                programs.map((prog: any, idx: number) => {
                  const theme = colorMap[prog.title] || { bg: "#f8fafc", icon: "#00aeef" };
                  
                  return (
                    <div 
                      key={prog.id || idx} 
                      className={`${styles.pillarCard} ${styles.animate}`} 
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div className={styles.pillarIcon} style={{ background: theme.bg, color: theme.icon }}>
                        <IconComponent name={prog.icon_name} />
                      </div>
                      <h2 className={styles.pillarTitle}>{prog.title}</h2>
                      <p className={styles.pillarDescription}>{prog.description}</p>
                      
                      <ul className={styles.pillarList}>
                        <li><CheckCircle2 size={16} color={theme.icon} /> Community-led delivery</li>
                        <li><CheckCircle2 size={16} color={theme.icon} /> Sustainable impact</li>
                      </ul>

                      <a href={`/projects?filter=${prog.title.toLowerCase()}`} className={styles.pillarLink}>
                        View Active Projects <ArrowRight size={20} />
                      </a>
                    </div>
                  );
                })
              ) : (
                <p>No programs found in the database.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3. APPROACH SECTION */}
      <section className={styles.approachSection}>
        <div className={styles.container}>
          <div className={styles.centeredHeader}>
            <h2 className={styles.sectionHeading}>The CMDI Method</h2>
            <p className={styles.sectionSubheading}>A sustainable framework for humanitarian delivery.</p>
          </div>

          <div className={styles.approachStep}>
            <div className={styles.stepNumber}>01</div>
            <div>
              <h3 className={styles.stepTitle}>Community Co-Design</h3>
              <p className={styles.stepText}>
                We don't bring pre-packaged solutions. Every program starts with a community meeting to ensure we are solving the problems the community actually identifies.
              </p>
            </div>
          </div>

          <div className={styles.approachStep}>
            <div className={styles.stepNumber}>02</div>
            <div>
              <h3 className={styles.stepTitle}>Accountable Logistics</h3>
              <p className={styles.stepText}>
                Operating in the Upper Nile requires specialized knowledge. Our local field team ensures supplies reach the most remote islands safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA SECTION */}
      <section className={styles.ctaWrapper}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <Zap size={48} className={styles.ctaIcon} />
            <h2 className={styles.ctaTitle}>Support a Program Today</h2>
            <p className={styles.ctaText}>
              Your partnership allows us to expand these pillars to more counties across South Sudan.
            </p>
         

          <div className={styles.ctaButtons}>
            <Link href="/donate" className={styles.btnPrimary} scroll>
              Donate Now
            </Link>

            <Link href="/partner-with-us" className={styles.btnOutline} scroll>
              Partner With Us
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}