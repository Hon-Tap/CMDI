'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Mail, MapPin, Facebook, Twitter, 
  Instagram, Linkedin, Heart, Send 
} from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const [hasMounted, setHasMounted] = useState(false);
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setHasMounted(true);
    setYear(new Date().getFullYear());
  }, []);

  if (!hasMounted) return <footer className={styles.footer} />;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        {/* BRAND COLUMN */}
        <div className={styles.brandCol}>
          <div className={styles.logo}>
            <Heart className={styles.logoIcon} fill="currentColor" />
            <span>CMDI</span>
          </div>
          <p className={styles.missionText}>
            Empowering the next generation in South Sudan through 
            holistic development and child-centered initiatives.
          </p>
          <div className={styles.socialLinks}>
            <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
          </div>
        </div>

        {/* LINKS COLUMNS - Synced with Navbar */}
        <div className={styles.linksGrid}>
          <div className={styles.linkGroup}>
            <h4>About CMDI</h4>
            <ul>
              <li><Link href="/about">Our Story</Link></li>
              <li><Link href="/partners">Partners</Link></li>
              <li><Link href="/news">News & Updates</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h4>Our Impact</h4>
            <ul>
              <li><Link href="/programs">Programs</Link></li>
              <li><Link href="/projects">Projects</Link></li>
              <li><Link href="/donate">Donate Now</Link></li>
              <li><Link href="/volunteer">Volunteer</Link></li>
            </ul>
          </div>
        </div>

        {/* NEWSLETTER COLUMN */}
        <div className={styles.contactCol}>
          <h4>Stay Updated</h4>
          <p>Join our newsletter for latest impact stories.</p>
          <form className={styles.newsletter} onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Email address" 
              suppressHydrationWarning 
            />
            <button type="submit" aria-label="Subscribe" suppressHydrationWarning>
              <Send size={18} />
            </button>
          </form>
          
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <MapPin size={18} className={styles.contactIcon} />
              <span>Juba, South Sudan</span>
            </div>
            <div className={styles.contactItem}>
              <Mail size={18} className={styles.contactIcon} />
              <a href="mailto:info@cmdi-ss.org">info@cmdi-ss.org</a>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <p>© <span suppressHydrationWarning>{year}</span> CMDI. All rights reserved.</p>
          <div className={styles.legalLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}